# MongoDB Setup for CastleBot

The bot connected to Discord successfully but needs MongoDB for data persistence.

## Option 1: Use MongoDB Atlas (Cloud - Recommended for Production)

**Pros:** Free tier available, managed service, no local setup needed
**Best for:** Production deployment

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Sandbox - Free)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/castlebot?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with your database credentials

---

## Option 2: Install MongoDB Locally

**Pros:** Full control, faster for development
**Best for:** Development and testing

### Ubuntu/Debian:
```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### Using Docker (Alternative):
```bash
# Run MongoDB in Docker container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Update .env to:
# MONGO_URI=mongodb://admin:password@localhost:27017/castlebot?authSource=admin
```

---

## Option 3: Development Mode (In-Memory - Testing Only)

For quick testing without MongoDB, you can temporarily disable database features:

**Note:** This is NOT recommended for production and will lose all data on restart.

---

## Verifying MongoDB Connection

After setting up MongoDB, verify the connection:

```bash
# Run the preflight check
./preflight.sh

# Or test the bot
npm start
```

You should see:
```
✅ Connected to MongoDB successfully!
```

---

## Current Status

✅ Bot successfully connects to Discord
✅ All 13 commands loaded correctly
✅ Bot is serving 1 server with 3 users
✅ All code syntax is valid
⚠️  MongoDB connection needed for data persistence

---

## Quick Start (After MongoDB Setup)

```bash
# Development
npm start

# Production with PM2
npm run pm2:start

# View logs
npm run pm2:logs

# Stop
npm run pm2:stop
```

---

## What Works Without MongoDB?

These commands will work:
- `!ping` - Check bot latency
- `!help` - Show commands
- `!avatar` - Show avatars
- `!botstats` - Basic stats

These commands NEED MongoDB:
- All moderation commands (ban, kick, mute, warn)
- Admin commands (setmodrole, setlogchannel)
- Warning system
- Moderation logs

---

## Recommended for Production

**Use MongoDB Atlas (Option 1)** because:
- Free tier is generous
- Automatic backups
- High availability
- No server maintenance
- Secure by default
- Easy to scale

Takes only 5 minutes to set up!
