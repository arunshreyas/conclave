import requests
import logging
import time
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"
MODEL_NAME = "nomic-embed-text"

def generate_single_embedding(text: str, retries: int = 3, delay: float = 1.0) -> List[float]:
    """Generate vector embedding for text using local Ollama model."""
    payload = {
        "model": MODEL_NAME,
        "prompt": text
    }

    for attempt in range(retries):
        try:
            res = requests.post(OLLAMA_EMBED_URL, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                embedding = data.get("embedding")
                if embedding and isinstance(embedding, list):
                    return embedding
            logger.warning(f"Ollama embedding HTTP status {res.status_code}, attempt {attempt + 1}")
        except Exception as e:
            logger.warning(f"Ollama embedding request failed (attempt {attempt + 1}/{retries}): {e}")
        
        if attempt < retries - 1:
            time.sleep(delay)

    raise RuntimeError(f"Failed to generate embedding with Ollama model '{MODEL_NAME}' after {retries} attempts.")

def test_embedding_dimension() -> int:
    """Test single embedding generation and return vector length."""
    test_text = "Subject: Physics\nChapter: Kinematics\nQuestion: Find the velocity of a projectile."
    emb = generate_single_embedding(test_text)
    dim = len(emb)
    logger.info(f"Ollama model '{MODEL_NAME}' test embedding dimension: {dim}")
    return dim

def build_embedding_input(question_obj: Dict[str, Any]) -> str:
    """Construct semantic embedding input string combining metadata, question, options, and solution."""
    parts = []
    
    subject = question_obj.get("subject", "General")
    chapter = question_obj.get("chapter", "General")
    topics = ", ".join(question_obj.get("topics", []))
    
    parts.append(f"Subject: {subject}")
    parts.append(f"Chapter: {chapter}")
    if topics:
        parts.append(f"Topics: {topics}")
        
    parts.append("\nQuestion:")
    parts.append(question_obj.get("question", "").strip())
    
    options = question_obj.get("options")
    if options and isinstance(options, list) and len(options) > 0:
        parts.append("\nOptions:")
        for idx, opt in enumerate(options, 1):
            parts.append(f"({idx}) {opt}")
            
    solution = question_obj.get("solution")
    if solution:
        parts.append("\nSolution:")
        parts.append(solution.strip())
        
    return "\n".join(parts)

def embed_question(question_obj: Dict[str, Any]) -> Dict[str, Any]:
    """Generate embedding for question object if not already present."""
    if question_obj.get("embedding") and isinstance(question_obj["embedding"], list):
        return question_obj

    input_text = build_embedding_input(question_obj)
    embedding = generate_single_embedding(input_text)
    question_obj["embedding"] = embedding
    return question_obj
