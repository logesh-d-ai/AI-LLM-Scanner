from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import Scan
from ..schemas import ScanCreate
from .scan_service import start_scan_thread, BASE_SCANS_DIR
from .process_manager import stop_process
import os
import re

def create_new_scan(db: Session, scan_req: ScanCreate) -> Scan:
    if scan_req.model_type.lower() == "openai" and not scan_req.api_key:
        raise HTTPException(status_code=400, detail="API key required for OpenAI models")

    new_scan = Scan(
        model_name=scan_req.model_name,
        model_type=scan_req.model_type,
        tool_type=scan_req.tool_type,
        scan_type=scan_req.scan_type,
        status="pending"
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    config_dict = scan_req.model_dump()
    start_scan_thread(new_scan.id, config_dict)

    return new_scan

def get_all_scans(db: Session):
    return db.query(Scan).order_by(Scan.created_at.desc()).all()

def get_scan_by_id(db: Session, scan_id: int) -> Scan:
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

def stop_scan_execution(db: Session, scan_id: int):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    success = stop_process(scan_id)
    
    if success or scan.status == "running":
        scan.status = "user_stopped"
        db.commit()
        return {"message": "Scan stopped successfully"}
    
    return {"message": "Scan is not currently running"}

def get_scan_progress_status(db: Session, scan_id: int):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    tool_type = scan.tool_type.lower()
    log_path = os.path.join(BASE_SCANS_DIR, tool_type, str(scan_id), f"{tool_type}_run_{scan_id}.log")
    
    progress = {}
    if not os.path.exists(log_path):
        return progress

    pattern = re.compile(r"([a-zA-Z0-9_.]+):\s*(\d+)%\|.*?\|\s*(\d+)/(\d+)")
    
    try:
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                match = pattern.search(line)
                if match:
                    probe_name = match.group(1)
                    percentage = int(match.group(2))
                    current = int(match.group(3))
                    total = int(match.group(4))
                    progress[probe_name] = {
                        "percentage": percentage,
                        "current": current,
                        "total": total
                    }
    except Exception as e:
        print(f"Error reading log for progress: {e}")
        
    return progress
