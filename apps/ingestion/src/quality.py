import re
import json
from typing import Dict, Any, Tuple, List, Optional

def normalize_question(text: Optional[str]) -> str:
    """Normalize question text for exact and near-duplicate matching."""
    if not text:
        return ""
    cleaned = text.lower()
    cleaned = re.sub(r'--- page \d+ ---', '', cleaned)
    cleaned = re.sub(r'[^a-z0-9\s]', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def detect_question_type(q: Dict[str, Any]) -> str:
    """Identify precise question_type based on prompt text, options format, and answer structure."""
    text = (q.get("question") or "").strip()
    text_lower = text.lower()
    options = q.get("options")
    answer = (str(q.get("answer") or "")).strip()

    # 1. Assertion / Reason
    if "assertion" in text_lower or "statement-1" in text_lower or "statement 1" in text_lower:
        return "assertion_reason"

    # 2. Match the Following
    if "match list" in text_lower or "column-i" in text_lower or "list-i" in text_lower or "match the following" in text_lower:
        return "match_the_following"

    # Convert options to list if dict
    opt_list = []
    if isinstance(options, list):
        opt_list = options
    elif isinstance(options, dict):
        opt_list = list(options.values())

    # 3. Numerical / Integer Numerical
    if not opt_list or len(opt_list) < 2:
        # Check if answer is numerical
        clean_ans = answer.replace(',', '').strip()
        if re.match(r'^-?\d+(?:\.\d+)?$', clean_ans):
            if '.' in clean_ans and not clean_ans.endswith('.0'):
                return "numerical"
            return "integer_numerical"
        return "unknown"

    # 4. Multiple Correct MCQ
    if ("," in answer or " and " in answer or " & " in answer) and len(answer) <= 10:
        parts = [p.strip().upper() for p in re.split(r'[,&]|\band\b', answer) if p.strip()]
        if len(parts) > 1 and all(len(p) == 1 and p in 'ABCD' for p in parts):
            return "multiple_correct_mcq"

    # 5. Single Correct MCQ
    if len(opt_list) >= 2:
        return "single_correct_mcq"

    return "unknown"

def is_numerical_value(val: str) -> bool:
    """Check if string value is parseable as float."""
    if not val:
        return False
    try:
        float(val.replace(',', '').strip())
        return True
    except ValueError:
        return False

def evaluate_question_quality(q: Dict[str, Any]) -> Tuple[bool, str, List[str]]:
    """
    Evaluates question quality and usability.
    Returns: (is_usable: bool, quality: str, failure_reasons: List[str])
    """
    reasons = []
    text = (q.get("question") or "").strip()
    options = q.get("options")
    answer = (str(q.get("answer") or "")).strip()
    q_type = q.get("question_type") or detect_question_type(q)
    image_url = q.get("image_url") or q.get("image_path")

    # Rule 1: Text completeness & corruption
    if not text or len(text) < 10:
        reasons.append("Question statement is missing or too short (<10 chars)")

    if re.search(r'(?:--- PAGE \d+ ---|Page \d+ of \d+|Extraction Error)', text, re.IGNORECASE):
        reasons.append("Question text contains raw PDF extraction garbage")

    # Rule 2: Image dependency validation
    if re.search(r'\b(?:refer to (?:the )?figure|in the given (?:figure|diagram)|as shown in (?:the )?figure)\b', text, re.IGNORECASE):
        if not image_url:
            reasons.append("Question references a figure/diagram but image_url is missing")

    # Normalize options
    opt_list = []
    if isinstance(options, list):
        opt_list = options
    elif isinstance(options, dict):
        opt_list = list(options.values())

    # Rule 3: Type-specific requirements
    if q_type in ["single_correct_mcq", "multiple_correct_mcq", "assertion_reason"]:
        if not opt_list or len(opt_list) < 2:
            reasons.append(f"{q_type} requires at least 2 options")
        if not answer:
            reasons.append(f"{q_type} requires a valid answer key")
        elif len(answer) <= 3 and answer.upper() not in ["A", "B", "C", "D", "OPTION A", "OPTION B", "OPTION C", "OPTION D", "(A)", "(B)", "(C)", "(D)"]:
            # Check if answer key matches option prefix
            clean_ans_key = answer.replace(/[()]/g, '').strip().upper()
            if clean_ans_key not in ["A", "B", "C", "D"]:
                reasons.append(f"MCQ answer key '{answer}' is malformed or unrepresented")

    elif q_type in ["numerical", "integer_numerical"]:
        if not answer or not is_numerical_value(answer):
            reasons.append("Numerical question missing valid numeric answer")

    elif q_type == "unknown":
        reasons.append("Question structure could not be mapped to a known question_type")

    # Calculate usability and quality tier
    is_usable = (len(reasons) == 0)

    if not is_usable:
        quality = "low"
    else:
        # Evaluate high vs medium quality
        if len(text) > 40 and q.get("solution") and (opt_list and len(opt_list) == 4 or q_type in ["numerical", "integer_numerical"]):
            quality = "high"
        else:
            quality = "medium"

    return is_usable, quality, reasons

def process_question_pipeline(q: Dict[str, Any]) -> Dict[str, Any]:
    """Applies full classification, quality scoring, and normalization to a question object."""
    q["normalized_question"] = normalize_question(q.get("question"))
    q["question_type"] = detect_question_type(q)
    is_usable, quality, reasons = evaluate_question_quality(q)
    
    q["is_usable"] = is_usable
    q["question_quality"] = quality
    q["quality_reasons"] = reasons
    
    return q
