from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import database
import models
from gesture_engine import GestureRecognizer
import base64
import cv2
import numpy as np
import json
from datetime import datetime, date

app = FastAPI(title="Rural STEM Quest API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
database.init_db()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

gesture_recognizer = GestureRecognizer()

# Dependency to get database connection
def get_db_connection():
    with database.get_db() as conn:
        yield conn

@app.get("/")
async def root():
    return {"message": "Rural STEM Quest API"}

@app.post("/users/", response_model=models.UserResponse)
async def create_user(user: models.UserCreate, conn = Depends(get_db_connection)):
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = ? OR username = ?", 
                  (user.email, user.username))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")
    
    # In production, hash the password
    password_hash = f"hashed_{user.password}"  # Replace with actual hashing
    
    cursor.execute('''
        INSERT INTO users (username, email, password_hash, role, school, grade, language)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user.username, user.email, password_hash, user.role, user.school, user.grade, user.language))
    
    conn.commit()
    user_id = cursor.lastrowid
    
    return {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "school": user.school,
        "grade": user.grade,
        "language": user.language
    }

@app.get("/games/", response_model=list[models.Game])
async def get_games(subject: str = None, difficulty: str = None, conn = Depends(get_db_connection)):
    cursor = conn.cursor()
    
    query = "SELECT * FROM games"
    params = []
    
    if subject or difficulty:
        query += " WHERE"
        conditions = []
        if subject:
            conditions.append(" subject = ?")
            params.append(subject)
        if difficulty:
            conditions.append(" difficulty = ?")
            params.append(difficulty)
        query += " AND".join(conditions)
    
    cursor.execute(query, params)
    games = cursor.fetchall()
    
    return [dict(game) for game in games]

@app.get("/games/{game_id}/data")
async def get_game_data(game_id: int, conn = Depends(get_db_connection)):
    """Get specific game data and initial state"""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM games WHERE id = ?", (game_id,))
    game = cursor.fetchone()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Generate game-specific initial data
    game_data = json.loads(game['game_data']) if game['game_data'] else {}
    
    if game['subject'] == 'physics':
        initial_state = generate_physics_game_data()
    elif game['subject'] == 'mathematics':
        initial_state = generate_math_game_data()
    elif game['subject'] == 'chemistry':
        initial_state = generate_chemistry_game_data()
    elif game['subject'] == 'biology':
        initial_state = generate_biology_game_data()
    elif game['subject'] == 'computer_science':
        initial_state = generate_coding_game_data()
    else:
        initial_state = {}
    
    return {
        "game": dict(game),
        "initial_state": initial_state
    }

def generate_physics_game_data():
    return {
        "objects": [
            {"id": 1, "type": "ball", "mass": 1, "position": {"x": 100, "y": 100}, "velocity": {"x": 0, "y": 0}},
            {"id": 2, "type": "block", "mass": 2, "position": {"x": 300, "y": 200}, "velocity": {"x": 0, "y": 0}},
            {"id": 3, "type": "ramp", "mass": 0, "position": {"x": 200, "y": 300}, "angle": 30}
        ],
        "forces": ["gravity", "friction", "applied"],
        "current_problem": "Drag the ball to hit the target using Newton's laws"
    }

def generate_math_game_data():
    return {
        "shapes": ["triangle", "square", "circle", "rectangle"],
        "current_problem": {
            "type": "area",
            "shape": "triangle",
            "dimensions": {"base": 10, "height": 8},
            "expected_answer": 40
        },
        "user_drawn_shape": None
    }

def generate_chemistry_game_data():
    return {
        "chemicals": [
            {"id": 1, "name": "Hydrochloric Acid", "type": "acid", "color": "#ff6b6b"},
            {"id": 2, "name": "Sodium Hydroxide", "type": "base", "color": "#4ecdc4"},
            {"id": 3, "name": "Water", "type": "neutral", "color": "#74b9ff"}
        ],
        "beakers": [
            {"id": 1, "content": None, "volume": 0},
            {"id": 2, "content": None, "volume": 0}
        ],
        "current_experiment": "Neutralization Reaction"
    }

def generate_biology_game_data():
    return {
        "organism": "human",
        "system": "skeletal",
        "parts": ["skull", "ribs", "spine", "limbs"],
        "current_view": "front",
        "rotation": {"x": 0, "y": 0, "z": 0},
        "zoom_level": 1.0
    }

def generate_coding_game_data():
    return {
        "language": "blockly",
        "available_blocks": [
            "move_forward", "turn_left", "turn_right", "repeat", "if_condition"
        ],
        "target_output": "Square pattern",
        "user_blocks": [],
        "current_challenge": "Create a square using loops"
    }

@app.post("/games/{game_id}/submit")
async def submit_game_action(game_id: int, action_data: dict, conn = Depends(get_db_connection)):
    """Submit game action and get result"""
    cursor = conn.cursor()
    cursor.execute("SELECT subject FROM games WHERE id = ?", (game_id,))
    game = cursor.fetchone()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Process game action based on subject
    result = process_game_action(game['subject'], action_data)
    
    return {
        "success": True,
        "result": result,
        "score_change": result.get('score', 0),
        "message": result.get('message', 'Action processed')
    }

def process_game_action(subject: str, action_data: dict):
    if subject == 'physics':
        return process_physics_action(action_data)
    elif subject == 'mathematics':
        return process_math_action(action_data)
    elif subject == 'chemistry':
        return process_chemistry_action(action_data)
    elif subject == 'biology':
        return process_biology_action(action_data)
    elif subject == 'computer_science':
        return process_coding_action(action_data)
    else:
        return {"success": False, "message": "Unknown game type"}

def process_physics_action(action_data: dict):
    # Simulate physics engine response
    object_id = action_data.get('object_id')
    force = action_data.get('force', {})
    
    # Simple physics calculation
    velocity_change = {
        'x': force.get('x', 0) * 0.1,
        'y': force.get('y', 0) * 0.1
    }
    
    return {
        'success': True,
        'velocity_change': velocity_change,
        'score': 10,
        'message': 'Force applied successfully'
    }

def process_math_action(action_data: dict):
    shape_data = action_data.get('shape', {})
    user_answer = action_data.get('answer')
    expected_answer = action_data.get('expected_answer')
    
    if abs(user_answer - expected_answer) < 0.01:
        return {
            'success': True,
            'score': 20,
            'message': 'Correct answer! Well done!'
        }
    else:
        return {
            'success': False,
            'score': 0,
            'message': 'Try again! Check your calculations.'
        }

def process_chemistry_action(action_data: dict):
    chemical_a = action_data.get('chemical_a')
    chemical_b = action_data.get('chemical_b')
    
    # Simple reaction simulation
    if chemical_a == 'acid' and chemical_b == 'base':
        return {
            'success': True,
            'reaction': 'neutralization',
            'product': 'salt + water',
            'score': 15,
            'message': 'Neutralization reaction successful!'
        }
    else:
        return {
            'success': False,
            'score': 0,
            'message': 'No reaction occurred. Try different chemicals.'
        }

def process_biology_action(action_data: dict):
    part_identified = action_data.get('part')
    action = action_data.get('action')  # rotate, zoom, identify
    
    if action == 'identify' and part_identified:
        return {
            'success': True,
            'score': 5,
            'message': f'Correctly identified {part_identified}!'
        }
    else:
        return {
            'success': True,
            'score': 1,
            'message': 'View updated'
        }

def process_coding_action(action_data: dict):
    blocks = action_data.get('blocks', [])
    expected_pattern = action_data.get('expected_pattern')
    
    # Simple pattern matching
    if len(blocks) >= 4 and 'repeat' in str(blocks):
        return {
            'success': True,
            'score': 25,
            'message': 'Excellent coding! Pattern matched.'
        }
    else:
        return {
            'success': False,
            'score': 5,
            'message': 'Good start, but try using loops for efficiency'
        }

@app.post("/progress/")
async def save_progress(progress: models.ProgressCreate, conn = Depends(get_db_connection)):
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO progress (user_id, game_id, score, time_spent, completed, gestures_used, game_specific_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (progress.user_id, progress.game_id, progress.score, progress.time_spent, 
          progress.completed, json.dumps(progress.gestures_used), 
          json.dumps(progress.game_specific_data) if progress.game_specific_data else None))
    
    conn.commit()
    return {"message": "Progress saved successfully"}

@app.post("/process-gesture/")
async def process_gesture(image_data: str):
    """Process hand gesture from base64 image"""
    try:
        # Decode base64 image
        image_data = image_data.split(",")[1]  # Remove data URL prefix
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Process gesture
        gesture_data = gesture_recognizer.process_frame(frame)
        
        return gesture_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing gesture: {str(e)}")

@app.get("/analytics/{user_id}")
async def get_user_analytics(user_id: int, conn = Depends(get_db_connection)):
    cursor = conn.cursor()
    
    # Get user progress
    cursor.execute('''
        SELECT g.title, g.subject, AVG(p.score) as avg_score, 
               SUM(p.time_spent) as total_time, COUNT(p.id) as games_played
        FROM progress p
        JOIN games g ON p.game_id = g.id
        WHERE p.user_id = ?
        GROUP BY g.id
    ''', (user_id,))
    
    progress_data = cursor.fetchall()
    
    # Get weekly engagement
    cursor.execute('''
        SELECT DATE(created_at) as date, SUM(time_spent) as daily_time
        FROM progress
        WHERE user_id = ? AND created_at >= date('now', '-7 days')
        GROUP BY DATE(created_at)
    ''', (user_id,))
    
    weekly_engagement = cursor.fetchall()
    
    return {
        "progress": [dict(row) for row in progress_data],
        "weekly_engagement": [dict(row) for row in weekly_engagement]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)