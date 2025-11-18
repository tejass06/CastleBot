// Test what events Discord.js emits
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const originalEmit = client.emit.bind(client);
client.emit = function(event, ...args) {
  if (event.toLowerCase().includes('ready')) {
    console.log('[Event] client.emit called with:', event);
  }
  return originalEmit(event, ...args);
};

client.once('ready', () => {
  console.log('[Event] ready event received');
  process.exit(0);
});

client.once('clientReady', () => {
  console.log('[Event] clientReady event received');
  process.exit(0);
});

console.log('[Event] Logging in...');
client.login(process.env.TOKEN);

setTimeout(() => {
  console.log('[Event] Timeout - no ready events');
  process.exit(1);
}, 10000);
