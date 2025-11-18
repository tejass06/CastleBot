// Quick Lavalink connection test
const { Shoukaku, Connectors } = require('shoukaku');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const nodes = [
  {
    name: 'test-node',
    url: '20.38.34.253:2333',
    auth: 'youshallnotpass',
    secure: false
  }
];

console.log('[Test] Connecting with config:', JSON.stringify(nodes, null, 2));

client.once('ready', () => {
  console.log('[Test] Discord client ready, now creating Shoukaku...');
  
  const options = {
    moveOnDisconnect: false,
    reconnectTries: 3,
    reconnectInterval: 5,
    restTimeout: 10000,
    resume: false,
    resumeByLibrary: false
  };

  const shoukaku = new Shoukaku(
    new Connectors.DiscordJS(client),
    nodes,
    options
  );

  shoukaku.on('ready', (name) => {
    console.log(`✅ [Test] Node ${name} is READY!`);
    process.exit(0);
  });

  shoukaku.on('error', (name, error) => {
    console.error(`❌ [Test] Node ${name} error:`, error.message || error);
  });

  shoukaku.on('close', (name, code, reason) => {
    console.warn(`⚠️  [Test] Node ${name} closed: code=${code} reason=${reason || 'none'}`);
  });

  shoukaku.on('disconnect', (name, reason) => {
    console.warn(`⚠️  [Test] Node ${name} disconnected: ${reason || 'unknown'}`);
  });

  shoukaku.on('debug', (name, info) => {
    console.log(`🔍 [Test] Node ${name} debug:`, info);
  });

  setTimeout(() => {
    console.log('❌ [Test] Timeout after 10s - no connection established');
    try {
      const nodes = shoukaku.nodes;
      console.log('[Test] Node states (size:', nodes.size, '):');
      for (const [name, node] of nodes) {
        console.log(`  - ${name}: state=${node.state}, connected=${node.connected}`);
      }
      if (nodes.size === 0) {
        console.log('[Test] ⚠️  No nodes were created! This suggests a Shoukaku version/config mismatch.');
      }
    } catch (err) {
      console.error('[Test] Error checking nodes:', err.message);
    }
    process.exit(1);
  }, 10000);
});

client.login(process.env.TOKEN);

const options = {
  moveOnDisconnect: false,
  reconnectTries: 3,
  reconnectInterval: 5,
  restTimeout: 10000,
  resume: false,
  resumeByLibrary: false
};

const shoukaku = new Shoukaku(
  new Connectors.DiscordJS(client),
  nodes,
  options
);

shoukaku.on('ready', (name) => {
  console.log(`✅ [Test] Node ${name} is READY!`);
  process.exit(0);
});

shoukaku.on('error', (name, error) => {
  console.error(`❌ [Test] Node ${name} error:`, error.message || error);
});

shoukaku.on('close', (name, code, reason) => {
  console.warn(`⚠️  [Test] Node ${name} closed: code=${code} reason=${reason || 'none'}`);
});

shoukaku.on('disconnect', (name, reason) => {
  console.warn(`⚠️  [Test] Node ${name} disconnected: ${reason || 'unknown'}`);
});

shoukaku.on('debug', (name, info) => {
  console.log(`🔍 [Test] Node ${name} debug:`, info);
});

client.once('ready', () => {
  console.log('[Test] Discord client ready, waiting for Lavalink...');
});

setTimeout(() => {
  console.log('❌ [Test] Timeout after 10s - no connection established');
  try {
    const nodes = shoukaku.nodes;
    console.log('[Test] Node states (size:', nodes.size, '):');
    for (const [name, node] of nodes) {
      console.log(`  - ${name}: state=${node.state}, connected=${node.connected}`);
    }
    if (nodes.size === 0) {
      console.log('[Test] ⚠️  No nodes were created! This suggests a Shoukaku version/config mismatch.');
    }
  } catch (e) {
    console.error('[Test] Error checking nodes:', e.message);
  }
  process.exit(1);
}, 10000);

client.login(process.env.TOKEN);
