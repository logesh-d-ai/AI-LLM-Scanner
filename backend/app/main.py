from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas
from .database import engine, get_db, Base
from .services.scan_service import start_scan_thread

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
