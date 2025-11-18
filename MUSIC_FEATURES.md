# 🎵 Music Features

High-quality YouTube/Spotify playback with simple queue controls.

You can use either:
- Local playback (FFmpeg + play-dl) — quick and simple
- Lavalink (recommended for production) — better stability and performance

## Requirements
- Voice intents enabled (already configured)

Local mode:
- System FFmpeg installed and available in PATH
  - Ubuntu/Debian: `sudo apt-get update && sudo apt-get install -y ffmpeg`

Lavalink mode:
- A running Lavalink v4 server (Docker or Java). See LAVALINK_SETUP.md
- .env configuration (example):
  - `LAVALINK_ENABLED=true`
  - `LAVALINK_HOST=127.0.0.1`
  - `LAVALINK_PORT=2333`
  - `LAVALINK_PASSWORD=youshallnotpass`

## Commands
- `!play <url|search>` or `!p` — Add a track (YouTube link, playlist, Spotify track link, or plain search).
- `!skip` or `!s` — Skip the current track.
- `!stop` — Stop and clear queue; disconnects from voice.
- `!pause` — Pause playback.
- `!resume` — Resume playback.
- `!queue` or `!q` — Show the current queue.
- `!nowplaying` or `!np` — Show the currently playing track.

## Notes
- Spotify links are resolved via YouTube search (no direct Spotify stream).
- Auto-disconnects after 60 seconds of idle time to save resources.
- If playback fails for a specific track, it’s skipped and the queue continues.
- When Lavalink is enabled, the bot will prefer it automatically.

## Troubleshooting
- "FFmpeg Not Found": install FFmpeg and restart the bot.
- "Unable to join your voice channel": ensure the bot has Connect and Speak permissions.
- If some YouTube links fail intermittently, try again or use a different link; YouTube changes may require `play-dl` updates.
