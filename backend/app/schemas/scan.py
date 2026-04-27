from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
import datetime

class ScanCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    tool_type: str
    scan_type: str
    model_type: str
    model_name: str
    api_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    temperature: Optional[float] = None
    probes: Optional[List[str]] = None
    max_tokens: Optional[int] = None
    custom_rest_config: Optional[dict] = None

class ResultResponse(BaseModel):
    id: int
    scan_id: int
    vulnerability_type: str
    severity: str
    description: str
    raw_output: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ScanResponse(BaseModel):
    id: int
    model_name: str
    model_type: str
    tool_type: str
    scan_type: str
    status: str
    report_path: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime.datetime
    results: Optional[List[ResultResponse]] = []
    
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

class TestEndpointRequest(BaseModel):
    endpoint: str
    method: str
    headers: Dict[str, str]
    req_template: Dict[str, Any]
    response_field: str
    api_key: Optional[str] = None
