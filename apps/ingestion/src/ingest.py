import os
import sys
import json
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Any

from .extract import discover_pdfs, extract_pdf
from .parse import parse_paper
from .classify import classify_question
from .embed import test_embedding_dimension, embed_question
from .upload import init_supabase_pgvector, upload_questions_to_supabase

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ingest")

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent.parent
PAPERS_DIR = BASE_DIR / "papers"
OUTPUT_DIR = BASE_DIR / "output"
RAW_DIR = OUTPUT_DIR / "raw"
PARSED_DIR = OUTPUT_DIR / "parsed"
FAILED_DIR = OUTPUT_DIR / "failed"

def run_extraction_phase() -> List[Dict[str, Any]]:
    """Phase 3: PDF Discovery and Text Extraction."""
    logger.info("=== PHASE 3: DISCOVERING & EXTRACTING PDF PAPERS ===")
    pdf_files = discover_pdfs(PAPERS_DIR)
    
    if not pdf_files:
        logger.error(f"No PDF files found inside {PAPERS_DIR}")
        sys.exit(1)

    extraction_results = []
    print("\n" + "=" * 70)
    print(f"FOUND {len(pdf_files)} PDF PAPER(S) FOR INGESTION:")
    print("=" * 70)

    for pdf in pdf_files:
        res = extract_pdf(pdf, RAW_DIR)
        extraction_results.append(res)
        print(f"[PDF] File: {pdf.name}")
        print(f"   Path: {pdf.relative_to(BASE_DIR)}")
        print(f"   Total Pages: {res['total_pages']}")
        print(f"   Extracted Text Length: {res['total_text_length']} chars")
        print(f"   OCR Required: {'YES (' + str(res['ocr_page_count']) + ' pages)' if res['ocr_required'] else 'NO (Machine readable text)'}")
        if res['issues']:
            print(f"   [WARN] Issues: {', '.join(res['issues'])}")
        print(f"   Raw Output Saved: {res['raw_file']}")
        print("-" * 70)

    return extraction_results

def run_parsing_phase(extraction_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Phase 4 & 5: Question Parsing & Validation Report."""
    logger.info("=== PHASE 4 & 5: QUESTION PARSING & VALIDATION CHECKPOINT ===")
    parsed_results = []
    FAILED_DIR.mkdir(parents=True, exist_ok=True)

    total_questions_parsed = 0
    failed_parsing_count = 0

    print("\n" + "=" * 70)
    print("PARSING CHECKPOINT & VALIDATION REPORT:")
    print("=" * 70)

    for res in extraction_results:
        slug = res["slug"]
        raw_file = RAW_DIR / f"{slug}.txt"
        parse_res = parse_paper(raw_file, res["source_file"], PARSED_DIR)
        parsed_results.append(parse_res)

        q_count = parse_res["total_questions"]
        total_questions_parsed += q_count
        print(f"[PAPER] Source: {res['source_file']}")
        print(f"   Questions Detected: {q_count}")
        print(f"   Parsed File: {parse_res['parsed_file']}")

        # Validate suspicious items or missing options
        suspicious = [q for q in parse_res["questions"] if not q["options"] or len(q["question"]) < 10]
        if suspicious:
            print(f"   [WARN] Questions with unusual formatting/missing options: {len(suspicious)}")
            failed_file = FAILED_DIR / f"{slug}_failed.json"
            with open(failed_file, "w", encoding="utf-8") as ff:
                json.dump(suspicious, ff, indent=2)
            print(f"   Saved failed/suspicious records to: {failed_file}")
            failed_parsing_count += len(suspicious)
        else:
            print(f"   [OK] All questions passed basic structural validation.")
        print("-" * 70)

    # Print first 5 parsed questions from each paper for human comparison
    print("\n" + "=" * 70)
    print("SAMPLE PARSED QUESTIONS (FIRST 5 PER PAPER FOR HUMAN VALIDATION):")
    print("=" * 70)

    for p in parsed_results:
        print(f"\n--- PAPER: {p['source_file']} ---")
        sample_qs = p["questions"][:5]
        for idx, q in enumerate(sample_qs, 1):
            print(f"\n[{idx}] Question #{q['question_number']} (Page {q['source_page']}) | Subject: {q['subject'] or 'N/A'}")
            print(f"    Text: {q['question'][:120]}...")
            print(f"    Options Count: {len(q['options'])}")
            print(f"    Answer: {q['answer'] or 'null'} | Solution: {'Available' if q['solution'] else 'null'}")

    return parsed_results

def run_classification_phase(parsed_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Phase 6: Metadata Classification."""
    logger.info("=== PHASE 6: METADATA & SYLLABUS CLASSIFICATION ===")
    for p in parsed_results:
        for q in p["questions"]:
            classify_question(q)
    logger.info("Classification completed for all parsed questions.")
    return parsed_results

def run_embedding_phase(parsed_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Phase 7: Vector Embedding Generation via Ollama."""
    logger.info("=== PHASE 7: OLLAMA VECTOR EMBEDDING ===")
    dim = test_embedding_dimension()
    print(f"\n[OK] Ollama 'nomic-embed-text' Vector Dimension Measured: {dim}")

    total_embedded = 0
    for p in parsed_results:
        for q in p["questions"]:
            embed_question(q)
            total_embedded += 1

    logger.info(f"Generated embeddings for {total_embedded} questions.")
    return parsed_results

def main():
    parser = argparse.ArgumentParser(description="PYQ Ingestion Pipeline for Crack")
    parser.add_argument("--extract-only", action="store_true", help="Stop after Phase 3 extraction")
    parser.add_argument("--parse-only", action="store_true", help="Stop after Phase 5 validation report")
    parser.add_argument("--dry-run", action="store_true", help="Run extraction, parsing, classification & embedding test, but do not upload to Supabase")
    parser.add_argument("--upload", action="store_true", help="Run full pipeline and upload to Supabase pgvector")

    args = parser.parse_args()

    # Step 1: Extraction
    extraction_results = run_extraction_phase()
    if args.extract_only:
        print("\n[STOP] STOPPED AT PHASE 3 EXTRACTION CHECKPOINT (as requested with --extract-only)")
        return

    # Step 2: Parsing & Validation
    parsed_results = run_parsing_phase(extraction_results)
    if args.parse_only:
        print("\n[STOP] STOPPED AT PHASE 5 HUMAN VALIDATION CHECKPOINT (as requested with --parse-only)")
        return

    # Step 3: Classification
    parsed_results = run_classification_phase(parsed_results)

    # Step 4: Embedding Test & Generation
    dim = test_embedding_dimension()
    
    if args.dry_run or not args.upload:
        # Run embeddings on dry-run
        parsed_results = run_embedding_phase(parsed_results)

        total_qs = sum(p["total_questions"] for p in parsed_results)
        print("\n" + "=" * 70)
        print("FINAL DRY-RUN SUMMARY REPORT:")
        print("=" * 70)
        print(f"Total PDFs Discovered:        {len(extraction_results)}")
        print(f"Total Pages Processed:        {sum(r['total_pages'] for r in extraction_results)}")
        print(f"Total Raw Text Extracted:     {sum(r['total_text_length'] for r in extraction_results)} chars")
        print(f"Total Questions Parsed:       {total_qs}")
        print(f"Successfully Classified:      {total_qs}")
        print(f"Successfully Embedded:        {total_qs}")
        print(f"Ollama Embedding Dimension:   {dim}")
        print(f"Supabase Vector Upload Status: DRY-RUN (Skipped upload to database)")
        print("=" * 70)
        print("\n[STOP] STOPPED AT DRY-RUN CHECKPOINT BEFORE SUPABASE UPLOAD.")
        print("To push these questions to Supabase, run: python -m src.ingest --upload")
        return

    # Step 5: Full Upload to Supabase
    parsed_results = run_embedding_phase(parsed_results)
    logger.info("Initializing Supabase pgvector schema...")
    init_supabase_pgvector(dim)

    all_questions = [q for p in parsed_results for q in p["questions"]]
    logger.info(f"Uploading {len(all_questions)} questions to Supabase PostgreSQL pgvector...")
    upload_stats = upload_questions_to_supabase(all_questions)

    print("\n" + "=" * 70)
    print("FINAL INGESTION SUMMARY REPORT (SUPABASE UPLOAD COMPLETE):")
    print("=" * 70)
    print(f"Total PDFs Processed:       {len(extraction_results)}")
    print(f"Total Pages Extracted:       {sum(r['total_pages'] for r in extraction_results)}")
    print(f"Total Questions Parsed:      {len(all_questions)}")
    print(f"Successfully Uploaded:       {upload_stats['uploaded']}")
    print(f"Skipped (Duplicates):        {upload_stats['skipped']}")
    print(f"Failed Inserts:             {upload_stats['failed']}")
    print("=" * 70)

if __name__ == "__main__":
    main()
