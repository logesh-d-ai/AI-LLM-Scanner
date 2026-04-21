import os
import threading
from typing import Dict, Any
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Scan, Result
from .tool_factory import get_tool

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
            scan.status = "failed"
            scan.error_message = str(e)
            db.commit()
    finally:
        db.close()
