from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"
    school: Optional[str] = None
    grade: Optional[int] = None
    language: str = "odia"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    school: Optional[str]
    grade: Optional[int]
    language: str

class Game(BaseModel):
    id: int
    title: str
    subject: str
    description: str
    gesture_type: str
    difficulty: str
    content_url: Optional[str]
    game_data: Optional[Dict[str, Any]]

class ProgressCreate(BaseModel):
    user_id: int
    game_id: int
    score: int
    time_spent: int
    completed: bool
    gestures_used: Dict[str, Any]
    game_specific_data: Optional[Dict[str, Any]] = None

class AnalyticsResponse(BaseModel):
    user_id: int
    game_id: int
    gesture_accuracy: float
    engagement_time: int
    session_date: str

class GestureData(BaseModel):
    landmarks: List[List[float]]
    gesture_type: str
    confidence: float

# Game-specific models
class PhysicsGameData(BaseModel):
    object_type: str
    position: Dict[str, float]
    velocity: Dict[str, float]
    force_applied: Dict[str, float]

class MathGameData(BaseModel):
    shape_type: str
    dimensions: Dict[str, float]
    problem: str
    solution: float

class ChemistryGameData(BaseModel):
    chemical_a: str
    chemical_b: str
    reaction_type: str
    result: str

class BiologyGameData(BaseModel):
    organism: str
    system: str
    action: str
    result: str

class CodingGameData(BaseModel):
    language: str
    blocks: List[str]
    expected_output: str
    actual_output: str