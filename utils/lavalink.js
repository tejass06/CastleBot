const { Shoukaku } = require('shoukaku');
const DiscordJSFixed = require('./DiscordJSConnector');
const { EmbedBuilder } = require('discord.js');

function normalizeUrlParts(inputHost, inputPort, inputUrl, inputSecure) {
  // If URL provided, attempt to parse protocol and port
  if (inputUrl) {
    try {
      let u = inputUrl.trim();
      // Allow schemes ws/wss/http/https
      if (!/^wss?:\/\//i.test(u) && !/^https?:\/\//i.test(u)) {
        // No scheme provided, assume ws/http based on secure flag
        const scheme = inputSecure ? 'wss://' : 'ws://';
        u = scheme + u;
      }
      const urlObj = new URL(u);
      const host = urlObj.hostname;
      const port = urlObj.port || (urlObj.protocol === 'wss:' || urlObj.protocol === 'https:' ? '443' : '80');
      const secure = inputSecure != null ? !!inputSecure : (urlObj.protocol === 'wss:' || urlObj.protocol === 'https:');
      return { host, port, secure };
    } catch (e) {
      console.warn('[Lavalink] Could not parse LAVALINK_URL, falling back to host/port:', e.message);
    }
  }
  // Fallback to host & port
  if (inputHost && inputPort) {
    return { host: inputHost, port: inputPort, secure: !!inputSecure };
  }
  return null;
}

function parseNodesFromEnv() {
  // Check if LAVALINK_NODES is set as a JSON array
  const nodesStr = process.env.LAVALINK_NODES;
  if (nodesStr && nodesStr.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(nodesStr);
      return parsed.map(node => {
        const parts = normalizeUrlParts(node.url || `${node.hostname || node.host}:${node.port}`);
        return {
          name: node.name || 'lavalink-node',
          url: `${parts.host}:${parts.port}`,
          auth: node.auth || node.password || 'youshallnotpass',
          secure: node.secure !== undefined ? node.secure : parts.secure
        };
      });
    } catch (error) {
      console.error('[Lavalink] Failed to parse LAVALINK_NODES JSON:', error.message);
      return [];
    }
  }

  // Otherwise try individual env vars
  const host = process.env.LAVALINK_HOST;
  const port = parseInt(process.env.LAVALINK_PORT || '2333', 10);
  const password = (process.env.LAVALINK_PASSWORD || 'youshallnotpass').trim().replace(/^["']|["']$/g, '');
  const secure = (process.env.LAVALINK_SECURE === 'true');

  if (!host) return [];

  return [{
    name: 'lavalink-node',
    url: `${host}:${port}`,
    auth: password,
    secure
  }];
}

class GuildQueue {
  constructor(manager, guildId) {
    this.manager = manager;
    this.guildId = guildId;
    this.tracks = [];
    this.player = null;
    this.textChannel = null;
    this.nowPlaying = null;
    this.bound = false;
  }

  async connect(voiceChannel) {
    const node = this.manager.getNode();
    if (!node) throw new Error('No Lavalink nodes are connected');
    
    // In Shoukaku v4, use joinVoiceChannel on the Shoukaku instance, not the node
    const player = await this.manager.client.shoukaku.joinVoiceChannel({
      guildId: voiceChannel.guild.id,
      channelId: voiceChannel.id,
      shardId: voiceChannel.guild.shardId,
      deaf: true,
      mute: false
    });
    
    this.player = player;
    if (!this.bound) {
      this.bound = true;
      player.on('start', () => {
        console.log('[Lavalink] Track started playing');
      });
      player.on('end', (data) => {
        console.log('[Lavalink] Track ended:', data?.reason);
        this._onEnd();
      });
      player.on('closed', (data) => {
        console.log('[Lavalink] Player closed:', data);
        this._onEnd();
      });
      player.on('stuck', (data) => {
        console.log('[Lavalink] Track stuck:', data);
        this._onEnd();
      });
      player.on('exception', (data) => {
        console.error('[Lavalink] Track exception:', data);
        // Notify user of the failure
        if (this.textChannel) {
          const reason = data?.exception?.message || 'Unknown error';
          const track = data?.track?.info?.title || 'Unknown track';
          this.textChannel.send({
            embeds: [new EmbedBuilder()
              .setColor('#ffc107')
              .setTitle('⚠️ Track Failed')
              .setDescription(`**${track}**\nReason: ${reason}`)
              .setFooter({ text: 'Skipping to next track...' })
            ]
          }).catch(() => {});
        }
        this._onEnd();
      });
      player.on('update', (data) => {
        // Periodic position updates
      });
    }
    return player;
  }

  enqueue(track) {
    this.tracks.push(track);
  }

  async playNext() {
    if (!this.player) {
      console.log('[Lavalink] playNext: No player available');
      return;
    }
    if (!this.tracks.length) {
      this.nowPlaying = null;
      // Optionally disconnect after idle
            setTimeout(() => {
        if (!this.tracks.length && !this.nowPlaying) {
          try { 
            this.manager.client.shoukaku.leaveVoiceChannel(this.guildId);
            this.player = null;
          } catch {}
        }
      }, 60000);
      return;
    }
    const next = this.tracks.shift();
    this.nowPlaying = next;
    try {
      const encoded = next.encoded || next.track || next.encodedTrack;
      if (!encoded) throw new Error('Invalid lavalink track payload');
      
      console.log('[Lavalink] Playing track:', next.info?.title);
      console.log('[Lavalink] Track encoded:', encoded.substring(0, 50) + '...');
      
      // Lavalink v4 requires track to be wrapped in an object
      await this.player.playTrack({ 
        track: { encoded: encoded }
      });
      
      console.log('[Lavalink] playTrack() call completed successfully');
      
      if (this.textChannel) {
        const title = next.info?.title || 'Unknown Title';
        const uri = next.info?.uri || next.info?.url || '';
        this.textChannel.send({ embeds: [ new EmbedBuilder().setColor('#28a745').setTitle('▶️ Now Playing').setDescription(`**${title}**\n${uri}`) ]}).catch(()=>{});
      }
    } catch (e) {
      console.error('[Lavalink] playNext error:', e);
      this.playNext();
    }
  }

  async skip() {
    if (!this.player) return false;
    try { await this.player.stopTrack(); return true; } catch { return false; }
  }

  async stop() {
    if (!this.player) return;
    this.tracks = [];
    try { await this.player.stopTrack(); } catch {}
    try { 
      // Use Shoukaku instance's leaveVoiceChannel method
      await this.manager.client.shoukaku.leaveVoiceChannel(this.guildId);
    } catch {}
    this.nowPlaying = null;
    this.player = null;
  }

  async pause() {
    if (!this.player) return false;
    try { await this.player.setPaused(true); return true; } catch { return false; }
  }

  async resume() {
    if (!this.player) return false;
    try { await this.player.setPaused(false); return true; } catch { return false; }
  }

  _onEnd() {
    this.nowPlaying = null;
    // Auto-advance
    this.playNext();
  }
}

class LavalinkManager {
  constructor(client) {
    this.client = client;
    this.queues = new Map();
    this.nodes = parseNodesFromEnv();
    this.enabled = (process.env.LAVALINK_ENABLED === 'true') && this.nodes.length > 0;

    if (!this.enabled) {
      console.warn('[Lavalink] Disabled or nodes not configured. Set LAVALINK_ENABLED=true and nodes in env.');
      return;
    }

    const options = {
      moveOnDisconnect: true,
      resume: false,
      resumeTimeout: 30,
      resumeByLibrary: false,
      reconnectTries: Infinity,
      reconnectInterval: 5,
      restTimeout: 60
    };

    const connector = new DiscordJSFixed(client);
    console.log('[Lavalink] Configured nodes:', this.nodes.map(n => `${n.name} (${n.url}) secure=${n.secure}`).join(', ') || '(none)');
    const shoukaku = new Shoukaku(connector, this.nodes, options);
    client.shoukaku = shoukaku;

    shoukaku.on('ready', (name) => console.log(`[Lavalink] Node ${name} is ready`));
    shoukaku.on('error', (name, error) => console.error(`[Lavalink] Node ${name} error:`, error));
    shoukaku.on('close', (name, code, reason) => console.warn(`[Lavalink] Node ${name} closed: ${code} ${reason || ''}`));
    shoukaku.on('disconnect', (name, reason) => console.warn(`[Lavalink] Node ${name} disconnected: ${reason || ''}`));
    shoukaku.on('debug', (name, info) => {
      if (info.includes('Connecting') || info.includes('Connection') || info.includes('Failed') || info.includes('ready')) {
        console.log(`[Lavalink] Node ${name} debug:`, info);
      }
    });
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) this.queues.set(guildId, new GuildQueue(this, guildId));
    return this.queues.get(guildId);
  }

  async search(query) {
    if (!this.enabled) return { ok: false, loadType: 'DISABLED', tracks: [], message: 'Lavalink disabled' };
    const node = this.getNode();
    if (!node) return { ok: false, loadType: 'NO_NODE', tracks: [], message: 'No connected Lavalink node' };
    const isUrl = /^https?:\/\//.test(query);

    const tryResolve = async (q) => {
      try {
        console.log('[Lavalink] Searching with query:', q);
        const res = await node.rest.resolve(q);
        console.log('[Lavalink] Search response type:', res?.type || res?.loadType);
        console.log('[Lavalink] Raw response:', JSON.stringify(res, null, 2).substring(0, 500));
        const loadType = res?.type || res?.loadType || 'SEARCH_RESULT';
        
        // Handle error responses
        if (loadType === 'error' || res?.exception) {
          const errorMsg = res?.exception?.message || res?.message || 'Unknown error';
          console.error('[Lavalink] Search returned error:', errorMsg);
          console.error('[Lavalink] Full error response:', JSON.stringify(res, null, 2));
          return { loadType, tracks: [], error: errorMsg };
        }
        
        let tracks = res?.data || res?.tracks || [];
        console.log('[Lavalink] Tracks found:', Array.isArray(tracks) ? tracks.length : 0);
        
        // Ensure tracks is an array
        if (!Array.isArray(tracks)) {
          console.warn('[Lavalink] Tracks is not an array:', typeof tracks);
          tracks = [];
        }
        
        // Filter out tracks that are likely age-restricted (common patterns)
        const beforeFilter = tracks.length;
        tracks = tracks.filter(t => {
          const title = (t?.info?.title || '').toLowerCase();
          const author = (t?.info?.author || '').toLowerCase();
          
          // Skip music label channels (often have restrictions)
          const restrictedChannels = ['t-series', 'tseries', 'vevo', 'zee music', 'sony music'];
          if (restrictedChannels.some(channel => author.includes(channel))) {
            return false;
          }
          
          // Skip if title contains "official video" from major labels
          if (title.includes('official video') && restrictedChannels.some(channel => author.includes(channel))) {
            return false;
          }
          
          return true;
        });
        
        if (beforeFilter > tracks.length) {
          console.log(`[Lavalink] Filtered out ${beforeFilter - tracks.length} potentially age-restricted tracks`);
        }
        
        // Log source distribution
        if (tracks.length > 0) {
          const sources = tracks.map(t => t?.info?.sourceName || 'unknown');
          const sourceCounts = {};
          sources.forEach(s => sourceCounts[s] = (sourceCounts[s] || 0) + 1);
          console.log('[Lavalink] Track sources:', sourceCounts);
        }
        
        return { loadType, tracks, rawResponse: res };
      } catch (e) {
        console.error('[Lavalink] tryResolve error:', e);
        return { loadType: 'LOAD_FAILED', tracks: [] };
      }
    };

    try {
      if (isUrl) {
        const out = await tryResolve(query);
        return { ok: (out.tracks?.length || 0) > 0, ...out };
      }
      
      // Try Spotify search first
      let out = await tryResolve(`spsearch:${query}`);
      if ((out.tracks?.length || 0) > 0) {
        console.log('[Lavalink] Using Spotify results');
        return { ok: true, ...out };
      }
      
      // Spotify failed, try with different format (artist - song)
      console.log('[Lavalink] Trying Spotify with enhanced query...');
      out = await tryResolve(`sprec:${query}`);
      if ((out.tracks?.length || 0) > 0) {
        console.log('[Lavalink] Using Spotify recommendations');
        return { ok: true, ...out };
      }
      
      // If Spotify doesn't work, try YouTube Music (fewer restrictions than YouTube)
      console.log('[Lavalink] Spotify returned no results, trying YouTube Music...');
      out = await tryResolve(`ytmsearch:${query}`);
      
      if ((out.tracks?.length || 0) > 0) {
        console.log('[Lavalink] Using YouTube Music results');
        return { ok: true, ...out };
      }
      
      // Last resort: Regular YouTube with heavy filtering
      console.log('[Lavalink] YouTube Music returned no results, trying regular YouTube...');
      out = await tryResolve(`ytsearch:${query}`);
      
      // Filter out age-restricted videos more aggressively
      if (out.tracks && out.tracks.length > 0) {
        const originalCount = out.tracks.length;
        out.tracks = out.tracks.filter(t => {
          const author = (t?.info?.author || '').toLowerCase();
          const title = (t?.info?.title || '').toLowerCase();
          
          // Filter out major labels and common restricted patterns
          const blockedChannels = ['vevo', 't-series', 'tseries', 'sony music', 'zee music', 
                                   'tips official', 'tips music', 'gaane filmi', 'ultra music',
                                   'warner music', 'universal music'];
          
          const hasBlockedChannel = blockedChannels.some(channel => author.includes(channel));
          const hasOfficialVideo = title.includes('official') || title.includes('lyrical video');
          
          // Keep only non-official, non-label uploads
          return !hasBlockedChannel && !hasOfficialVideo;
        });
        console.log(`[Lavalink] Filtered ${originalCount - out.tracks.length} potentially restricted videos`);
      }
      
      if ((out.tracks?.length || 0) > 0) {
        console.log('[Lavalink] Using filtered YouTube results');
        return { ok: true, ...out };
      }
      
      console.log('[Lavalink] No results found on any platform');
      return { ok: false, loadType: 'NO_MATCHES', tracks: [], message: 'No tracks found. Try a more specific search with artist name.' };
    } catch (e) {
      console.error('[Lavalink] search error:', e);
      return { ok: false, loadType: 'LOAD_FAILED', tracks: [], message: e?.message || 'Search failed' };
    }
  }

  getNode() {
    try {
      const nodes = this.client.shoukaku?.nodes;
      if (!nodes || nodes.size === 0) return null;
      // Prefer a connected node if available (state: 1=CONNECTED)
      for (const node of nodes.values()) {
        if (node?.state === 1 || node?.connected === true) return node;
      }
      // Fallback to first node
      return nodes.values().next().value || null;
    } catch {
      return null;
    }
  }

  isConnected() {
    try {
      const nodes = this.client.shoukaku?.nodes;
      if (!nodes || nodes.size === 0) return false;
      for (const node of nodes.values()) {
        // State is a number: 0=CONNECTING, 1=CONNECTED, 2=DISCONNECTING, 3=IDLE
        if (node?.state === 1 || node?.connected === true) return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

function createLavalinkManager(client) {
  return new LavalinkManager(client);
}

module.exports = { createLavalinkManager };
