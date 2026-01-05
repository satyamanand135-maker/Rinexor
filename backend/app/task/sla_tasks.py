"""
SLA MONITORING TASKS - Background tasks for SLA breach detection and alerts
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.core.database import SessionLocal
from app.models.case import Case, CaseStatus
from app.models.sla import SLABreach
from app.services.notification_service import NotificationService
from app.services.workflow_service import WorkflowService
import uuid


class SLAMonitoringTasks:
    
    @staticmethod
    def check_sla_breaches():
        """
        Check for SLA breaches and send notifications
        This should be run every hour via scheduler
        """
        db = SessionLocal()
        try:
            print(f"🔍 Starting SLA breach check at {datetime.utcnow()}")
            
            # Get all SLA breaches
            breaches = WorkflowService.check_sla_breaches(db)
            
            if not breaches:
                print("✅ No SLA breaches found")
                return {"status": "success", "breaches_found": 0}
            
            print(f"⚠️ Found {len(breaches)} SLA breaches")
            
            # Process each breach
            new_breaches = 0
            for breach in breaches:
                # Check if we already recorded this breach
                existing_breach = db.query(SLABreach).filter(
                    SLABreach.case_id == breach["case_id"],
                    SLABreach.breach_type == breach["breach_type"]
                ).first()
                
                if not existing_breach:
                    # Record new breach
                    sla_breach = SLABreach(
                        id=str(uuid.uuid4()),
                        case_id=breach["case_id"],
                        breach_type=breach["breach_type"],
                        deadline=breach["deadline"],
                        detected_at=datetime.utcnow(),
                        days_overdue=breach["days_overdue"],
                        is_resolved=False
                    )
                    
                    db.add(sla_breach)
                    new_breaches += 1
                    
                    # Send notification
                    try:
                        NotificationService.send_sla_breach_alert(
                            breach["case_id"], 
                            breach["breach_type"], 
                            db
                        )
                        print(f"📧 Sent SLA breach notification for case {breach['case_id']}")
                    except Exception as e:
                        print(f"❌ Failed to send notification for case {breach['case_id']}: {e}")
            
            db.commit()
            
            result = {
                "status": "success",
                "breaches_found": len(breaches),
                "new_breaches": new_breaches,
                "notifications_sent": new_breaches
            }
            
            print(f"✅ SLA breach check completed: {result}")
            return result
            
        except Exception as e:
            print(f"❌ SLA breach check failed: {e}")
            db.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            db.close()
    
    @staticmethod
    def escalate_overdue_cases():
        """
        Escalate cases that are significantly overdue
        Run daily
        """
        db = SessionLocal()
        try:
            print(f"🚨 Starting case escalation check at {datetime.utcnow()}")
            
            now = datetime.utcnow()
            escalation_threshold = now - timedelta(days=7)  # 7 days overdue
            
            # Find cases that are severely overdue
            overdue_cases = db.query(Case).filter(
                Case.status.in_([CaseStatus.ALLOCATED, CaseStatus.IN_PROGRESS]),
                or_(
                    Case.sla_contact_deadline < escalation_threshold,
                    Case.sla_resolution_deadline < escalation_threshold
                )
            ).all()
            
            escalated_count = 0
            
            for case in overdue_cases:
                # Check if already escalated
                if case.status != CaseStatus.ESCALATED:
                    # Escalate case
                    case.status = CaseStatus.ESCALATED
                    case.updated_at = datetime.utcnow()
                    
                    escalated_count += 1
                    
                    # Send escalation notification
                    try:
                        SLAMonitoringTasks._send_escalation_notification(case, db)
                        print(f"🚨 Escalated case {case.id}")
                    except Exception as e:
                        print(f"❌ Failed to send escalation notification for case {case.id}: {e}")
            
            db.commit()
            
            result = {
                "status": "success",
                "cases_checked": len(overdue_cases),
                "cases_escalated": escalated_count
            }
            
            print(f"✅ Case escalation completed: {result}")
            return result
            
        except Exception as e:
            print(f"❌ Case escalation failed: {e}")
            db.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            db.close()
    
    @staticmethod
    def _send_escalation_notification(case: Case, db: Session):
        """Send escalation notification"""
        from app.models.user import User
        from app.models.dca import DCA
        
        # Get case details
        dca_name = "Unassigned"
        if case.dca_id:
            dca = db.query(DCA).filter(DCA.id == case.dca_id).first()
            dca_name = dca.name if dca else "Unknown DCA"
        
        # Get admin contacts
        admin_emails = db.query(User.email).filter(
            User.role == "enterprise_admin",
            User.is_active == True
        ).all()
        
        escalation_data = {
            "case_id": case.id,
            "account_id": case.account_id,
            "debtor_name": case.debtor_name,
            "amount": case.original_amount,
            "dca_name": dca_name,
            "days_overdue": (datetime.utcnow() - case.sla_resolution_deadline).days if case.sla_resolution_deadline else 0
        }
        
        # Send to admins
        for admin_email in admin_emails:
            print(f"🚨 CASE ESCALATION ALERT")
            print(f"To: {admin_email[0]}")
            print(f"Case: {case.id} | Amount: ${case.original_amount:,.2f}")
            print(f"DCA: {dca_name} | Days Overdue: {escalation_data['days_overdue']}")
            print("-" * 50)
    
    @staticmethod
    def generate_daily_sla_report():
        """
        Generate daily SLA compliance report
        Run once daily at end of day
        """
        db = SessionLocal()
        try:
            print(f"📊 Generating daily SLA report at {datetime.utcnow()}")
            
            today = datetime.utcnow().date()
            yesterday = today - timedelta(days=1)
            
            # Cases created yesterday
            cases_created = db.query(Case).filter(
                Case.created_at >= yesterday,
                Case.created_at < today
            ).count()
            
            # SLA breaches yesterday
            breaches_yesterday = db.query(SLABreach).filter(
                SLABreach.detected_at >= yesterday,
                SLABreach.detected_at < today
            ).count()
            
            # Cases resolved yesterday
            cases_resolved = db.query(Case).filter(
                Case.resolved_date >= yesterday,
                Case.resolved_date < today,
                Case.status == CaseStatus.RESOLVED
            ).count()
            
            # Current active breaches
            active_breaches = db.query(SLABreach).filter(
                SLABreach.is_resolved == False
            ).count()
            
            report_data = {
                "report_date": yesterday.isoformat(),
                "cases_created": cases_created,
                "sla_breaches": breaches_yesterday,
                "cases_resolved": cases_resolved,
                "active_breaches": active_breaches,
                "compliance_rate": round(((cases_created - breaches_yesterday) / cases_created * 100) if cases_created > 0 else 100, 2)
            }
            
            # Send report to administrators
            NotificationService.send_daily_summary_report(db)
            
            print(f"📊 Daily SLA Report: {report_data}")
            
            return {
                "status": "success",
                "report_data": report_data
            }
            
        except Exception as e:
            print(f"❌ Daily SLA report generation failed: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            db.close()
    
    @staticmethod
    def update_case_sla_status():
        """
        Update SLA status for all active cases
        Run every 6 hours
        """
        db = SessionLocal()
        try:
            print(f"🔄 Updating case SLA status at {datetime.utcnow()}")
            
            now = datetime.utcnow()
            
            # Get all active cases
            active_cases = db.query(Case).filter(
                Case.status.in_([CaseStatus.NEW, CaseStatus.ALLOCATED, CaseStatus.IN_PROGRESS])
            ).all()
            
            updated_count = 0
            
            for case in active_cases:
                sla_status = SLAMonitoringTasks._calculate_sla_status(case, now)
                
                # Update case if SLA status changed
                if hasattr(case, 'sla_status') and case.sla_status != sla_status:
                    case.sla_status = sla_status
                    case.updated_at = datetime.utcnow()
                    updated_count += 1
            
            db.commit()
            
            result = {
                "status": "success",
                "cases_checked": len(active_cases),
                "cases_updated": updated_count
            }
            
            print(f"✅ SLA status update completed: {result}")
            return result
            
        except Exception as e:
            print(f"❌ SLA status update failed: {e}")
            db.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            db.close()
    
    @staticmethod
    def _calculate_sla_status(case: Case, now: datetime) -> str:
        """Calculate current SLA status for a case"""
        
        # Check contact SLA
        contact_breach = False
        if case.sla_contact_deadline and not case.first_contact_date:
            if now > case.sla_contact_deadline:
                contact_breach = True
        
        # Check resolution SLA
        resolution_breach = False
        if case.sla_resolution_deadline and not case.resolved_date:
            if now > case.sla_resolution_deadline:
                resolution_breach = True
        
        # Determine status
        if contact_breach or resolution_breach:
            return "breached"
        
        # Check if approaching deadline (within 24 hours)
        warning_threshold = timedelta(hours=24)
        
        if case.sla_contact_deadline and not case.first_contact_date:
            if now + warning_threshold > case.sla_contact_deadline:
                return "warning"
        
        if case.sla_resolution_deadline and not case.resolved_date:
            if now + warning_threshold > case.sla_resolution_deadline:
                return "warning"
        
        return "compliant"
    
    @staticmethod
    def cleanup_resolved_breaches():
        """
        Mark SLA breaches as resolved when cases are resolved
        Run daily
        """
        db = SessionLocal()
        try:
            print(f"🧹 Cleaning up resolved SLA breaches at {datetime.utcnow()}")
            
            # Find breaches for resolved cases
            resolved_breaches = db.query(SLABreach).join(Case).filter(
                Case.status == CaseStatus.RESOLVED,
                SLABreach.is_resolved == False
            ).all()
            
            resolved_count = 0
            
            for breach in resolved_breaches:
                breach.is_resolved = True
                breach.resolved_at = datetime.utcnow()
                resolved_count += 1
            
            db.commit()
            
            result = {
                "status": "success",
                "breaches_resolved": resolved_count
            }
            
            print(f"✅ SLA breach cleanup completed: {result}")
            return result
            
        except Exception as e:
            print(f"❌ SLA breach cleanup failed: {e}")
            db.rollback()
            return {"status": "error", "message": str(e)}
        finally:
            db.close()


# Scheduler functions (for APScheduler or Celery)
def hourly_sla_check():
    """Wrapper for hourly SLA breach check"""
    return SLAMonitoringTasks.check_sla_breaches()

def daily_escalation_check():
    """Wrapper for daily case escalation"""
    return SLAMonitoringTasks.escalate_overdue_cases()

def daily_sla_report():
    """Wrapper for daily SLA report"""
    return SLAMonitoringTasks.generate_daily_sla_report()

def sla_status_update():
    """Wrapper for SLA status update"""
    return SLAMonitoringTasks.update_case_sla_status()

def cleanup_breaches():
    """Wrapper for breach cleanup"""
    return SLAMonitoringTasks.cleanup_resolved_breaches()