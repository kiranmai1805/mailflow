from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from datetime import datetime

from app.core.database import Base


class EmailAccount(Base):
    __tablename__ = "email_accounts"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "email",
            name="uq_email_account_user_email",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    email = Column(
        String,
        nullable=False,
    )

    provider = Column(
        String,
        nullable=False,
    )

    smtp_host = Column(
        String,
        nullable=True,
    )

    smtp_port = Column(
        Integer,
        nullable=True,
    )

    username = Column(
        String,
        nullable=True,
    )

    password = Column(
        String,
        nullable=True,
    )

    use_tls = Column(
        Boolean,
        default=True,
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