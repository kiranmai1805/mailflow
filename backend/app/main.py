from fastapi import FastAPI

from app.core.database import Base, engine

# IMPORTANT: import the model
from app.models.contact import Contact

from app.api.contacts import router as contacts_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(contacts_router)