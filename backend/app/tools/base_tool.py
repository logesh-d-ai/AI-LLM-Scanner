from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseTool(ABC):
    @abstractmethod
    def run_scan(self, scan_id: int, config: Dict[str, Any], output_dir: str) -> str:
        """
        Executes the scan.
        Returns the path to the raw output report file.
        """

    @abstractmethod
    def parse_output(self, raw_output_path: str) -> List[Dict[str, Any]]:
        """
        Parses the tool's specific output format into standard format.
        Must return a list of dictionaries with keys:
        - vulnerability_type (str)
        - severity (str): High, Medium, Low
        - description (str)
        - raw_output (str)
        """
