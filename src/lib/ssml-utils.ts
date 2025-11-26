// src/lib/ssml-utils.ts

/**
 * Pronunciation mappings for futurist/trend research terms
 * Format: [regex pattern, replacement with SSML]
 */
const ENGLISH_PRONUNCIATIONS: [RegExp, string][] = [
  // Technology terms
  [/\bAI\b/g, '<say-as interpret-as="characters">AI</say-as>'],
  [/\bIoT\b/g, '<say-as interpret-as="characters">IoT</say-as>'],
  [/\bVR\b/g, '<say-as interpret-as="characters">VR</say-as>'],
  [/\bAR\b/g, '<say-as interpret-as="characters">AR</say-as>'],
  [/\bXR\b/g, '<say-as interpret-as="characters">XR</say-as>'],
  [/\bML\b/g, '<say-as interpret-as="characters">ML</say-as>'],

  // Business terms
  [/\bB2B\b/g, '<say-as interpret-as="characters">B2B</say-as>'],
  [/\bB2C\b/g, '<say-as interpret-as="characters">B2C</say-as>'],
  [/\bSaaS\b/g, '<say-as interpret-as="characters">SaaS</say-as>'],
  [/\bKPI\b/g, '<say-as interpret-as="characters">KPI</say-as>'],
  [/\bROI\b/g, '<say-as interpret-as="characters">ROI</say-as>'],

  // Organizations
  [/\bCEO\b/g, '<say-as interpret-as="characters">CEO</say-as>'],
  [/\bCTO\b/g, '<say-as interpret-as="characters">CTO</say-as>'],
  [/\bCIO\b/g, '<say-as interpret-as="characters">CIO</say-as>'],
  [/\bCFO\b/g, '<say-as interpret-as="characters">CFO</say-as>'],

  // Research terms
  [/\bR&D\b/g, 'R and D'],
];

const GERMAN_PRONUNCIATIONS: [RegExp, string][] = [
  // Think tank and organization names
  [/\b2b\s+AHEAD\b/gi, 'two bee ahead'],
  [/\b2b\s+ahead\b/gi, 'two bee ahead'],

  // Technology acronyms (German context - spell out letter by letter)
  [/\bKI\b/g, '<say-as interpret-as="characters">KI</say-as>'],  // Künstliche Intelligenz
  [/\bAI\b/g, '<say-as interpret-as="characters">AI</say-as>'],  // When AI is used in German text
  [/\bVR\b/g, '<say-as interpret-as="characters">VR</say-as>'],  // Virtual Reality
  [/\bAR\b/g, '<say-as interpret-as="characters">AR</say-as>'],  // Augmented Reality
  [/\bXR\b/g, '<say-as interpret-as="characters">XR</say-as>'],  // Extended Reality
  [/\bIoT\b/g, '<say-as interpret-as="characters">IoT</say-as>'], // Internet of Things
  [/\bML\b/g, '<say-as interpret-as="characters">ML</say-as>'],  // Machine Learning

  // Business acronyms (German context)
  [/\bB2B\b/g, '<say-as interpret-as="characters">B2B</say-as>'],
  [/\bB2C\b/g, '<say-as interpret-as="characters">B2C</say-as>'],
  [/\bSaaS\b/g, '<say-as interpret-as="characters">SaaS</say-as>'],
  [/\bKPI\b/g, '<say-as interpret-as="characters">KPI</say-as>'],
  [/\bROI\b/g, '<say-as interpret-as="characters">ROI</say-as>'],

  // Organization roles (German context)
  [/\bCEO\b/g, '<say-as interpret-as="characters">CEO</say-as>'],
  [/\bCTO\b/g, '<say-as interpret-as="characters">CTO</say-as>'],
  [/\bCIO\b/g, '<say-as interpret-as="characters">CIO</say-as>'],
  [/\bCFO\b/g, '<say-as interpret-as="characters">CFO</say-as>'],

  // Futurist terms
  [/\bZukunftsforschung\b/gi, 'Zukunftsforschung'],
  [/\bMegatrends\b/gi, 'Megatrends'],
  [/\bTrendforscher\b/gi, 'Trendforscher'],

  // Technology terms
  [/\bDigitalisierung\b/gi, 'Digitalisierung'],
  [/\bKünstliche\s+Intelligenz\b/gi, 'Künstliche Intelligenz'],

  // Business terms
  [/\bGeschäftsmodell\b/gi, 'Geschäftsmodell'],
  [/\bInnovation\b/gi, 'Innovation'],
];

/**
 * Apply pronunciation corrections to text
 */
export const applyPronunciations = (text: string): string => {
  let processed = text;

  // Apply English pronunciations
  for (const [pattern, replacement] of ENGLISH_PRONUNCIATIONS) {
    processed = processed.replace(pattern, replacement);
  }

  // Apply German pronunciations
  for (const [pattern, replacement] of GERMAN_PRONUNCIATIONS) {
    processed = processed.replace(pattern, replacement);
  }

  return processed;
};

/**
 * Legacy function - now calls applyPronunciations
 * @deprecated Use applyPronunciations instead
 */
export const wrapDVAGWithSSML = (text: string): string => {
  return applyPronunciations(text);
};

/**
 * Create complete SSML response with proper language tags
 */
export const createSSMLResponse = (content: string, language: 'en' | 'de' = 'en'): string => {
  const processedContent = applyPronunciations(content);
  const langCode = language === 'de' ? 'de-DE' : 'en-US';
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${langCode}">${processedContent}</speak>`;
};

/**
 * Add custom pronunciation for specific terms
 */
export const addCustomPronunciation = (term: string, pronunciation: string): void => {
  const pattern = new RegExp(`\\b${term}\\b`, 'gi');
  ENGLISH_PRONUNCIATIONS.push([pattern, pronunciation]);
};

// Additional utility for think tank name
export const explicit2bAHEADSpelling = (): string => {
  return "two bee ahead";
};

// For system instructions
export const futuristInstructionSSML = (): string => {
  return `When mentioning the think tank, say "two bee ahead" for natural pronunciation.`;
};
