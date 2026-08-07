from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.campaign import Campaign, campaign_contacts
from app.models.contact import Contact

import os

from fastapi import HTTPException

from app.models.google_account import GoogleAccount
from app.services.mail_service import send_email


router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"],
)


class CampaignCreate(BaseModel):
    name: str
    subject: str
    body: str
    contact_ids: list[int] = []


@router.post("/")
async def create_new_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db),
):
    new_campaign = Campaign(
        name=campaign.name,
        subject=campaign.subject,
        body=campaign.body,
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
            "status": campaign.status,
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

    # Don't allow the same campaign to be sent twice
    if campaign.status == "sent":
        return {
            "message": "Campaign has already been sent",
            "sent": 0,
            "failed": 0,
            "status": "sent",
        }

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
            "status": campaign.status,
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

            sent += 1

        except Exception as error:
            print(
                f"Failed to send email to {contact.email}: {error}"
            )
            failed += 1

    # Mark as sent only if all emails succeeded
    if failed == 0 and sent > 0:
        campaign.status = "sent"
        db.commit()

    return {
        "message": "Campaign sending completed",
        "sent": sent,
        "failed": failed,
        "status": campaign.status,
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

    # Remove campaign-contact associations first
    db.execute(
        campaign_contacts.delete().where(
            campaign_contacts.c.campaign_id == campaign_id
        )
    )

    # Remove campaign
    db.delete(campaign)
    db.commit()

    return {
        "message": "Campaign deleted successfully",
        "id": campaign_id,
    }