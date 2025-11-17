const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ghostping',
    description: 'Send a ghost ping that gets deleted immediately (prank feature)',
    aliases: ['gping', 'phantom'],
    usage: '<@user> [message]',
    
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
        if (!args.length) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('👻 Ghost Ping Command')
                    .setDescription('Send a ping that gets deleted immediately! The user still gets notified but can\'t see the message.')
                    .addFields(
                        {
                            name: '📝 Usage',
                            value: '`!ghostping <@user> [message]`',
                            inline: false
                        },
                        {
                            name: '💡 Examples',
                            value: 
                                '`!ghostping @John`\n' +
                                '`!ghostping @Sarah Hey there!`\n' +
                                '`!ghostping @Mike This will disappear!`',
                            inline: false
                        },
                        {
                            name: '🎯 How It Works',
                            value: '• Sends a message pinging the user\n• Deletes it immediately\n• User gets notification but sees nothing\n• Perfect harmless prank!',
                            inline: false
                        }
                    )
                    .setFooter({ text: '👻 Use for fun only!' })
                ]
            });
        }

        // Parse user mention
        let targetUser;
        if (message.mentions.users.size > 0) {
            targetUser = message.mentions.users.first();
        } else {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ No User Mentioned')
                    .setDescription('Please mention a user to ghost ping!\n\nUsage: `!ghostping @user [message]`')
                ]
            });
        }

        const messageContent = args.slice(1).join(' ') || 'Ghost ping! 👻';

        try {
            // Create temporary webhook
            const webhook = await message.channel.createWebhook({
                name: 'Ghost',
                avatar: 'https://cdn.discordapp.com/emojis/787929991804461076.png', // Ghost emoji
                reason: `Ghost ping by ${message.author.tag}`
            });

            // Send ghost ping
            const sentMessage = await webhook.send({
                content: `${targetUser} ${messageContent}`,
                username: '👻 Ghost',
            });

            // Delete webhook
            await webhook.delete();

            // Delete the ghost message after a brief moment
            setTimeout(async () => {
                try {
                    await sentMessage.delete();
                } catch (error) {
                    // Ignore errors
                }
            }, 100); // Delete after 100ms

            // Delete original command
            try {
                await message.delete();
            } catch (error) {
                // Ignore
            }

            // Send confirmation in DM
            try {
                await message.author.send({
                    embeds: [new EmbedBuilder()
                        .setColor('#28a745')
                        .setTitle('👻 Ghost Ping Sent!')
                        .setDescription(`Successfully ghost pinged ${targetUser.tag}!`)
                        .addFields(
                            { name: 'Target', value: targetUser.tag, inline: true },
                            { name: 'Message', value: messageContent, inline: true }
                        )
                        .setTimestamp()
                    ]
                });
            } catch (error) {
                // User has DMs disabled
            }

        } catch (error) {
            console.error('Ghost ping error:', error);
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#dc3545')
                    .setTitle('❌ Error')
                    .setDescription('An error occurred while trying to send ghost ping!')
                ]
            });
        }
    },
};
