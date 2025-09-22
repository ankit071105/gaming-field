import math
import random
from typing import Dict, List, Any, Tuple

class MathGameEngine:
    def __init__(self):
        self.current_problem = None
        self.user_drawing = []
        self.recognized_shapes = []
        
    def generate_math_problem(self, grade_level: int = 6) -> Dict[str, Any]:
        """Generate math problems based on grade level"""
        if grade_level <= 8:
            # Basic geometry problems
            problem_type = random.choice(["area", "perimeter", "volume"])
            shape = random.choice(["triangle", "rectangle", "circle", "square"])
            
            if shape == "triangle":
                base = random.randint(5, 15)
                height = random.randint(4, 12)
                if problem_type == "area":
                    answer = 0.5 * base * height
                    problem = f"Find area of triangle with base={base}, height={height}"
                else:
                    # For perimeter, create a right triangle
                    hypotenuse = math.sqrt(base**2 + height**2)
                    answer = base + height + hypotenuse
                    problem = f"Find perimeter of right triangle with sides {base}, {height}"
                    
            elif shape == "rectangle":
                length = random.randint(6, 20)
                width = random.randint(4, 15)
                if problem_type == "area":
                    answer = length * width
                    problem = f"Find area of rectangle with length={length}, width={width}"
                else:
                    answer = 2 * (length + width)
                    problem = f"Find perimeter of rectangle with length={length}, width={width}"
                    
            elif shape == "circle":
                radius = random.randint(3, 10)
                if problem_type == "area":
                    answer = math.pi * radius**2
                    problem = f"Find area of circle with radius={radius}"
                else:
                    answer = 2 * math.pi * radius
                    problem = f"Find circumference of circle with radius={radius}"
                    
            else:  # square
                side = random.randint(5, 12)
                if problem_type == "area":
                    answer = side**2
                    problem = f"Find area of square with side={side}"
                else:
                    answer = 4 * side
                    problem = f"Find perimeter of square with side={side}"
                    
        else:
            # Advanced problems for higher grades
            problem_type = random.choice(["algebra", "trigonometry", "calculus"])
            
            if problem_type == "algebra":
                a, b = random.randint(1, 10), random.randint(1, 10)
                answer = a + b
                problem = f"Solve for x: {a}x + {b} = {a+b}"
                
            elif problem_type == "trigonometry":
                angle = random.randint(30, 60)
                answer = math.sin(math.radians(angle))
                problem = f"Find sin({angle}°)"
                
            else:  # calculus
                # Simple derivative
                coefficient = random.randint(2, 5)
                power = random.randint(2, 4)
                answer = coefficient * power
                problem = f"Find derivative of {coefficient}x^{power}"
        
        self.current_problem = {
            "problem": problem,
            "shape": shape,
            "type": problem_type,
            "answer": round(answer, 2),
            "parameters": locals().get('base', locals().get('radius', locals().get('length', 0))),
            "grade_level": grade_level
        }
        
        return self.current_problem
    
    def analyze_drawing(self, points: List[Tuple[float, float]]) -> Dict[str, Any]:
        """Analyze hand-drawn shape and identify it"""
        if len(points) < 3:
            return {"success": False, "error": "Not enough points"}
        
        # Calculate basic shape properties
        x_coords = [p[0] for p in points]
        y_coords = [p[1] for p in points]
        
        width = max(x_coords) - min(x_coords)
        height = max(y_coords) - min(y_coords)
        aspect_ratio = width / height if height != 0 else 1
        
        # Calculate circularity
        area = self._calculate_polygon_area(points)
        perimeter = self._calculate_perimeter(points)
        circularity = (4 * math.pi * area) / (perimeter**2) if perimeter != 0 else 0
        
        # Identify shape based on properties
        if circularity > 0.8:
            shape = "circle"
            confidence = circularity
        elif 0.6 < aspect_ratio < 1.4:
            shape = "square" if abs(width - height) < 0.2 * max(width, height) else "rectangle"
            confidence = 0.8
        else:
            # Check for triangle
            if len(points) >= 3:
                angles = self._calculate_angles(points[:3])
                if max(angles) < 120:  # Reasonable triangle angles
                    shape = "triangle"
                    confidence = 0.7
                else:
                    shape = "polygon"
                    confidence = 0.5
        
        self.recognized_shapes.append(shape)
        
        return {
            "success": True,
            "shape": shape,
            "confidence": round(confidence, 2),
            "area": round(area, 2),
            "perimeter": round(perimeter, 2),
            "aspect_ratio": round(aspect_ratio, 2)
        }
    
    def _calculate_polygon_area(self, points: List[Tuple[float, float]]) -> float:
        """Calculate area of polygon using shoelace formula"""
        n = len(points)
        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += points[i][0] * points[j][1]
            area -= points[j][0] * points[i][1]
        return abs(area) / 2.0
    
    def _calculate_perimeter(self, points: List[Tuple[float, float]]) -> float:
        """Calculate perimeter of drawn shape"""
        perimeter = 0.0
        n = len(points)
        for i in range(n):
            j = (i + 1) % n
            dx = points[j][0] - points[i][0]
            dy = points[j][1] - points[i][1]
            perimeter += math.sqrt(dx**2 + dy**2)
        return perimeter
    
    def _calculate_angles(self, points: List[Tuple[float, float]]) -> List[float]:
        """Calculate angles between points"""
        if len(points) != 3:
            return []
        
        angles = []
        for i in range(3):
            a = points[i]
            b = points[(i + 1) % 3]
            c = points[(i + 2) % 3]
            
            # Calculate vectors
            ba = (a[0] - b[0], a[1] - b[1])
            bc = (c[0] - b[0], c[1] - b[1])
            
            # Calculate angle
            dot_product = ba[0] * bc[0] + ba[1] * bc[1]
            mag_ba = math.sqrt(ba[0]**2 + ba[1]**2)
            mag_bc = math.sqrt(bc[0]**2 + bc[1]**2)
            
            if mag_ba * mag_bc == 0:
                angles.append(0)
            else:
                angle = math.degrees(math.acos(dot_product / (mag_ba * mag_bc)))
                angles.append(angle)
        
        return angles
    
    def check_solution(self, user_answer: float, tolerance: float = 0.1) -> Dict[str, Any]:
        """Check if user's answer is correct"""
        if not self.current_problem:
            return {"success": False, "error": "No active problem"}
        
        correct_answer = self.current_problem["answer"]
        is_correct = abs(user_answer - correct_answer) <= tolerance
        
        return {
            "success": True,
            "correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "difference": abs(user_answer - correct_answer)
        }