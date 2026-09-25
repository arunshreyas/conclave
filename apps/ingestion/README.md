# PYQ Ingestion Pipeline — Crack

Offline Python ingestion pipeline to extract, parse, classify, embed, and upload Previous Year Question (PYQ) papers into Supabase PostgreSQL + pgvector.

## Features
- **PDF Discovery & Extraction**: Extracts text with page boundaries using PyMuPDF (fitz) with OCR fallback.
- **Question Parsing**: Normalizes question text, options, answers, solutions, and paper metadata.
- **Metadata Classification**: Structured subject/chapter/topic/difficulty tags.
- **Ollama Vector Embeddings**: Generates embeddings locally using `nomic-embed-text`.
- **Supabase pgvector**: Stores structured questions and vector embeddings with candidate pre-filtering.

## Usage
```bash
# Run text extraction (Phase 3)
python -m src.ingest --extract-only

# Run parsing & generate validation report (Phase 4 & 5)
python -m src.ingest --parse-only

# Run full pipeline with dry-run
python -m src.ingest --dry-run
```
