from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import (
    create_access_token, 
    validate_user_credentials,
    get_current_active_user
)

router = APIRouter()

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user (simplified for demo)"""
    user = validate_user_credentials(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create token
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"], "user_id": user["id"]}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_active_user)):
    """Get current user info (simplified)"""
    return {
        "id": current_user.get("user_id", "demo_id"),
        "email": current_user.get("sub", "demo@email.com"),
        "role": current_user.get("role", "user"),
        "dca_id": current_user.get("dca_id")
    }