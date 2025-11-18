# CastleBot - Production Deployment Guide

## Quick Links

- **Local/VPS Deployment**: See below
- **Azure App Service**: See [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)
- **Docker Deployment**: See Docker section below

## Prerequisites

1. **Node.js**: Version 20.x or higher
2. **MongoDB**: Running instance (local or cloud)
3. **Discord Bot Token**: From Discord Developer Portal
4. **Discord Bot Permissions**: 
   - Administrator (or specific permissions: Ban Members, Kick Members, Manage Messages, etc.)
   - Message Content Intent enabled in Discord Developer Portal

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
TOKEN=your_actual_discord_bot_token
PREFIX=!
MONGO_URI=mongodb://localhost:27017/castlebot
NODE_ENV=production
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string and update MONGO_URI in .env

### 4. Discord Bot Setup

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the token and add to .env
5. Enable "Message Content Intent" under Privileged Gateway Intents
6. Generate invite URL with proper permissions

## Running the Bot

### Development Mode
```bash
npm start
```

### Production Mode with PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the bot
pm2 start index.js --name castlebot

# View logs
pm2 logs castlebot

# Monitor
pm2 monit

# Auto-restart on system reboot
pm2 startup
pm2 save
```

## Initial Bot Configuration

Once the bot is running and added to your Discord server:

1. **Set Moderator Role**:
   ```
   !setmodrole @ModeratorRole
   ```

2. **Set Log Channel** (optional):
   ```
   !setlogchannel #mod-logs
   ```

## Available Commands

### Admin Commands
- `!setmodrole @role` - Set the moderator role
- `!setlogchannel #channel` - Set the moderation log channel

### Moderation Commands
- `!ban @user [reason]` - Ban a user
- `!kick @user [reason]` - Kick a user
- `!mute @user [duration] [reason]` - Mute a user
- `!unmute @user` - Unmute a user
- `!unban <userId>` - Unban a user
- `!warn @user <reason>` - Warn a user
- `!warnings @user` - View user warnings

### Utility Commands
- `!help [command]` - Show help information
- `!ping` - Check bot latency
- `!avatar [@user]` - Show user avatar
- `!botstats` - Show bot statistics

## Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] Bot has proper Discord permissions
- [ ] Message Content Intent enabled
- [ ] Moderator role set in each server
- [ ] Log channel configured (optional)
- [ ] PM2 or similar process manager configured
- [ ] Monitoring and logging in place
- [ ] Regular backups of MongoDB data

## Troubleshooting

### Bot not responding
- Check if Message Content Intent is enabled
- Verify TOKEN is correct in .env
- Check bot has proper permissions in server

### Database errors
- Verify MongoDB is running: `sudo systemctl status mongodb`
- Check MONGO_URI is correct
- Ensure MongoDB has proper disk space

### Commands not working
- Verify prefix is correct
- Check user has moderator role
- Review bot logs for errors

## Monitoring

View logs with PM2:
```bash
pm2 logs castlebot --lines 100
```

Check bot status:
```bash
pm2 status
```

Restart bot:
```bash
pm2 restart castlebot
```

## Security Best Practices

1. Never commit .env file to git
2. Use strong, unique bot token
3. Limit bot permissions to only what's needed
4. Regularly update dependencies: `npm update`
5. Monitor logs for suspicious activity
6. Keep MongoDB secure with authentication

## Support

For issues or questions, check the logs first:
```bash
pm2 logs castlebot
```

Common error messages are displayed with emoji indicators:
- ✅ Success
- ❌ Error
- ⚠️  Warning
- 🔄 Processing
