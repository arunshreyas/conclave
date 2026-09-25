import os
import re
import pymupdf as fitz
from pathlib import Path
from typing import Dict, List, Any
from .ocr import is_ocr_needed, ocr_page_image

def sanitize_filename(name: str) -> str:
    """Convert PDF filename to a clean slug for raw/parsed files."""
    slug = re.sub(r'[^\w\s-]', '', name).strip().lower()
    slug = re.sub(r'[-\s]+', '_', slug)
    return slug

def discover_pdfs(papers_dir: Path) -> List[Path]:
    """Discover all PDF files in the papers directory recursively."""
    if not papers_dir.exists():
        return []
    return list(papers_dir.glob("**/*.pdf"))

def extract_pdf(pdf_path: Path, output_raw_dir: Path) -> Dict[str, Any]:
    """Extract text from a single PDF page by page."""
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    extracted_pages = []
    ocr_used = False
    ocr_page_count = 0
    total_text_length = 0
    issues = []

    paper_slug = sanitize_filename(pdf_path.stem)
    output_raw_dir.mkdir(parents=True, exist_ok=True)
    raw_output_file = output_raw_dir / f"{paper_slug}.txt"

    full_text_lines = [
        f"SOURCE_FILE: {pdf_path.name}",
        f"TOTAL_PAGES: {total_pages}",
        "=" * 60,
        ""
    ]

    for page_num in range(total_pages):
        page = doc[page_num]
        page_text = page.get_text("text") or ""
        
        # Check if page text is insufficient and requires OCR fallback
        if is_ocr_needed(page_text):
            pix = page.get_pixmap(dpi=150)
            image_bytes = pix.tobytes("png")
            ocr_text = ocr_page_image(image_bytes)
            if ocr_text:
                page_text = ocr_text
                ocr_used = True
                ocr_page_count += 1
            else:
                issues.append(f"Page {page_num + 1}: Low text density and OCR failed or unavailable")

        page_len = len(page_text.strip())
        total_text_length += page_len

        full_text_lines.append(f"--- PAGE {page_num + 1} ---")
        full_text_lines.append(page_text.strip())
        full_text_lines.append("")

        extracted_pages.append({
            "page_num": page_num + 1,
            "text": page_text,
            "char_count": page_len
        })

    doc.close()

    raw_output_text = "\n".join(full_text_lines)
    with open(raw_output_file, "w", encoding="utf-8") as f:
        f.write(raw_output_text)

    return {
        "source_file": pdf_path.name,
        "full_path": str(pdf_path),
        "slug": paper_slug,
        "total_pages": total_pages,
        "total_text_length": total_text_length,
        "ocr_required": ocr_used,
        "ocr_page_count": ocr_page_count,
        "raw_file": str(raw_output_file),
        "issues": issues
    }

def extract_all_papers(papers_dir: Path, output_raw_dir: Path) -> List[Dict[str, Any]]:
    """Discover and extract text for all PDFs in papers directory."""
    pdf_files = discover_pdfs(papers_dir)
    results = []
    for pdf in pdf_files:
        res = extract_pdf(pdf, output_raw_dir)
        results.append(res)
    return results
