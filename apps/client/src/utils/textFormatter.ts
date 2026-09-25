/**
 * Text & Math Formatter for Crackr Question Bank
 * Normalizes question text, mathematical sub/superscripts, and option strings.
 */
export function formatMathText(text: string | null | undefined): string {
  if (!text) return '';

  let cleaned = String(text).trim();

  // 1. Common chemical & subscript formulas
  cleaned = cleaned.replace(/\bH2O\b/g, 'H₂O');
  cleaned = cleaned.replace(/\bCO2\b/g, 'CO₂');
  cleaned = cleaned.replace(/\bO2\b/g, 'O₂');
  cleaned = cleaned.replace(/\bN2\b/g, 'N₂');
  cleaned = cleaned.replace(/\bt1\/2\b/gi, 't½');
  cleaned = cleaned.replace(/\bt1000%\b/gi, 't₁₀₀₀%');

  // 2. Greek symbol normalization
  cleaned = cleaned.replace(/\\alpha|𝜶|𝝰/g, 'α');
  cleaned = cleaned.replace(/\\beta|𝜷|𝝱/g, 'β');
  cleaned = cleaned.replace(/\\gamma|𝛄|𝝲/g, 'γ');
  cleaned = cleaned.replace(/\\theta|𝜽|𝝷/g, 'θ');
  cleaned = cleaned.replace(/\\lambda|𝝀|𝝀/g, 'λ');
  cleaned = cleaned.replace(/\\pi|𝜋|𝝅/g, 'π');
  cleaned = cleaned.replace(/\\mu|𝝁|𝛍/g, 'μ');
  cleaned = cleaned.replace(/\\sigma|𝝈|𝛔/g, 'σ');
  cleaned = cleaned.replace(/\\omega|𝝎|𝛚/g, 'ω');
  cleaned = cleaned.replace(/\\Delta|𝚫|9/g, 'Δ');
  cleaned = cleaned.replace(/∈/g, 'ε');

  // 3. Mathematical powers ^2, ^3, ^n
  cleaned = cleaned.replace(/\^2\b/g, '²');
  cleaned = cleaned.replace(/\^3\b/g, '³');
  cleaned = cleaned.replace(/\^-1\b/g, '⁻¹');

  // 4. Square roots and integrals
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
  cleaned = cleaned.replace(/\\int/g, '∫');

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
