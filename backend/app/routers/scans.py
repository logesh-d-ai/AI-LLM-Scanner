from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import json
import requests
import re

from ..core.database import get_db
from ..schemas.scan import ScanCreate, ScanResponse, TestEndpointRequest
from ..services.scanner import (
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

def extract_nested_field(data, field_path):
    if not field_path:
        return data
        
    if field_path.startswith("$."):
        field_path = field_path[2:]
        
    parts = re.split(r'\.|\[|\]', field_path)
    parts = [p for p in parts if p]
    
    current = data
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        elif isinstance(current, list) and part.isdigit() and int(part) < len(current):
            current = current[int(part)]
        else:
            return None
    return current

@router.post("/scan/test-endpoint")
def test_endpoint(req: TestEndpointRequest):
    headers = {}
    for k, v in req.headers.items():
        if req.api_key:
            headers[k] = v.replace("{{key}}", req.api_key)
        else:
            headers[k] = v

    req_body_str = json.dumps(req.req_template)
    req_body_str = req_body_str.replace("{{input}}", "Hello, this is a test prompt.")
    req_body = json.loads(req_body_str)

    try:
        if req.method.lower() == "post":
            response = requests.post(req.endpoint, headers=headers, json=req_body, timeout=10)
        else:
            response = requests.get(req.endpoint, headers=headers, params=req_body, timeout=10)
            
        try:
            raw_response = response.json()
        except Exception:
            raw_response = {"text": response.text}
            
        parsed_output = extract_nested_field(raw_response, req.response_field)
        
        return {
            "success": response.status_code == 200,
            "raw_response": raw_response,
            "parsed_output": str(parsed_output) if parsed_output is not None else None,
            "status_code": response.status_code
        }
    except Exception as e:
        return {
            "success": False,
            "raw_response": {"error": str(e)},
            "parsed_output": None,
            "status_code": 500
        }
