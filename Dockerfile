# CastleBot - Production container (no music, TTS-only)
# Uses Node 22 LTS to satisfy @discordjs/voice engine
FROM node:22-alpine

# Install runtime tools
RUN apk add --no-cache ffmpeg

# Workdir
WORKDIR /app

# Install dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --only=production --no-audit --no-fund

# Copy source
COPY . .

# Default environment (override in Azure)
# ENV PREFIX=!

# Run the bot
CMD ["node", "index.js"]
