const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'help',
    description: 'Lists all available commands or info about a specific command.',
    aliases: ['commands', 'h'],
    async execute(message, args, client) {
        const prefix = process.env.PREFIX;

        // If no arguments are provided, show modern dropdown menu
        if (!args.length) {
            // Category emojis
            const categoryEmojis = {
                admin: '👑',
                mod:   '🛡️',
                utility: '🔧',
                stats: '📊',
                voice: '🎙️', 
                fun:   '🎮'
            };

            // Read command folders
            const commandFolders = fs.readdirSync('./commands');
            
            // Build command data (filter out removed/disabled commands)
            const categories = {};
            let totalCommands = 0;

            for (const folder of commandFolders) {
                const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
                const list = [];
                for (const file of commandFiles) {
                    try {
                        const command = require(`../${folder}/${file}`);
                        if (!command || command.removed === true || !command.name) continue;
                        list.push(command);
                        totalCommands++;
                    } catch (err) {
                        // Skip broken command files gracefully
                        console.warn(`⚠️  Failed to load command ${folder}/${file}:`, err.message);
                    }
                }
                categories[folder] = list;
            }

            // Create main embed
            const mainEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({ 
                    name: `${client.user.username} Help Menu`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('🏰 Welcome to CastleBot!')
                .setDescription(
                    `**Your all-in-one moderation & utility bot!**\n\n` +
                    `📝 **Total Commands:** ${totalCommands}\n` +
                    `⚙️ **Prefix:** \`${prefix}\`\n` +
                    `🌐 **Multi-Language Support:** 20+ languages!\n\n` +
                    `**Select a category from the menu below to view commands.**`
                )
                .addFields(
                    { 
                        name: '📚 Quick Links', 
                        value: `• Type \`${prefix}help <command>\` for details\n• Use dropdown menu to browse categories\n• Commands marked with 🔒 need permissions`,
                        inline: false 
                    }
                )
                .setFooter({ 
                    text: `Requested by ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            // Create dropdown menu options
            const selectMenuOptions = commandFolders.map(folder => ({
                label: folder.charAt(0).toUpperCase() + folder.slice(1),
                description: `View all ${folder} commands`,
                value: folder,
                emoji: categoryEmojis[folder] || '📁'
            }));

            // Add "Home" option
            selectMenuOptions.unshift({
                label: 'Home',
                description: 'Return to main help menu',
                value: 'home',
                emoji: '🏠'
            });

            // Create select menu
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('📂 Select a command category')
                .addOptions(selectMenuOptions);

            // Create button row
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Support Server')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.gg/yourserver')
                        .setEmoji('💬'),
                    new ButtonBuilder()
                        .setLabel('Invite Bot')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID')
                        .setEmoji('➕'),
                    new ButtonBuilder()
                        .setCustomId('delete_help')
                        .setLabel('Delete')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🗑️')
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Send the message
            const helpMessage = await message.channel.send({
                embeds: [mainEmbed],
                components: [row, buttons]
            });

            // Create collector for interactions
            const collector = helpMessage.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 300000 // 5 minutes
            });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'delete_help') {
                    await helpMessage.delete();
                    return;
                }

                if (interaction.customId === 'help_menu') {
                    const selected = interaction.values[0];

                    if (selected === 'home') {
                        await interaction.update({ embeds: [mainEmbed], components: [row, buttons] });
                        return;
                    }

                    // Create category embed
                    const categoryCommands = categories[selected] || [];
                    const categoryEmbed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setAuthor({ 
                            name: `${client.user.username} Help Menu`,
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setTitle(`${categoryEmojis[selected] || '📁'} ${selected.charAt(0).toUpperCase() + selected.slice(1)} Commands`)
                        .setDescription(`**${categoryCommands.length} command(s) in this category**\n\nUse \`${prefix}help <command>\` for detailed information.`)
                        .setFooter({ 
                            text: `Requested by ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setTimestamp();

                    // Add commands to embed
                    categoryCommands.forEach(cmd => {
                        const aliases = cmd.aliases ? `(${cmd.aliases.join(', ')})` : '';
                        categoryEmbed.addFields({
                            name: `${prefix}${cmd.name} ${aliases}`,
                            value: cmd.description || 'No description available.',
                            inline: false
                        });
                    });

                    await interaction.update({ embeds: [categoryEmbed], components: [row, buttons] });
                }
            });

            collector.on('end', () => {
                // Disable components after timeout
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        StringSelectMenuBuilder.from(selectMenu).setDisabled(true)
                    );
                const disabledButtons = new ActionRowBuilder()
                    .addComponents(
                        buttons.components.map(btn => 
                            btn.data.style === ButtonStyle.Link ? btn : ButtonBuilder.from(btn).setDisabled(true)
                        )
                    );
                
                helpMessage.edit({ components: [disabledRow, disabledButtons] }).catch(() => {});
            });

            return;
        }

        // If a specific command is asked for (e.g., '!help kick')
        const commandName = args[0].toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            return message.reply('That\'s not a valid command!');
        }

        // Create an embed for the specific command
        const commandEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Command: \`  ${command.name}\``)
            .setDescription(command.description || 'No description available.');

        if (command.aliases) {
            commandEmbed.addFields({ name: 'Aliases', value: `\`${command.aliases.join(', ')}\``, inline: true });
        }

        // A good practice is to add a 'usage' property to your command files
        if (command.usage) {
            commandEmbed.addFields({ name: 'Usage', value: `\`${prefix}${command.name} ${command.usage}\``, inline: true });
        }

        return message.channel.send({ embeds: [commandEmbed] });
    },
};