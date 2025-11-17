const googleTTS = require('google-tts-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Text-to-Speech Utility with Indian Female Voice
 * Supports multiple Indian languages with female voice accent
 */

// Voice configurations for different languages
const VOICE_CONFIGS = {
    'en': { lang: 'en-IN', voice: 'hi-IN', name: 'Indian English (Female)' },  // Indian English accent
    'hi': { lang: 'hi-IN', voice: 'hi-IN', name: 'Hindi (Female)' },
    'ta': { lang: 'ta-IN', voice: 'ta-IN', name: 'Tamil (Female)' },
    'te': { lang: 'te-IN', voice: 'te-IN', name: 'Telugu (Female)' },
    'bn': { lang: 'bn-IN', voice: 'bn-IN', name: 'Bengali (Female)' },
    'mr': { lang: 'mr-IN', voice: 'mr-IN', name: 'Marathi (Female)' },
    'gu': { lang: 'gu-IN', voice: 'gu-IN', name: 'Gujarati (Female)' },
    'kn': { lang: 'kn-IN', voice: 'kn-IN', name: 'Kannada (Female)' },
    'ml': { lang: 'ml-IN', voice: 'ml-IN', name: 'Malayalam (Female)' },
};

/**
 * Generate TTS audio URL
 * @param {string} text - Text to convert to speech
 * @param {string} lang - Language code (default: 'en' for Indian English)
 * @param {boolean} slow - Slow speed (default: false)
 * @returns {Promise<Object>} Audio URL and info
 */
async function generateTTS(text, lang = 'en', slow = false) {
    try {
        // Get voice config or default to Indian English
        const voiceConfig = VOICE_CONFIGS[lang] || VOICE_CONFIGS['en'];
        
        // Generate TTS URL using Google TTS
        const audioUrl = googleTTS.getAudioUrl(text, {
            lang: voiceConfig.lang,
            slow: slow,
            host: 'https://translate.google.com',
        });

        return {
            success: true,
            url: audioUrl,
            text: text,
            language: lang,
            voiceName: voiceConfig.name,
            duration: estimateDuration(text)
        };
    } catch (error) {
        console.error('TTS generation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate speech'
        };
    }
}

/**
 * Download TTS audio to file
 * @param {string} text - Text to convert
 * @param {string} lang - Language code
 * @param {string} outputPath - File path to save
 * @returns {Promise<Object>} Result with file path
 */
async function downloadTTS(text, lang = 'en', outputPath = null) {
    try {
        const voiceConfig = VOICE_CONFIGS[lang] || VOICE_CONFIGS['en'];
        
        // Generate audio URL
        const audioUrl = googleTTS.getAudioUrl(text, {
            lang: voiceConfig.lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate filename if not provided
        if (!outputPath) {
            const timestamp = Date.now();
            outputPath = path.join(tempDir, `tts_${timestamp}.mp3`);
        }

        // Download audio
        const response = await axios({
            method: 'get',
            url: audioUrl,
            responseType: 'stream'
        });

        // Save to file
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                resolve({
                    success: true,
                    filePath: outputPath,
                    text: text,
                    language: lang,
                    voiceName: voiceConfig.name
                });
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('TTS download error:', error);
        return {
            success: false,
            error: error.message || 'Failed to download speech'
        };
    }
}

/**
 * Estimate audio duration in seconds
 * @param {string} text - Text to estimate
 * @returns {number} Estimated duration in seconds
 */
function estimateDuration(text) {
    // Rough estimation: ~150 words per minute, ~5 characters per word
    const wordsPerMinute = 150;
    const charsPerWord = 5;
    const words = text.length / charsPerWord;
    const minutes = words / wordsPerMinute;
    return Math.ceil(minutes * 60);
}

/**
 * Get available voices
 * @returns {Object} Available voice configurations
 */
function getAvailableVoices() {
    return VOICE_CONFIGS;
}

/**
 * Check if language is supported
 * @param {string} lang - Language code
 * @returns {boolean} True if supported
 */
function isLanguageSupported(lang) {
    return lang in VOICE_CONFIGS;
}

/**
 * Clean up old temporary files
 * @param {number} maxAge - Max age in milliseconds (default: 1 hour)
 */
function cleanupTempFiles(maxAge = 3600000) {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) return;

    const now = Date.now();
    const files = fs.readdirSync(tempDir);

    files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Cleaned up old TTS file: ${file}`);
        }
    });
}

module.exports = {
    generateTTS,
    downloadTTS,
    getAvailableVoices,
    isLanguageSupported,
    cleanupTempFiles,
    estimateDuration
};
