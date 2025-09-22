import sqlite3
from contextlib import contextmanager

DATABASE_URL = "rural_stem_quest.db"

def init_db():
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            school TEXT,
            grade INTEGER,
            language TEXT DEFAULT 'odia',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Games table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT NOT NULL,
            description TEXT,
            gesture_type TEXT NOT NULL,
            difficulty TEXT DEFAULT 'beginner',
            content_url TEXT,
            game_data TEXT,  # JSON data for game configuration
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Progress table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            game_id INTEGER,
            score INTEGER DEFAULT 0,
            time_spent INTEGER DEFAULT 0,
            completed BOOLEAN DEFAULT FALSE,
            gestures_used TEXT,
            game_specific_data TEXT,  # JSON for game-specific progress
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (game_id) REFERENCES games (id)
        )
    ''')
    
    # Analytics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            game_id INTEGER,
            gesture_accuracy REAL,
            engagement_time INTEGER,
            session_date DATE DEFAULT CURRENT_DATE,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (game_id) REFERENCES games (id)
        )
    ''')
    
    # Insert sample games with enhanced data
    sample_games = [
        ('Physics Puzzle', 'physics', 'Drag objects using hand gestures to learn Newton\'s laws', 'drag_drop', 'beginner', 
         '{"objects": ["ball", "block", "ramp"], "concepts": ["gravity", "friction", "momentum"]}'),
        
        ('Math Shapes', 'mathematics', 'Create geometric shapes with gestures and solve problems', 'shape_draw', 'beginner',
         '{"shapes": ["triangle", "square", "circle"], "operations": ["area", "perimeter", "volume"]}'),
        
        ('Chemistry Lab', 'chemistry', 'Mix chemicals with hand motions to learn reactions', 'pour_tilt', 'intermediate',
         '{"chemicals": ["acid", "base", "salt"], "reactions": ["neutralization", "combustion", "synthesis"]}'),
        
        ('Biology Explorer', 'biology', 'Explore anatomy with 3D gestures and dissect virtual organisms', 'rotate_zoom', 'intermediate',
         '{"organisms": ["human", "frog", "plant"], "systems": ["skeletal", "digestive", "nervous"]}'),
        
        ('Coding Challenge', 'computer_science', 'Arrange code blocks with gestures to learn programming', 'drag_drop', 'advanced',
         '{"languages": ["python", "scratch", "blockly"], "concepts": ["loops", "conditionals", "functions"]}')
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO games (title, subject, description, gesture_type, difficulty, game_data)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', sample_games)
    
    conn.commit()
    conn.close()

@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()