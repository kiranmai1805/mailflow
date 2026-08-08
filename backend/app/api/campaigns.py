from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.campaign import Campaign, campaign_contacts
from app.models.contact import Contact
from app.models.campaign_history import CampaignHistory

import os

from fastapi import HTTPException

from app.models.google_account import GoogleAccount
from app.services.mail_service import send_email

from app.models.email_account import EmailAccount
from app.services.smtp_service import send_smtp_email


router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"],
)


class CampaignCreate(BaseModel):
    name: str
    subject: str
    body: str
    contact_ids: list[int] = []
    sender_account_id: int | None = None


@router.post("/")
async def create_new_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db),
):
    new_campaign = Campaign(
    name=campaign.name,
    subject=campaign.subject,
    body=campaign.body,
    sender_account_id=campaign.sender_account_id,
)

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    # Add selected contacts
    for contact_id in campaign.contact_ids:
        contact = db.query(Contact).filter(
            Contact.id == contact_id
        ).first()

        if contact:
            db.execute(
                campaign_contacts.insert().values(
                    campaign_id=new_campaign.id,
                    contact_id=contact.id,
                )
            )

    db.commit()

    return {
        "message": "Campaign created successfully",
        "id": new_campaign.id,
        "name": new_campaign.name,
    }


@router.get("/")
async def list_campaigns(
    db: Session = Depends(get_db),
):
    campaigns = (
        db.query(Campaign)
        .order_by(Campaign.id.desc())
        .all()
    )

    return [
    {
        "id": campaign.id,
        "name": campaign.name,
        "subject": campaign.subject,
        "body": campaign.body,
        "sender_account_id": campaign.sender_account_id,
    }
    for campaign in campaigns
]

@router.post("/{campaign_id}/send")
async def send_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
):
    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found",
        )

    # Get contacts belonging to this campaign
    contacts = (
        db.query(Contact)
        .join(
            campaign_contacts,
            campaign_contacts.c.contact_id == Contact.id,
        )
        .filter(
            campaign_contacts.c.campaign_id == campaign_id
        )
        .all()
    )

    if not contacts:
        return {
            "message": "No contacts selected for this campaign",
            "sent": 0,
            "failed": 0,
        }

    # Get connected Google account
    google_account = (
        db.query(GoogleAccount)
        .first()
    )

    if not google_account:
        raise HTTPException(
            status_code=400,
            detail="No Google account connected",
        )

    sent = 0
    failed = 0

    for contact in contacts:

        try:

            send_email(
                access_token=google_account.access_token,
                refresh_token=google_account.refresh_token,
                client_id=os.getenv("GOOGLE_CLIENT_ID"),
                client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
                recipient=contact.email,
                subject=campaign.subject,
                body=campaign.body,
            )

            # -----------------------------------------
            # SAVE SUCCESSFUL SEND
            # -----------------------------------------

            history = CampaignHistory(
                campaign_id=campaign.id,
                contact_id=contact.id,
                recipient_email=contact.email,
                status="sent",
                error=None,
            )

            db.add(history)

            sent += 1

        except Exception as error:

            print(
                f"Failed to send email to "
                f"{contact.email}: {error}"
            )

            # -----------------------------------------
            # SAVE FAILED SEND
            # -----------------------------------------

            history = CampaignHistory(
                campaign_id=campaign.id,
                contact_id=contact.id,
                recipient_email=contact.email,
                status="failed",
                error=str(error),
            )

            db.add(history)

            failed += 1

    # Save all history records
    db.commit()

    return {
        "message": "Campaign sending completed",
        "sent": sent,
        "failed": failed,
    }
@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
):
    campaign = (
        db.query(Campaign)
        .filter(Campaign.id == campaign_id)
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found",
        )

    # -------------------------------------------------
    # 1. Delete campaign history FIRST
    # -------------------------------------------------

    db.query(CampaignHistory).filter(
        CampaignHistory.campaign_id == campaign_id
    ).delete(
        synchronize_session=False
    )

    db.flush()

    # -------------------------------------------------
    # 2. Delete campaign-recipient relationships
    # -------------------------------------------------

    db.execute(
        campaign_contacts.delete().where(
            campaign_contacts.c.campaign_id == campaign_id
        )
    )

    db.flush()

    # -------------------------------------------------
    # 3. Delete the campaign itself
    # -------------------------------------------------

    db.delete(campaign)

    db.commit()

    return {
        "message": "Campaign removed successfully",
        "id": campaign_id,
    }
@router.get("/history")
async def get_campaign_history(
    db: Session = Depends(get_db),
):
    history = (
        db.query(CampaignHistory)
        .order_by(
            CampaignHistory.sent_at.desc()
        )
        .all()
    )

    return [
        {
            "id": item.id,
            "campaign_id": item.campaign_id,
            "contact_id": item.contact_id,
            "recipient_email": item.recipient_email,
            "status": item.status,
            "error": item.error,
            "sent_at": item.sent_at,
        }
        for item in history
    ]

@router.get("/stats")
async def get_campaign_stats(
    db: Session = Depends(get_db),
):
    total_sent = (
        db.query(CampaignHistory)
        .filter(
            CampaignHistory.status == "sent"
        )
        .count()
    )

    total_failed = (
        db.query(CampaignHistory)
        .filter(
            CampaignHistory.status == "failed"
        )
        .count()
    )

    total_attempted = (
        db.query(CampaignHistory)
        .count()
    )

    total_campaigns = (
        db.query(Campaign)
        .count()
    )

    total_contacts = (
        db.query(Contact)
        .count()
    )

    success_rate = 0

    if total_attempted > 0:
        success_rate = round(
            (total_sent / total_attempted) * 100,
            2,
        )

    return {
        "total_sent": total_sent,
        "total_failed": total_failed,
        "total_attempted": total_attempted,
        "total_campaigns": total_campaigns,
        "total_contacts": total_contacts,
        "success_rate": success_rate,
    }