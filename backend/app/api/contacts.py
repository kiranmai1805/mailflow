from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.campaign import campaign_contacts

from app.models.user import User

from app.core.database import get_db

from app.api.dependencies import get_current_user

from app.services.excel_service import load_excel
from app.services.validation_service import validate_contacts
from app.services.contact_service import import_contacts


router = APIRouter(
    prefix="/contacts",
    tags=["Contacts"],
)


# =========================================================
# PREVIEW EXCEL
# =========================================================

@router.post("/preview")
async def preview_contacts(
    file: UploadFile = File(...),
):
    df = load_excel(file.file)

    valid, errors = validate_contacts(df)

    return {
        "total": len(df),
        "valid": len(valid),
        "errors": len(errors),
        "preview": valid[:20],
        "validation_errors": errors,
    }


# =========================================================
# IMPORT EXCEL
# =========================================================

@router.post("/import")
async def import_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    df = load_excel(file.file)

    valid, errors = validate_contacts(df)

    imported = 0
    skipped = 0

    for item in valid:

        email = (
            item.get("email")
            if isinstance(item, dict)
            else None
        )

        if not email:
            skipped += 1
            continue

        email = email.strip().lower()

        existing = (
            db.query(Contact)
            .filter(
                Contact.email == email,
                Contact.user_id == current_user.id,
            )
            .first()
        )

        if existing:
            skipped += 1
            continue

        contact = Contact(
            email=email,
            user_id=current_user.id,
        )

        db.add(contact)
        imported += 1

    db.commit()

    return {
        "imported": imported,
        "skipped": skipped,
        "validation_errors": errors,
    }


# =========================================================
# GET CURRENT USER CONTACTS
# =========================================================

@router.get("/")
async def get_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contacts = (
        db.query(Contact)
        .filter(
            Contact.user_id == current_user.id
        )
        .order_by(Contact.id.desc())
        .all()
    )

    return [
        {
            "id": contact.id,
            "email": contact.email,
        }
        for contact in contacts
    ]


# =========================================================
# DELETE CONTACT
# =========================================================

@router.delete("/{contact_id}")
async def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(Contact)
        .filter(
            Contact.id == contact_id,
            Contact.user_id == current_user.id,
        )
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=404,
            detail="Contact not found",
        )

    email = contact.email

    # Remove campaign-recipient relationships
    db.execute(
        campaign_contacts.delete().where(
            campaign_contacts.c.contact_id
            == contact_id
        )
    )

    # Remove campaign history
    from app.models.campaign_history import CampaignHistory

    db.query(CampaignHistory).filter(
        CampaignHistory.contact_id == contact_id
    ).delete(
        synchronize_session=False
    )

    db.delete(contact)

    db.commit()

    return {
        "message": "Contact removed successfully",
        "email": email,
    }