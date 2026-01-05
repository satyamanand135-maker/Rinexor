from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True)
    account_id = Column(String, nullable=False)
    debtor_name = Column(String, nullable=False)
    original_amount = Column(Float, nullable=False)
    current_amount = Column(Float, nullable=False)
    days_delinquent = Column(Integer, default=0)
    status = Column(String, default="new")
    priority = Column(String, default="medium")
    recovery_score = Column(Float, default=0.0)
    dca_id = Column(String, ForeignKey("dcas.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    def __repr__(self):
        return f"<Case {self.account_id}>"