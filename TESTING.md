# CastleBot Testing Guide

## Pre-Production Testing Checklist

### 1. Environment Setup ✓
- [x] Dependencies installed
- [x] .env file configured
- [x] MongoDB connection string set
- [x] Discord bot token configured
- [x] All command files loaded

### 2. Bot Testing Procedure

#### A. Basic Connectivity Test
1. Start the bot: `npm start`
2. Verify console shows:
   - ✅ Bot is online
   - ✅ Connected to MongoDB
   - ✅ Commands loaded count
   - Server and user count

#### B. Command Testing

**Utility Commands (No permissions required):**
- `!ping` - Should return latency
- `!help` - Should show all commands
- `!help ping` - Should show specific command info
- `!avatar` - Should show your avatar
- `!avatar @user` - Should show mentioned user's avatar
- `!botstats` - Should show bot statistics

**Admin Commands (Requires admin permissions):**
- `!setmodrole @ModRole` - Set moderator role
- `!setlogchannel #log-channel` - Set log channel

**Moderation Commands (Requires mod role):**
- `!warn @user test warning` - Add a warning
- `!warnings @user` - View warnings
- `!kick @user test kick` - Kick user (be careful!)
- `!mute @user 10m test mute` - Mute user
- `!unmute @user` - Unmute user
- `!ban @user test ban` - Ban user (be careful!)
- `!unban <userId>` - Unban user

### 3. Error Handling Tests

Test the following scenarios:
- [ ] Command without permissions
- [ ] Invalid command syntax
- [ ] Missing parameters
- [ ] Invalid user mentions
- [ ] Non-existent users
- [ ] Bot offline and reconnect
- [ ] Database connection loss

### 4. Production Readiness Checklist

- [ ] All commands work as expected
- [ ] Error messages are user-friendly
- [ ] Logs are being written correctly
- [ ] MongoDB data persists correctly
- [ ] Bot reconnects after disconnect
- [ ] Moderation logs appear in log channel
- [ ] Warning system stores data
- [ ] Guild configs save properly

### 5. Performance Testing

Monitor the following:
- [ ] Memory usage stays reasonable
- [ ] Response time is acceptable
- [ ] No memory leaks over time
- [ ] Database queries are efficient

### 6. Security Checks

- [ ] .env file is not committed to git
- [ ] Bot token is secure
- [ ] MongoDB credentials are secure
- [ ] Permissions are properly restricted
- [ ] Input validation works

## Running Tests

### Quick Test (Development)
```bash
npm start
```

Then test basic commands in Discord:
- !ping
- !help
- !botstats

### Production Test with PM2
```bash
# Start with PM2
npm run pm2:start

# Check status
pm2 status

# View logs
npm run pm2:logs

# Monitor resources
pm2 monit
```

### Load Testing
1. Invite bot to multiple servers
2. Run commands simultaneously
3. Monitor: `pm2 monit`
4. Check memory usage
5. Verify all responses are correct

## Test Scenarios

### Scenario 1: New Server Setup
1. Invite bot to test server
2. Run `!help` - should work
3. Run `!setmodrole @ModRole` (as admin)
4. Run `!setlogchannel #logs` (as admin)
5. Test moderation commands with mod role

### Scenario 2: Moderation Flow
1. Assign yourself mod role
2. Warn a test user: `!warn @testuser Test warning`
3. Check warnings: `!warnings @testuser`
4. Verify log appears in log channel
5. Mute user: `!mute @testuser 5m Testing`
6. Unmute user: `!unmute @testuser`

### Scenario 3: Error Recovery
1. Stop MongoDB
2. Run a command that needs DB
3. Check error handling
4. Restart MongoDB
5. Verify bot reconnects

### Scenario 4: Bot Restart
1. Run `pm2 restart castlebot`
2. Verify bot comes back online
3. Test that commands still work
4. Check that DB connection restored

## Expected Behaviors

### Successful Bot Start
```
🔄 Logging in to Discord...
✅ Loaded 13 commands successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bot is online!
🤖 Logged in as: YourBot#1234
📊 Serving X server(s)
👥 Watching X user(s)
⚙️  Prefix: !
📝 Commands loaded: 13
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Connected to MongoDB successfully!
```

### Successful Command Execution
- User gets a response within 1-2 seconds
- Response is formatted with embeds
- Logs appear in mod-log channel (if configured)
- No errors in console

### Expected Error Messages
- Permission denied messages when user lacks role
- Helpful error messages for wrong syntax
- Database errors logged to console
- User-friendly error messages in Discord

## Monitoring in Production

### Daily Checks
```bash
pm2 status              # Check if bot is running
pm2 logs castlebot --lines 50  # Check recent logs
```

### Weekly Checks
```bash
# Check memory usage
pm2 info castlebot

# Check log file sizes
ls -lh logs/

# Backup database
mongodump --uri="$MONGO_URI" --out=./backups/$(date +%Y%m%d)
```

### Monthly Checks
- Update dependencies: `npm update`
- Review and clear old logs
- Check for Discord.js updates
- Review moderation patterns
- Optimize database if needed

## Troubleshooting

### Bot doesn't start
1. Check .env configuration
2. Verify Discord token is valid
3. Check MongoDB connection
4. Review error logs

### Commands don't work
1. Verify Message Content Intent is enabled
2. Check bot has permissions in channel
3. Verify prefix is correct
4. Check user has required role

### Database errors
1. Check MongoDB is running
2. Verify MONGO_URI is correct
3. Check network connectivity
4. Review MongoDB logs

## Success Criteria

Bot is production-ready when:
- ✅ All commands respond correctly
- ✅ Error handling is graceful
- ✅ Logs are comprehensive
- ✅ Performance is stable
- ✅ Security measures in place
- ✅ Documentation is complete
- ✅ Monitoring is configured
- ✅ Backup strategy exists
