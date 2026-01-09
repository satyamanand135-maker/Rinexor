from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import random
import csv
import io
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
    {"id": "dca-005", "name": "Prime Recovery Partners", "performance_score": 95, "active_cases": 72, "resolved_cases": 210, "sla_breaches": 4},
    {"id": "dca-006", "name": "Assured Collections Group", "performance_score": 82, "active_cases": 26, "resolved_cases": 94, "sla_breaches": 0},
    {"id": "dca-007", "name": "Swift Debt Resolution", "performance_score": 67, "active_cases": 11, "resolved_cases": 42, "sla_breaches": 2},
]


def compute_case_risk(amount: int, sla_deadline: datetime):
    now = datetime.now()
    days_overdue = 0
    if sla_deadline < now:
        days_overdue = (now - sla_deadline).days

    score = 40

    if amount >= 20000:
        score += 25
    elif amount >= 10000:
        score += 15
    elif amount >= 5000:
        score += 5

    score += min(days_overdue * 5, 35)

    if score > 95:
        score = 95

    if score >= 85:
        priority = "critical"
    elif score >= 70:
        priority = "high"
    elif score >= 50:
        priority = "medium"
    else:
        priority = "low"

    return priority, score


def select_dca_for_case(priority: str) -> str:
    sorted_dcas = sorted(
        DEMO_DCAS,
        key=lambda d: (
            -(d.get("performance_score") or 0),
            d.get("sla_breaches") or 0,
            d.get("active_cases") or 0,
        ),
    )
    if not sorted_dcas:
        return ""
    return sorted_dcas[0]["id"]


# Generate demo cases
def generate_demo_cases():
    cases = []
    statuses = ["pending", "in_progress", "contacted", "resolved", "failed"]

    borrower_names = [
        "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson",
        "Lisa Anderson", "Robert Taylor", "Jennifer Martinez", "William Garcia", "Mary Rodriguez"
    ]
    
    for i in range(50):
        case_id = str(uuid.uuid4())
        borrower_name = random.choice(borrower_names)
        email = f"{borrower_name.lower().replace(' ', '.')}@email.com"
        amount = random.randint(500, 50000)
        sla_deadline_dt = datetime.now() + timedelta(days=random.randint(-5, 30))
        priority, ai_score = compute_case_risk(amount, sla_deadline_dt)
        assigned_dca_id = select_dca_for_case(priority)

        case = {
            "id": case_id,
            "borrower_name": borrower_name,
            "borrower_email": email,
            "borrower_phone": f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "amount": amount,
            "status": random.choice(statuses),
            "priority": priority,
            "ai_score": ai_score,
            "sla_deadline": sla_deadline_dt.isoformat(),
            "assigned_dca_id": assigned_dca_id,
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
    recovered_amount: int
    average_resolution_days: Optional[float] = None


class DCACreate(BaseModel):
    name: str
    contact_email: Optional[str] = None
    performance_score: Optional[int] = None

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
    results: List[DCA] = []
    for dca in DEMO_DCAS:
        dca_cases = [c for c in DEMO_CASES if c["assigned_dca_id"] == dca["id"]]

        active_cases = len(
            [c for c in dca_cases if c["status"] in ["pending", "in_progress", "contacted", "promised"]]
        )
        resolved_cases = len(
            [c for c in dca_cases if c["status"] in ["recovered", "resolved"]]
        )
        recovered_amount = sum(
            c["amount"] for c in dca_cases if c["status"] in ["recovered", "resolved"]
        )

        durations: List[float] = []
        for c in dca_cases:
            if c["status"] in ["recovered", "resolved"]:
                try:
                    created_at = datetime.fromisoformat(c["created_at"])
                    updated_at = datetime.fromisoformat(c["updated_at"])
                    delta_days = (updated_at - created_at).total_seconds() / 86400.0
                    if delta_days >= 0:
                        durations.append(delta_days)
                except Exception:
                    continue

        avg_resolution_days: Optional[float] = None
        if durations:
            avg_resolution_days = round(sum(durations) / len(durations), 1)

        results.append(
            DCA(
                id=dca["id"],
                name=dca["name"],
                contact_email=dca.get("contact_email")
                or f"contact@{dca['name'].lower().replace(' ', '')}.com",
                performance_score=dca["performance_score"],
                active_cases=active_cases,
                resolved_cases=resolved_cases,
                sla_breaches=dca["sla_breaches"],
                recovered_amount=recovered_amount,
                average_resolution_days=avg_resolution_days,
            )
        )

    return results


@router.post("/dashboard/dcas", response_model=DCA)
def create_dca(dca_in: DCACreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["super_admin", "enterprise_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    dca_id = str(uuid.uuid4())
    contact_email = dca_in.contact_email or f"contact@{dca_in.name.lower().replace(' ', '')}.com"
    performance_score = dca_in.performance_score if dca_in.performance_score is not None else 80

    dca = {
        "id": dca_id,
        "name": dca_in.name,
        "contact_email": contact_email,
        "performance_score": performance_score,
        "active_cases": 0,
        "resolved_cases": 0,
        "sla_breaches": 0,
    }
    DEMO_DCAS.append(dca)

    return DCA(
        id=dca_id,
        name=dca_in.name,
        contact_email=contact_email,
        performance_score=performance_score,
        active_cases=0,
        resolved_cases=0,
        sla_breaches=0,
    )

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
    for i in range(3):
        case_id = str(uuid.uuid4())
        amount = random.randint(1000, 25000)
        sla_deadline_dt = datetime.now() + timedelta(days=random.randint(7, 30))
        priority, ai_score = compute_case_risk(amount, sla_deadline_dt)
        assigned_dca_id = select_dca_for_case(priority)

        case = {
            "id": case_id,
            "borrower_name": f"Uploaded Case {i+1}",
            "borrower_email": f"uploaded{i+1}@example.com",
            "borrower_phone": f"+1-555-{random.randint(1000, 9999)}",
            "amount": amount,
            "status": "pending",
            "priority": priority,
            "ai_score": ai_score,
            "sla_deadline": sla_deadline_dt.isoformat(),
            "assigned_dca_id": assigned_dca_id,
            "enterprise_id": current_user["enterprise_id"] or "ent-001",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "remarks": "Uploaded via bulk import"
        }
        new_cases.append(case)
        DEMO_CASES.append(case)
        log_audit_event(current_user, "case_uploaded", case=case, details={"source": "bulk_import"})
    
    return {"message": f"Successfully uploaded {len(new_cases)} cases", "cases": new_cases}

@router.post("/cases/upload-csv")
async def upload_cases_csv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["enterprise_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except Exception:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8 encoded")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV missing header row")

    now = datetime.now()
    new_cases: List[dict] = []

    for idx, row in enumerate(reader):
        borrower_name = (row.get("borrower_name") or "").strip()
        if not borrower_name:
            raise HTTPException(status_code=400, detail=f"Row {idx + 2}: borrower_name is required")

        amount_raw = (row.get("amount") or "").strip()
        if not amount_raw:
            raise HTTPException(status_code=400, detail=f"Row {idx + 2}: amount is required")
        try:
            amount = int(float(amount_raw))
        except Exception:
            raise HTTPException(status_code=400, detail=f"Row {idx + 2}: amount must be a number")

        borrower_email = (row.get("borrower_email") or f"{borrower_name.lower().replace(' ', '.')}@example.com").strip()
        borrower_phone = (row.get("borrower_phone") or f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}").strip()

        status = (row.get("status") or "pending").strip() or "pending"

        sla_deadline_raw = (row.get("sla_deadline") or "").strip()
        if sla_deadline_raw:
            try:
                sla_deadline_dt = datetime.fromisoformat(sla_deadline_raw)
                sla_deadline = sla_deadline_raw
            except Exception:
                raise HTTPException(status_code=400, detail=f"Row {idx + 2}: sla_deadline must be ISO datetime")
        else:
            sla_deadline_dt = now + timedelta(days=random.randint(7, 30))
            sla_deadline = sla_deadline_dt.isoformat()

        priority, ai_score = compute_case_risk(amount, sla_deadline_dt)

        assigned_dca_id = (row.get("assigned_dca_id") or "").strip()
        if not assigned_dca_id:
            assigned_dca_id = select_dca_for_case(priority)

        if current_user["role"] == "enterprise_admin" and current_user.get("enterprise_id"):
            enterprise_id = current_user["enterprise_id"]
        else:
            enterprise_id = (row.get("enterprise_id") or "").strip() or current_user.get("enterprise_id") or "ent-001"

        remarks = (row.get("remarks") or "").strip() or "Uploaded via CSV"

        case = {
            "id": str(uuid.uuid4()),
            "borrower_name": borrower_name,
            "borrower_email": borrower_email,
            "borrower_phone": borrower_phone,
            "amount": amount,
            "status": status,
            "priority": priority,
            "ai_score": ai_score,
            "sla_deadline": sla_deadline,
            "assigned_dca_id": assigned_dca_id,
            "enterprise_id": enterprise_id,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "remarks": remarks,
        }

        DEMO_CASES.append(case)
        new_cases.append(case)
        log_audit_event(current_user, "case_uploaded_csv", case=case, details={"filename": file.filename})

    return {"message": f"Successfully uploaded {len(new_cases)} cases from CSV", "cases": new_cases}

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
