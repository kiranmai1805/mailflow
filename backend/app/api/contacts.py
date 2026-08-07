from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.excel_service import load_excel
from app.services.validation_service import validate_contacts
from app.services.contact_service import import_contacts

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.post("/preview")
async def preview_contacts(file: UploadFile = File(...)):
    df = load_excel(file.file)

    valid, errors = validate_contacts(df)

    return {
        "total": len(df),
        "valid": len(valid),
        "errors": len(errors),
        "preview": valid[:20],
        "validation_errors": errors
    }


@router.post("/import")
async def import_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    df = load_excel(file.file)

    valid, errors = validate_contacts(df)

    result = import_contacts(db, valid)

    return {
        **result,
        "validation_errors": errors
    }