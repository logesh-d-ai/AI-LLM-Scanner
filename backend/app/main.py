from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas
from .database import engine, get_db, Base
from .services.scan_service import start_scan_thread, BASE_SCANS_DIR
import os
import re

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LLM Vulnerability Scanner API")

# Setup CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allowing all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scan", response_model=schemas.ScanResponse)
def create_scan(scan_req: schemas.ScanCreate, db: Session = Depends(get_db)):
    if scan_req.model_type.lower() == "openai" and not scan_req.api_key:
        raise HTTPException(status_code=400, detail="API key required for OpenAI models")

    # 1. Create Scan record in DB
    new_scan = models.Scan(
        model_name=scan_req.model_name,
        model_type=scan_req.model_type,
        tool_type=scan_req.tool_type,
        scan_type=scan_req.scan_type,
        status="pending"
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    # Convert request to dict for passing
    config_dict = scan_req.model_dump()

    # 2. Start the scan on a background thread (non-blocking)
    start_scan_thread(new_scan.id, config_dict)

    return new_scan

@app.get("/scans", response_model=List[schemas.ScanResponse])
def get_scans(db: Session = Depends(get_db)):
    scans = db.query(models.Scan).order_by(models.Scan.created_at.desc()).all()
    return scans

@app.get("/results/{scan_id}", response_model=schemas.ScanResponse)
def get_scan_results(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@app.post("/scan/{scan_id}/stop")
def stop_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    from .services.process_manager import stop_process
    success = stop_process(scan_id)
    
    if success or scan.status == "running":
        scan.status = "user_stopped"
        db.commit()
        return {"message": "Scan stopped successfully"}
    
    return {"message": "Scan is not currently running"}

@app.get("/scan/{scan_id}/progress")
def get_scan_progress(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    tool_type = scan.tool_type.lower()
    log_path = os.path.join(BASE_SCANS_DIR, tool_type, str(scan_id), f"{tool_type}_run_{scan_id}.log")
    
    progress = {}
    if not os.path.exists(log_path):
        return progress

    # matches lines like: probes.promptinject.HijackHateHumans:  14%|█▍        | 97/700 [15:02<1:02:24,  6.21s/it]
    # sometimes probe names have dots, so [a-zA-Z0-9_.]
    # tqdm output might not start exactly at line beginning
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
