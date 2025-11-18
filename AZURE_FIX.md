# Azure Container Fix - Quick Summary

## Problem
Container starts on Azure but terminates after 20-30 seconds with "No new trace" messages.

## Root Cause
Discord bots don't expose HTTP endpoints. Azure App Service expects apps to bind to a port for health checks.

## Solution
Added a simple HTTP server to `index.js` that:
- Listens on Azure's `PORT` environment variable (defaults to 8080)
- Responds to `/health` endpoint with bot status
- Keeps the container alive

## What to Do Now

### 1. Rebuild Docker Image
```bash
docker build -t yourusername/castlebot:latest .
docker push yourusername/castlebot:latest
```

### 2. Set Environment Variables in Azure
Go to Azure Portal → Your App Service → Configuration → Application settings:

- `TOKEN` = Your Discord bot token
- `PREFIX` = `!`
- `MONGO_URI` = Your MongoDB connection string
- `NODE_ENV` = `production`

**Click Save!**

### 3. Deploy
- Go to Deployment Center
- Sync/redeploy your container

### 4. Verify
- Check Log Stream for: `🌐 HTTP server listening on port 8080`
- Test: `https://your-app-name.azurewebsites.net/health`
- Discord: Send `!help`

## Files Modified
- `index.js` - Added HTTP health server
- `AZURE_DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT.md` - Added Azure reference

The container should now stay running! 🎉
