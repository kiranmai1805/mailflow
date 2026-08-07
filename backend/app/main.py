from dotenv import load_dotenv
load_dotenv()

import os 

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.database import Base, engine

# IMPORTANT: import the model
from app.models.contact import Contact
from app.models.google_account import GoogleAccount
from app.models.campaign import Campaign



from app.api.contacts import router as contacts_router
from app.api.google_auth import router as google_auth_router
from app.api.campaigns import router as campaigns_router

app = FastAPI()


app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(contacts_router)
app.include_router(campaigns_router)
app.include_router(google_auth_router)