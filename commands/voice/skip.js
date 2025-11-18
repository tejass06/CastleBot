const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'skip',
  description: 'This command has been removed. Music features are no longer available.',
  aliases: ['s', 'next'],
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
