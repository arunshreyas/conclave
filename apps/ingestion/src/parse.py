import re
import json
from pathlib import Path
from typing import Dict, List, Any, Optional

def parse_paper_metadata(filename: str, header_text: str) -> Dict[str, Any]:
    """Extract metadata (exam, year, shift, session) from filename and text header."""
    meta = {
        "exam": "JEE Main",
        "year": 2026,
        "session": "April",
        "shift": None
    }
    
    # Year detection
    year_match = re.search(r'202[4-6]', filename) or re.search(r'202[4-6]', header_text)
    if year_match:
        meta["year"] = int(year_match.group(0))

    # Shift detection
    filename_lower = filename.lower()
    header_lower = header_text.lower()

    if "shift 1" in filename_lower or "shift-1" in filename_lower or "morning shift" in header_lower:
        meta["shift"] = "Shift 1"
    elif "shift 2" in filename_lower or "shift-2" in filename_lower or "evening shift" in header_lower:
        meta["shift"] = "Shift 2"

    # Exam detection
    if "jee main" in filename_lower or "jee main" in header_lower:
        meta["exam"] = "JEE Main"
    elif "jee adv" in filename_lower or "jee adv" in header_lower:
        meta["exam"] = "JEE Advanced"

    return meta

def parse_raw_text_to_questions(raw_file_path: Path, source_filename: str) -> List[Dict[str, Any]]:
    """Parse raw text file into structured question objects."""
    with open(raw_file_path, "r", encoding="utf-8") as f:
        content = f.read()

    meta = parse_paper_metadata(source_filename, content[:1000])

    # Strip raw file header
    header_delimiter = "============================================================"
    body_text = content[content.find(header_delimiter) + len(header_delimiter):] if header_delimiter in content else content

    # Split by Question: keyword or Q.1 / Q1 / Q. 1
    q_blocks = re.split(r'(?:\n|\A)(?:Question\s*:\s*|\bQ(?:uestion)?[\.\s]*\d+[\.\:\)]|\bQ\d+[\.\:\)])', body_text, flags=re.IGNORECASE)

    questions: List[Dict[str, Any]] = []
    current_subject: Optional[str] = None
    q_counter = 1

    for block in q_blocks[1:]:
        block = block.strip()
        if not block:
            continue

        # Split into Question Text and Options/Answer
        opt_split = re.split(r'\n\s*Options\s*:\s*', block, flags=re.IGNORECASE)
        q_text = opt_split[0].strip()

        # Clean page markers from question text
        q_text = re.sub(r'--- PAGE \d+ ---', '', q_text).strip()
        q_text = re.sub(r'​', '', q_text).strip()

        options: List[str] = []
        answer: Optional[str] = None
        solution: Optional[str] = None

        if len(opt_split) > 1:
            rest = opt_split[1]
            
            # Extract Answer: ...
            ans_split = re.split(r'\n\s*Answer\s*[:\.]?\s*', rest, flags=re.IGNORECASE)
            options_text = ans_split[0].strip()

            if len(ans_split) > 1:
                after_ans = ans_split[1]
                sol_split = re.split(r'\n\s*Solution\s*[:\.]?\s*', after_ans, flags=re.IGNORECASE)
                answer = sol_split[0].strip()
                if len(sol_split) > 1:
                    solution = sol_split[1].strip()

            # Parse (a), (b), (c), (d) options from options_text
            opt_matches = re.findall(r'\(([a-dA-D1-4])\)\s*([^\n\(]+(?:\n(?!\([a-dA-D1-4]\))[^\n\(]+)*)', options_text)
            if opt_matches:
                options = [f"({m[0].lower()}) {m[1].strip()}" for m in opt_matches]
            else:
                # Fallback line-by-line options
                opt_lines = [l.strip() for l in options_text.splitlines() if l.strip() and not l.startswith("--- PAGE")]
                options = opt_lines[:4]

        # Subject detection per question
        q_upper = q_text.upper()

        chem_keywords = [
            "CHEMISTRY", "MOLE", "REACTION", "ORGANIC", "INORGANIC", "ACID", "BASE", "PH ", "BENZENE", "EQUILIBRIUM",
            "ATOM", "ORBITAL", "ELEMENT", "COMPOUND", "SOLUTE", "SOLVENT", "SOLUTION", "BOND", "OXIDATION", "REDUCTION",
            "HYBRIDIZATION", "ISOMER", "ALCOHOL", "PHENOL", "ETHER", "ALDEHYDE", "KETONE", "CARBOXYLIC", "AMINE", "POLYMER",
            "BIOMOLECULE", "THERMODYNAMICS", "ENTHALPY", "ENTROPY", "ELECTROCHEMISTRY", "KINETICS", "CATALYST", "TITRATION",
            "CH3", "COOH", "NH2", "NO2", "H2SO4", "HNO3", "NAOH", "MOLAR", "MOLARITY", "MOLALITY"
        ]
        phys_keywords = [
            "PHYSICS", "FORCE", "VELOCITY", "ACCELERATION", "MASS", "MOMENTUM", "WAVE", "ELECTRIC", "MAGNETIC", "OPTICS",
            "DENSITY", "GRAVITATIONAL", "GRAVITY", "TORQUE", "FRICTION", "CAPACITOR", "RESISTOR", "INDUCTOR", "CURRENT",
            "VOLTAGE", "POTENTIAL", "CIRCUIT", "REFRACTION", "REFLECTION", "LENS", "MIRROR", "FREQUENCY", "WAVELENGTH",
            "WORK", "ENERGY", "POWER", "KINETIC", "ROTATIONAL", "RIGID BODY", "FLUID", "PRESSURE", "VISCOSITY",
            "THERMAL", "HEAT", "CONDUCTION", "RADIATION", "FIELD", "FLUX", "INDUCTION", "DIPOLE", "CHARGE"
        ]
        math_keywords = [
            "MATHEMATICS", "MATH", "MATRIX", "DETERMINANT", "INTEGRAL", "INTEGRATION", "DERIVATIVE", "DIFFERENTIAL",
            "PROBABILITY", "VECTOR", "EQUATION", "PARABOLA", "HYPERBOLA", "ELLIPSE", "CIRCLE", "LIMIT", "CONTINUITY",
            "FUNCTION", "DOMAIN", "RANGE", "PERMUTATION", "COMBINATION", "SEQUENCE", "SERIES", "COMPLEX NUMBER",
            "QUADRATIC", "POLYNOMIAL", "TRIGONOMETRY", "SINE", "COSINE", "TANGENT", "LOGARITHM", "STATISTICS"
        ]

        # Calculate keyword match scores
        chem_score = sum(1 for w in chem_keywords if w in q_upper)
        phys_score = sum(1 for w in phys_keywords if w in q_upper)
        math_score = sum(1 for w in math_keywords if w in q_upper)

        if chem_score > phys_score and chem_score > math_score:
            subj = "Chemistry"
        elif math_score > phys_score and math_score > chem_score:
            subj = "Mathematics"
        elif phys_score > chem_score and phys_score > math_score:
            subj = "Physics"
        else:
            subj = current_subject or "Physics"

        current_subject = subj

        # Estimate page number from location in raw text
        page_num = 1
        pos = content.find(q_text[:30]) if len(q_text) >= 30 else -1
        if pos != -1:
            preceding = content[:pos]
            page_matches = re.findall(r'--- PAGE (\d+) ---', preceding)
            if page_matches:
                page_num = int(page_matches[-1])

        if len(q_text) > 10:
            questions.append({
                "question": q_text,
                "options": options,
                "answer": answer,
                "solution": solution,
                "exam": meta["exam"],
                "year": meta["year"],
                "session": meta["session"],
                "shift": meta["shift"],
                "subject": subj,
                "chapter": None,
                "topics": [],
                "source_file": source_filename,
                "source_page": page_num,
                "question_number": q_counter
            })
            q_counter += 1

    return questions

def parse_paper(raw_file_path: Path, source_filename: str, output_parsed_dir: Path) -> Dict[str, Any]:
    """Parse a single raw paper into structured JSON."""
    slug = raw_file_path.stem
    questions = parse_raw_text_to_questions(raw_file_path, source_filename)
    
    output_parsed_dir.mkdir(parents=True, exist_ok=True)
    output_json_path = output_parsed_dir / f"{slug}.json"
    
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)

    return {
        "slug": slug,
        "source_file": source_filename,
        "parsed_file": str(output_json_path),
        "total_questions": len(questions),
        "questions": questions
    }
