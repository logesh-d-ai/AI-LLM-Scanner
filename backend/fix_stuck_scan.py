import os
import sys

# Adjust sys.path so we can import from backend
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models.scan import Scan, Result
from app.tools.garak_tool import GarakTool

def fix_scan(scan_id: int):
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            print(f"Scan {scan_id} not found.")
            return

        if scan.status != "running":
            print(f"Scan {scan_id} is not running. It is {scan.status}.")
            return

        tool = GarakTool()
        report_path = f"D:/AURISEG/LLM Scanner/LLM Scanner Application/backend/scans/garak/{scan_id}/garak_report_{scan_id}.report.jsonl"
        
        if not os.path.exists(report_path):
            print(f"Report path does not exist: {report_path}")
            return

        print("Parsing output...")
        parsed_results = tool.parse_output(report_path)
        
        print(f"Found {len(parsed_results)} results. Storing in DB...")
        for res in parsed_results:
            new_result = Result(
                scan_id=scan_id,
                vulnerability_type=res["vulnerability_type"],
                severity=res["severity"],
                description=res["description"],
                raw_output=res.get("raw_output", "")
            )
            db.add(new_result)
        
        scan.report_path = report_path
        scan.status = "completed"
        db.commit()
        print(f"Scan {scan_id} fixed and marked as completed.")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_scan(22)
