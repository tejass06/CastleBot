const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Text-to-Speech Utility powered by ElevenLabs
 * Default voice can be configured via ELEVENLABS_VOICE_ID
 */

// ElevenLabs configuration
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
// Default to the provided voice id if not configured via env
const ELEVEN_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'hGb0Exk8cp4vQEnwolxa';
const ELEVEN_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const ELEVEN_OUTPUT = process.env.ELEVENLABS_OUTPUT || 'mp3_44100_128';

// Backwards-compatible list for UI/help. These map to the same ElevenLabs voice.
const VOICE_CONFIGS = {
    'en': { code: 'en', name: 'ElevenLabs Voice (English/IN)' },
    'hi': { code: 'hi', name: 'ElevenLabs Voice (Hindi)' },
    'ta': { code: 'ta', name: 'ElevenLabs Voice (Tamil)' },
    'te': { code: 'te', name: 'ElevenLabs Voice (Telugu)' },
    'bn': { code: 'bn', name: 'ElevenLabs Voice (Bengali)' },
    'mr': { code: 'mr', name: 'ElevenLabs Voice (Marathi)' },
    'gu': { code: 'gu', name: 'ElevenLabs Voice (Gujarati)' },
    'kn': { code: 'kn', name: 'ElevenLabs Voice (Kannada)' },
    'ml': { code: 'ml', name: 'ElevenLabs Voice (Malayalam)' },
};

/**
 * Generate TTS audio URL
 * @param {string} text - Text to convert to speech
 * @param {string} lang - Language code (default: 'en' for Indian English)
 * @param {boolean} slow - Slow speed (default: false)
 * @returns {Promise<Object>} Audio URL and info
 */
async function generateTTS(text, lang = 'en') {
    // Keep for compatibility: generate a file then return metadata
    const result = await downloadTTS(text, lang);
    if (!result.success) return result;
    return {
        success: true,
        filePath: result.filePath,
        text,
        language: lang,
        voiceName: result.voiceName,
        duration: estimateDuration(text)
    };
}

/**
 * Download TTS audio to file
 * @param {string} text - Text to convert
 * @param {string} lang - Language code
 * @param {string} outputPath - File path to save
 * @param {object} [opts] - Optional settings
 * @param {string} [opts.outputFormat] - Override ElevenLabs output_format (e.g., 'ogg_44100_64')
 * @returns {Promise<Object>} Result with file path
 */
async function downloadTTS(text, lang = 'en', outputPath = null, opts = {}) {
    if (!ELEVEN_API_KEY) {
        return { success: false, error: 'ELEVENLABS_API_KEY is not set in environment' };
    }
    try {
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

    const outputFormat = opts.outputFormat || ELEVEN_OUTPUT;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}?output_format=${encodeURIComponent(outputFormat)}`;
        const response = await axios({
            method: 'post',
            url,
            headers: {
                'xi-api-key': ELEVEN_API_KEY,
                'Content-Type': 'application/json'
            },
            data: {
                text,
                model_id: ELEVEN_MODEL_ID,
                // Optional: tweak voice settings via env
                voice_settings: process.env.ELEVENLABS_SETTINGS
                    ? JSON.parse(process.env.ELEVENLABS_SETTINGS)
                    : { stability: 0.5, similarity_boost: 0.8 }
            },
            responseType: 'stream',
            timeout: 20000
        });

        await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const voiceConfig = VOICE_CONFIGS[lang] || VOICE_CONFIGS['en'];
        return {
            success: true,
            filePath: outputPath,
            text,
            language: lang,
            voiceName: `${voiceConfig.name}`
        };
    } catch (error) {
        console.error('TTS download error (ElevenLabs):', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to download speech'
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
