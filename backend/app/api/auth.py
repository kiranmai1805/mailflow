from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User

from pwdlib import PasswordHash


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


password_hash = PasswordHash.recommended()


# =========================================================
# REQUEST MODELS
# =========================================================

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================================================
# SIGN UP
# =========================================================

@router.post("/signup")
async def signup(
    data: SignupRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    # Check if email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    # Basic password validation
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    # Hash password
    hashed_password = password_hash.hash(
        data.password
    )

    # Create user
    new_user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        password_hash=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically sign the user in
    request.session["user_id"] = new_user.id

    return {
        "message": "Account created successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
        },
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
async def login(
    data: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(
            User.email == data.email.lower()
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # Verify password
    if not password_hash.verify(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # Create session
    request.session["user_id"] = user.id

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated.",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        request.session.clear()

        raise HTTPException(
            status_code=401,
            detail="User account not found.",
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }


# =========================================================
# LOGOUT
# =========================================================

@router.post("/logout")
async def logout(
    request: Request,
):
    request.session.clear()

    return {
        "message": "Logged out successfully",
    }