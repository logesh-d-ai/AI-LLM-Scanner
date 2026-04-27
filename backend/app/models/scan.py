from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from ..core.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    model_type = Column(String)
    tool_type = Column(String)
    scan_type = Column(String)
    status = Column(String, default="pending")  # pending, running, completed, failed, user_stopped
    report_path = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    results = relationship("Result", back_populates="scan", cascade="all, delete-orphan")

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="CASCADE"))
    vulnerability_type = Column(String)
    severity = Column(String) # High, Medium, Low
    description = Column(Text)
    raw_output = Column(Text, nullable=True)

    scan = relationship("Scan", back_populates="results")
