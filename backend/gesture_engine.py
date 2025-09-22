import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, List, Tuple
import math

class GestureRecognizer:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_draw = mp.solutions.drawing_utils
        
    def process_frame(self, frame: np.ndarray) -> Dict:
        """Process frame and detect hand gestures for all game types"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        gesture_data = {
            "hands_detected": 0,
            "landmarks": [],
            "gestures": [],
            "bounding_boxes": [],
            "fingertip_positions": [],
            "palm_center": [],
            "gesture_scores": {}
        }
        
        if results.multi_hand_landmarks:
            gesture_data["hands_detected"] = len(results.multi_hand_landmarks)
            
            for hand_landmarks in results.multi_hand_landmarks:
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.append([lm.x, lm.y, lm.z])
                
                gesture_data["landmarks"].append(landmarks)
                
                # Detect multiple gesture types
                gestures = self._classify_all_gestures(landmarks)
                gesture_data["gestures"].extend(gestures)
                
                # Get fingertip positions for precise control
                fingertips = self._get_fingertip_positions(landmarks)
                gesture_data["fingertip_positions"].append(fingertips)
                
                # Get palm center for movement detection
                palm_center = self._get_palm_center(landmarks)
                gesture_data["palm_center"].append(palm_center)
                
                # Calculate bounding box
                bbox = self._get_bounding_box(landmarks)
                gesture_data["bounding_boxes"].append(bbox)
        
        return gesture_data
    
    def _classify_all_gestures(self, landmarks: List[List[float]]) -> List[Dict[str, Any]]:
        """Classify multiple gesture types for different games"""
        gestures = []
        
        # Drag and drop gesture (for Physics & Coding)
        drag_confidence = self._detect_drag_gesture(landmarks)
        if drag_confidence > 0.8:
            gestures.append({"type": "drag", "confidence": drag_confidence})
        
        # Shape drawing gesture (for Math)
        draw_confidence = self._detect_draw_gesture(landmarks)
        if draw_confidence > 0.7:
            gestures.append({"type": "draw", "confidence": draw_confidence})
        
        # Pour/tilt gesture (for Chemistry)
        pour_confidence = self._detect_pour_gesture(landmarks)
        if pour_confidence > 0.75:
            gestures.append({"type": "pour", "confidence": pour_confidence, "direction": self._get_tilt_direction(landmarks)})
        
        # Rotate/zoom gesture (for Biology)
        rotate_confidence = self._detect_rotate_gesture(landmarks)
        if rotate_confidence > 0.7:
            gestures.append({"type": "rotate", "confidence": rotate_confidence})
        
        # Pinch zoom gesture
        zoom_confidence = self._detect_zoom_gesture(landmarks)
        if zoom_confidence > 0.7:
            gestures.append({"type": "zoom", "confidence": zoom_confidence, "scale": self._get_zoom_scale(landmarks)})
        
        return gestures
    
    def _detect_drag_gesture(self, landmarks: List[List[float]]) -> float:
        """Detect grab/drag gesture for physics and coding games"""
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        
        # Check if thumb and fingers are close together (pinch)
        thumb_index_dist = self._calculate_distance(thumb_tip, index_tip)
        thumb_middle_dist = self._calculate_distance(thumb_tip, middle_tip)
        
        if thumb_index_dist < 0.05 and thumb_middle_dist < 0.06:
            return 0.9
        return 0.0
    
    def _detect_draw_gesture(self, landmarks: List[List[float]]) -> float:
        """Detect drawing gesture for math shapes"""
        index_tip = landmarks[8]
        index_pip = landmarks[6]  # PIP joint
        
        # Check if index finger is extended for drawing
        if index_tip[1] < index_pip[1]:  # Tip above PIP (extended)
            return 0.8
        return 0.0
    
    def _detect_pour_gesture(self, landmarks: List[List[float]]) -> float:
        """Detect pouring gesture for chemistry"""
        wrist = landmarks[0]
        middle_mcp = landmarks[9]  # Middle finger MCP
        
        # Check hand tilt based on wrist to middle finger relationship
        tilt_angle = self._calculate_tilt_angle(wrist, middle_mcp)
        
        if abs(tilt_angle) > 30:  # Significant tilt
            return 0.8
        return 0.0
    
    def _detect_rotate_gesture(self, landmarks: List[List[float]]) -> float:
        """Detect rotation gesture for biology 3D models"""
        # Check if hand is making circular motion (simplified)
        # In practice, you'd track motion over multiple frames
        fingertips = [landmarks[i] for i in [8, 12, 16, 20]]
        spread = self._calculate_finger_spread(fingertips)
        
        if spread > 0.15:  # Fingers spread for rotation
            return 0.7
        return 0.0
    
    def _detect_zoom_gesture(self, landmarks: List[List[float]]) -> float:
        """Detect pinch-to-zoom gesture"""
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        
        distance = self._calculate_distance(thumb_tip, index_tip)
        
        if distance < 0.03:  # Very close for zoom
            return 0.9
        elif distance > 0.15:  # Spread for zoom out
            return 0.8
        return 0.0
    
    def _get_fingertip_positions(self, landmarks: List[List[float]]) -> Dict[str, List[float]]:
        """Get precise fingertip positions"""
        return {
            "thumb": landmarks[4],
            "index": landmarks[8],
            "middle": landmarks[12],
            "ring": landmarks[16],
            "pinky": landmarks[20]
        }
    
    def _get_palm_center(self, landmarks: List[List[float]]) -> List[float]:
        """Calculate palm center position"""
        palm_points = [landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]]
        x_coords = [p[0] for p in palm_points]
        y_coords = [p[1] for p in palm_points]
        z_coords = [p[2] for p in palm_points]
        
        return [
            sum(x_coords) / len(x_coords),
            sum(y_coords) / len(y_coords),
            sum(z_coords) / len(z_coords)
        ]
    
    def _get_bounding_box(self, landmarks: List[List[float]]) -> Dict[str, float]:
        """Get bounding box around hand"""
        x_coords = [lm[0] for lm in landmarks]
        y_coords = [lm[1] for lm in landmarks]
        
        return {
            "x_min": min(x_coords),
            "y_min": min(y_coords),
            "x_max": max(x_coords),
            "y_max": max(y_coords),
            "width": max(x_coords) - min(x_coords),
            "height": max(y_coords) - min(y_coords)
        }
    
    def _get_tilt_direction(self, landmarks: List[List[float]]) -> str:
        """Get direction of hand tilt for pouring"""
        wrist = landmarks[0]
        middle_mcp = landmarks[9]
        
        if wrist[0] < middle_mcp[0]:
            return "left"
        else:
            return "right"
    
    def _get_zoom_scale(self, landmarks: List[List[float]]) -> float:
        """Calculate zoom scale based on finger distance"""
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        distance = self._calculate_distance(thumb_tip, index_tip)
        
        # Normalize to 0-1 scale
        return max(0, min(1, (distance - 0.03) / 0.12))
    
    def _calculate_distance(self, point1: List[float], point2: List[float]) -> float:
        """Calculate Euclidean distance between two points"""
        return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def _calculate_tilt_angle(self, point1: List[float], point2: List[float]) -> float:
        """Calculate tilt angle between two points"""
        dx = point2[0] - point1[0]
        dy = point2[1] - point1[1]
        return math.degrees(math.atan2(dy, dx))
    
    def _calculate_finger_spread(self, fingertips: List[List[float]]) -> float:
        """Calculate how spread out fingers are"""
        distances = []
        for i in range(len(fingertips)):
            for j in range(i + 1, len(fingertips)):
                distances.append(self._calculate_distance(fingertips[i], fingertips[j]))
        
        return max(distances) if distances else 0.0