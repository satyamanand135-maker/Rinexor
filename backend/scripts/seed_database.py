import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine
from app.models import *
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta
import random

def seed_database(db: Session):
    print("🌱 Seeding database...")
    
    # Clear existing data (for demo only)
    db.query(User).delete()
    db.query(DCA).delete()
    db.query(Case).delete()
    db.commit()
    
    # Create DCAs
    dcas = []
    dca_names = ["Alpha Collections", "Beta Recovery", "Gamma Solutions", "Delta Agency"]
    
    for i, name in enumerate(dca_names):
        dca = DCA(
            id=str(uuid.uuid4()),
            name=name,
            code=f"DCA-{i+1:03d}",
            contact_person=f"Manager {i+1}",
            email=f"contact@{name.lower().replace(' ', '')}.com",
            phone=f"+1-555-{1000+i}",
            address=f"{i+1} Collection Street, City, State",
            performance_score=round(random.uniform(0.6, 0.95), 2),
            recovery_rate=round(random.uniform(60, 95), 1),
            avg_resolution_days=round(random.uniform(15, 45), 1),
            max_concurrent_cases=random.choice([30, 50, 75, 100]),
            current_active_cases=random.randint(5, 25),
            specialization=random.sample(["medical", "credit_card", "personal_loan", "mortgage", "auto_loan"], 2),
            sla_compliance_rate=round(random.uniform(85, 99), 1)
        )
        dcas.append(dca)
        db.add(dca)
    
    db.commit()
    print(f"✅ Created {len(dcas)} DCAs")
    
    # Create Users
    users = []
    
    # Enterprise Admin
    admin_user = User(
        id=str(uuid.uuid4()),
        email="admin@recoverai.com",
        hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "secret"
        full_name="System Administrator",
        role=UserRole.ENTERPRISE_ADMIN,
        is_active=True
    )
    users.append(admin_user)
    db.add(admin_user)
    
    # Collection Manager
    manager_user = User(
        id=str(uuid.uuid4()),
        email="manager@recoverai.com",
        hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        full_name="Collection Manager",
        role=UserRole.COLLECTION_MANAGER,
        is_active=True
    )
    users.append(manager_user)
    db.add(manager_user)
    
    # DCA Agents
    for i, dca in enumerate(dcas):
        agent = User(
            id=str(uuid.uuid4()),
            email=f"agent{i+1}@{dca.name.lower().replace(' ', '')}.com",
            hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
            full_name=f"DCA Agent {i+1}",
            role=UserRole.DCA_AGENT,
            dca_id=dca.id,
            is_active=True
        )
        users.append(agent)
        db.add(agent)
    
    db.commit()
    print(f"✅ Created {len(users)} users")
    
    # Create Cases
    cases = []
    debtor_names = [
        "John Smith", "Maria Garcia", "Robert Johnson", "Lisa Chen",
        "David Williams", "Sarah Miller", "James Brown", "Emily Davis",
        "Michael Wilson", "Jennifer Taylor"
    ]
    
    status_distribution = {
        CaseStatus.NEW: 3,
        CaseStatus.ASSIGNED: 5,
        CaseStatus.IN_PROGRESS: 4,
        CaseStatus.CONTACTED: 3,
        CaseStatus.PAYMENT_PROMISE: 2,
        CaseStatus.PARTIALLY_PAID: 1,
        CaseStatus.RESOLVED: 2,
        CaseStatus.ESCALATED: 1
    }
    
    case_counter = 0
    for status, count in status_distribution.items():
        for i in range(count):
            case_counter += 1
            debtor = random.choice(debtor_names)
            amount = round(random.uniform(1000, 50000), 2)
            days_delinquent = random.randint(30, 180)
            
            # Calculate recovery score based on factors
            base_score = random.uniform(0.3, 0.9)
            if days_delinquent > 120:
                base_score *= 0.7
            if amount > 20000:
                base_score *= 0.8
                
            recovery_score = round(base_score, 2)
            
            # Determine band
            if recovery_score >= 0.7:
                band = RecoveryScoreBand.HIGH
                priority = CasePriority.HIGH
            elif recovery_score >= 0.4:
                band = RecoveryScoreBand.MEDIUM
                priority = CasePriority.MEDIUM
            else:
                band = RecoveryScoreBand.LOW
                priority = CasePriority.LOW
            
            # Assign to DCA if not new
            assigned_dca = None
            if status != CaseStatus.NEW:
                assigned_dca = random.choice(dcas).id
            
            case = Case(
                id=str(uuid.uuid4()),
                account_id=f"ACC-{case_counter:05d}",
                debtor_name=debtor,
                debtor_email=f"{debtor.lower().replace(' ', '.')}@example.com",
                debtor_phone=f"+1-555-{1000 + case_counter}",
                original_amount=amount,
                current_amount=amount * random.uniform(0.7, 1.0),
                days_delinquent=days_delinquent,
                debt_age_days=days_delinquent + random.randint(0, 30),
                status=status,
                priority=priority,
                recovery_score=recovery_score,
                recovery_score_band=band,
                dca_id=assigned_dca,
                allocated_by=admin_user.id if assigned_dca else None,
                allocation_date=datetime.utcnow() - timedelta(days=random.randint(1, 14)) if assigned_dca else None,
                ml_features={
                    "debt_age": days_delinquent,
                    "amount": amount,
                    "previous_payments": random.randint(0, 3),
                    "credit_score": random.randint(550, 750)
                },
                sla_contact_deadline=datetime.utcnow() + timedelta(days=random.randint(1, 5)),
                sla_resolution_deadline=datetime.utcnow() + timedelta(days=random.randint(15, 45)),
                created_at=datetime.ut