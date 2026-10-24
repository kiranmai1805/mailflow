from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Table,
    ForeignKey,
)
from datetime import datetime

from app.core.database import Base


campaign_contacts = Table(
    "campaign_contacts",
    Base.metadata,

    Column(
        "campaign_id",
        Integer,
        ForeignKey("campaigns.id"),
        primary_key=True,
    ),

    Column(
        "contact_id",
        Integer,
        ForeignKey("contacts.id"),
        primary_key=True,
    ),
)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    subject = Column(
        String,
        nullable=False,
    )

    body = Column(
        Text,
        nullable=False,
    )

    sender_account_id = Column(
        Integer,
        ForeignKey("email_accounts.id"),
        nullable=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )