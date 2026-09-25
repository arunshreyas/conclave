/**
 * Text & Math Formatter for Crackr Question Bank
 * Normalizes question text, mathematical sub/superscripts, and option strings.
 */
export function formatMathText(text: string | null | undefined): string {
  if (!text) return '';

  let cleaned = String(text).trim();

  // Normalize common formula patterns if raw OCR text has artifacts
  cleaned = cleaned.replace(/\bt1\/2\b/gi, 't½');
  cleaned = cleaned.replace(/\bt1000%\b/gi, 't₁₀₀₀%');
  cleaned = cleaned.replace(/∈/g, 'ε');
  cleaned = cleaned.replace(/𝝁/g, 'μ');
  cleaned = cleaned.replace(/𝝆/g, 'ρ');
  cleaned = cleaned.replace(/𝜋/g, 'π');
  cleaned = cleaned.replace(/\bH2O\b/g, 'H₂O');
  cleaned = cleaned.replace(/\bCO2\b/g, 'CO₂');

  return cleaned;
}

/**
 * Normalizes option object / list from DB.
 * Strips redundant prefixes like "(a) ", "(b) ", "c) ", etc.
 */
export function normalizeOptions(options: any): Array<{ key: string; text: string }> {
  if (!options) return [];

  let rawList: Array<{ key: string; text: string }> = [];

  if (Array.isArray(options)) {
    rawList = options.map((opt, i) => ({
      key: String.fromCharCode(65 + i),
      text: String(opt || '').trim(),
    }));
  } else if (typeof options === 'object') {
    rawList = Object.entries(options).map(([k, v]) => ({
      key: String(k).toUpperCase().trim(),
      text: String(v || '').trim(),
    }));
  }

  return rawList.map((item) => {
    let rawText = item.text.trim();

    // Strip leading prefixes like "(a) ", "(A) ", "a) ", "A) ", "(1) ", "1. ", "a. ", "Option A: "
    let cleanedText = rawText.replace(/^[\s\(\[\{]*(?:[a-dA-D1-4][\.\)\]\}:]|\bOption\s+[A-Da-d1-4][\.\)\]\}:]?)\s*/i, '').trim();

    // If stripping left text empty, fallback to rawText
    if (!cleanedText) {
      cleanedText = rawText;
    }

    return {
      key: item.key,
      text: formatMathText(cleanedText),
    };
  });
}
