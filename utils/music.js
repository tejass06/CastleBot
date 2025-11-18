const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const play = require('play-dl');
const { spawnSync } = require('node:child_process');

function isValidHttpUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

class MusicQueue {
  constructor(guildId) {
    this.guildId = guildId;
    this.tracks = [];
    this.connection = null;
    this.player = createAudioPlayer();
    this.textChannel = null;
    this.voiceChannel = null;
    this.nowPlaying = null;
    this.volume = 1.0; // reserved for future use
    this.bindPlayerEvents();
  }

  bindPlayerEvents() {
    this.player.on(AudioPlayerStatus.Idle, () => {
      this.nowPlaying = null;
      this.playNext();
    });

    this.player.on('error', (err) => {
      console.error('[Music] Player error:', err);
      this.playNext();
    });
  }

  async connect(voiceChannel) {
    if (this.connection && this.connection.joinConfig.channelId === voiceChannel.id) return this.connection;
    if (this.connection) {
      try { this.connection.destroy(); } catch {}
      this.connection = null;
    }

    this.voiceChannel = voiceChannel;
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: true,
    });
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    } catch (e) {
      connection.destroy();
      throw new Error('Failed to join voice channel');
    }
    connection.subscribe(this.player);
    this.connection = connection;
    return connection;
  }

  enqueue(track) {
    this.tracks.push(track);
  }

  async playNext() {
    if (!this.tracks.length) {
      // Leave channel after idle delay
      setTimeout(() => {
        if (!this.tracks.length && this.connection) {
          try { this.connection.destroy(); } catch {}
          this.connection = null;
        }
      }, 60_000);
      return;
    }
    const next = this.tracks.shift();
    this.nowPlaying = next;
    try {
      // Validate track URL before attempting to stream
      if (!next || !next.url || !isValidHttpUrl(next.url)) {
        throw new Error('Invalid track: bad URL');
      }

      // Get playable stream from URL
      const s = await play.stream(next.url, { discordPlayerCompatibility: true, quality: 2, seek: 0 });
      const resource = createAudioResource(s.stream, { inputType: s.type });
      this.player.play(resource);
    } catch (err) {
      console.error('[Music] Streaming error:', err);
      // Announce skip
      if (this.textChannel) {
        const reason = err?.message?.includes('Invalid track') ? 'Invalid track data' : 'Playback error';
        this.textChannel.send({ embeds: [ new EmbedBuilder().setColor('#dc3545').setTitle('⏭️ Skipped').setDescription(`${reason}: ${next?.title || next?.url || 'unknown'}`) ] }).catch(()=>{});
      }
      this.playNext();
    }
  }
}

class MusicManager {
  constructor(client) {
    this.client = client;
    this.queues = new Map(); // guildId -> MusicQueue
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) this.queues.set(guildId, new MusicQueue(guildId));
    return this.queues.get(guildId);
  }
}

function checkFFmpeg() {
  const res = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  return res.status === 0;
}

async function resolveQuery(query) {
  try {
    // Normalize query
    if (typeof query !== 'string') query = String(query || '').trim();
    if (!query) return [];

    if (play.yt_validate(query) === 'video') {
      const info = await play.video_info(query);
      const details = info.video_details;
      const url = details.url || details.video_url || details.shortUrl || (details.id && `https://www.youtube.com/watch?v=${details.id}`);
      const track = { title: details.title, url, durationInSec: details.durationInSec };
      return isValidHttpUrl(track.url) ? [track] : [];
    }

    if (play.yt_validate(query) === 'playlist') {
      const playlist = await play.playlist_info(query, { incomplete: true });
      const videos = await playlist.all_videos();
      return videos
        .map(v => ({ title: v.title, url: v.url || v.video_url || v.shortUrl || (v.id && `https://www.youtube.com/watch?v=${v.id}`), durationInSec: v.durationInSec }))
        .filter(t => isValidHttpUrl(t.url));
    }

    // Spotify links will be searched on YouTube
    if (play.sp_validate(query) === 'track') {
      const sp = await play.spotify(query);
      const search = await play.search(`${sp.name} ${sp.artists[0].name}`, { limit: 1 });
      if (search.length) {
        const r = search[0];
        const url = r.url || r.permalink || r.link || (r.id && `https://www.youtube.com/watch?v=${r.id}`);
        if (isValidHttpUrl(url)) return [{ title: r.title, url, durationInSec: r.durationInSec }];
      }
    }

    // Generic search (prefer YouTube videos)
    let results = await play.search(query, { limit: 3, source: { youtube: 'video' } });
    if (!Array.isArray(results) || results.length === 0) {
      // Fallback: generic search
      results = await play.search(query, { limit: 3 });
    }

    for (const r of results || []) {
      let url = r.url || r.permalink || r.link;
      // Handle various id shapes
      if (!url && r.id) {
        const vid = typeof r.id === 'string' ? r.id : (r.id.videoId || r.id.id || r.id.value);
        if (vid) url = `https://www.youtube.com/watch?v=${vid}`;
      }
      if (isValidHttpUrl(url)) {
        return [{ title: r.title || r.name || 'Unknown Title', url, durationInSec: r.durationInSec || r.durationInSec === 0 ? r.durationInSec : undefined }];
      }
    }
    return [];
  } catch (e) {
    console.error('[Music] resolveQuery error:', e);
    return [];
  }
}

module.exports = { MusicManager, resolveQuery, checkFFmpeg };
