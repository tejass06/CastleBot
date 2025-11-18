// Custom Shoukaku connector for Discord.js v14 that fixes the ready event bug
const { Connector } = require('shoukaku');

class DiscordJSFixed extends Connector {
  sendPacket(shardId, payload, important) {
    return this.client.ws.shards.get(shardId)?.send(payload, important);
  }

  getId() {
    return this.client.user.id;
  }

  // Fixed: Discord.js emits "ready", not "clientReady"
  listen(nodes) {
    this.client.once("ready", () => this.ready(nodes));
    this.client.on("raw", (packet) => this.raw(packet));
  }
}

module.exports = DiscordJSFixed;
