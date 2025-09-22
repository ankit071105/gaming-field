import random
from typing import Dict, List, Any

class ChemistryGameEngine:
    def __init__(self):
        self.chemicals = {
            "hcl": {"name": "Hydrochloric Acid", "type": "acid", "color": "#ff6b6b", "concentration": 1.0},
            "naoh": {"name": "Sodium Hydroxide", "type": "base", "color": "#4ecdc4", "concentration": 1.0},
            "h2so4": {"name": "Sulfuric Acid", "type": "acid", "color": "#ff8e8e", "concentration": 0.5},
            "koh": {"name": "Potassium Hydroxide", "type": "base", "color": "#56ccb8", "concentration": 0.5},
            "water": {"name": "Water", "type": "neutral", "color": "#74b9ff", "concentration": 0.0},
            "nacl": {"name": "Sodium Chloride", "type": "salt", "color": "#a29bfe", "concentration": 0.3}
        }
        self.reactions = {}
        self.current_experiment = None
        
    def initialize_experiment(self, experiment_type: str = "neutralization") -> Dict[str, Any]:
        """Initialize a chemistry experiment"""
        if experiment_type == "neutralization":
            self.current_experiment = {
                "type": "neutralization",
                "objective": "Neutralize acid with base to form salt and water",
                "chemicals_available": ["hcl", "naoh", "water"],
                "target_ph": 7.0,
                "instructions": "Mix acid and base in correct proportions"
            }
        elif experiment_type == "precipitation":
            self.current_experiment = {
                "type": "precipitation",
                "objective": "Create precipitate by mixing specific salts",
                "chemicals_available": ["agno3", "nacl", "water"],
                "target_precipitate": "AgCl",
                "instructions": "Mix silver nitrate with sodium chloride"
            }
        else:
            self.current_experiment = {
                "type": "color_change",
                "objective": "Observe color changes in chemical reactions",
                "chemicals_available": ["naoh", "phenolphthalein", "hcl"],
                "target_color": "pink_to_colorless",
                "instructions": "Add indicator and observe pH changes"
            }
        
        return self.current_experiment
    
    def mix_chemicals(self, chemical1: str, chemical2: str, volume1: float, volume2: float) -> Dict[str, Any]:
        """Mix two chemicals and return reaction result"""
        chem1_data = self.chemicals.get(chemical1)
        chem2_data = self.chemicals.get(chemical2)
        
        if not chem1_data or not chem2_data:
            return {"success": False, "error": "Invalid chemicals"}
        
        # Calculate resulting mixture properties
        total_volume = volume1 + volume2
        concentration1 = (volume1 / total_volume) * chem1_data["concentration"]
        concentration2 = (volume2 / total_volume) * chem2_data["concentration"]
        
        # Determine reaction type
        reaction_type = self._determine_reaction_type(chem1_data["type"], chem2_data["type"])
        reaction_result = self._calculate_reaction(reaction_type, concentration1, concentration2)
        
        # Calculate resulting color (weighted average)
        color1 = self._hex_to_rgb(chem1_data["color"])
        color2 = self._hex_to_rgb(chem2_data["color"])
        
        ratio1 = volume1 / total_volume
        ratio2 = volume2 / total_volume
        
        result_color = self._rgb_to_hex(
            int(color1[0] * ratio1 + color2[0] * ratio2),
            int(color1[1] * ratio1 + color2[1] * ratio2),
            int(color1[2] * ratio1 + color2[2] * ratio2)
        )
        
        # Calculate pH change
        final_ph = self._calculate_ph(chem1_data["type"], chem2_data["type"], concentration1, concentration2)
        
        result = {
            "success": True,
            "reaction_type": reaction_type,
            "products": reaction_result["products"],
            "color": result_color,
            "ph": final_ph,
            "temperature_change": reaction_result["temperature_change"],
            "precipitate_formed": reaction_result["precipitate_formed"],
            "message": reaction_result["message"]
        }
        
        # Check if experiment objective is achieved
        if self.current_experiment:
            result["objective_achieved"] = self._check_experiment_objective(result)
        
        return result
    
    def _determine_reaction_type(self, type1: str, type2: str) -> str:
        """Determine what type of reaction occurs"""
        if type1 == "acid" and type2 == "base" or type1 == "base" and type2 == "acid":
            return "neutralization"
        elif (type1 == "salt" and type2 == "salt") or (type1 == "ion" and type2 == "ion"):
            return "precipitation"
        elif type1 == "indicator" or type2 == "indicator":
            return "color_change"
        else:
            return "mixing"
    
    def _calculate_reaction(self, reaction_type: str, conc1: float, conc2: float) -> Dict[str, Any]:
        """Calculate reaction results"""
        if reaction_type == "neutralization":
            # Acid-base neutralization
            strength = min(conc1, conc2)
            return {
                "products": ["salt", "water"],
                "temperature_change": strength * 10,  # Exothermic reaction
                "precipitate_formed": False,
                "message": "Neutralization reaction: Acid + Base → Salt + Water"
            }
        elif reaction_type == "precipitation":
            # Precipitation reaction
            return {
                "products": ["precipitate", "soluble_salt"],
                "temperature_change": 0,
                "precipitate_formed": True,
                "message": "Precipitation reaction: Two salts form an insoluble compound"
            }
        elif reaction_type == "color_change":
            # pH indicator color change
            return {
                "products": ["colored_complex"],
                "temperature_change": 0,
                "precipitate_formed": False,
                "message": "Color change indicates pH variation"
            }
        else:
            # Simple mixing
            return {
                "products": ["mixture"],
                "temperature_change": 0,
                "precipitate_formed": False,
                "message": "Chemicals mixed without significant reaction"
            }
    
    def _calculate_ph(self, type1: str, type2: str, conc1: float, conc2: float) -> float:
        """Calculate resulting pH of mixture"""
        if type1 == "acid" and type2 == "base":
            # Neutralization pH calculation
            difference = conc1 - conc2
            if abs(difference) < 0.01:  # Perfect neutralization
                return 7.0
            elif difference > 0:  # Acidic
                return max(1.0, 7.0 - difference * 3)
            else:  # Basic
                return min(14.0, 7.0 + abs(difference) * 3)
        elif type1 == "acid" or type2 == "acid":
            return 3.0 + random.uniform(0, 2)
        elif type1 == "base" or type2 == "base":
            return 11.0 + random.uniform(0, 2)
        else:
            return 7.0
    
    def _hex_to_rgb(self, hex_color: str) -> tuple:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def _rgb_to_hex(self, r: int, g: int, b: int) -> str:
        """Convert RGB to hex color"""
        return f"#{r:02x}{g:02x}{b:02x}"
    
    def _check_experiment_objective(self, reaction_result: Dict[str, Any]) -> bool:
        """Check if current experiment objective is achieved"""
        if not self.current_experiment:
            return False
        
        if self.current_experiment["type"] == "neutralization":
            return abs(reaction_result["ph"] - 7.0) < 0.5
        elif self.current_experiment["type"] == "precipitation":
            return reaction_result["precipitate_formed"]
        elif self.current_experiment["type"] == "color_change":
            return reaction_result["color"] != "#74b9ff"  # Not water color
        
        return False