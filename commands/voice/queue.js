const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'This command has been removed. Music features are no longer available.',
  aliases: ['q'],
  removed: true,
  async execute(message) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#dc3545')
          .setTitle('❌ Command Removed')
          .setDescription('Music features have been removed from this bot.')
      ]
    });
  }
};
