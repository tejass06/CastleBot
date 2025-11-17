# 🏰 CastleBot - Discord Moderation Bot

A powerful, production-ready Discord moderation bot built with Discord.js v14 and MongoDB.

## ✨ Features

### 🛡️ Moderation Commands
- **Ban/Unban** - Ban or unban users with reasons
- **Kick** - Remove users from the server
- **Mute/Unmute** - Timeout users for specified duration
- **Warn** - Issue warnings to users
- **Warnings** - View user warning history

### ⚙️ Admin Commands
- **Set Mod Role** - Configure which role can use moderation commands
- **Set Log Channel** - Configure where moderation logs are sent

### 📊 Utility Commands
- **Help** - Display all available commands
- **Ping** - Check bot latency
- **Avatar** - Display user avatars
- **Bot Stats** - View bot statistics
- **Translate** 🌐 - Reply-to-translate messages (20+ languages, Indian languages supported!)

### 📝 Logging System
- Automatic moderation action logging
- Embed-based log messages
- Configurable log channel per server

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB (local or Atlas)
- Discord Bot Token

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd CastleBot
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your credentials
   ```

3. **Set up MongoDB:**
   ```bash
   ./setup-mongodb.sh
   # Follow the interactive prompts
   ```

4. **Run pre-flight checks:**
   ```bash
   ./preflight.sh
   ```

5. **Start the bot:**
   ```bash
   npm start
   ```

## 📦 Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start bot
npm run pm2:start

# View status
pm2 status

# View logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop
```

### Auto-restart on server reboot
```bash
pm2 startup
pm2 save
```

## ⚙️ Configuration

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. **Enable "Message Content Intent"** (Required!)
5. Copy the bot token to `.env`
6. Generate invite URL with these permissions:
   - Administrator (or specific: Ban Members, Kick Members, Manage Messages, etc.)

### MongoDB Setup

**Option 1: MongoDB Atlas (Recommended)**
- See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed instructions
- Run `./setup-mongodb.sh` for interactive setup

**Option 2: Local MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Initial Server Configuration

After adding the bot to your server:

1. Set moderator role (Admin only):
   ```
   !setmodrole @Moderator
   ```

2. Set log channel (Admin only):
   ```
   !setlogchannel #mod-logs
   ```

## 📖 Commands Reference

### Admin Commands (Requires Administrator permission)
| Command | Usage | Description |
|---------|-------|-------------|
| `!setmodrole` | `!setmodrole @role` | Set the moderator role |
| `!setlogchannel` | `!setlogchannel #channel` | Set moderation log channel |

### Moderation Commands (Requires Mod Role)
| Command | Usage | Description |
|---------|-------|-------------|
| `!ban` | `!ban @user [reason]` | Ban a user |
| `!unban` | `!unban <userId>` | Unban a user |
| `!kick` | `!kick @user [reason]` | Kick a user |
| `!mute` | `!mute @user <duration> [reason]` | Mute a user |
| `!unmute` | `!unmute @user` | Unmute a user |
| `!warn` | `!warn @user <reason>` | Warn a user |
| `!warnings` | `!warnings @user` | View user warnings |

### Utility Commands (Everyone)
| Command | Usage | Description |
|---------|-------|-------------|
| `!help` | `!help [command]` | Show help information |
| `!ping` | `!ping` | Check bot latency |
| `!avatar` | `!avatar [@user]` | Show user avatar |
| `!botstats` | `!botstats` | Show bot statistics |
| `!translate` | Reply to message + `!translate <lang>` | Translate messages (supports Indian languages!) |

**Mute Duration Examples:**
- `5m` = 5 minutes
- `2h` = 2 hours  
- `1d` = 1 day
- `7d` = 1 week

## 🧪 Testing

See [TESTING.md](TESTING.md) for comprehensive testing procedures.

### Quick Test
```bash
npm start
```

Then in Discord:
```
!ping
!help
!botstats
```

## 📊 Monitoring

### Check Bot Status
```bash
pm2 status
pm2 info castlebot
```

### View Logs
```bash
# Real-time logs
pm2 logs castlebot

# Last 100 lines
pm2 logs castlebot --lines 100

# Error logs only
pm2 logs castlebot --err
```

### Monitor Resources
```bash
pm2 monit
```

## 🏗️ Project Structure

```
CastleBot/
├── commands/           # Command modules
│   ├── admin/         # Admin commands
│   ├── mod/           # Moderation commands
│   ├── stats/         # Statistics commands
│   └── utility/       # Utility commands
├── models/            # MongoDB models
│   ├── guildConfig.js # Server configuration
│   └── userWarnings.js # Warning system
├── utils/             # Utility functions
│   └── modlog.js      # Logging system
├── logs/              # Application logs
├── index.js           # Main bot file
├── package.json       # Dependencies
├── ecosystem.config.json # PM2 configuration
├── .env.example       # Environment template
├── preflight.sh       # Pre-flight checks
├── setup-mongodb.sh   # MongoDB setup helper
├── DEPLOYMENT.md      # Deployment guide
├── TESTING.md         # Testing procedures
└── MONGODB_SETUP.md   # MongoDB setup guide
```

## ✅ Production Readiness Status

**Successfully Tested:**
- ✅ Bot connects to Discord
- ✅ All 13 commands loaded
- ✅ Command syntax validated
- ✅ Error handling implemented
- ✅ Graceful shutdown configured
- ✅ Environment validation
- ✅ Production logging
- ✅ PM2 configuration ready

**Pending Configuration:**
- ⚠️  MongoDB connection (see MONGODB_SETUP.md)
- ⚠️  Discord bot token verification
- ⚠️  Server-specific configuration

## 🔒 Security Best Practices

- ✅ `.env` file excluded from git
- ✅ Environment variable validation
- ✅ Permission checks on commands
- ✅ Input validation
- ✅ Error messages don't expose sensitive info
- ✅ Secure token handling

## 🐛 Troubleshooting

### Bot not responding
1. Check Message Content Intent is enabled
2. Verify bot has proper permissions
3. Check prefix is correct
4. Review logs: `pm2 logs castlebot`

### Database errors
1. Verify MongoDB is running
2. Check MONGO_URI in .env
3. Test connection: `./preflight.sh`

### Permission errors
1. Ensure moderator role is set: `!setmodrole @role`
2. Verify user has the moderator role
3. Check bot role hierarchy

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [TESTING.md](TESTING.md) - Testing procedures
- [MONGODB_SETUP.md](MONGODB_SETUP.md) - MongoDB configuration

## 🤝 Support

For issues:
1. Check the logs: `pm2 logs castlebot`
2. Run pre-flight check: `./preflight.sh`
3. Review documentation in the docs folder

## 📝 License

ISC

---

**Current Status:** Production-ready framework complete. Bot successfully connects to Discord with all commands loaded. MongoDB setup required for full functionality.

**Next Steps:**
1. Configure MongoDB (run `./setup-mongodb.sh`)
2. Verify Discord token
3. Run production deployment
4. Configure servers with `!setmodrole` and `!setlogchannel`
