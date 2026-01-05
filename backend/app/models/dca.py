from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer
from sqlalchemy.sql import func
from app.core.database import Base

class DCA(Base):
    __tablename__ = "dcas"
    
    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    contact_person = Column(String, nullable=False)
    email = Column(String, nullable=False)
    performance_score = Column(Float, default=0.0)
    recovery_rate = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<DCA {self.code}>"