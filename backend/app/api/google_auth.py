import os
import requests

from fastapi import (
    APIRouter,
    Request,
    Depends,
)

from fastapi.responses import RedirectResponse

from google_auth_oauthlib.flow import Flow

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.google_account import GoogleAccount
from app.models.user import User

from app.api.dependencies import get_current_user


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
                "client_id": os.getenv(
                    "GOOGLE_CLIENT_ID"
                ),
                "client_secret": os.getenv(
                    "GOOGLE_CLIENT_SECRET"
                ),
                "auth_uri":
                    "https://accounts.google.com/o/oauth2/auth",

                "token_uri":
                    "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=os.getenv(
            "GOOGLE_REDIRECT_URI"
        ),
    )


# =========================================================
# GOOGLE LOGIN
# =========================================================

@router.get("/login")
async def google_login(
    request: Request,
    current_user: User = Depends(get_current_user),
):

    flow = create_flow()

    authorization_url, state = (
        flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
    )

    # Save OAuth information
    request.session["google_state"] = state

    request.session[
        "google_code_verifier"
    ] = flow.code_verifier

    # Save the MailFlow user who started OAuth
    request.session[
        "google_user_id"
    ] = current_user.id

    return RedirectResponse(
        authorization_url
    )


# =========================================================
# GOOGLE CALLBACK
# =========================================================

@router.get("/callback")
async def google_callback(
    request: Request,
    code: str,
    state: str,
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # Retrieve OAuth session data
    # -----------------------------------------------------

    saved_state = request.session.get(
        "google_state"
    )

    saved_code_verifier = (
        request.session.get(
            "google_code_verifier"
        )
    )

    google_user_id = (
        request.session.get(
            "google_user_id"
        )
    )

    # -----------------------------------------------------
    # Validate session
    # -----------------------------------------------------

    if (
        not saved_state
        or not saved_code_verifier
        or not google_user_id
    ):

        return {
            "error":
                "Google OAuth session expired "
                "or missing"
        }

    # -----------------------------------------------------
    # Validate OAuth state
    # -----------------------------------------------------

    if state != saved_state:

        return {
            "error":
                "Invalid OAuth state"
        }

    # -----------------------------------------------------
    # Verify MailFlow user exists
    # -----------------------------------------------------

    current_user = (
        db.query(User)
        .filter(
            User.id == google_user_id
        )
        .first()
    )

    if not current_user:

        return {
            "error":
                "MailFlow user not found"
        }

    # -----------------------------------------------------
    # Create OAuth flow
    # -----------------------------------------------------

    flow = create_flow()

    flow.code_verifier = (
        saved_code_verifier
    )

    # -----------------------------------------------------
    # Exchange authorization code
    # -----------------------------------------------------

    flow.fetch_token(
        code=code
    )

    credentials = flow.credentials

    # -----------------------------------------------------
    # Get Google user information
    # -----------------------------------------------------

    userinfo_response = requests.get(
        "https://openidconnect.googleapis.com/v1/userinfo",
        headers={
            "Authorization":
                f"Bearer {credentials.token}"
        },
    )

    userinfo_response.raise_for_status()

    userinfo = (
        userinfo_response.json()
    )

    email = userinfo["email"]

    # -----------------------------------------------------
    # Check whether this Google account exists
    # -----------------------------------------------------

    google_account = (
        db.query(GoogleAccount)
        .filter(
            GoogleAccount.email == email
        )
        .first()
    )

    # =====================================================
    # EXISTING GOOGLE ACCOUNT
    # =====================================================

    if google_account:

        # -------------------------------------------------
        # Make sure it belongs to this MailFlow user
        # -------------------------------------------------

        if (
            google_account.user_id
            != current_user.id
        ):

            return {
                "error":
                    "This Google account is already "
                    "connected to another MailFlow user."
            }

        # -------------------------------------------------
        # Update access token
        # -------------------------------------------------

        google_account.access_token = (
            credentials.token
        )

        # Google may not return a refresh token
        # every time.
        if credentials.refresh_token:

            google_account.refresh_token = (
                credentials.refresh_token
            )

    # =====================================================
    # NEW GOOGLE ACCOUNT
    # =====================================================

    else:

        if not credentials.refresh_token:

            return {
                "error":
                    "Google did not provide a "
                    "refresh token. Please reconnect "
                    "with Google."
            }

        google_account = GoogleAccount(
            email=email,
            access_token=credentials.token,
            refresh_token=(
                credentials.refresh_token
            ),
            user_id=current_user.id,
        )

        db.add(
            google_account
        )

    # -----------------------------------------------------
    # Save
    # -----------------------------------------------------

    db.commit()

    # -----------------------------------------------------
    # Remove temporary OAuth session data
    # -----------------------------------------------------

    request.session.pop(
        "google_state",
        None,
    )

    request.session.pop(
        "google_code_verifier",
        None,
    )

    request.session.pop(
        "google_user_id",
        None,
    )

    return RedirectResponse(
    url=f"{os.getenv('FRONTEND_URL', 'https://mailflow-frontend-one.vercel.app')}/email-accounts?google_connected=true",
    status_code=303,
)