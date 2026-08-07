from sqlalchemy.orm import Session

from app.models.campaign import Campaign


def create_campaign(
    db: Session,
    name: str,
    subject: str,
    body: str,
):
    campaign = Campaign(
        name=name,
        subject=subject,
        body=body,
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return campaign


def get_campaigns(db: Session):
    return db.query(Campaign).order_by(Campaign.id.desc()).all()