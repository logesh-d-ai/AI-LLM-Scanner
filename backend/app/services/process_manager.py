import subprocess
from typing import Dict

ACTIVE_PROCESSES: Dict[int, subprocess.Popen] = {}

def register_process(scan_id: int, process: subprocess.Popen):
    """Register a running subprocess for a scan."""
    ACTIVE_PROCESSES[scan_id] = process

def unregister_process(scan_id: int):
    """Remove a subprocess from tracking if it exists."""
    if scan_id in ACTIVE_PROCESSES:
        del ACTIVE_PROCESSES[scan_id]

def stop_process(scan_id: int) -> bool:
    """Terminate the process associated with a scan ID."""
    if scan_id in ACTIVE_PROCESSES:
        process = ACTIVE_PROCESSES[scan_id]
        if process.poll() is None:  # If process is still running
            process.terminate()
        return True
    return False
