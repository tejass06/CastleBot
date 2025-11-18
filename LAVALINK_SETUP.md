# 🎧 Lavalink Setup for CastleBot

Lavalink offloads audio playback to a separate Java server for reliability and performance.
This guide shows how to run Lavalink and configure the bot to use it instead of local FFmpeg/play-dl.

## 1) Requirements
- Java 17+ (LTS) or Java 21+ recommended
- Port access (default 2333)

## 2) Quick start (Docker)
```bash
# Pull Lavalink v4 image
docker pull fredboat/lavalink:4

# Create application.yml (minimal)
cat > application.yml <<'YAML'
server:
  port: 2333
lavalink:
  server:
    password: youshallnotpass
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
    filters: true
    resamplingQuality: LOW
logging:
  level:
    root: INFO
YAML

# Run server (mount config)
docker run -d --name lavalink \
  -p 2333:2333 \
  -v $(pwd)/application.yml:/opt/Lavalink/application.yml \
  fredboat/lavalink:4
```

## 3) Quick start (Manual Java)
```bash
# Install Java (Ubuntu)
sudo apt-get update && sudo apt-get install -y openjdk-17-jre-headless

# Download Lavalink.jar (v4)
wget -O Lavalink.jar https://github.com/lavalink-devs/Lavalink/releases/latest/download/Lavalink.jar

# Create application.yml (same as above) and run
java -jar Lavalink.jar
```

## 4) Bot configuration (.env)
Set these variables in your `.env`:
```
LAVALINK_ENABLED=true
LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
# LAVALINK_SECURE=false
```

Alternatively for multiple nodes:
```
LAVALINK_ENABLED=true
LAVALINK_NODES=[
  {"name":"main","host":"127.0.0.1","port":2333,"password":"youshallnotpass","secure":false}
]
```

Or a single URL (ws/wss/http/https accepted):
```
LAVALINK_ENABLED=true
LAVALINK_URL=ws://127.0.0.1:2333
LAVALINK_PASSWORD=youshallnotpass
# LAVALINK_SECURE=false   # set to true if using wss/https
```

## 5) Commands (no change)
Use the same music commands:
- !play <url|search>
- !skip, !stop, !pause, !resume
- !queue, !nowplaying

When Lavalink is enabled, the bot will automatically use it; otherwise it falls back to local playback.

## 6) Troubleshooting
- If the bot says “Unable to join your voice channel (Lavalink)”, ensure the Lavalink container is running and reachable from the bot host.
- If searches return nothing, verify YouTube is enabled in application.yml sources.
- Check logs: container logs (docker logs lavalink) and bot logs for “[Lavalink] Node …” messages.
