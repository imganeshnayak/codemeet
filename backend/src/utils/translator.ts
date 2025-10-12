import axios from 'axios';

// Language detection helper
export const detectLanguage = (text: string): string => {
  // Basic language detection based on character patterns
  // Hindi/Devanagari
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  // Punjabi
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
  // Marathi (uses Devanagari like Hindi, but for now we'll treat as Hindi)
  if (/[\u0900-\u097F]/.test(text)) return 'mr';
  // Default to English
  return 'en';
};

// Language code mapping for LibreTranslate
// Note: LibreTranslate public API has limited language support
// Supported: en, hi, bn, gu, mr, pa (and some others)
// Not supported on public API: kn, ta, te, ml (Kannada, Tamil, Telugu, Malayalam)
const languageCodeMap: Record<string, string> = {
  'en': 'en',
  'hi': 'hi',    // Hindi - Supported
  'kn': 'kn',    // Kannada - Limited support
  'ta': 'ta',    // Tamil - Limited support
  'te': 'te',    // Telugu - Limited support
  'ml': 'ml',    // Malayalam - Limited support
  'bn': 'bn',    // Bengali - Supported
  'gu': 'gu',    // Gujarati - Supported
  'pa': 'pa',    // Punjabi - Supported
  'mr': 'mr'     // Marathi - Supported
};

// Languages with good translation support on public LibreTranslate
const wellSupportedLanguages = ['en', 'hi', 'bn', 'gu', 'mr', 'pa'];

// Check if language is well supported
const isLanguageSupported = (lang: string): boolean => {
  return wellSupportedLanguages.includes(lang);
};

// Translate text using LibreTranslate public API
export const translateText = async (
  text: string,
  sourceLang: string = 'en',
  targetLang: string = 'hi'
): Promise<string> => {
  // If source and target are the same, no translation needed
  if (sourceLang === targetLang) {
    return text;
  }

  // If target is English, no translation needed
  if (targetLang === 'en') {
    return text;
  }

  // Check if target language is well supported
  if (!isLanguageSupported(targetLang)) {
    console.log(`⚠️ Language ${targetLang} has limited support on LibreTranslate public API. Returning English response.`);
    console.log(`💡 Tip: For better ${getLanguageName(targetLang)} support, consider using Google Translate API or self-hosting LibreTranslate with more models.`);
    return text; // Return English text for unsupported languages
  }

  try {
    // Use LibreTranslate public API
    const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';
    
    console.log(`🌍 Translating from ${sourceLang} to ${targetLang}`);

    const response = await axios.post(
      LIBRETRANSLATE_URL,
      {
        q: text,
        source: languageCodeMap[sourceLang] || sourceLang,
        target: languageCodeMap[targetLang] || targetLang,
        format: 'text'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      }
    );

    if (response.data && response.data.translatedText) {
      console.log('✅ Translation successful');
      return response.data.translatedText;
    } else {
      console.error('❌ Translation response invalid:', response.data);
      return text; // Return original text if translation fails
    }
  } catch (error: any) {
    console.error('❌ Translation error:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
    // Check if language is supported
    if (error.response?.status === 400) {
      console.log(`⚠️ Language ${targetLang} may not be supported by LibreTranslate. Returning English response.`);
    }
    // Return original text if translation fails
    return text;
  }
};

// Get language name for logging
export const getLanguageName = (code: string): string => {
  const names: Record<string, string> = {
    'en': 'English',
    'hi': 'Hindi',
    'kn': 'Kannada',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ml': 'Malayalam',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'pa': 'Punjabi',
    'mr': 'Marathi'
  };
  return names[code] || code;
};
