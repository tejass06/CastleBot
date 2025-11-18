const { EmbedBuilder } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType
} = require('@discordjs/voice');
const { downloadTTS, getAvailableVoices, isLanguageSupported } = require('../../utils/tts');
const fs = require('fs');

module.exports = {
    name: 'vspeak',
    description: 'Bot joins your voice channel and speaks text with Indian female voice',
    aliases: ['vcspeak', 'vtts', 'vcvoice'],
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
                    .setTitle('🎙️ Voice Channel Text-to-Speech')
                    .setDescription('Bot joins your VC and speaks text with Indian female voice!')
                    .addFields(
                        {
                            name: '📝 Usage',
                            value: '`!vspeak <text> [language]`\n`!vspeak <text> -lang <code>`',
                            inline: false
                        },
                        {
                            name: '⚠️ Requirements',
                            value: '• You must be in a voice channel\n• Bot needs permission to join/speak',
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
                                '`!vspeak Hello everyone!` (Indian English)\n' +
                                '`!vspeak नमस्ते दोस्तों! -lang hi` (Hindi)\n' +
                                '`!vspeak வணக்கம் -lang ta` (Tamil)\n' +
                                '`!vspeak Welcome to the server!` (Indian accent)',
                            inline: false
                        }
                    )
                    .setFooter({ text: 'Bot will join your VC and speak!' })
                ]
            });
        }

        // Check if user is in a voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Not in Voice Channel')
                    .setDescription('You need to be in a voice channel to use this command!\n\nJoin a voice channel first, then try again.')
                ]
            });
        }

        // Check bot permissions
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Missing Permissions')
                    .setDescription('I need **Connect** and **Speak** permissions in that voice channel!')
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
            args.splice(langFlagIndex, 2);
            text = args.join(' ');
        }

        // Validate language
        if (!isLanguageSupported(language)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Unsupported Language')
                    .setDescription(`Language code \`${language}\` is not supported!\n\nUse \`!vspeak\` without arguments to see available languages.`)
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
                    .setDescription('Please provide some text for me to speak!')
                ]
            });
        }

        // Show generating message
        const generatingMsg = await message.reply({
            embeds: [new EmbedBuilder()
                .setColor('#ffc107')
                .setTitle('🎙️ Generating Voice...')
                .setDescription(`Preparing to speak in **${voiceChannel.name}**...\n\nGenerating Indian female voice audio...`)
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

            // Join voice channel
            await generatingMsg.edit({
                embeds: [new EmbedBuilder()
                    .setColor('#ffc107')
                    .setTitle('🔊 Joining Voice Channel...')
                    .setDescription(`Connecting to **${voiceChannel.name}**...`)
                ]
            });

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            // Wait for connection to be ready
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
            } catch (error) {
                connection.destroy();
                fs.unlinkSync(result.filePath);
                return generatingMsg.edit({
                    embeds: [new EmbedBuilder()
                        .setColor('#dc3545')
                        .setTitle('❌ Connection Failed')
                        .setDescription('Failed to connect to voice channel. Please try again!')
                    ]
                });
            }

            // Create audio player
            const player = createAudioPlayer();

            // Try to create resource; if FFmpeg is missing, fall back to OGG Opus
            let resource;
            try {
                resource = createAudioResource(result.filePath);
            } catch (err) {
                if (String(err?.message || err).includes('FFmpeg/avconv not found')) {
                    try {
                        await generatingMsg.edit({
                            embeds: [new EmbedBuilder()
                                .setColor('#ffc107')
                                .setTitle('🎙️ Preparing Fallback...')
                                .setDescription('FFmpeg not found on server. Trying OGG/Opus fallback...')
                            ]
                        });

                        // Clean up original file
                        try { if (fs.existsSync(result.filePath)) fs.unlinkSync(result.filePath); } catch {}

                        const fallback = await downloadTTS(text, language, null, { outputFormat: 'ogg_44100_64' });
                        if (!fallback.success) {
                            throw new Error(`Fallback failed: ${fallback.error}`);
                        }
                        resource = createAudioResource(fallback.filePath, { inputType: StreamType.OggOpus });
                    } catch (fallbackErr) {
                        throw fallbackErr;
                    }
                } else {
                    throw err;
                }
            }

            // Play audio
            player.play(resource);
            connection.subscribe(player);

            // Update message
            await generatingMsg.edit({
                embeds: [new EmbedBuilder()
                    .setColor('#28a745')
                    .setTitle('🔊 Now Speaking!')
                    .setDescription(`Speaking in **${voiceChannel.name}**\n\n**Language:** ${result.voiceName}\n**Text:** ${text}`)
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
                ]
            });

            // Handle player events
            player.on(AudioPlayerStatus.Idle, () => {
                // Disconnect after playing
                setTimeout(() => {
                    connection.destroy();
                    
                    // Clean up file
                    try {
                        if (fs.existsSync(result.filePath)) {
                            fs.unlinkSync(result.filePath);
                        }
                    } catch (err) {
                        console.error('Error cleaning up TTS file:', err);
                    }

                    // Update message
                    generatingMsg.edit({
                        embeds: [new EmbedBuilder()
                            .setColor('#5865F2')
                            .setTitle('✅ Finished Speaking')
                            .setDescription(`Left **${voiceChannel.name}**\n\n**Language:** ${result.voiceName}\n**Text:** ${text}`)
                            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                            .setTimestamp()
                        ]
                    }).catch(() => {});
                }, 1000);
            });

            player.on('error', error => {
                console.error('Audio player error:', error);
                connection.destroy();
                
                // Clean up file
                try {
                    if (fs.existsSync(result.filePath)) {
                        fs.unlinkSync(result.filePath);
                    }
                } catch (err) {
                    console.error('Error cleaning up TTS file:', err);
                }

                generatingMsg.edit({
                    embeds: [new EmbedBuilder()
                        .setColor('#dc3545')
                        .setTitle('❌ Playback Error')
                        .setDescription('An error occurred while playing audio.')
                    ]
                }).catch(() => {});
            });

        } catch (error) {
            console.error('VC TTS command error:', error);
            return generatingMsg.edit({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Error')
                    .setDescription('An error occurred. Please try again!')
                ]
            });
        }
    },
};
