from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.models.case import CaseStatus, CasePriority, RecoveryScoreBand
from .base import BaseSchema, TimestampSchema

class CaseBase(BaseSchema):
    account_id: str = Field(..., description="Unique account identifier")
    debtor_name: str = Field(..., min_length=2, max_length=100)
    debtor_email: Optional[str] = None
    debtor_phone: Optional[str] = None
    debtor_address: Optional[str] = None
    original_amount: float = Field(..., gt=0, description="Original debt amount")
    current_amount: float = Field(..., gt=0, description="Current outstanding amount")
    currency: str = "USD"
    days_delinquent: int = Field(0, ge=0)
    debt_age_days: int = Field(..., ge=0)

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseSchema):
    status: Optional[CaseStatus] = None
    priority: Optional[CasePriority] = None
    current_amount: Optional[float] = None
    dca_id: Optional[str] = None
    recovery_score: Optional[float] = Field(None, ge=0, le=1)
    
    @validator('current_amount')
    def validate_current_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError('Current amount cannot be negative')
        return v

class CaseInDB(CaseBase, TimestampSchema):
    id: str
    status: CaseStatus
    priority: CasePriority
    recovery_score: float
    recovery_score_band: RecoveryScoreBand
    dca_id: Optional[str]
    allocated_by: Optional[str]
    allocation_date: Optional[datetime]
    ml_features: dict
    sla_contact_deadline: Optional[datetime]
    sla_resolution_deadline: Optional[datetime]
    sla_breached: bool
    closed_at: Optional[datetime]

class CaseResponse(CaseInDB):
    dca_name: Optional[str] = None
    allocated_by_name: Optional[str] = None
    
class CaseAllocationRequest(BaseSchema):
    case_ids: List[str]
    dca_id: str
    allocation_reason: Optional[str] = None
    
class CaseSearchParams(BaseSchema):
    status: Optional[CaseStatus] = None
    priority: Optional[CasePriority] = None
    dca_id: Optional[str] = None
    recovery_score_min: Optional[float] = None
    recovery_score_max: Optional[float] = None
    days_delinquent_min: Optional[int] = None
    days_delinquent_max: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search_text: Optional[str] = None