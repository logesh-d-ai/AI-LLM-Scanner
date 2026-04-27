import os
import re
import threading
from typing import Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..core.database import SessionLocal
from ..models import Scan, Result
from ..schemas import ScanCreate
from .tool_factory import get_tool
from .process_manager import stop_process

BASE_SCANS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "scans")

def start_scan_thread(scan_id: int, config: Dict[str, Any]):
    """Launch the thread to execute the scan asynchronously."""
    thread = threading.Thread(target=_run_scan, args=(scan_id, config))
    thread.daemon = True
    thread.start()

def _run_scan(scan_id: int, config: Dict[str, Any]):
    """Internal function that runs in a separate thread."""
    db: Session = SessionLocal()
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    
    if not scan:
        db.close()
        return

    try:
        scan.status = "running"
        db.commit()

        tool_type = config.get("tool_type", "garak").lower()
        tool = get_tool(tool_type)

        output_dir = os.path.join(BASE_SCANS_DIR, tool_type, str(scan_id))
        os.makedirs(output_dir, exist_ok=True)

        # 1. Run the scan
        report_path = tool.run_scan(scan_id, config, output_dir)
        
        scan.report_path = report_path
        db.commit()

        # 2. Parse the output
        parsed_results = tool.parse_output(report_path)

        # 3. Store the results natively
        for res in parsed_results:
            new_result = Result(
                scan_id=scan_id,
                vulnerability_type=res["vulnerability_type"],
                severity=res["severity"],
                description=res["description"],
                raw_output=res.get("raw_output", "")
            )
            db.add(new_result)
        
        scan.status = "completed"
        db.commit()

    except Exception as e:
        db.rollback()
        # Fetch scan again just in case there were detached instance issues
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan:
            if scan.status != "user_stopped":
                scan.status = "failed"
                scan.error_message = str(e)
            db.commit()
    finally:
        db.close()

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
        
    was_running = scan.status == "running"
    
    if was_running:
        scan.status = "user_stopped"
        db.commit()
        
    success = stop_process(scan_id)
    
    if success or was_running:
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
