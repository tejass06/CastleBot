#!/bin/bash
# Azure startup script
cd /home/site/wwwroot

# Install dependencies if node_modules doesn't exist or is incomplete
if [ ! -d "node_modules" ] || [ ! -d "node_modules/discord.js" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Start the bot
echo "Starting Discord bot..."
node index.js
