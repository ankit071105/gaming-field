import numpy as np
from typing import Dict, List, Any

class PhysicsGameEngine:
    def __init__(self):
        self.gravity = 9.8
        self.friction = 0.1
        self.objects = []
        self.forces = {}
        
    def initialize_game(self, level: int = 1) -> Dict[str, Any]:
        """Initialize physics game with objects and targets"""
        if level == 1:
            return {
                "objects": [
                    {
                        "id": 1,
                        "type": "ball",
                        "mass": 1.0,
                        "position": {"x": 100, "y": 100},
                        "velocity": {"x": 0, "y": 0},
                        "radius": 20,
                        "color": "#ef4444"
                    },
                    {
                        "id": 2,
                        "type": "block", 
                        "mass": 2.0,
                        "position": {"x": 300, "y": 200},
                        "velocity": {"x": 0, "y": 0},
                        "width": 60,
                        "height": 40,
                        "color": "#3b82f6"
                    }
                ],
                "targets": [
                    {
                        "id": 1,
                        "position": {"x": 600, "y": 300},
                        "radius": 30,
                        "color": "#10b981"
                    }
                ],
                "obstacles": [
                    {
                        "id": 1,
                        "type": "ramp",
                        "position": {"x": 400, "y": 250},
                        "angle": 30,
                        "length": 100
                    }
                ],
                "level": level,
                "objective": "Drag objects to hit the target using physics principles"
            }
        else:
            return self._create_advanced_level(level)
    
    def _create_advanced_level(self, level: int) -> Dict[str, Any]:
        """Create advanced physics levels"""
        # Advanced levels with more complex physics scenarios
        return {
            "objects": [
                {
                    "id": 1,
                    "type": "ball",
                    "mass": 1.5,
                    "position": {"x": 50, "y": 150},
                    "velocity": {"x": 0, "y": 0},
                    "radius": 25,
                    "color": "#dc2626"
                }
            ],
            "targets": [
                {
                    "id": 1, 
                    "position": {"x": 700, "y": 200},
                    "radius": 25,
                    "color": "#059669"
                }
            ],
            "obstacles": [
                {
                    "id": 1,
                    "type": "wall",
                    "position": {"x": 300, "y": 0},
                    "height": 400,
                    "width": 20
                },
                {
                    "id": 2,
                    "type": "pendulum",
                    "position": {"x": 500, "y": 100},
                    "length": 80,
                    "angle": 45
                }
            ],
            "level": level,
            "objective": "Navigate through obstacles using momentum and forces"
        }
    
    def apply_force(self, object_id: int, force: Dict[str, float], duration: float = 1.0) -> Dict[str, Any]:
        """Apply force to an object and calculate new position"""
        obj = next((o for o in self.objects if o["id"] == object_id), None)
        if not obj:
            return {"success": False, "error": "Object not found"}
        
        # Calculate acceleration (F = ma -> a = F/m)
        acceleration = {
            "x": force.get("x", 0) / obj["mass"],
            "y": force.get("y", 0) / obj["mass"] + self.gravity  # Include gravity
        }
        
        # Update velocity (v = u + at)
        obj["velocity"]["x"] += acceleration["x"] * duration
        obj["velocity"]["y"] += acceleration["y"] * duration
        
        # Apply friction
        obj["velocity"]["x"] *= (1 - self.friction)
        obj["velocity"]["y"] *= (1 - self.friction)
        
        # Update position (s = ut + 0.5at²)
        obj["position"]["x"] += obj["velocity"]["x"] * duration + 0.5 * acceleration["x"] * duration**2
        obj["position"]["y"] += obj["velocity"]["y"] * duration + 0.5 * acceleration["y"] * duration**2
        
        # Check boundaries
        obj["position"]["x"] = max(0, min(800, obj["position"]["x"]))
        obj["position"]["y"] = max(0, min(600, obj["position"]["y"]))
        
        return {
            "success": True,
            "new_position": obj["position"],
            "new_velocity": obj["velocity"],
            "acceleration": acceleration
        }
    
    def check_collision(self, object1: Dict, object2: Dict) -> bool:
        """Check collision between two objects"""
        if object1["type"] == "ball" and object2["type"] == "target":
            dist = np.sqrt(
                (object1["position"]["x"] - object2["position"]["x"])**2 +
                (object1["position"]["y"] - object2["position"]["y"])**2
            )
            return dist <= (object1.get("radius", 0) + object2.get("radius", 0))
        
        return False
    
    def calculate_trajectory(self, object_id: int, initial_force: Dict[str, float], steps: int = 50) -> List[Dict[str, float]]:
        """Calculate and return trajectory points for prediction"""
        trajectory = []
        obj = next((o for o in self.objects if o["id"] == object_id), None)
        
        if not obj:
            return trajectory
        
        # Simulate trajectory
        pos = obj["position"].copy()
        vel = obj["velocity"].copy()
        
        for i in range(steps):
            # Apply forces
            accel_x = initial_force.get("x", 0) / obj["mass"]
            accel_y = initial_force.get("y", 0) / obj["mass"] + self.gravity
            
            vel["x"] += accel_x * 0.1
            vel["y"] += accel_y * 0.1
            
            pos["x"] += vel["x"] * 0.1
            pos["y"] += vel["y"] * 0.1
            
            trajectory.append(pos.copy())
            
            # Stop if out of bounds
            if pos["x"] < 0 or pos["x"] > 800 or pos["y"] < 0 or pos["y"] > 600:
                break
        
        return trajectory