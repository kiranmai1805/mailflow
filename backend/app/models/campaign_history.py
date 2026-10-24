from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from datetime import datetime

from app.core.database import Base


class CampaignHistory(Base):
    __tablename__ = "campaign_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    campaign_id = Column(
        Integer,
        ForeignKey("campaigns.id"),
        nullable=False,
    )

    contact_id = Column(
        Integer,
        ForeignKey("contacts.id"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    recipient_email = Column(
        String,
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
    )

    error = Column(
        Text,
        nullable=True,
    )

    sent_at = Column(
        DateTime,
        default=datetime.utcnow,
    )