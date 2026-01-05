from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.schemas.case import (
    CaseCreate, CaseResponse, CaseUpdate, 
    CaseAllocationRequest, CaseSearchParams
)
from app.services.workflow_service import WorkflowService
from app.services.ai_service import AIService
from app.models.case import Case, CaseStatus, CasePriority
from app.models.case_note import CaseNote
import uuid

router = APIRouter()

# Initialize AI service
ai_service = AIService()
ai_service.initialize()

@router.post("/", response_model=CaseResponse)
async def create_case(
    case_data: CaseCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["enterprise_admin", "collection_manager"]))
):
    """Create new case with AI processing"""
    # Process through workflow
    processed_data = WorkflowService.process_new_case(case_data.dict(), db)
    
    # Create case
    case = Case(
        id=str(uuid.uuid4()),
        account_id=case_data.account_id,
        debtor_name=case_data.debtor_name,
        debtor_email=case_data.debtor_email,
        debtor_phone=case_data.debtor_phone,
        debtor_address=case_data.debtor_address,
        original_amount=case_data.original_amount,
        current_amount=case_data.original_amount,
        currency=case_data.currency,
        days_delinquent=case_data.days_delinquent,
        debt_age_days=case_data.debt_age_days,
        status=processed_data["status"],
        priority=processed_data["priority"],
        recovery_score=processed_data["recovery_score"],
        recovery_score_band="high" if processed_data["recovery_score"] >= 70 else "medium" if processed_data["recovery_score"] >= 40 else "low",
        dca_id=processed_data["dca_id"],
        allocated_by=current_user["id"] if processed_data["dca_id"] else None,
        allocation_date=datetime.utcnow() if processed_data["dca_id"] else None,
        ml_features={},  # Will be populated by AI
        sla_contact_deadline=processed_data["sla_contact_deadline"],
        sla_resolution_deadline=processed_data["sla_resolution_deadline"],
        created_at=datetime.utcnow()
    )
    
    db.add(case)
    db.commit()
    db.refresh(case)
    
    # Run AI analysis in background
    background_tasks.add_task(
        perform_ai_analysis,
        case.id,
        case_data.dict(),
        db
    )
    
    return case

async def perform_ai_analysis(case_id: str, case_data: dict, db: Session):
    """Background task for AI analysis"""
    try:
        # Get AI insights
        ai_result = ai_service.analyze_case(case_data)
        
        # Update case with AI insights
        case = db.query(Case).filter(Case.id == case_id).first()
        if case:
            case.ml_features = {
                "ai_analysis": ai_result,
                "analyzed_at": datetime.utcnow().isoformat()
            }
            case.recovery_score = ai_result["recovery_score"]
            case.priority = ai_result["priority_level"]
            db.commit()
    except Exception as e:
        print(f"AI analysis failed for case {case_id}: {e}")

@router.get("/", response_model=List[CaseResponse])
async def get_cases(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    dca_id: Optional[str] = Query(None, description="Filter by DCA"),
    days_delinquent_min: Optional[int] = Query(None, description="Min days delinquent"),
    days_delinquent_max: Optional[int] = Query(None, description="Max days delinquent"),
    search: Optional[str] = Query(None, description="Search in debtor name or account ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get cases with filtering and pagination"""
    query = db.query(Case)
    
    # Apply role-based filtering
    if current_user["role"] == "dca_agent":
        query = query.filter(Case.dca_id == current_user.get("dca_id"))
    elif current_user["role"] == "collection_manager":
        # Managers see cases assigned to their DCAs
        if current_user.get("dca_id"):
            query = query.filter(Case.dca_id == current_user.get("dca_id"))
    
    # Apply filters
    if status:
        query = query.filter(Case.status == status)
    if priority:
        query = query.filter(Case.priority == priority)
    if dca_id:
        query = query.filter(Case.dca_id == dca_id)
    if days_delinquent_min is not None:
        query = query.filter(Case.days_delinquent >= days_delinquent_min)
    if days_delinquent_max is not None:
        query = query.filter(Case.days_delinquent <= days_delinquent_max)
    if search:
        query = query.filter(
            (Case.debtor_name.ilike(f"%{search}%")) | 
            (Case.account_id.ilike(f"%{search}%"))
        )
    
    # Get total count for pagination
    total = query.count()
    
    # Apply pagination
    cases = query.order_by(Case.created_at.desc()).offset(skip).limit(limit).all()
    
    return cases

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get specific case by ID"""
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check permissions
    if (current_user["role"] == "dca_agent" and 
        case.dca_id != current_user.get("dca_id")):
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
    
    return case

@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: str,
    case_update: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update case"""
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check permissions
    if current_user["role"] == "dca_agent":
        if case.dca_id != current_user.get("dca_id"):
            raise HTTPException(status_code=403, detail="Not authorized to update this case")
        # DCA agents can only update status and current amount
        if case_update.status:
            old_status = case.status
            case.status = case_update.status
            case.updated_at = datetime.utcnow()
            
            # Add status change note
            note = CaseNote(
                id=str(uuid.uuid4()),
                case_id=case_id,
                user_id=current_user["id"],
                content=f"Status changed from {old_status} to {case_update.status}",
                note_type="status_change"
            )
            db.add(note)
        
        if case_update.current_amount is not None:
            case.current_amount = case_update.current_amount
    else:
        # Admins and managers can update anything
        for field, value in case_update.dict(exclude_unset=True).items():
            setattr(case, field, value)
        case.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(case)
    
    return case

@router.post("/{case_id}/notes")
async def add_case_note(
    case_id: str,
    content: str,
    note_type: str = "general",
    is_internal: bool = False,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add note to case"""
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check permissions
    if (current_user["role"] == "dca_agent" and 
        case.dca_id != current_user.get("dca_id")):
        raise HTTPException(status_code=403, detail="Not authorized to add notes to this case")
    
    note = CaseNote(
        id=str(uuid.uuid4()),
        case_id=case_id,
        user_id=current_user["id"],
        content=content,
        note_type=note_type,
        is_internal=is_internal,
        created_at=datetime.utcnow()
    )
    
    db.add(note)
    db.commit()
    
    return {"message": "Note added successfully", "note_id": note.id}

@router.get("/{case_id}/notes")
async def get_case_notes(
    case_id: str,
    include_internal: bool = False,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get notes for a case"""
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check permissions
    if (current_user["role"] == "dca_agent" and 
        case.dca_id != current_user.get("dca_id")):
        raise HTTPException(status_code=403, detail="Not authorized to view notes for this case")
    
    query = db.query(CaseNote).filter(CaseNote.case_id == case_id)
    
    # DCA agents can't see internal notes
    if current_user["role"] == "dca_agent" or not include_internal:
        query = query.filter(CaseNote.is_internal == False)
    
    notes = query.order_by(CaseNote.created_at.desc()).all()
    
    return notes

@router.post("/allocate")
async def allocate_cases(
    allocation_request: CaseAllocationRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["enterprise_admin", "collection_manager"]))
):
    """Allocate cases to DCA"""
    allocated = []
    failed = []
    
    for case_id in allocation_request.case_ids:
        case = db.query(Case).filter(Case.id == case_id).first()
        
        if not case:
            failed.append({"case_id": case_id, "error": "Case not found"})
            continue
        
        # Update allocation
        case.dca_id = allocation_request.dca_id
        case.allocated_by = current_user["id"]
        case.allocation_date = datetime.utcnow()
        case.allocation_reason = allocation_request.allocation_reason
        case.status = CaseStatus.ASSIGNED
        case.updated_at = datetime.utcnow()
        
        # Add allocation note
        note = CaseNote(
            id=str(uuid.uuid4()),
            case_id=case_id,
            user_id=current_user["id"],
            content=f"Case allocated to DCA {allocation_request.dca_id}. Reason: {allocation_request.allocation_reason}",
            note_type="allocation"
        )
        db.add(note)
        
        allocated.append(case_id)
    
    db.commit()
    
    return {
        "allocated": allocated,
        "failed": failed,
        "total_allocated": len(allocated)
    }

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get dashboard statistics"""
    from sqlalchemy import func, case as sql_case
    
    # Base query
    query = db.query(Case)
    
    # Apply role-based filtering
    if current_user["role"] == "dca_agent":
        query = query.filter(Case.dca_id == current_user.get("dca_id"))
    elif current_user["role"] == "collection_manager":
        if current_user.get("dca_id"):
            query = query.filter(Case.dca_id == current_user.get("dca_id"))
    
    # Calculate stats
    total_cases = query.count()
    
    active_cases = query.filter(
        Case.status.in_([CaseStatus.NEW, CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS])
    ).count()
    
    total_amount = query.with_entities(func.sum(Case.original_amount)).scalar() or 0
    
    recovered_amount = query.filter(
        Case.status == CaseStatus.RESOLVED
    ).with_entities(
        func.sum(Case.original_amount - Case.current_amount)
    ).scalar() or 0
    
    # SLA compliance
    sla_compliant = query.filter(
        Case.sla_breached == False,
        Case.status.in_([CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS, CaseStatus.RESOLVED])
    ).count()
    
    sla_total = query.filter(
        Case.status.in_([CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS, CaseStatus.RESOLVED])
    ).count() or 1
    
    # Cases by status
    status_counts = {}
    for status in CaseStatus:
        count = query.filter(Case.status == status).count()
        status_counts[status.value] = count
    
    # Cases by priority
    priority_counts = {}
    for priority in CasePriority:
        count = query.filter(Case.priority == priority).count()
        priority_counts[priority.value] = count
    
    return {
        "total_cases": total_cases,
        "active_cases": active_cases,
        "total_amount": float(total_amount),
        "recovered_amount": float(recovered_amount),
        "recovery_rate": (recovered_amount / total_amount * 100) if total_amount > 0 else 0,
        "sla_compliance_rate": (sla_compliant / sla_total * 100),
        "cases_by_status": status_counts,
        "cases_by_priority": priority_counts,
        "avg_recovery_score": query.with_entities(func.avg(Case.recovery_score)).scalar() or 0
    }