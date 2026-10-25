from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user

from app.models.user import User
from app.models.email_account import EmailAccount

from app.services.smtp_service import send_smtp_email
from app.models.google_account import GoogleAccount

router = APIRouter(
    prefix="/email-accounts",
    tags=["Email Accounts"],
)


class EmailAccountCreate(BaseModel):
    email: str
    provider: str
    smtp_host: str
    smtp_port: int = 587
    username: str
    password: str
    use_tls: bool = True


# =========================================================
# ADD EMAIL ACCOUNT
# =========================================================

@router.post("/")
async def create_email_account(
    account: EmailAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(EmailAccount)
        .filter(
            EmailAccount.email == account.email,
            EmailAccount.user_id == current_user.id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This email account is already connected",
        )

    new_account = EmailAccount(
        email=account.email,
        provider=account.provider,
        smtp_host=account.smtp_host,
        smtp_port=account.smtp_port,
        username=account.username,
        password=account.password,
        use_tls=account.use_tls,
        user_id=current_user.id,
    )

    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    return {
        "message": "Email account added successfully",
        "id": new_account.id,
        "email": new_account.email,
        "provider": new_account.provider,
    }


# =========================================================
# LIST EMAIL ACCOUNTS
# =========================================================



@router.get("/")
async def list_email_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    smtp_accounts = (
        db.query(EmailAccount)
        .filter(EmailAccount.user_id == current_user.id)
        .all()
    )

    google_accounts = (
        db.query(GoogleAccount)
        .filter(GoogleAccount.user_id == current_user.id)
        .all()
    )

    return [
        {
            "id": account.id,
            "email": account.email,
            "provider": account.provider,
            "account_type": "smtp",
        }
        for account in smtp_accounts
    ] + [
        {
            "id": account.id,
            "email": account.email,
            "provider": "Google",
            "account_type": "google",
        }
        for account in google_accounts
    ]


# =========================================================
# TEST SMTP ACCOUNT
# =========================================================

@router.post("/{account_id}/test")
async def test_email_account(
    account_id: int,
    recipient: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(EmailAccount)
        .filter(
            EmailAccount.id == account_id,
            EmailAccount.user_id == current_user.id,
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Email account not found",
        )

    try:
        result = await send_smtp_email(
            smtp_host=account.smtp_host,
            smtp_port=account.smtp_port,
            username=account.username,
            password=account.password,
            recipient=recipient,
            subject="MailFlow SMTP Test",
            body=(
                "This is a test email sent from "
                "MailFlow using SMTP."
            ),
            use_tls=account.use_tls,
        )

        return result

    except Exception as error:

        print(
            f"SMTP test failed: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"SMTP test failed: {str(error)}",
        )


# =========================================================
# DELETE EMAIL ACCOUNT
# =========================================================

@router.delete("/{account_id}")
async def delete_email_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(EmailAccount)
        .filter(
            EmailAccount.id == account_id,
            EmailAccount.user_id == current_user.id,
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Email account not found",
        )

    email = account.email

    db.delete(account)
    db.commit()

    return {
        "message": "Email account removed successfully",
        "email": email,
    }


@router.delete("/google/{account_id}")
async def delete_google_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = (
        db.query(GoogleAccount)
        .filter(
            GoogleAccount.id == account_id,
            GoogleAccount.user_id == current_user.id,
        )
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Google account not found",
        )

    email = account.email
    db.delete(account)
    db.commit()

    return {
        "message": "Google account disconnected successfully",
        "email": email,
    }
