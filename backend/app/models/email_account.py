from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime

from app.core.database import Base


class EmailAccount(Base):
    __tablename__ = "email_accounts"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, nullable=False, unique=True)

    provider = Column(String, nullable=False)

    smtp_host = Column(String, nullable=True)
    smtp_port = Column(Integer, nullable=True)

    username = Column(String, nullable=True)
    password = Column(String, nullable=True)

    use_tls = Column(Boolean, default=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )