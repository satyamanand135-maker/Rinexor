"""
USER SCHEMAS - Pydantic models for user API requests/responses
"""
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, Literal
from datetime import datetime

from app.schemas.base import BaseSchema, IDSchema, TimestampSchema

# Define user roles as Literal type for Pydantic
UserRoleType = Literal["enterprise_admin", "collection_manager", "dca_agent"]


class UserBase(BaseSchema):
    email: EmailStr
    full_name: str
    role: UserRoleType
    dca_id: Optional[str] = None
    is_active: bool = True
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters')
        return v.strip()


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


class UserUpdate(BaseSchema):
    """Schema for updating an existing user"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRoleType] = None
    dca_id: Optional[str] = None
    is_active: Optional[bool] = None
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters')
        return v.strip() if v else v


class UserResponse(UserBase, IDSchema, TimestampSchema):
    """Schema for user API responses"""
    # Don't include password hash in responses
    pass


class UserLogin(BaseSchema):
    """Schema for user login"""
    username: str  # Can be email
    password: str


class UserToken(BaseSchema):
    """Schema for authentication token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class UserPasswordChange(BaseSchema):
    """Schema for password change"""
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('New password must be at least 6 characters')
        return v


class UserProfile(BaseSchema):
    """Schema for user profile information"""
    id: str
    email: EmailStr
    full_name: str
    role: UserRoleType
    dca_id: Optional[str] = None
    dca_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    permissions: list = []


class UserSearchParams(BaseSchema):
    """Schema for user search parameters"""
    email: Optional[str] = None
    role: Optional[UserRoleType] = None
    dca_id: Optional[str] = None
    is_active: Optional[bool] = None
    search_text: Optional[str] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"
    
    @validator('sort_by')
    def validate_sort_by(cls, v):
        valid_fields = ["email", "full_name", "role", "created_at", "last_login"]
        if v not in valid_fields:
            raise ValueError(f'Sort field must be one of: {", ".join(valid_fields)}')
        return v
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v not in ["asc", "desc"]:
            raise ValueError('Sort order must be "asc" or "desc"')
        return v


class UserBulkUpdate(BaseSchema):
    """Schema for bulk user updates"""
    user_ids: list[str]
    updates: UserUpdate
    
    @validator('user_ids')
    def validate_user_ids(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one user ID must be provided')
        if len(v) > 50:
            raise ValueError('Cannot update more than 50 users at once')
        return v


class UserStatistics(BaseSchema):
    """Schema for user statistics"""
    total_users: int
    active_users: int
    inactive_users: int
    users_by_role: dict
    users_by_dca: dict
    recent_logins: int  # Last 7 days
    new_users_this_month: int