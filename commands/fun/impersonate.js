const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// This optimized version reuses a single webhook per channel instead of creating + deleting one every time.
// Creating & deleting webhooks is slow because each is a REST call; sending via an existing webhook is fast.
// We also perform non-blocking deletion of the invoking message for snappier user experience.

module.exports = {
    name: 'imp',
    description: 'Impersonate another user by sending a webhook message that copies their name/avatar (fast version)',
    aliases: ['impersonate','fake','mimic','pretend','ghost'],
    usage: '<@user|user_id> <message>',

    async execute(message, args) {
        // Duplicate execution guard (rare race conditions or double events)
        if (!message.client._impProcessed) message.client._impProcessed = new Set();
        if (message.client._impProcessed.has(message.id)) return; // already handled
        message.client._impProcessed.add(message.id);

        // Permission checks (keep lightweight)
        if (!message.member.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#dc3545').setTitle('❌ Missing Permissions').setDescription('You need **Manage Webhooks** to use this command.')] });
        }
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#dc3545').setTitle('❌ Bot Missing Permissions').setDescription('I need **Manage Webhooks** permission.')] });
        }

        // Help menu
        if (!args.length) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle('🎭 Impersonate (Fast)')
                    .setDescription('Send a message that looks like another user without creating + deleting a webhook every time.')
                    .addFields(
                        { name: '📝 Usage', value: '`!imp @user <message>`\n`!imp <user_id> <message>`', inline: false },
                        { name: '⚡ Why Faster?', value: '• Reuses one webhook per channel\n• No delete/create cycle\n• Sends instantly', inline: false },
                        { name: '🎯 Features', value: '• Copies avatar\n• Uses user nickname if available\n• Cleans your command (if possible)', inline: false },
                        { name: '💡 Example', value: '`!imp @John Hello!`', inline: false }
                    )
                    .setFooter({ text: '⚠️ Fun only. Do not harass / deceive.' })
                ]
            });
        }

        // Resolve target user
        const mentionArg = args[0];
        let targetUser;
        if (message.mentions.users.size) {
            targetUser = message.mentions.users.first();
        } else {
            const id = mentionArg.replace(/[^0-9]/g, '');
            try { targetUser = await message.client.users.fetch(id); } catch { /* ignored */ }
        }
        if (!targetUser) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#dc3545').setTitle('❌ User Not Found').setDescription('Mention a valid user or provide a valid user ID.')] });
        }

        const content = args.slice(1).join(' ').trim();
        if (!content) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#dc3545').setTitle('❌ No Message').setDescription('Provide the text to send after the user mention.')] });
        }
        if (content.length > 2000) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#dc3545').setTitle('❌ Message Too Long').setDescription(`Length: ${content.length} / 2000`)] });
        }

        // Determine display name (nickname fallback)
        let displayName = targetUser.username;
        try {
            const member = await message.guild.members.fetch(targetUser.id);
            if (member && member.displayName) displayName = member.displayName;
        } catch {/* not in guild */}

        const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 256 });

        // Initialize cache map on client if missing
        if (!message.client.impersonationWebhooks) {
            message.client.impersonationWebhooks = new Map(); // channelId -> webhook
        }

        // Try to reuse existing webhook for this channel
        let webhook = message.client.impersonationWebhooks.get(message.channel.id);
        if (!webhook) {
            // Attempt to find an existing one named 'Impersonator'
            try {
                const existing = await message.channel.fetchWebhooks();
                webhook = existing.find(w => w.name === 'Impersonator' && w.owner && w.owner.id === message.client.user.id) || null;
            } catch {/* ignore */}
        }
        if (!webhook) {
            try {
                webhook = await message.channel.createWebhook({ name: 'Impersonator', reason: 'Fast impersonation cache' });
            } catch (err) {
                console.error('Failed creating impersonation webhook:', err);
                return message.reply({ embeds: [new EmbedBuilder().setColor('#dc3545').setTitle('❌ Webhook Error').setDescription('Could not create/retrieve webhook. Check channel permissions.')] });
            }
            message.client.impersonationWebhooks.set(message.channel.id, webhook);
        }

        // Delete invoking message first (if we can) to reduce "two messages" visual
        if (message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            message.delete().catch(() => {});
        }

        // Send as webhook
        try {
            await webhook.send({ content, username: displayName, avatarURL });
        } catch (err) {
            console.error('Impersonation send error:', err);
            return message.channel.send({ embeds: [new EmbedBuilder().setColor('#dc3545').setTitle('❌ Send Failed').setDescription('Could not send webhook message.')] }).catch(()=>{});
        }
    },
};
