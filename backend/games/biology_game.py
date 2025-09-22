import math
from typing import Dict, List, Any

class BiologyGameEngine:
    def __init__(self):
        self.organisms = {
            "human": {
                "systems": ["skeletal", "digestive", "nervous", "circulatory", "respiratory"],
                "parts": {
                    "skeletal": ["skull", "spine", "ribs", "pelvis", "limbs"],
                    "digestive": ["mouth", "esophagus", "stomach", "intestines", "liver"],
                    "nervous": ["brain", "spinal_cord", "nerves", "neurons"],
                    "circulatory": ["heart", "arteries", "veins", "capillaries"],
                    "respiratory": ["lungs", "trachea", "bronchi", "alveoli"]
                }
            },
            "frog": {
                "systems": ["skeletal", "digestive", "nervous", "circulatory"],
                "parts": {
                    "skeletal": ["skull", "backbone", "limbs", "pectoral_girdle"],
                    "digestive": ["mouth", "stomach", "intestines", "liver"],
                    "nervous": ["brain", "spinal_cord", "nerves"],
                    "circulatory": ["heart", "arteries", "veins"]
                }
            },
            "plant": {
                "systems": ["root", "stem", "leaf", "flower", "reproductive"],
                "parts": {
                    "root": ["root_hairs", "root_cap", "vascular_tissue"],
                    "stem": ["xylem", "phloem", "cambium"],
                    "leaf": ["blade", "petiole", "veins", "stomata"],
                    "flower": ["petals", "sepals", "stamen", "pistil"],
                    "reproductive": ["pollen", "ovary", "seeds"]
                }
            }
        }
        self.current_organism = None
        self.current_system = None
        
    def initialize_organism(self, organism: str = "human") -> Dict[str, Any]:
        """Initialize organism for exploration"""
        if organism not in self.organisms:
            return {"success": False, "error": "Organism not available"}
        
        self.current_organism = organism
        organism_data = self.organisms[organism]
        
        return {
            "success": True,
            "organism": organism,
            "available_systems": organism_data["systems"],
            "description": self._get_organism_description(organism),
            "fun_fact": self._get_fun_fact(organism)
        }
    
    def select_system(self, system: str) -> Dict[str, Any]:
        """Select a biological system to explore"""
        if not self.current_organism:
            return {"success": False, "error": "No organism selected"}
        
        if system not in self.organisms[self.current_organism]["systems"]:
            return {"success": False, "error": "System not available for this organism"}
        
        self.current_system = system
        
        return {
            "success": True,
            "system": system,
            "parts": self.organisms[self.current_organism]["parts"][system],
            "system_info": self._get_system_info(system),
            "interactive_elements": self._get_interactive_elements(system)
        }
    
    def identify_part(self, part_name: str, position: Dict[str, float]) -> Dict[str, Any]:
        """Identify biological part based on position and context"""
        if not self.current_organism or not self.current_system:
            return {"success": False, "error": "No organism or system selected"}
        
        available_parts = self.organisms[self.current_organism]["parts"][self.current_system]
        
        if part_name not in available_parts:
            return {
                "success": False,
                "error": "Part not found in current system",
                "hint": f"Try: {', '.join(available_parts)}"
            }
        
        # Calculate identification confidence based on position
        confidence = self._calculate_identification_confidence(part_name, position)
        
        return {
            "success": True,
            "part": part_name,
            "confidence": confidence,
            "information": self._get_part_information(part_name),
            "fun_fact": self._get_part_fun_fact(part_name),
            "correct": confidence > 0.7
        }
    
    def calculate_3d_transform(self, rotation: Dict[str, float], zoom: float) -> Dict[str, Any]:
        """Calculate 3D transformation for organism view"""
        # Convert rotation to radians
        rx = math.radians(rotation.get("x", 0))
        ry = math.radians(rotation.get("y", 0))
        rz = math.radians(rotation.get("z", 0))
        
        # Calculate transformation matrix (simplified)
        transform_matrix = self._calculate_transformation_matrix(rx, ry, rz)
        
        # Apply zoom
        scale_factor = max(0.1, min(5.0, zoom))
        
        # Calculate visible parts based on rotation
        visible_parts = self._get_visible_parts(rotation)
        
        return {
            "transform_matrix": transform_matrix,
            "scale_factor": scale_factor,
            "visible_parts": visible_parts,
            "view_direction": self._get_view_direction(rotation),
            "lighting_angle": self._calculate_lighting_angle(rotation)
        }
    
    def _get_organism_description(self, organism: str) -> str:
        """Get description of organism"""
        descriptions = {
            "human": "Homo sapiens - Bipedal primate with highly developed brain",
            "frog": "Amphibian species - Undergoes metamorphosis from tadpole to adult",
            "plant": "Multicellular organism - Performs photosynthesis using chlorophyll"
        }
        return descriptions.get(organism, "Unknown organism")
    
    def _get_fun_fact(self, organism: str) -> str:
        """Get interesting fact about organism"""
        facts = {
            "human": "The human brain has about 86 billion neurons",
            "frog": "Frogs absorb water through their skin so they don't need to drink",
            "plant": "Some plants can communicate with each other through chemical signals"
        }
        return facts.get(organism, "Interesting fact not available")
    
    def _get_system_info(self, system: str) -> Dict[str, Any]:
        """Get information about biological system"""
        system_info = {
            "skeletal": {
                "function": "Support and protection",
                "components": "Bones, cartilage, ligaments",
                "importance": "Provides structure and enables movement"
            },
            "digestive": {
                "function": "Break down food and absorb nutrients",
                "components": "Mouth, stomach, intestines, liver",
                "importance": "Converts food into energy and building materials"
            },
            "nervous": {
                "function": "Control and coordination",
                "components": "Brain, spinal cord, nerves",
                "importance": "Processes information and controls body functions"
            }
        }
        return system_info.get(system, {})
    
    def _get_interactive_elements(self, system: str) -> List[str]:
        """Get interactive elements for the system"""
        elements = {
            "skeletal": ["rotate_bones", "zoom_joints", "highlight_connections"],
            "digestive": ["follow_food_path", "show_enzymes", "demonstrate_absorption"],
            "nervous": ["trace_nerve_paths", "show_synapses", "demonstrate_reflexes"]
        }
        return elements.get(system, [])
    
    def _calculate_identification_confidence(self, part: str, position: Dict[str, float]) -> float:
        """Calculate confidence in part identification"""
        # Simplified confidence calculation based on position
        # In real implementation, this would use machine learning
        base_confidence = 0.8
        
        # Adjust based on position (mock logic)
        x, y = position.get("x", 0.5), position.get("y", 0.5)
        distance_from_center = math.sqrt((x - 0.5)**2 + (y - 0.5)**2)
        
        # Parts near center are easier to identify
        confidence = base_confidence * (1 - distance_from_center)
        
        return max(0.1, min(1.0, confidence))
    
    def _get_part_information(self, part: str) -> str:
        """Get detailed information about a part"""
        part_info = {
            "skull": "Protects the brain and supports facial structures",
            "heart": "Pumps blood throughout the circulatory system",
            "stomach": "Digests food using acids and enzymes",
            "brain": "Central processing unit of the nervous system",
            "lungs": "Facilitate gas exchange between air and blood"
        }
        return part_info.get(part, "Information not available")
    
    def _get_part_fun_fact(self, part: str) -> str:
        """Get fun fact about a part"""
        facts = {
            "skull": "The skull is made of 22 bones that fuse together as we grow",
            "heart": "The heart beats about 100,000 times per day",
            "stomach": "Stomach acid is strong enough to dissolve metal",
            "brain": "The brain uses about 20% of the body's oxygen",
            "lungs": "Total surface area of lungs is about the size of a tennis court"
        }
        return facts.get(part, "Fun fact not available")
    
    def _calculate_transformation_matrix(self, rx: float, ry: float, rz: float) -> List[List[float]]:
        """Calculate 3D transformation matrix"""
        # Simplified rotation matrix calculation
        cos_x, sin_x = math.cos(rx), math.sin(rx)
        cos_y, sin_y = math.cos(ry), math.sin(ry)
        cos_z, sin_z = math.cos(rz), math.sin(rz)
        
        # Rotation matrices
        rx_matrix = [
            [1, 0, 0],
            [0, cos_x, -sin_x],
            [0, sin_x, cos_x]
        ]
        
        ry_matrix = [
            [cos_y, 0, sin_y],
            [0, 1, 0],
            [-sin_y, 0, cos_y]
        ]
        
        rz_matrix = [
            [cos_z, -sin_z, 0],
            [sin_z, cos_z, 0],
            [0, 0, 1]
        ]
        
        # Combined rotation (simplified)
        return rz_matrix  # Return only one for simplicity
    
    def _get_visible_parts(self, rotation: Dict[str, float]) -> List[str]:
        """Determine which parts are visible based on rotation"""
        # Simplified visibility calculation
        view_angle = rotation.get("y", 0)
        
        if -45 <= view_angle <= 45:
            return ["front_parts", "central_organs"]
        elif view_angle > 45:
            return ["right_side", "limbs"]
        else:
            return ["left_side", "internal_structures"]
    
    def _get_view_direction(self, rotation: Dict[str, float]) -> str:
        """Get human-readable view direction"""
        y_angle = rotation.get("y", 0)
        
        if -30 <= y_angle <= 30:
            return "Front View"
        elif 30 < y_angle <= 150:
            return "Right Side View"
        elif -150 <= y_angle < -30:
            return "Left Side View"
        else:
            return "Rear View"
    
    def _calculate_lighting_angle(self, rotation: Dict[str, float]) -> Dict[str, float]:
        """Calculate lighting angle for 3D rendering"""
        # Simple lighting based on rotation
        return {
            "x": rotation.get("x", 0) + 45,  # Add some default angle
            "y": rotation.get("y", 0) + 30,
            "intensity": 0.8
        }