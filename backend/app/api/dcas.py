from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.schemas.dca import DCAResponse, DCAPerformanceResponse, DCACreate, DCAUpdate
from app.models.dca import DCA
from app.models.case import Case, CaseStatus
from sqlalchemy import func
import uuid

router = APIRouter()

@router.get("/", response_model=List[DCAResponse])
async def get_dcas(
    active_only: bool = Query(True, description="Show only active DCAs"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all DCAs"""
    query = db.query(DCA)
    
    if active_only:
        query = query.filter(DCA.is_active == True)
    
    dcas = query.order_by(DCA.performance_score.desc()).offset(skip).limit(limit).all()
    return dcas

@router.get("/{dca_id}", response_model=DCAResponse)
async def get_dca(
    dca_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get specific DCA"""
    dca = db.query(DCA).filter(DCA.id == dca_id).first()
    
    if not dca:
        raise HTTPException(status_code=404, detail="DCA not found")
    
    return dca

@router.post("/", response_model=DCAResponse)
async def create_dca(
    dca_data: DCACreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["enterprise_admin"]))
):
    """Create new DCA"""
    # Check if DCA with same name or code exists
    existing = db.query(DCA).filter(
        (DCA.name == dca_data.name) | (DCA.code == dca_data.code)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="DCA with this name or code already exists")
    
    dca = DCA(
        id=str(uuid.uuid4()),
        name=dca_data.name,
        code=dca_data.code,
        contact_person=dca_data.contact_person,
        email=dca_data.email,
        phone=dca_data.phone,
        address=dca_data.address,
        performance_score=0.0,
        recovery_rate=0.0,
        is_active=True,
        is_accepting_cases=True,
        created_at=datetime.utcnow(),
        onboarded_date=datetime.utcnow()
    )
    
    db.add(dca)
    db.commit()
    db.refresh(dca)
    
    return dca

@router.put("/{dca_id}", response_model=DCAResponse)
async def update_dca(
    dca_id: str,
    dca_update: DCAUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["enterprise_admin", "collection_manager"]))
):
    """Update DCA"""
    dca = db.query(DCA).filter(DCA.id == dca_id).first()
    
    if not dca:
        raise HTTPException(status_code=404, detail="DCA not found")
    
    for field, value in dca_update.dict(exclude_unset=True).items():
        setattr(dca, field, value)
    
    dca.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(dca)
    
    return dca

@router.get("/{dca_id}/performance", response_model=DCAPerformanceResponse)
async def get_dca_performance(
    dca_id: str,
    period_days: int = Query(30, ge=1, le=365, description="Performance period in days"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get DCA performance metrics"""
    dca = db.query(DCA).filter(DCA.id == dca_id).first()
    
    if not dca:
        raise HTTPException(status_code=404, detail="DCA not found")
    
    # Calculate period
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=period_days)
    
    # Get cases in period
    cases = db.query(Case).filter(
        Case.dca_id == dca_id,
        Case.created_at >= start_date,
        Case.created_at <= end_date
    ).all()
    
    # Calculate metrics
    total_cases = len(cases)
    resolved_cases = len([c for c in cases if c.status == CaseStatus.RESOLVED])
    
    total_recovered = sum(
        c.original_amount - c.current_amount 
        for c in cases if c.status == CaseStatus.RESOLVED
    )
    
    total_amount = sum(c.original_amount for c in cases)
    
    # Calculate resolution time for resolved cases
    resolved_times = []
    for case in cases:
        if case.status == CaseStatus.RESOLVED and case.closed_at and case.created_at:
            resolution_days = (case.closed_at - case.created_at).days
            resolved_times.append(resolution_days)
    
    avg_resolution_days = sum(resolved_times) / len(resolved_times) if resolved_times else 0
    
    return {
        "dca_id": dca_id,
        "dca_name": dca.name,
        "period_days": period_days,
        "period_start": start_date,
        "period_end": end_date,
        "total_cases": total_cases,
        "resolved_cases": resolved_cases,
        "pending_cases": total_cases - resolved_cases,
        "resolution_rate": (resolved_cases / total_cases * 100) if total_cases > 0 else 0,
        "total_recovered": total_recovered,
        "total_amount": total_amount,
        "recovery_rate": (total_recovered / total_amount * 100) if total_amount > 0 else 0,
        "avg_resolution_days": avg_resolution_days,
        "current_active_cases": dca.current_active_cases,
        "performance_score": dca.performance_score,
        "sla_compliance_rate": dca.sla_compliance_rate
    }

@router.get("/{dca_id}/cases")
async def get_dca_cases(
    dca_id: str,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get cases assigned to a DCA"""
    dca = db.query(DCA).filter(DCA.id == dca_id).first()
    
    if not dca:
        raise HTTPException(status_code=404, detail="DCA not found")
    
    query = db.query(Case).filter(Case.dca_id == dca_id)
    
    if status:
        query = query.filter(Case.status == status)
    
    cases = query.order_by(Case.created_at.desc()).offset(skip).limit(limit).all()
    
    return cases

@router.post("/{dca_id}/recalculate-performance")
async def recalculate_dca_performance(
    dca_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["enterprise_admin"]))
):
    """Recalculate DCA performance score"""
    dca = db.query(DCA).filter(DCA.id == dca_id).first()
    
    if not dca:
        raise HTTPException(status_code=404, detail="DCA not found")
    
    # Get performance data
    performance = db.query(DCAPerformance).filter(
        DCAPerformance.dca_id == dca_id
    ).order_by(DCAPerformance.calculated_at.desc()).first()
    
    if performance:
        # Update DCA with latest performance
        dca.performance_score = performance.performance_score
        dca.recovery_rate = performance.amount_recovered / (
            performance.amount_recovered + performance.cases_assigned * 1000
        ) * 100 if performance.cases_assigned > 0 else 0
        dca.avg_resolution_days = performance.avg_resolution_days
        dca.sla_compliance_rate = performance.sla_compliance_rate
        
        db.commit()
    
    return {"message": "Performance recalculated", "performance_score": dca.performance_score}