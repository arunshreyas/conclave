import json
import logging
import requests
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"

# Syllabus reference dictionary for deterministic rule-based keyword classification fallback
SUBJECT_KEYWORDS = {
    "Physics": [
        "velocity", "acceleration", "force", "mass", "friction", "work", "energy", "power",
        "momentum", "torque", "rotation", "gravitation", "fluid", "viscosity", "heat",
        "thermodynamics", "oscillation", "wave", "electric field", "potential", "capacitor",
        "current", "resistor", "magnetic", "induction", "optics", "refraction", "photoelectric",
        "nucleus", "semiconductor", "diode", "logic gate"
    ],
    "Chemistry": [
        "mole", "atom", "orbital", "thermodynamics", "equilibrium", "ph", "buffer", "redox",
        "electrochemistry", "kinetics", "surface", "metallurgy", "coordination", "isomer",
        "alkane", "alkene", "benzene", "alcohol", "aldehyde", "ketone", "carboxylic", "amine",
        "polymer", "biomolecule", "periodic table"
    ],
    "Mathematics": [
        "matrix", "determinant", "probability", "vector", "3d geometry", "limit", "derivative",
        "integral", "differential equation", "area", "tangent", "normal", "parabola", "ellipse",
        "hyperbola", "circle", "triangle", "complex number", "quadratic", "sequence", "series",
        "permutation", "combination", "binomial"
    ]
}

def classify_question_heuristic(question_text: str, current_subject: str = None) -> Dict[str, Any]:
    """Fallback rule-based subject, chapter, topic and difficulty classifier."""
    text_lower = question_text.lower()
    
    # 1. Determine Subject
    subject = current_subject
    if not subject:
        scores = {}
        for sub, keywords in SUBJECT_KEYWORDS.items():
            scores[sub] = sum(1 for kw in keywords if kw in text_lower)
        best_sub = max(scores, key=scores.get)
        subject = best_sub if scores[best_sub] > 0 else "Physics"

    # 2. Determine Chapter & Topics
    chapter = "General Concepts"
    topics = []
    
    if subject == "Physics":
        if any(w in text_lower for w in ["work", "energy", "power", "kinetic", "potential"]):
            chapter = "Work, Power & Energy"
            topics = ["Work-energy theorem", "Conservation of energy"]
        elif any(w in text_lower for w in ["force", "friction", "newton", "mass", "tension"]):
            chapter = "Laws of Motion"
            topics = ["Newton's laws", "Friction"]
        elif any(w in text_lower for w in ["magnetic", "field", "induction", "flux", "solenoid"]):
            chapter = "Magnetic Effects & Induction"
            topics = ["Magnetic field", "Electromagnetic induction"]
        elif any(w in text_lower for w in ["resistor", "current", "voltage", "ohm", "circuit"]):
            chapter = "Current Electricity"
            topics = ["Ohm's law", "Kirchhoff's rules"]
        elif any(w in text_lower for w in ["lens", "mirror", "optics", "refraction", "ray"]):
            chapter = "Ray Optics"
            topics = ["Refraction", "Lenses"]
        else:
            chapter = "Mechanics & General Physics"
            topics = ["Kinematics & Dynamics"]
    elif subject == "Chemistry":
        if any(w in text_lower for w in ["organic", "benzene", "reaction", "alcohol", "acid"]):
            chapter = "Organic Chemistry"
            topics = ["Reaction mechanism", "Functional groups"]
        elif any(w in text_lower for w in ["equilibrium", "ph", "buffer", "kp", "kc"]):
            chapter = "Chemical Equilibrium"
            topics = ["Ionic equilibrium", "Equilibrium constant"]
        elif any(w in text_lower for w in ["orbital", "electron", "quantum", "spin"]):
            chapter = "Atomic Structure"
            topics = ["Quantum numbers", "Electronic configuration"]
        else:
            chapter = "General Chemistry"
            topics = ["Stoichiometry & Concepts"]
    else: # Mathematics
        if any(w in text_lower for w in ["integral", "integration", "area", "derivative", "limit"]):
            chapter = "Calculus"
            topics = ["Definite integration", "Differentiation"]
        elif any(w in text_lower for w in ["matrix", "determinant"]):
            chapter = "Matrices & Determinants"
            topics = ["Matrix properties", "System of linear equations"]
        elif any(w in text_lower for w in ["vector", "3d", "plane", "line"]):
            chapter = "Vector & 3D Geometry"
            topics = ["Vector product", "Lines in 3D"]
        elif any(w in text_lower for w in ["probability", "dice", "cards", "event"]):
            chapter = "Probability"
            topics = ["Conditional probability", "Bayes theorem"]
        else:
            chapter = "Algebra & Geometry"
            topics = ["General Algebra"]

    # 3. Determine Difficulty
    length = len(question_text)
    if length > 300 or "find the ratio" in text_lower or "statement" in text_lower:
        difficulty = "hard"
    elif length > 150:
        difficulty = "medium"
    else:
        difficulty = "easy"

    return {
        "subject": subject,
        "chapter": chapter,
        "topics": topics,
        "difficulty": difficulty,
        "confidence": "high" if current_subject else "medium"
    }

def classify_question_with_ollama(question_text: str, current_subject: str = None) -> Dict[str, Any]:
    """Classify question metadata using local Ollama model if available."""
    prompt = f"""
Classify the following IIT JEE question into structured metadata.
Return strictly valid JSON with no markdown tags or explanations.

JSON Format:
{{
  "subject": "Physics" | "Chemistry" | "Mathematics",
  "chapter": "Chapter Name",
  "topics": ["topic1", "topic2"],
  "difficulty": "easy" | "medium" | "hard",
  "confidence": "high" | "medium" | "low"
}}

Question text:
{question_text[:1000]}
"""
    try:
        res = requests.post(
            OLLAMA_URL,
            json={"model": "mistral", "prompt": prompt, "stream": False},
            timeout=10
        )
        if res.status_code == 200:
            raw_response = res.json().get("response", "").strip()
            # Extract JSON from response
            match = re.search(r'\{.*\}', raw_response, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                if data.get("subject") and data.get("chapter"):
                    return data
    except Exception as e:
        logger.debug(f"Ollama classification fallback triggered: {e}")

    return classify_question_heuristic(question_text, current_subject)

def classify_question(question_obj: Dict[str, Any]) -> Dict[str, Any]:
    """Enrich question object with classification metadata."""
    q_text = question_obj.get("question", "")
    sub = question_obj.get("subject")
    
    meta = classify_question_heuristic(q_text, sub)
    
    question_obj["subject"] = meta.get("subject", sub or "Physics")
    question_obj["chapter"] = meta.get("chapter", "General Concepts")
    question_obj["topics"] = meta.get("topics", [])
    question_obj["difficulty"] = meta.get("difficulty", "medium")
    question_obj["confidence"] = meta.get("confidence", "high")
    
    return question_obj
