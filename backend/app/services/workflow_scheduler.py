from apscheduler.schedulers.background import BackgroundScheduler
from backend.app.services import case_service
from backend.app.models import Case, CaseStatus
from backend.app.core.database import SessionLocal
from datetime import datetime

db = SessionLocal()

def auto_assign_cases():
    unassigned_cases = db.query(Case).filter(Case.assigned_to == None).all()
    for case in unassigned_cases:
        dca = case_service.find_available_dca()
        if dca:
            case.assigned_to = dca.id
            case.sla_due_at = case_service.calculate_sla(case)
            case_service.save_case(case)
            print(f"Auto-assigned Case {case.id} to DCA {dca.name}")

def sla_monitor():
    overdue_cases = db.query(Case).filter(
        Case.sla_due_at < datetime.utcnow(),
        Case.status != CaseStatus.RESOLVED
    ).all()
    for case in overdue_cases:
        case.status = CaseStatus.SLA_BREACH
        case_service.notify_admin(case)
        case_service.save_case(case)

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(auto_assign_cases, 'interval', minutes=5)
    scheduler.add_job(sla_monitor, 'interval', minutes=10)
    scheduler.start()
    print("Workflow Scheduler started.")
