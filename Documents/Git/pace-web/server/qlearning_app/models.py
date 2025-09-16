from pydantic import BaseModel
from typing import List, Optional
class UserState(BaseModel):
    user_id: str
    completed_categories: List[str]
    available_actions: List[str]
    state_bucket: str | None = None

class QUpdateRequest(BaseModel):
    user_id: str
    state: str
    action: str
    reward: float
    next_state: str
    available_actions: List[str]



class UserState(BaseModel):
    user_id: str
    completed_categories: List[str]
    available_actions: List[str]
    state_bucket: Optional[str] = None

class QUpdateRequest(BaseModel):
    user_id: str
    state: str
    action: str
    reward: float
    next_state: str
    available_actions: List[str]

# NEW: activity session models
class ActivityStartRequest(BaseModel):
    user_id: str
    activity_id: str
    state: str
    deep_link_base: Optional[str] = None  

class ActivityCompleteRequest(BaseModel):
    session_id: str
