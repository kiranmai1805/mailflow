from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.api.dependencies import get_current_user

from app.models.user import User
from app.models.campaign import Campaign, campaign_contacts
from app.models.contact import Contact
from app.models.campaign_history import CampaignHistory
from app.models.google_account import GoogleAccount
from app.models.email_account import EmailAccount

from app.services.mail_service import send_email
from app.services.smtp_service import send_smtp_email

import os


router = APIRouter(
    prefix="/campaigns",
    tags=["Campaigns"],
)


# =========================================================
# REQUEST MODEL
# =========================================================


class CampaignCreate(BaseModel):
    name: str
    subject: str
    body: str
    contact_ids: list[int] = []
    sender_account_id: int | None = None
    sender_account_type: str = "google"


# =========================================================
# CREATE CAMPAIGN
# =========================================================

@router.post("/")
async def create_new_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # Verify sender account belongs to current user
    # -----------------------------------------------------

    if campaign.sender_account_id is not None:
        sender_account = (
            db.query(EmailAccount)
            .filter(
                EmailAccount.id == campaign.sender_account_id,
                EmailAccount.user_id == current_user.id,
            )
            .first()
        )

    google_account = None

    if not sender_account:
        google_account = (
            db.query(GoogleAccount)
            .filter(
                GoogleAccount.id == campaign.sender_account_id,
                GoogleAccount.user_id == current_user.id,
            )
            .first()
        )

    if not sender_account and not google_account:
        raise HTTPException(
            status_code=404,
            detail="Sender email account not found",
        )

    # -----------------------------------------------------
    # Create campaign
    # -----------------------------------------------------

    new_campaign = Campaign(
    name=campaign.name,
    subject=campaign.subject,
    body=campaign.body,
    user_id=current_user.id,
    sender_account_id=campaign.sender_account_id,
    sender_account_type=campaign.sender_account_type,
)

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    # -----------------------------------------------------
    # Add selected contacts
    # -----------------------------------------------------

    for contact_id in campaign.contact_ids:

        contact = (
            db.query(Contact)
            .filter(
                Contact.id == contact_id,
                Contact.user_id == current_user.id,
            )
            .first()
        )

        # Ignore contacts that don't belong
        # to the logged-in user
        if not contact:
            continue

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


# =========================================================
# LIST CAMPAIGNS
# =========================================================

@router.get("/")
async def list_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.user_id == current_user.id
        )
        .order_by(
            Campaign.id.desc()
        )
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


# =========================================================
# SEND CAMPAIGN
# =========================================================

@router.post("/{campaign_id}/send")
async def send_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # Get campaign belonging to current user
    # -----------------------------------------------------

    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == campaign_id,
            Campaign.user_id == current_user.id,
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found",
        )

    # -----------------------------------------------------
    # Get contacts belonging to this campaign
    # AND current user
    # -----------------------------------------------------

    contacts = (
        db.query(Contact)
        .join(
            campaign_contacts,
            campaign_contacts.c.contact_id
            == Contact.id,
        )
        .filter(
            campaign_contacts.c.campaign_id
            == campaign_id,
            Contact.user_id
            == current_user.id,
        )
        .all()
    )

    if not contacts:
        return {
            "message": "No contacts selected for this campaign",
            "sent": 0,
            "failed": 0,
        }

    # -----------------------------------------------------
    # Get connected Google account
    # -----------------------------------------------------

    
    # -----------------------------------------------------
    # Get the selected sender account
    # -----------------------------------------------------

    google_account = None
    sender_account = None

    if campaign.sender_account_type == "google":
        google_account = (
            db.query(GoogleAccount)
            .filter(
                GoogleAccount.id == campaign.sender_account_id,
                GoogleAccount.user_id == current_user.id,
            )
            .first()
        )

        if not google_account:
            raise HTTPException(
                status_code=404,
                detail="Selected Google sender account not found",
            )

    elif campaign.sender_account_type == "smtp":
        sender_account = (
            db.query(EmailAccount)
            .filter(
                EmailAccount.id == campaign.sender_account_id,
                EmailAccount.user_id == current_user.id,
            )
            .first()
        )

        if not sender_account:
            raise HTTPException(
                status_code=404,
                detail="Selected SMTP sender account not found",
            )

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid sender account type",
        )

    sent = 0
    failed = 0


    # -----------------------------------------------------
    # Send to every contact
    # -----------------------------------------------------

   
    
    for contact in contacts:
        try:
            if campaign.sender_account_type == "google":
                send_email(
                    access_token=google_account.access_token,
                    refresh_token=google_account.refresh_token,
                    client_id=os.getenv("GOOGLE_CLIENT_ID"),
                    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
                    recipient=contact.email,
                    subject=campaign.subject,
                    body=campaign.body,
                )

            elif campaign.sender_account_type == "smtp":
                await send_smtp_email(
                    smtp_host=sender_account.smtp_host,
                    smtp_port=sender_account.smtp_port,
                    username=sender_account.username,
                    password=sender_account.password,
                    recipient=contact.email,
                    subject=campaign.subject,
                    body=campaign.body,
                    use_tls=sender_account.use_tls,
                )

            history = CampaignHistory(
                campaign_id=campaign.id,
                contact_id=contact.id,
                status="sent",
                error=None,
            )
            db.add(history)
            sent += 1

        except Exception as error:
            print(f"Failed to send email to {contact.email}: {error}")

            history = CampaignHistory(
                campaign_id=campaign.id,
                contact_id=contact.id,
                status="failed",
                error=str(error),
            )
            db.add(history)
            failed += 1

    db.commit()

    return {
        "message": "Campaign sending completed",
        "sent": sent,
        "failed": failed,
    }




# =========================================================
# DELETE CAMPAIGN
# =========================================================

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # Get campaign belonging to current user
    # -----------------------------------------------------

    campaign = (
        db.query(Campaign)
        .filter(
            Campaign.id == campaign_id,
            Campaign.user_id == current_user.id,
        )
        .first()
    )

    if not campaign:
        raise HTTPException(
            status_code=404,
            detail="Campaign not found",
        )

    # -----------------------------------------------------
    # 1. Delete campaign history FIRST
    # -----------------------------------------------------

    db.query(CampaignHistory).filter(
        CampaignHistory.campaign_id
        == campaign_id,
        CampaignHistory.user_id
        == current_user.id,
    ).delete(
        synchronize_session=False
    )

    db.flush()

    # -----------------------------------------------------
    # 2. Delete campaign-recipient relationships
    # -----------------------------------------------------

    db.execute(
        campaign_contacts.delete().where(
            campaign_contacts.c.campaign_id
            == campaign_id
        )
    )

    db.flush()

    # -----------------------------------------------------
    # 3. Delete campaign itself
    # -----------------------------------------------------

    db.delete(campaign)

    db.commit()

    return {
        "message": "Campaign removed successfully",
        "id": campaign_id,
    }


# =========================================================
# CAMPAIGN HISTORY
# =========================================================

@router.get("/history")
async def get_campaign_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    history = (
        db.query(CampaignHistory)
        .filter(
            CampaignHistory.user_id
            == current_user.id
        )
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


# =========================================================
# CAMPAIGN STATISTICS
# =========================================================

@router.get("/stats")
async def get_campaign_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------
    # Total successful emails
    # -----------------------------------------------------

    total_sent = (
        db.query(CampaignHistory)
        .filter(
            CampaignHistory.user_id
            == current_user.id,
            CampaignHistory.status
            == "sent",
        )
        .count()
    )

    # -----------------------------------------------------
    # Total failed emails
    # -----------------------------------------------------

    total_failed = (
        db.query(CampaignHistory)
        .filter(
            CampaignHistory.user_id
            == current_user.id,
            CampaignHistory.status
            == "failed",
        )
        .count()
    )

    # -----------------------------------------------------
    # Total attempted
    # -----------------------------------------------------

    total_attempted = (
        db.query(CampaignHistory)
        .filter(
            CampaignHistory.user_id
            == current_user.id
        )
        .count()
    )

    # -----------------------------------------------------
    # Total campaigns
    # -----------------------------------------------------

    total_campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.user_id
            == current_user.id
        )
        .count()
    )

    # -----------------------------------------------------
    # Total contacts
    # -----------------------------------------------------

    total_contacts = (
        db.query(Contact)
        .filter(
            Contact.user_id
            == current_user.id
        )
        .count()
    )

    # -----------------------------------------------------
    # Success rate
    # -----------------------------------------------------

    success_rate = 0

    if total_attempted > 0:
        success_rate = round(
            (
                total_sent
                / total_attempted
            ) * 100,
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