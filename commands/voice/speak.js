const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { downloadTTS, getAvailableVoices, isLanguageSupported } = require('../../utils/tts');
const fs = require('fs');

module.exports = {
    name: 'speak',
    description: 'Convert text to speech with voice and send as voice note',
    aliases: ['tts', 'say', 'voice'],
    usage: '<text> [language]',
    
    async execute(message, args) {
        if (!args.length) {
            const voices = getAvailableVoices();
            const voiceList = Object.entries(voices)
                .map(([code, info]) => `\`${code}\` - ${info.name}`)
                .join('\n');

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('🎙️ Text-to-Speech with Indian Voice')
                    .setDescription('Convert text to speech with natural Indian female voice!')
                    .addFields(
                        {
                            name: '📝 Usage',
                            value: '`!speak <text> [language]`\n`!speak <text> -lang <code>`',
                            inline: false
                        },
                        {
                            name: '🌐 Available Voices',
                            value: voiceList,
                            inline: false
                        },
                        {
                            name: '💡 Examples',
                            value: 
                                '`!speak Hello, how are you?` (Indian English)\n' +
                                '`!speak नमस्ते, कैसे हैं आप? -lang hi` (Hindi)\n' +
                                '`!speak வணக்கம் -lang ta` (Tamil)\n' +
                                '`!speak నమస్కారం -lang te` (Telugu)',
                            inline: false
                        }
                    )
                    .setFooter({ text: 'Tip: Voice notes will be sent as MP3 files!' })
                ]
            });
        }

        // Parse language flag
        let language = 'en'; // Default to Indian English
        let text = args.join(' ');

        // Check for -lang flag
        const langFlagIndex = args.findIndex(arg => arg.toLowerCase() === '-lang' || arg.toLowerCase() === '-l');
        if (langFlagIndex !== -1 && args[langFlagIndex + 1]) {
            language = args[langFlagIndex + 1].toLowerCase();
            // Remove language flag from text
            args.splice(langFlagIndex, 2);
            text = args.join(' ');
        }

        // Validate language
        if (!isLanguageSupported(language)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Unsupported Language')
                    .setDescription(`Language code \`${language}\` is not supported!\n\nUse \`!speak\` without arguments to see available languages.`)
                ]
            });
        }

        // Check text length
        if (text.length > 500) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Text Too Long')
                    .setDescription('Please keep your text under 500 characters!')
                    .addFields({ name: 'Current Length', value: `${text.length} characters`, inline: true })
                ]
            });
        }

        if (!text || text.trim() === '') {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ No Text Provided')
                    .setDescription('Please provide some text to convert to speech!')
                ]
            });
        }

        // Show generating message
        const generatingMsg = await message.reply({
            embeds: [new EmbedBuilder()
                .setColor('#ffc107')
                .setTitle('🎙️ Generating Voice...')
                .setDescription('Creating your voice note with Indian female voice...')
            ]
        });

        try {
            // Generate and download TTS
            const result = await downloadTTS(text, language);

            if (!result.success) {
                return generatingMsg.edit({
                    embeds: [new EmbedBuilder()
                        .setColor('#dc3545')
                        .setTitle('❌ Generation Failed')
                        .setDescription(`Error: ${result.error}`)
                    ]
                });
            }

            // Create attachment
            const attachment = new AttachmentBuilder(result.filePath, {
                name: 'voice_note.mp3',
                description: `TTS: ${text.substring(0, 50)}...`
            });

            // Send voice note
            const successEmbed = new EmbedBuilder()
                .setColor('#28a745')
                .setTitle('🎙️ Voice Note Generated!')
                .setDescription(`**Language:** ${result.voiceName}\n**Text:** ${text}`)
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await generatingMsg.edit({
                embeds: [successEmbed],
                files: [attachment]
            });

            // Clean up file after sending
            setTimeout(() => {
                try {
                    if (fs.existsSync(result.filePath)) {
                        fs.unlinkSync(result.filePath);
                    }
                } catch (err) {
                    console.error('Error cleaning up TTS file:', err);
                }
            }, 5000); // Delete after 5 seconds

        } catch (error) {
            console.error('TTS command error:', error);
            return generatingMsg.edit({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Error')
                    .setDescription('An error occurred while generating the voice note. Please try again!')
                ]
            });
        }
    },
};
