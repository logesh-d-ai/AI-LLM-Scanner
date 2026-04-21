from ..tools.base_tool import BaseTool
from ..tools.garak_tool import GarakTool

def get_tool(tool_type: str) -> BaseTool:
    tool_type = tool_type.lower()
    if tool_type == "garak":
        return GarakTool()
    
    # Expandable pattern for new tools
    # elif tool_type == "other_tool":
    #     return OtherTool()
    
    raise ValueError(f"Unsupported tool type: {tool_type}")
