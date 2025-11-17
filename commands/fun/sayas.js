const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'sayas',
    description: 'Make the bot say something as anyone using webhook',
    aliases: ['talkas', 'speakas'],
    usage: '<name> <avatar_url> <message>',
    
    async execute(message, args) {
        // Check permissions
        if (!message.member.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Missing Permissions')
                    .setDescription('You need **Manage Webhooks** permission to use this command!')
                ]
            });
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Bot Missing Permissions')
                    .setDescription('I need **Manage Webhooks** permission to use this feature!')
                ]
            });
        }

        // Show help if no arguments
        if (args.length < 2) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('💬 Say As Command')
                    .setDescription('Make the bot say something as any custom name/avatar!')
                    .addFields(
                        {
                            name: '📝 Usage',
                            value: '`!sayas <name> <message>`\n`!sayas <name> <avatar_url> <message>`',
                            inline: false
                        },
                        {
                            name: '💡 Examples',
                            value: 
                                '`!sayas "Elon Musk" Hello everyone!`\n' +
                                '`!sayas "Jeff Bezos" https://example.com/avatar.png Welcome!`\n' +
                                '`!sayas Bot This is a custom message!`',
                            inline: false
                        },
                        {
                            name: '🎯 Features',
                            value: '• Custom name\n• Custom avatar (optional)\n• Clean message appearance\n• Auto-cleanup',
                            inline: false
                        },
                        {
                            name: '💡 Pro Tip',
                            value: 'Use quotes for names with spaces: `!sayas "John Doe" message`',
                            inline: false
                        }
                    )
                    .setFooter({ text: 'Have fun! Use responsibly.' })
                ]
            });
        }

        try {
            let customName;
            let avatarURL = null;
            let messageContent;

            // Parse name (check if it's quoted)
            if (args[0].startsWith('"')) {
                // Find the closing quote
                const quotedName = args.join(' ').match(/"([^"]+)"/);
                if (quotedName) {
                    customName = quotedName[1];
                    const remainingArgs = args.join(' ').replace(`"${customName}"`, '').trim().split(' ');
                    
                    // Check if next arg is a URL (avatar)
                    if (remainingArgs[0] && (remainingArgs[0].startsWith('http://') || remainingArgs[0].startsWith('https://'))) {
                        avatarURL = remainingArgs[0];
                        messageContent = remainingArgs.slice(1).join(' ');
                    } else {
                        messageContent = remainingArgs.join(' ');
                    }
                } else {
                    customName = args[0].replace(/"/g, '');
                    messageContent = args.slice(1).join(' ');
                }
            } else {
                customName = args[0];
                
                // Check if second arg is URL
                if (args[1] && (args[1].startsWith('http://') || args[1].startsWith('https://'))) {
                    avatarURL = args[1];
                    messageContent = args.slice(2).join(' ');
                } else {
                    messageContent = args.slice(1).join(' ');
                }
            }

            if (!messageContent || messageContent.trim() === '') {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('#dc3545')
                        .setTitle('❌ No Message Provided')
                        .setDescription('Please provide a message to send!')
                    ]
                });
            }

            // Create webhook
            const webhook = await message.channel.createWebhook({
                name: customName,
                avatar: avatarURL,
                reason: `Say As command by ${message.author.tag}`
            });

            // Send message
            await webhook.send({
                content: messageContent,
                username: customName,
                avatarURL: avatarURL
            });

            // Delete webhook
            await webhook.delete();

            // Delete original command
            try {
                await message.delete();
            } catch (error) {
                // Ignore
            }

        } catch (error) {
            console.error('Say As command error:', error);
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Error')
                    .setDescription('An error occurred! Make sure the avatar URL is valid (if provided).')
                ]
            });
        }
    },
};
