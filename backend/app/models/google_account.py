from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class GoogleAccount(Base):
    __tablename__ = "google_accounts"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, nullable=False, index=True)

    access_token = Column(Text, nullable=False)

    refresh_token = Column(Text, nullable=False)