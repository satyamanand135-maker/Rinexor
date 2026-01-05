"""
NOTIFICATION SERVICE - Email, SMS, and in-app notifications
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.models.user import User
from app.models.case import Case
from app.models.dca import DCA
from app.core.config import settings


class NotificationService:
    
    @staticmethod
    def send_sla_breach_alert(case_id: str, breach_type: str, db: Session):
        """Send SLA breach alert to relevant stakeholders"""
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return False
        
        # Get DCA contact if case is allocated
        dca_contact = None
        if case.dca_id:
            dca = db.query(DCA).filter(DCA.id == case.dca_id).first()
            if dca:
                dca_contact = dca.email
        
        # Get enterprise admin contacts
        admin_contacts = db.query(User.email).filter(
            User.role == "enterprise_admin",
            User.is_active == True
        ).all()
        
        # Prepare notification data
        notification_data = {
            "case_id": case.id,
            "account_id": case.account_id,
            "debtor_name": case.debtor_name,
            "amount": case.original_amount,
            "breach_type": breach_type,
            "deadline": case.sla_contact_deadline if breach_type == "contact_sla" else case.sla_resolution_deadline,
            "dca_name": dca.name if case.dca_id and dca else "Unassigned"
        }
        
        # Send to DCA if allocated
        if dca_contact:
            NotificationService._send_sla_breach_email(dca_contact, notification_data, "dca")
        
        # Send to admins
        for admin_email in admin_contacts:
            NotificationService._send_sla_breach_email(admin_email[0], notification_data, "admin")
        
        return True
    
    @staticmethod
    def _send_sla_breach_email(recipient: str, data: Dict[str, Any], recipient_type: str):
        """Send SLA breach email notification"""
        try:
            # Email configuration (mock for demo)
            smtp_server = getattr(settings, 'SMTP_SERVER', 'localhost')
            smtp_port = getattr(settings, 'SMTP_PORT', 587)
            smtp_username = getattr(settings, 'SMTP_USERNAME', 'noreply@recoverai.com')
            smtp_password = getattr(settings, 'SMTP_PASSWORD', 'password')
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = smtp_username
            msg['To'] = recipient
            msg['Subject'] = f"SLA Breach Alert - Case {data['account_id']}"
            
            # Email body based on recipient type
            if recipient_type == "dca":
                body = NotificationService._get_dca_breach_email_body(data)
            else:
                body = NotificationService._get_admin_breach_email_body(data)
            
            msg.attach(MIMEText(body, 'html'))
            
            # For demo purposes, just log the email instead of actually sending
            print(f"📧 SLA BREACH EMAIL NOTIFICATION")
            print(f"To: {recipient}")
            print(f"Subject: {msg['Subject']}")
            print(f"Body Preview: {body[:200]}...")
            print("-" * 50)
            
            # In production, uncomment this to actually send emails:
            # server = smtplib.SMTP(smtp_server, smtp_port)
            # server.starttls()
            # server.login(smtp_username, smtp_password)
            # server.send_message(msg)
            # server.quit()
            
            return True
            
        except Exception as e:
            print(f"Failed to send email to {recipient}: {e}")
            return False
    
    @staticmethod
    def _get_dca_breach_email_body(data: Dict[str, Any]) -> str:
        """Generate email body for DCA SLA breach notification"""
        return f"""
        <html>
        <body>
            <h2>🚨 SLA Breach Alert</h2>
            
            <p>Dear Collection Team,</p>
            
            <p>This is an urgent notification regarding an SLA breach for one of your assigned cases:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545;">
                <h3>Case Details:</h3>
                <ul>
                    <li><strong>Case ID:</strong> {data['case_id']}</li>
                    <li><strong>Account ID:</strong> {data['account_id']}</li>
                    <li><strong>Debtor:</strong> {data['debtor_name']}</li>
                    <li><strong>Amount:</strong> ${data['amount']:,.2f}</li>
                    <li><strong>Breach Type:</strong> {data['breach_type'].replace('_', ' ').title()}</li>
                    <li><strong>Original Deadline:</strong> {data['deadline']}</li>
                </ul>
            </div>
            
            <p><strong>Immediate Action Required:</strong></p>
            <ul>
                <li>Review the case immediately</li>
                <li>Take appropriate collection action</li>
                <li>Update case status and notes</li>
                <li>Contact debtor if required</li>
            </ul>
            
            <p>Please log into the RecoverAI Pro platform to view full case details and take action.</p>
            
            <p>Best regards,<br>
            RecoverAI Pro System</p>
        </body>
        </html>
        """
    
    @staticmethod
    def _get_admin_breach_email_body(data: Dict[str, Any]) -> str:
        """Generate email body for admin SLA breach notification"""
        return f"""
        <html>
        <body>
            <h2>📊 SLA Breach Report</h2>
            
            <p>Dear Administrator,</p>
            
            <p>An SLA breach has been detected in the system:</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107;">
                <h3>Breach Details:</h3>
                <ul>
                    <li><strong>Case ID:</strong> {data['case_id']}</li>
                    <li><strong>Account ID:</strong> {data['account_id']}</li>
                    <li><strong>Debtor:</strong> {data['debtor_name']}</li>
                    <li><strong>Amount:</strong> ${data['amount']:,.2f}</li>
                    <li><strong>Assigned DCA:</strong> {data['dca_name']}</li>
                    <li><strong>Breach Type:</strong> {data['breach_type'].replace('_', ' ').title()}</li>
                    <li><strong>Original Deadline:</strong> {data['deadline']}</li>
                </ul>
            </div>
            
            <p><strong>Recommended Actions:</strong></p>
            <ul>
                <li>Review DCA performance metrics</li>
                <li>Consider case escalation or reallocation</li>
                <li>Update SLA rules if needed</li>
                <li>Monitor for pattern of breaches</li>
            </ul>
            
            <p>Access the admin dashboard for detailed analytics and corrective actions.</p>
            
            <p>Best regards,<br>
            RecoverAI Pro System</p>
        </body>
        </html>
        """
    
    @staticmethod
    def send_case_allocation_notification(case_id: str, dca_id: str, db: Session):
        """Notify DCA when a new case is allocated"""
        case = db.query(Case).filter(Case.id == case_id).first()
        dca = db.query(DCA).filter(DCA.id == dca_id).first()
        
        if not case or not dca:
            return False
        
        notification_data = {
            "case_id": case.id,
            "account_id": case.account_id,
            "debtor_name": case.debtor_name,
            "amount": case.original_amount,
            "priority": case.priority,
            "dca_name": dca.name,
            "contact_deadline": case.sla_contact_deadline,
            "resolution_deadline": case.sla_resolution_deadline
        }
        
        # Send to DCA contact
        NotificationService._send_allocation_email(dca.email, notification_data)
        
        # Send to DCA agents
        dca_agents = db.query(User.email).filter(
            User.dca_id == dca_id,
            User.role == "dca_agent",
            User.is_active == True
        ).all()
        
        for agent_email in dca_agents:
            NotificationService._send_allocation_email(agent_email[0], notification_data)
        
        return True
    
    @staticmethod
    def _send_allocation_email(recipient: str, data: Dict[str, Any]):
        """Send case allocation email"""
        try:
            print(f"📧 CASE ALLOCATION NOTIFICATION")
            print(f"To: {recipient}")
            print(f"Subject: New Case Allocated - {data['account_id']}")
            print(f"Case: {data['case_id']} | Amount: ${data['amount']:,.2f} | Priority: {data['priority']}")
            print(f"Contact Deadline: {data['contact_deadline']}")
            print("-" * 50)
            
            # In production, implement actual email sending here
            return True
            
        except Exception as e:
            print(f"Failed to send allocation email to {recipient}: {e}")
            return False
    
    @staticmethod
    def send_case_status_update(case_id: str, old_status: str, new_status: str, db: Session):
        """Send notification when case status changes"""
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return False
        
        # Get stakeholders to notify
        stakeholders = []
        
        # Add DCA contacts if allocated
        if case.dca_id:
            dca = db.query(DCA).filter(DCA.id == case.dca_id).first()
            if dca:
                stakeholders.append(dca.email)
                
                # Add DCA agents
                agents = db.query(User.email).filter(
                    User.dca_id == case.dca_id,
                    User.role == "dca_agent",
                    User.is_active == True
                ).all()
                stakeholders.extend([agent[0] for agent in agents])
        
        # Add collection managers
        managers = db.query(User.email).filter(
            User.role == "collection_manager",
            User.is_active == True
        ).all()
        stakeholders.extend([manager[0] for manager in managers])
        
        # Send notifications
        for email in stakeholders:
            NotificationService._send_status_update_email(email, case, old_status, new_status)
        
        return True
    
    @staticmethod
    def _send_status_update_email(recipient: str, case: Case, old_status: str, new_status: str):
        """Send case status update email"""
        try:
            print(f"📧 CASE STATUS UPDATE")
            print(f"To: {recipient}")
            print(f"Subject: Case Status Update - {case.account_id}")
            print(f"Case: {case.id} | {old_status} → {new_status}")
            print(f"Amount: ${case.original_amount:,.2f}")
            print("-" * 50)
            
            return True
            
        except Exception as e:
            print(f"Failed to send status update email to {recipient}: {e}")
            return False
    
    @staticmethod
    def send_daily_summary_report(db: Session):
        """Send daily summary report to administrators"""
        # Get summary statistics
        from sqlalchemy import func
        
        # Cases created today
        today = datetime.utcnow().date()
        cases_today = db.query(func.count(Case.id)).filter(
            func.date(Case.created_at) == today
        ).scalar() or 0
        
        # SLA breaches today
        sla_breaches = db.query(func.count(Case.id)).filter(
            Case.sla_contact_deadline < datetime.utcnow(),
            Case.first_contact_date.is_(None)
        ).scalar() or 0
        
        # Cases resolved today
        cases_resolved = db.query(func.count(Case.id)).filter(
            func.date(Case.resolved_date) == today
        ).scalar() or 0
        
        # Get admin emails
        admin_emails = db.query(User.email).filter(
            User.role == "enterprise_admin",
            User.is_active == True
        ).all()
        
        summary_data = {
            "date": today,
            "cases_created": cases_today,
            "sla_breaches": sla_breaches,
            "cases_resolved": cases_resolved
        }
        
        for admin_email in admin_emails:
            NotificationService._send_daily_summary_email(admin_email[0], summary_data)
        
        return True
    
    @staticmethod
    def _send_daily_summary_email(recipient: str, data: Dict[str, Any]):
        """Send daily summary email"""
        try:
            print(f"📊 DAILY SUMMARY REPORT")
            print(f"To: {recipient}")
            print(f"Date: {data['date']}")
            print(f"Cases Created: {data['cases_created']}")
            print(f"SLA Breaches: {data['sla_breaches']}")
            print(f"Cases Resolved: {data['cases_resolved']}")
            print("-" * 50)
            
            return True
            
        except Exception as e:
            print(f"Failed to send daily summary to {recipient}: {e}")
            return False
    
    @staticmethod
    def send_performance_alert(dca_id: str, alert_type: str, metrics: Dict[str, Any], db: Session):
        """Send performance alert for DCA"""
        dca = db.query(DCA).filter(DCA.id == dca_id).first()
        if not dca:
            return False
        
        # Get admin contacts
        admin_emails = db.query(User.email).filter(
            User.role == "enterprise_admin",
            User.is_active == True
        ).all()
        
        alert_data = {
            "dca_name": dca.name,
            "dca_code": dca.code,
            "alert_type": alert_type,
            "metrics": metrics
        }
        
        # Send to admins
        for admin_email in admin_emails:
            NotificationService._send_performance_alert_email(admin_email[0], alert_data)
        
        # Also notify DCA
        NotificationService._send_performance_alert_email(dca.email, alert_data)
        
        return True
    
    @staticmethod
    def _send_performance_alert_email(recipient: str, data: Dict[str, Any]):
        """Send performance alert email"""
        try:
            print(f"⚠️ PERFORMANCE ALERT")
            print(f"To: {recipient}")
            print(f"DCA: {data['dca_name']} ({data['dca_code']})")
            print(f"Alert Type: {data['alert_type']}")
            print(f"Metrics: {data['metrics']}")
            print("-" * 50)
            
            return True
            
        except Exception as e:
            print(f"Failed to send performance alert to {recipient}: {e}")
            return False
    
    @staticmethod
    def get_notification_preferences(user_id: str, db: Session) -> Dict[str, Any]:
        """Get user notification preferences"""
        # Mock implementation - in production, store in database
        return {
            "email_enabled": True,
            "sms_enabled": False,
            "sla_breach_alerts": True,
            "case_allocation_alerts": True,
            "status_update_alerts": True,
            "daily_summary": True,
            "performance_alerts": True
        }
    
    @staticmethod
    def update_notification_preferences(user_id: str, preferences: Dict[str, Any], db: Session) -> bool:
        """Update user notification preferences"""
        # Mock implementation - in production, store in database
        print(f"📱 Updated notification preferences for user {user_id}: {preferences}")
        return True