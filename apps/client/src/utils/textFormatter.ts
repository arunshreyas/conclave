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
 * If option text is literally just "(a)", "(b)", etc., formats it as "Option (A)", "Option (B)", etc.
 */
export function normalizeOptions(options: any): Array<{ key: string; text: string }> {
  if (!options) return [];

  let rawList: Array<{ key: string; text: string }> = [];

  if (Array.isArray(options)) {
    rawList = options.map((opt, i) => ({
      key: String.fromCharCode(65 + i),
      text: String(opt).trim(),
    }));
  } else if (typeof options === 'object') {
    rawList = Object.entries(options).map(([k, v]) => ({
      key: k.toUpperCase().trim(),
      text: String(v).trim(),
    }));
  }

  return rawList.map((item) => {
    const cleanText = item.text.replace(/[()]/g, '').trim().toUpperCase();
    const cleanKey = item.key.replace(/[()]/g, '').trim().toUpperCase();

    // If the option text is redundant e.g. Key "A", Text "(a)" or "A"
    if (cleanText === cleanKey || cleanText === `OPTION ${cleanKey}` || cleanText === `(${cleanKey.toLowerCase()})` || cleanText === cleanKey.toLowerCase()) {
      return {
        key: item.key,
        text: `Option (${item.key})`,
      };
    }

    return {
      key: item.key,
      text: formatMathText(item.text),
    };
  });
}
