from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.campaign import campaign_contacts
from app.core.database import get_db

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
    file: UploadFile = File(...)
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
):
    df = load_excel(file.file)

    valid, errors = validate_contacts(df)

    result = import_contacts(db, valid)

    return {
        **result,
        "validation_errors": errors,
    }


# =========================================================
# GET ALL CONTACTS
# =========================================================

@router.get("/")
async def get_contacts(
    db: Session = Depends(get_db),
):
    contacts = db.query(Contact).all()

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
):
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id)
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=404,
            detail="Contact not found",
        )

    email = contact.email

    # Remove the contact from campaign-recipient
    # relationships first.
    db.execute(
        campaign_contacts.delete().where(
            campaign_contacts.c.contact_id == contact_id
        )
    )

    # Remove the actual contact.
    db.delete(contact)

    db.commit()

    return {
        "message": "Contact removed successfully",
        "email": email,
    }