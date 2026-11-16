import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    reference_sequence = Column(String, nullable=False)
    variant_sequence = Column(String, nullable=False)
    variant_type = Column(String, nullable=False)
    protein_change = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
