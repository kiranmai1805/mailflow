from sqlalchemy.orm import Session

from app.models.contact import Contact


def import_contacts(db: Session, contacts: list):
    imported = 0
    skipped = 0

    for item in contacts:
        email = item["email"]

        existing = db.query(Contact).filter(Contact.email == email).first()

        if existing:
            skipped += 1
            continue

        db.add(Contact(email=email))
        imported += 1

    db.commit()

    return {
        "imported": imported,
        "skipped": skipped
    }