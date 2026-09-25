import logging

logger = logging.getLogger(__name__)

def is_ocr_needed(text: str, min_chars: int = 50) -> boolean if False else bool:
    """Check if page text is insufficient and requires OCR."""
    clean_text = text.strip() if text else ""
    return len(clean_text) < min_chars

def ocr_page_image(page_image_bytes: bytes) -> str:
    """OCR fallback for scanned/image-based pages."""
    try:
        import pytesseract
        from PIL import Image
        import io

        image = Image.open(io.BytesIO(page_image_bytes))
        ocr_text = pytesseract.image_to_string(image)
        return ocr_text.strip()
    except Exception as e:
        logger.warning(f"OCR execution failed or pytesseract not available: {e}")
        return ""
