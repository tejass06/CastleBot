const { EmbedBuilder } = require('discord.js');
const { translateText, detectLanguage, getLanguageInfo, isValidLanguage, getLanguageList } = require('../../utils/translator');

module.exports = {
    name: 'translate',
    description: 'Translate a message by replying to it. Works great with Indian languages!',
    aliases: ['tr', 'trans'],
    usage: 'Reply to a message and type: !translate <language_code>\nExample: !translate en (translates to English)\nExample: !translate ta (translates to Tamil)',
    
    async execute(message, args) {
        // If no args, show help
        if (!args.length) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🌐 Translation Help')
                    .setDescription('**How to use:**\n1. Reply to any message\n2. Type `!translate <language_code>`\n\n**Examples:**\n• Reply to a Tamil message: `!translate en` (Tamil → English)\n• Reply to an English message: `!translate ta` (English → Tamil)\n• Reply to a Hindi message: `!translate te` (Hindi → Telugu)')
                    .addFields(
                        { 
                            name: '🇮🇳 Indian Languages', 
                            value: '**hi** - Hindi | **ta** - Tamil | **te** - Telugu\n**bn** - Bengali | **mr** - Marathi | **gu** - Gujarati\n**kn** - Kannada | **ml** - Malayalam | **pa** - Punjabi',
                            inline: false
                        },
                        {
                            name: '🌍 Popular Languages',
                            value: '**en** - English | **es** - Spanish | **fr** - French\n**de** - German | **ja** - Japanese | **ko** - Korean\n**ar** - Arabic | **ru** - Russian | **zh** - Chinese',
                            inline: false
                        },
                        {
                            name: '📝 More Commands',
                            value: '`!translate list` - Show all languages\n`!translate detect` - Detect language of replied message',
                            inline: false
                        }
                    )
                    .setFooter({ text: 'Tip: You can also use !tr or !trans as shortcuts' })
                ]
            });
        }

        // Show language list
        if (args[0].toLowerCase() === 'list') {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🌐 Supported Languages')
                    .setDescription(getLanguageList('all'))
                    .setFooter({ text: 'Use the language code with !translate' })
                ]
            });
        }

        // Check if user replied to a message
        const repliedMessage = message.reference ? await message.channel.messages.fetch(message.reference.messageId) : null;
        
        if (!repliedMessage) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ No Message Reply')
                    .setDescription('Please **reply to a message** you want to translate!\n\n**How to:**\n1. Right-click (or long-press) on any message\n2. Click "Reply"\n3. Type `!translate <language_code>`')
                ]
            });
        }

        const textToTranslate = repliedMessage.content;
        
        if (!textToTranslate || textToTranslate.trim() === '') {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ No Text Found')
                    .setDescription('The message you replied to has no text to translate!')
                ]
            });
        }

        // Detect language command
        if (args[0].toLowerCase() === 'detect') {
            const detectMsg = await message.reply('🔍 Detecting language...');
            
            const detection = await detectLanguage(textToTranslate);
            
            if (!detection.success) {
                return detectMsg.edit({
                    content: '',
                    embeds: [new EmbedBuilder()
                        .setColor('#dc3545')
                        .setTitle('❌ Detection Failed')
                        .setDescription(`Error: ${detection.error}`)
                    ]
                });
            }

            const langInfo = getLanguageInfo(detection.languageCode);
            return detectMsg.edit({
                content: '',
                embeds: [new EmbedBuilder()
                    .setColor('#28a745')
                    .setTitle('🔍 Language Detection')
                    .addFields(
                        { name: 'Detected Language', value: `${langInfo.flag} **${langInfo.name}** (${langInfo.native})`, inline: true },
                        { name: 'Language Code', value: `\`${detection.languageCode}\``, inline: true },
                        { name: 'Confidence', value: detection.confidence === 'high' ? '✅ High' : '⚠️ Low', inline: true },
                        { name: 'Original Text', value: textToTranslate.length > 1000 ? textToTranslate.substring(0, 1000) + '...' : textToTranslate }
                    )
                ]
            });
        }

        const targetLang = args[0].toLowerCase();

        // Validate language code
        if (!isValidLanguage(targetLang)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Invalid Language Code')
                    .setDescription(`\`${targetLang}\` is not a valid language code.\n\nUse \`!translate list\` to see all supported languages.\n\n**Quick codes:**\n🇮🇳 **hi** (Hindi), **ta** (Tamil), **te** (Telugu)\n🌍 **en** (English), **es** (Spanish), **fr** (French)`)
                ]
            });
        }

        // Show translating message
        const loadingMsg = await message.reply('🌐 Translating...');

        // Perform translation
        const result = await translateText(textToTranslate, targetLang);

        if (!result.success) {
            return loadingMsg.edit({
                content: '',
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Translation Failed')
                    .setDescription(`Error: ${result.error}\n\nPlease try again or use a different language code.`)
                ]
            });
        }

        // Check if already in target language
        if (result.sourceLanguage === result.targetLanguage) {
            return loadingMsg.edit({
                content: '',
                embeds: [new EmbedBuilder()
                    .setColor('#ffc107')
                    .setTitle('⚠️ Already in Target Language')
                    .setDescription(`The message is already in **${result.targetLangName}**!\n\nTry translating to a different language.`)
                    .addFields({ name: 'Original Text', value: textToTranslate.length > 1000 ? textToTranslate.substring(0, 1000) + '...' : textToTranslate })
                ]
            });
        }

        const sourceLangInfo = getLanguageInfo(result.sourceLanguage);
        const targetLangInfo = getLanguageInfo(result.targetLanguage);

        // Send translation result
        const translationEmbed = new EmbedBuilder()
            .setColor('#28a745')
            .setTitle('🌐 Translation')
            .setDescription(`${sourceLangInfo.flag} **${sourceLangInfo.name}** ➜ ${targetLangInfo.flag} **${targetLangInfo.name}**`)
            .addFields(
                { 
                    name: `📄 Original (${sourceLangInfo.native})`, 
                    value: textToTranslate.length > 1000 ? textToTranslate.substring(0, 1000) + '...' : textToTranslate,
                    inline: false
                },
                { 
                    name: `✅ Translated (${targetLangInfo.native})`, 
                    value: result.translatedText.length > 1000 ? result.translatedText.substring(0, 1000) + '...' : result.translatedText,
                    inline: false
                }
            )
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await loadingMsg.edit({
            content: '',
            embeds: [translationEmbed]
        });
    },
};
