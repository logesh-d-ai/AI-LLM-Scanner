from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas.scan import ScanCreate, ScanResponse
from ..services.scan_manager import (
    create_new_scan,
    get_all_scans,
    get_scan_by_id,
    stop_scan_execution,
    get_scan_progress_status
)

router = APIRouter(
    tags=["scans"],
    responses={404: {"description": "Not found"}},
)

@router.post("/scan", response_model=ScanResponse)
def create_scan(scan_req: ScanCreate, db: Session = Depends(get_db)):
    return create_new_scan(db, scan_req)

@router.get("/scans", response_model=List[ScanResponse])
def get_scans(db: Session = Depends(get_db)):
    return get_all_scans(db)

@router.get("/results/{scan_id}", response_model=ScanResponse)
def get_scan_results(scan_id: int, db: Session = Depends(get_db)):
    return get_scan_by_id(db, scan_id)

@router.post("/scan/{scan_id}/stop")
def stop_scan(scan_id: int, db: Session = Depends(get_db)):
    return stop_scan_execution(db, scan_id)

@router.get("/scan/{scan_id}/progress")
def get_scan_progress(scan_id: int, db: Session = Depends(get_db)):
    return get_scan_progress_status(db, scan_id)
