const translate = require('@iamtraction/google-translate');

// Supported language codes with common names and regional languages
const LANGUAGES = {
    // Indian Languages
    'hi': { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    'ta': { name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    'te': { name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    'bn': { name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
    'mr': { name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
    'gu': { name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
    'kn': { name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    'ml': { name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    'pa': { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    'ur': { name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
    
    // International Languages
    'en': { name: 'English', native: 'English', flag: '🇬🇧' },
    'es': { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    'fr': { name: 'French', native: 'Français', flag: '🇫🇷' },
    'de': { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    'pt': { name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
    'ru': { name: 'Russian', native: 'Русский', flag: '🇷🇺' },
    'ja': { name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    'ko': { name: 'Korean', native: '한국어', flag: '🇰🇷' },
    'zh': { name: 'Chinese', native: '中文', flag: '🇨🇳' },
    'ar': { name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    'it': { name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
    'nl': { name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
    'pl': { name: 'Polish', native: 'Polski', flag: '🇵🇱' },
    'tr': { name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
    'vi': { name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
    'th': { name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
    'id': { name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
};

/**
 * Translate text from one language to another
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'en', 'ta', 'hi')
 * @param {string} sourceLang - Source language code (auto-detect if not provided)
 * @returns {Promise<Object>} Translation result with text and detected language
 */
async function translateText(text, targetLang, sourceLang = 'auto') {
    try {
        const result = await translate(text, { 
            to: targetLang,
            from: sourceLang 
        });
        
        return {
            success: true,
            translatedText: result.text,
            sourceLanguage: result.from.language.iso || sourceLang,
            sourceLangName: getLanguageName(result.from.language.iso || sourceLang),
            targetLanguage: targetLang,
            targetLangName: getLanguageName(targetLang),
            originalText: text
        };
    } catch (error) {
        console.error('Translation error:', error);
        return {
            success: false,
            error: error.message || 'Translation failed'
        };
    }
}

/**
 * Detect the language of text
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} Detected language info
 */
async function detectLanguage(text) {
    try {
        const result = await translate(text, { to: 'en' });
        const langCode = result.from.language.iso || 'en';
        
        return {
            success: true,
            languageCode: langCode,
            languageName: getLanguageName(langCode),
            confidence: result.from.language.didYouMean ? 'low' : 'high'
        };
    } catch (error) {
        console.error('Language detection error:', error);
        return {
            success: false,
            error: error.message || 'Detection failed'
        };
    }
}

/**
 * Get language name from code
 * @param {string} code - Language code
 * @returns {string} Language name
 */
function getLanguageName(code) {
    return LANGUAGES[code] ? LANGUAGES[code].name : code.toUpperCase();
}

/**
 * Get full language info
 * @param {string} code - Language code
 * @returns {Object} Language info
 */
function getLanguageInfo(code) {
    return LANGUAGES[code] || { name: code.toUpperCase(), native: code, flag: '🌐' };
}

/**
 * Get list of all supported languages
 * @returns {Object} All supported languages
 */
function getSupportedLanguages() {
    return LANGUAGES;
}

/**
 * Check if language code is valid
 * @param {string} code - Language code to check
 * @returns {boolean} True if valid
 */
function isValidLanguage(code) {
    return code in LANGUAGES;
}

/**
 * Format language list for display
 * @param {string} category - 'indian' or 'all'
 * @returns {string} Formatted language list
 */
function getLanguageList(category = 'all') {
    let langs = Object.entries(LANGUAGES);
    
    if (category === 'indian') {
        const indianCodes = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'];
        langs = langs.filter(([code]) => indianCodes.includes(code));
    }
    
    return langs
        .map(([code, info]) => `${info.flag} **${code}** - ${info.name} (${info.native})`)
        .join('\n');
}

module.exports = {
    translateText,
    detectLanguage,
    getLanguageName,
    getLanguageInfo,
    getSupportedLanguages,
    isValidLanguage,
    getLanguageList,
    LANGUAGES
};
