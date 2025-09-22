import random
from typing import Dict, List, Any

class CodingGameEngine:
    def __init__(self):
        self.programming_concepts = {
            "beginner": ["variables", "loops", "conditionals", "functions"],
            "intermediate": ["arrays", "objects", "events", "debugging"],
            "advanced": ["algorithms", "data_structures", "recursion", "optimization"]
        }
        self.current_challenge = None
        self.user_code = []
        
    def generate_challenge(self, difficulty: str = "beginner") -> Dict[str, Any]:
        """Generate a coding challenge based on difficulty"""
        concepts = self.programming_concepts.get(difficulty, ["variables", "loops"])
        main_concept = random.choice(concepts)
        
        if difficulty == "beginner":
            challenge = self._create_beginner_challenge(main_concept)
        elif difficulty == "intermediate":
            challenge = self._create_intermediate_challenge(main_concept)
        else:
            challenge = self._create_advanced_challenge(main_concept)
        
        self.current_challenge = challenge
        return challenge
    
    def _create_beginner_challenge(self, concept: str) -> Dict[str, Any]:
        """Create beginner-level coding challenge"""
        challenges = {
            "variables": {
                "title": "Variable Assignment",
                "description": "Create variables to store student information",
                "instructions": "Create variables for name, age, and grade",
                "expected_blocks": ["set_var", "value", "text"],
                "solution": ["set_var name John", "set_var age 15", "set_var grade 10"],
                "hint": "Use set_var blocks to create variables"
            },
            "loops": {
                "title": "Simple Loop",
                "description": "Create a loop that repeats an action",
                "instructions": "Make a loop that prints numbers 1 to 5",
                "expected_blocks": ["loop", "print", "number"],
                "solution": ["loop 5", "print 1", "print 2", "print 3", "print 4", "print 5"],
                "hint": "Use loop block with print blocks inside"
            },
            "conditionals": {
                "title": "Basic Condition",
                "description": "Use if-else to make decisions",
                "instructions": "Check if a number is positive or negative",
                "expected_blocks": ["if", "else", "compare", "print"],
                "solution": ["if number > 0", "print positive", "else", "print negative"],
                "hint": "Start with if block and add comparison"
            }
        }
        return challenges.get(concept, challenges["variables"])
    
    def _create_intermediate_challenge(self, concept: str) -> Dict[str, Any]:
        """Create intermediate-level coding challenge"""
        challenges = {
            "arrays": {
                "title": "Array Manipulation",
                "description": "Work with arrays of student scores",
                "instructions": "Calculate average of test scores in an array",
                "expected_blocks": ["array", "loop", "sum", "divide", "variable"],
                "solution": ["array scores", "loop scores", "sum score", "divide sum count", "set_var average result"],
                "hint": "Use loop to go through array elements"
            },
            "functions": {
                "title": "Function Creation",
                "description": "Create reusable functions",
                "instructions": "Make a function to calculate area of rectangle",
                "expected_blocks": ["function", "parameters", "multiply", "return"],
                "solution": ["function area", "parameters length width", "multiply length width", "return result"],
                "hint": "Define function with parameters and return value"
            }
        }
        return challenges.get(concept, challenges["arrays"])
    
    def _create_advanced_challenge(self, concept: str) -> Dict[str, Any]:
        """Create advanced-level coding challenge"""
        challenges = {
            "algorithms": {
                "title": "Sorting Algorithm",
                "description": "Implement a simple sorting algorithm",
                "instructions": "Sort an array of numbers in ascending order",
                "expected_blocks": ["array", "loop", "compare", "swap", "variable"],
                "solution": ["array numbers", "loop i numbers", "loop j numbers", "if numbers[i] > numbers[j]", "swap numbers[i] numbers[j]"],
                "hint": "Use nested loops for comparison"
            },
            "recursion": {
                "title": "Recursive Function",
                "description": "Solve problem using recursion",
                "instructions": "Calculate factorial of a number using recursion",
                "expected_blocks": ["function", "if", "else", "multiply", "recursive_call"],
                "solution": ["function factorial", "if n == 1", "return 1", "else", "multiply n factorial(n-1)", "return result"],
                "hint": "Base case: factorial(1) = 1, recursive case: n * factorial(n-1)"
            }
        }
        return challenges.get(concept, challenges["algorithms"])
    
    def validate_code(self, code_blocks: List[str]) -> Dict[str, Any]:
        """Validate user's code against challenge solution"""
        if not self.current_challenge:
            return {"success": False, "error": "No active challenge"}
        
        expected_blocks = self.current_challenge["expected_blocks"]
        solution = self.current_challenge["solution"]
        
        # Basic validation: check if required block types are present
        missing_blocks = []
        for block_type in expected_blocks:
            if not any(block_type in block for block in code_blocks):
                missing_blocks.append(block_type)
        
        # Check code structure similarity to solution
        similarity_score = self._calculate_similarity(code_blocks, solution)
        
        # Determine if solution is correct
        is_correct = similarity_score > 0.8 and len(missing_blocks) == 0
        
        return {
            "success": True,
            "correct": is_correct,
            "similarity_score": similarity_score,
            "missing_blocks": missing_blocks,
            "feedback": self._generate_feedback(code_blocks, is_correct, missing_blocks),
            "expected_solution": solution if not is_correct else None
        }
    
    def execute_code(self, code_blocks: List[str]) -> Dict[str, Any]:
        """Execute user's code and return output"""
        if not self.current_challenge:
            return {"success": False, "error": "No active challenge"}
        
        output = []
        variables = {}
        
        try:
            for block in code_blocks:
                result = self._execute_block(block, variables)
                if result:
                    output.append(result)
            
            return {
                "success": True,
                "output": output,
                "final_variables": variables,
                "execution_complete": True
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "output": output,
                "final_variables": variables,
                "execution_complete": False
            }
    
    def _execute_block(self, block: str, variables: Dict) -> str:
        """Execute a single code block"""
        block = block.lower().strip()
        
        if block.startswith("set_var"):
            # Variable assignment: set_var name value
            parts = block.split()
            if len(parts) >= 3:
                var_name = parts[1]
                var_value = ' '.join(parts[2:])
                variables[var_name] = var_value
                return f"Variable {var_name} set to {var_value}"
        
        elif block.startswith("print"):
            # Print statement
            content = block[5:].strip()
            # Replace variables with their values
            for var_name, var_value in variables.items():
                content = content.replace(var_name, str(var_value))
            return f"Output: {content}"
        
        elif block.startswith("loop"):
            # Loop construct
            loop_count = int(block[4:].strip()) if block[4:].strip().isdigit() else 5
            return f"Loop started: will run {loop_count} times"
        
        elif block.startswith("if"):
            # Conditional statement
            condition = block[2:].strip()
            return f"Condition check: {condition}"
        
        elif block == "else":
            return "Else branch"
        
        elif block.startswith("function"):
            func_name = block[8:].strip()
            return f"Function {func_name} defined"
        
        return f"Executed: {block}"
    
    def _calculate_similarity(self, user_blocks: List[str], solution_blocks: List[str]) -> float:
        """Calculate similarity between user code and solution"""
        if not user_blocks or not solution_blocks:
            return 0.0
        
        # Simple similarity: percentage of matching blocks
        matches = 0
        for user_block in user_blocks:
            for solution_block in solution_blocks:
                if self._blocks_similar(user_block, solution_block):
                    matches += 1
                    break
        
        return matches / max(len(user_blocks), len(solution_blocks))
    
    def _blocks_similar(self, block1: str, block2: str) -> bool:
        """Check if two blocks are similar"""
        # Normalize blocks
        b1 = block1.lower().strip()
        b2 = block2.lower().strip()
        
        # Check if they share common keywords
        keywords1 = set(b1.split())
        keywords2 = set(b2.split())
        
        common_keywords = keywords1.intersection(keywords2)
        return len(common_keywords) >= 1  # At least one common keyword
    
    def _generate_feedback(self, code_blocks: List[str], is_correct: bool, missing_blocks: List[str]) -> str:
        """Generate helpful feedback for the user"""
        if is_correct:
            return "Excellent! Your code is correct and well-structured."
        
        feedback_parts = []
        
        if missing_blocks:
            feedback_parts.append(f"Try using: {', '.join(missing_blocks)}")
        
        if len(code_blocks) < 3:
            feedback_parts.append("Your code seems too short. Try adding more blocks.")
        
        if not any('loop' in block for block in code_blocks) and 'loop' in self.current_challenge.get('expected_blocks', []):
            feedback_parts.append("Consider using a loop for repetition.")
        
        if not feedback_parts:
            feedback_parts.append("Check the order of your blocks and try again.")
        
        return " | ".join(feedback_parts)
    
    def get_hint(self) -> Dict[str, Any]:
        """Get a hint for the current challenge"""
        if not self.current_challenge:
            return {"success": False, "error": "No active challenge"}
        
        return {
            "success": True,
            "hint": self.current_challenge.get("hint", "Think about the problem step by step"),
            "next_step": self._suggest_next_step(),
            "concept_explanation": self._explain_concept()
        }
    
    def _suggest_next_step(self) -> str:
        """Suggest the next coding step"""
        concepts = self.current_challenge.get("expected_blocks", [])
        if "loop" in concepts:
            return "Start with a loop block to handle repetition"
        elif "if" in concepts:
            return "Begin with an if block for decision making"
        elif "function" in concepts:
            return "Define a function first with appropriate parameters"
        else:
            return "Start with variable assignments"
    
    def _explain_concept(self) -> str:
        """Explain the programming concept"""
        concept = self.current_challenge.get("title", "").lower()
        
        explanations = {
            "variable": "Variables store data that can be used and modified in your program",
            "loop": "Loops repeat actions multiple times, making code efficient",
            "conditional": "Conditionals help programs make decisions based on conditions",
            "function": "Functions are reusable code blocks that perform specific tasks",
            "array": "Arrays store collections of data that can be processed together"
        }
        
        for key, explanation in explanations.items():
            if key in concept:
                return explanation
        
        return "This challenge helps you practice important programming concepts."