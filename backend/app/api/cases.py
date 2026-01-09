from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import random
from .auth import get_current_user

router = APIRouter(prefix="/api", tags=["cases"])

# Demo data
DEMO_ENTERPRISES = [
    {"id": "ent-001", "name": "First National Bank"},
    {"id": "ent-002", "name": "Credit Union Plus"},
    {"id": "ent-003", "name": "Metro Financial"}
]

DEMO_DCAS = [
    {"id": "dca-001", "name": "Recovery Solutions Inc", "performance_score": 85, "active_cases": 45, "resolved_cases": 120, "sla_breaches": 3},
    {"id": "dca-002", "name": "Debt Masters LLC", "performance_score": 92, "active_cases": 38, "resolved_cases": 156, "sla_breaches": 1},
    {"id": "dca-003", "name": "Collection Experts", "performance_score": 78, "active_cases": 52, "resolved_cases": 98, "sla_breaches": 7},
    {"id": "dca-004", "name": "Professional Recovery", "performance_score": 88, "active_cases": 41, "resolved_cases": 134, "sla_breaches": 2},
]

# Generate demo cases
def generate_demo_cases():
    cases = []
    statuses = ["pending", "in_progress", "contacted", "resolved", "failed"]
    priorities = ["low", "medium", "high", "critical"]
    
    borrower_names = [
        "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson",
        "Lisa Anderson", "Robert Taylor", "Jennifer Martinez", "William Garcia", "Mary Rodriguez"
    ]
    
    for i in range(50):
        case_id = str(uuid.uuid4())
        borrower_name = random.choice(borrower_names)
        email = f"{borrower_name.lower().replace(' ', '.')}@email.com"
        
        case = {
            "id": case_id,
            "borrower_name": borrower_name,
            "borrower_email": email,
            "borrower_phone": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "amount": random.randint(500, 50000),
            "status": random.choice(statuses),
            "priority": random.choice(priorities),
            "ai_score": random.randint(20, 95),
            "sla_deadline": (datetime.now() + timedelta(days=random.randint(-5, 30))).isoformat(),
            "assigned_dca_id": random.choice(DEMO_DCAS)["id"],
            "enterprise_id": random.choice(DEMO_ENTERPRISES)["id"],
            "created_at": (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
            "remarks": "Demo case for testing purposes" if random.random() > 0.7 else None
        }
        cases.append(case)
    
    return cases

DEMO_CASES = generate_demo_cases()
AUDIT_LOG: List[dict] = []

def log_audit_event(actor: dict, action: str, case: Optional[dict] = None, details: Optional[Dict[str, Any]] = None):
    AUDIT_LOG.append(
        {
            "id": str(uuid.uuid4()),
            "at": datetime.now().isoformat(),
            "actor_email": actor.get("email"),
            "actor_role": actor.get("role"),
            "action": action,
            "case_id": case.get("id") if case else None,
            "enterprise_id": case.get("enterprise_id") if case else actor.get("enterprise_id"),
            "dca_id": case.get("assigned_dca_id") if case else actor.get("dca_id"),
            "details": details,
        }
    )

class Case(BaseModel):
    id: str
    borrower_name: str
    borrower_email: str
    borrower_phone: str
    amount: int
    status: str
    priority: str
    ai_score: int
    sla_deadline: str
    assigned_dca_id: str
    enterprise_id: str
    created_at: str
    updated_at: str
    remarks: Optional[str] = None

class CaseUpdate(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None
    assigned_dca_id: Optional[str] = None

class AuditEvent(BaseModel):
    id: str
    at: str
    actor_email: str
    actor_role: str
    action: str
    case_id: Optional[str] = None
    enterprise_id: Optional[str] = None
    dca_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class KPI(BaseModel):
    total_cases: int
    total_dcas: int
    total_enterprises: int
    overall_recovery_rate: int
    sla_breaches: int
    high_priority_cases: int

class DCA(BaseModel):
    id: str
    name: str
    contact_email: str
    performance_score: int
    active_cases: int
    resolved_cases: int
    sla_breaches: int

class Enterprise(BaseModel):
    id: str
    name: str
    total_cases: int
    active_cases: int
    resolved_cases: int
    recovery_rate: int

@router.get("/cases", response_model=List[Case])
def get_cases(
    enterprise_id: Optional[str] = Query(None),
    assigned_dca_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    cases = DEMO_CASES.copy()
    
    # Filter based on user role
    if current_user["role"] == "enterprise_admin" and current_user["enterprise_id"]:
        cases = [c for c in cases if c["enterprise_id"] == current_user["enterprise_id"]]
    elif current_user["role"] == "dca_user" and current_user["dca_id"]:
        cases = [c for c in cases if c["assigned_dca_id"] == current_user["dca_id"]]
    
    # Apply additional filters
    if enterprise_id:
        cases = [c for c in cases if c["enterprise_id"] == enterprise_id]
    if assigned_dca_id:
        cases = [c for c in cases if c["assigned_dca_id"] == assigned_dca_id]
    if status:
        cases = [c for c in cases if c["status"] == status]
    
    if limit:
        cases = cases[:limit]
    
    return cases

@router.get("/cases/{case_id}", response_model=Case)
def get_case(case_id: str, current_user: dict = Depends(get_current_user)):
    case = next((c for c in DEMO_CASES if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check permissions
    if current_user["role"] == "enterprise_admin" and case["enterprise_id"] != current_user["enterprise_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user["role"] == "dca_user" and case["assigned_dca_id"] != current_user["dca_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return case

@router.put("/cases/{case_id}", response_model=Case)
def update_case(case_id: str, case_update: CaseUpdate, current_user: dict = Depends(get_current_user)):
    case_index = next((i for i, c in enumerate(DEMO_CASES) if c["id"] == case_id), None)
    if case_index is None:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case = DEMO_CASES[case_index]
    
    # Check permissions
    if current_user["role"] == "enterprise_admin" and case["enterprise_id"] != current_user["enterprise_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user["role"] == "dca_user" and case["assigned_dca_id"] != current_user["dca_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    changes: Dict[str, Any] = {}
    
    # Update case
    if case_update.status:
        changes["status"] = {"from": case.get("status"), "to": case_update.status}
        case["status"] = case_update.status
    if case_update.remarks is not None:
        changes["remarks"] = {"from": case.get("remarks"), "to": case_update.remarks}
        case["remarks"] = case_update.remarks
    if case_update.assigned_dca_id is not None:
        if current_user["role"] not in ["enterprise_admin", "super_admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        changes["assigned_dca_id"] = {"from": case.get("assigned_dca_id"), "to": case_update.assigned_dca_id}
        case["assigned_dca_id"] = case_update.assigned_dca_id
    
    case["updated_at"] = datetime.now().isoformat()
    DEMO_CASES[case_index] = case

    if changes:
        log_audit_event(current_user, "case_updated", case=case, details=changes)
    
    return case

@router.get("/dashboard/kpis", response_model=KPI)
def get_kpis(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_cases = len(DEMO_CASES)
    resolved_cases = len([c for c in DEMO_CASES if c["status"] == "resolved"])
    overdue_cases = len([c for c in DEMO_CASES if datetime.fromisoformat(c["sla_deadline"]) < datetime.now()])
    high_priority = len([c for c in DEMO_CASES if c["priority"] in ["high", "critical"]])
    
    return KPI(
        total_cases=total_cases,
        total_dcas=len(DEMO_DCAS),
        total_enterprises=len(DEMO_ENTERPRISES),
        overall_recovery_rate=int((resolved_cases / total_cases) * 100) if total_cases > 0 else 0,
        sla_breaches=overdue_cases,
        high_priority_cases=high_priority
    )

@router.get("/dashboard/dcas", response_model=List[DCA])
def get_dcas(current_user: dict = Depends(get_current_user)):
    return [
        DCA(
            id=dca["id"],
            name=dca["name"],
            contact_email=f"contact@{dca['name'].lower().replace(' ', '')}.com",
            performance_score=dca["performance_score"],
            active_cases=dca["active_cases"],
            resolved_cases=dca["resolved_cases"],
            sla_breaches=dca["sla_breaches"]
        )
        for dca in DEMO_DCAS
    ]

@router.post("/cases/upload")
async def upload_cases(current_user: dict = Depends(get_current_user)):
    """
    Handle bulk case upload (demo endpoint)
    In a real app, this would process uploaded files and create cases
    """
    if current_user["role"] not in ["enterprise_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # For demo purposes, generate some new cases
    import uuid
    from datetime import datetime, timedelta
    import random
    
    new_cases = []
    for i in range(3):  # Create 3 demo cases
        case_id = str(uuid.uuid4())
        case = {
            "id": case_id,
            "borrower_name": f"Uploaded Case {i+1}",
            "borrower_email": f"uploaded{i+1}@example.com",
            "borrower_phone": f"+1-555-{random.randint(1000, 9999)}",
            "amount": random.randint(1000, 25000),
            "status": "pending",
            "priority": random.choice(["medium", "high"]),
            "ai_score": random.randint(60, 90),
            "sla_deadline": (datetime.now() + timedelta(days=random.randint(7, 30))).isoformat(),
            "assigned_dca_id": random.choice(DEMO_DCAS)["id"],
            "enterprise_id": current_user["enterprise_id"] or "ent-001",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "remarks": "Uploaded via bulk import"
        }
        new_cases.append(case)
        DEMO_CASES.append(case)
        log_audit_event(current_user, "case_uploaded", case=case, details={"source": "bulk_import"})
    
    return {"message": f"Successfully uploaded {len(new_cases)} cases", "cases": new_cases}

@router.get("/audit", response_model=List[AuditEvent])
def get_audit_events(
    case_id: Optional[str] = Query(None),
    limit: Optional[int] = Query(50),
    current_user: dict = Depends(get_current_user),
):
    events = AUDIT_LOG.copy()

    if current_user["role"] == "enterprise_admin" and current_user["enterprise_id"]:
        events = [e for e in events if e.get("enterprise_id") == current_user["enterprise_id"]]
    elif current_user["role"] == "dca_user" and current_user["dca_id"]:
        events = [e for e in events if e.get("dca_id") == current_user["dca_id"]]

    if case_id:
        events = [e for e in events if e.get("case_id") == case_id]

    events.sort(key=lambda e: e.get("at", ""), reverse=True)

    if limit:
        events = events[:limit]

    return events

@router.get("/dashboard/enterprises", response_model=List[Enterprise])
def get_enterprises(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    enterprises = []
    for ent in DEMO_ENTERPRISES:
        ent_cases = [c for c in DEMO_CASES if c["enterprise_id"] == ent["id"]]
        total_cases = len(ent_cases)
        active_cases = len([c for c in ent_cases if c["status"] in ["pending", "in_progress", "contacted"]])
        resolved_cases = len([c for c in ent_cases if c["status"] == "resolved"])
        
        enterprises.append(Enterprise(
            id=ent["id"],
            name=ent["name"],
            total_cases=total_cases,
            active_cases=active_cases,
            resolved_cases=resolved_cases,
            recovery_rate=int((resolved_cases / total_cases) * 100) if total_cases > 0 else 0
        ))
    
    return enterprises
