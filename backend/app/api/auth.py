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


class ProfileUpdateRequest(BaseModel):
    name: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

# =========================================================
# SIGN UP
# =========================================================

@router.post("/signup")
async def signup(
    data: SignupRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == data.email.lower())
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    hashed_password = password_hash.hash(
        data.password
    )

    new_user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        password_hash=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

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

    if not password_hash.verify(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

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
        "created_at": user.created_at,
    }


# =========================================================
# UPDATE PROFILE
# =========================================================

@router.put("/profile")
async def update_profile(
    data: ProfileUpdateRequest,
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
        raise HTTPException(
            status_code=404,
            detail="User account not found.",
        )

    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty.",
        )

    if len(name) > 100:
        raise HTTPException(
            status_code=400,
            detail="Name is too long.",
        )

    user.name = name

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


# =========================================================
# LOGOUT
# =========================================================
# =========================================================
# CHANGE PASSWORD
# =========================================================

@router.put("/password")
async def change_password(
    data: ChangePasswordRequest,
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
        raise HTTPException(
            status_code=404,
            detail="User account not found.",
        )

    # Check current password
    if not password_hash.verify(
        data.current_password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    # Validate new password
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long.",
        )

    # Confirm password
    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New passwords do not match.",
        )

    # Don't allow same password
    if password_hash.verify(
        data.new_password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password.",
        )

    # Hash new password
    user.password_hash = password_hash.hash(
        data.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully."
    }

@router.post("/logout")
async def logout(
    request: Request,
):
    request.session.clear()

    return {
        "message": "Logged out successfully",
    }