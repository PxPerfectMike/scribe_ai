// tokenUtils.js
export const languageTokenMultipliers = {
  // CJK languages use more tokens per character
  "chinese-simplified": 1.5,
  "chinese-traditional": 1.5,
  japanese: 1.5,
  korean: 1.3,
  // Languages using non-Latin scripts
  arabic: 1.2,
  hindi: 1.2,
  hebrew: 1.2,
  russian: 1.2,
  // Latin-based languages
  english: 1.0,
  spanish: 1.0,
  french: 1.0,
  german: 1.0,
  italian: 1.0,
  portuguese: 1.0,
  vietnamese: 1.0,
};

// Base limits
export const BASE_TOKEN_LIMIT = 4096;
export const TOKENS_RESERVED_FOR_PROMPT = 500; // Reserve tokens for prompt template
export const TOKENS_RESERVED_FOR_RESPONSE = 1500; // Reserve tokens for model response
export const AVAILABLE_TOKENS = BASE_TOKEN_LIMIT - TOKENS_RESERVED_FOR_PROMPT - TOKENS_RESERVED_FOR_RESPONSE;
export const CHARS_PER_TOKEN_ENGLISH = 4;

export const calculateMaxChars = (language = "english", action = "default") => {
  const multiplier = languageTokenMultipliers[language] || 1.0;
  let actionModifier = 1.0;

  // Adjust limits based on action type
  switch (action) {
    case "summarize":
      actionModifier = 1.2; // Allow more input for summarization
      break;
    case "translate":
      actionModifier = 0.8; // Be more conservative with translation
      break;
    case "elaborate":
      actionModifier = 0.7; // Need more room for elaboration
      break;
    default:
      actionModifier = 1.0;
  }

  const rawLimit = (AVAILABLE_TOKENS * CHARS_PER_TOKEN_ENGLISH * actionModifier) / multiplier;
  // Round down to nearest thousand
  return Math.floor(rawLimit / 1000) * 1000;
};

export const estimateTokens = (text, language = "english") => {
  const multiplier = languageTokenMultipliers[language] || 1.0;
  return Math.ceil((text.length / CHARS_PER_TOKEN_ENGLISH) * multiplier);
};
