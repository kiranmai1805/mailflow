from dotenv import load_dotenv

load_dotenv()

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.database import Base, engine


# =========================================================
# MODELS
# =========================================================

from app.models.contact import Contact
from app.models.google_account import GoogleAccount
from app.models.campaign import Campaign
from app.models.email_account import EmailAccount
from app.models.campaign_history import CampaignHistory
from app.models.user import User


# =========================================================
# ROUTERS
# =========================================================

from app.api.contacts import router as contacts_router
from app.api.google_auth import router as google_auth_router
from app.api.campaigns import router as campaigns_router
from app.api.email_accounts import router as email_accounts_router
from app.api.auth import router as auth_router


app = FastAPI()


# =========================================================
# SESSION
# =========================================================

session_secret = os.getenv("SESSION_SECRET")

if not session_secret:
    raise RuntimeError(
        "SESSION_SECRET is not configured in the .env file"
    )


app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET"),
    same_site="none",
    https_only=True,
)



# =========================================================
# CORS
# =========================================================

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://mailflow-frontend(-[a-z0-9]+)*-kiranmai1805s-projects\.vercel\.app",
    allow_origins=[
        "https://mailflow-frontend-one.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# ROUTES
# =========================================================

app.include_router(auth_router)

app.include_router(contacts_router)
app.include_router(campaigns_router)
app.include_router(google_auth_router)
app.include_router(email_accounts_router)