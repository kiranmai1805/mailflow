import os
import requests

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow

from sqlalchemy.orm import Session
from fastapi import Depends

from app.core.database import get_db
from app.models.google_account import GoogleAccount

router = APIRouter(
    prefix="/auth/google",
    tags=["Google Authentication"],
)

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
]

def create_flow():
    return Flow.from_client_config(
        {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=os.getenv("GOOGLE_REDIRECT_URI"),
    )


@router.get("/login")
async def google_login(request: Request):
    flow = create_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )

    # Save the state and PKCE code verifier
    request.session["google_state"] = state
    request.session["google_code_verifier"] = flow.code_verifier

    return RedirectResponse(authorization_url)


@router.get("/callback")
async def google_callback(
    request: Request,
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    saved_state = request.session.get("google_state")
    saved_code_verifier = request.session.get("google_code_verifier")

    if not saved_state or not saved_code_verifier:
        return {
            "error": "Google OAuth session expired or missing"
        }

    if state != saved_state:
        return {
            "error": "Invalid OAuth state"
        }

    flow = create_flow()

    flow.code_verifier = saved_code_verifier

    flow.fetch_token(code=code)

    credentials = flow.credentials

    userinfo_response = requests.get(
    "https://openidconnect.googleapis.com/v1/userinfo",
    headers={
        "Authorization": f"Bearer {credentials.token}"
    },
)

    userinfo_response.raise_for_status()

    userinfo = userinfo_response.json()

    email = userinfo["email"]

    # Get the Gmail account email
    

    # Check if this Google account already exists
    google_account = (
        db.query(GoogleAccount)
        .filter(GoogleAccount.email == email)
        .first()
    )

    if google_account:
        google_account.access_token = credentials.token

        if credentials.refresh_token:
            google_account.refresh_token = credentials.refresh_token

    else:
        google_account = GoogleAccount(
            email=email,
            access_token=credentials.token,
            refresh_token=credentials.refresh_token,
        )

        db.add(google_account)

    db.commit()

    # Remove temporary OAuth data
    request.session.pop("google_state", None)
    request.session.pop("google_code_verifier", None)

    return {
        "message": "Google account connected successfully",
        "email": email,
    }