from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Demo users database (simplified for demo)
DEMO_USERS = {
    "admin@rinexor.com": {
        "id": str(uuid.uuid4()),
        "email": "admin@rinexor.com",
        "name": "Super Admin",
        "role": "super_admin",
        "password": "admin123",
        "enterprise_id": None,
        "dca_id": None
    },
    "enterprise@demo.com": {
        "id": str(uuid.uuid4()),
        "email": "enterprise@demo.com",
        "name": "Enterprise Admin",
        "role": "enterprise_admin",
        "password": "enterprise123",
        "enterprise_id": "ent-001",
        "dca_id": None
    },
    "dca@demo.com": {
        "id": str(uuid.uuid4()),
        "email": "dca@demo.com",
        "name": "DCA User",
        "role": "dca_user",
        "password": "dca123",
        "enterprise_id": "ent-001",
        "dca_id": "dca-001"
    }
}

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

from typing import Optional

class User(BaseModel):
    id: str
    email: str
    name: str
    role: str
    enterprise_id: Optional[str] = None
    dca_id: Optional[str] = None

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = DEMO_USERS.get(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/login", response_model=Token)
def login(login_request: LoginRequest):
    user = DEMO_USERS.get(login_request.email)
    if not user or user["password"] != login_request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=User)
def get_profile(current_user: dict = Depends(get_current_user)):
    return User(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        enterprise_id=current_user["enterprise_id"],
        dca_id=current_user["dca_id"]
    )