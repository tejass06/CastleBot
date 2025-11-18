# Azure App Service Deployment Guide for CastleBot

## Overview
This guide will help you deploy CastleBot to Azure App Service using a Docker container.

## Prerequisites

1. **Azure Account** with an active subscription
2. **Discord Bot Token** from Discord Developer Portal
3. **MongoDB Connection String** (MongoDB Atlas recommended for production)
4. **Azure CLI** (optional, for command-line deployment)

## Step 1: Prepare Your MongoDB Database

### Option A: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs (`0.0.0.0/0`) or specific Azure datacenter IPs
5. Get your connection string

### Option B: Azure Cosmos DB (MongoDB API)

1. Create a Cosmos DB account with MongoDB API
2. Get the connection string from Azure Portal

## Step 2: Create Azure App Service

### Via Azure Portal

1. **Create Resource** → **Web App**
2. Configure:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or select existing
   - **Name**: Choose a unique name (e.g., `castlebot-discord`)
   - **Publish**: **Docker Container**
   - **Operating System**: **Linux**
   - **Region**: Choose closest to you
   - **Pricing Plan**: **B1 Basic** or higher (F1 Free tier may not work for long-running processes)

3. **Docker Configuration**:
   - **Options**: Single Container
   - **Image Source**: Docker Hub or Azure Container Registry
   - **Image and tag**: (You'll update this after building your image)

4. Click **Review + Create** → **Create**

## Step 3: Configure Environment Variables

1. In Azure Portal, go to your App Service
2. Navigate to **Configuration** → **Application settings**
3. Add the following settings (click **New application setting** for each):

   | Name | Value | Example |
   |------|-------|---------|
   | `TOKEN` | Your Discord bot token | `<YOUR_BOT_TOKEN>` |
   | `PREFIX` | Command prefix | `!` |
   | `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/castlebot` |
   | `NODE_ENV` | Environment | `production` |
   | `WEBSITES_PORT` | Port for Azure (optional) | `8080` |

4. Click **Save** and confirm restart

## Step 4: Build and Deploy Docker Image

### Option A: Deploy from Docker Hub (Recommended)

1. **Build your image locally**:
   ```bash
   docker build -t yourusername/castlebot:latest .
   ```

2. **Push to Docker Hub**:
   ```bash
   docker login
   docker push yourusername/castlebot:latest
   ```

3. **Configure Azure to use your image**:
   - Go to **Deployment Center** in Azure Portal
   - Select **Docker Hub** or **Docker Registry**
   - Enter image name: `yourusername/castlebot:latest`
   - Save and wait for deployment

### Option B: Deploy using Azure Container Registry

1. **Create Azure Container Registry** (ACR)
2. **Build and push**:
   ```bash
   az acr login --name yourregistry
   docker build -t yourregistry.azurecr.io/castlebot:latest .
   docker push yourregistry.azurecr.io/castlebot:latest
   ```

3. **Configure App Service to use ACR**:
   - In **Deployment Center**, select Azure Container Registry
   - Select your registry, image, and tag
   - Enable **Continuous Deployment** if desired

### Option C: Direct Deployment from Local Container

```bash
az webapp create --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name castlebot-discord \
  --deployment-container-image-name yourusername/castlebot:latest
```

## Step 5: Verify Deployment

1. **Check Logs**:
   - In Azure Portal, go to **Deployment Center** → **Logs**
   - Or use **Log Stream** under **Monitoring**
   
2. **Look for success messages**:
   ```
   🌐 HTTP server listening on port 8080 for Azure health checks
   ✅ Connected to MongoDB successfully!
   ✅ Loaded X commands successfully
   ✅ Bot is online!
   🤖 Logged in as: YourBot#1234
   ```

3. **Test health endpoint**:
   - Visit: `https://your-app-name.azurewebsites.net/health`
   - Should return JSON with bot status

4. **Test Discord bot**:
   - Go to Discord
   - Send a command like `!help`
   - Bot should respond

## Troubleshooting

### Container Keeps Restarting

**Symptom**: Container starts but terminates after 20-30 seconds.

**Causes**:
1. Missing environment variables (`TOKEN`, `PREFIX`, `MONGO_URI`)
2. Invalid Discord token
3. MongoDB connection failure
4. App not binding to a port (fixed by HTTP health server)

**Solutions**:
- Check **Configuration** → **Application settings** are set correctly
- Check logs in **Log Stream**
- Verify MongoDB allows connections from Azure IPs
- Ensure bot has required Discord intents enabled

### "No new trace" Messages

**Symptom**: Logs show "No new trace in the past X min(s)"

**Solution**: This means your app isn't producing logs. Make sure:
- Environment variables are set
- The app isn't crashing silently
- Check **Deployment Center** logs for container errors

### MongoDB Connection Issues

**Symptoms**: 
- `❌ Could not connect to MongoDB`
- Connection timeout errors

**Solutions**:
1. **Check MongoDB Atlas IP Whitelist**:
   - Add `0.0.0.0/0` to allow all IPs (or specific Azure datacenter IPs)

2. **Verify connection string**:
   - Username/password are correct
   - Database name is specified
   - Use `mongodb+srv://` for Atlas

3. **Test connection locally**:
   ```bash
   node -e "require('mongoose').connect('YOUR_MONGO_URI').then(() => console.log('Connected')).catch(err => console.error(err))"
   ```

### Discord Bot Not Responding

**Checks**:
1. Bot is online in Discord (green status)
2. Bot has **Message Content Intent** enabled in Discord Developer Portal
3. Bot has proper permissions in your server
4. Prefix matches what you're typing (`!help` not `help`)
5. Check logs for command execution errors

## Scaling and Performance

### Recommended Settings

- **Pricing Tier**: B1 Basic or higher
  - F1 Free may experience issues with long-running processes
  - B1 provides 1.75 GB RAM, suitable for most Discord bots

- **Always On**: Enable this setting
  - Go to **Configuration** → **General settings**
  - Turn **Always On** to **On**
  - This prevents the app from sleeping

### Monitoring

1. **Enable Application Insights** (optional):
   - Provides detailed metrics and error tracking
   - Can set up alerts for downtime

2. **Check Metrics**:
   - **Monitoring** → **Metrics**
   - Monitor CPU, Memory, Response Time

## Cost Optimization

- **Basic B1 Plan**: ~$13/month (1.75 GB RAM, 100 GB storage)
- **Free F1 Plan**: Limited, may not work for 24/7 bots
- Consider using **Azure for Students** (free credits) if applicable

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `TOKEN` | ✅ Yes | Discord bot token from Developer Portal | `<YOUR_BOT_TOKEN>` |
| `PREFIX` | ✅ Yes | Command prefix | `!` |
| `MONGO_URI` | ✅ Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NODE_ENV` | ⚠️ Recommended | Environment mode | `production` |
| `PORT` | ⚠️ Auto-set | HTTP server port (Azure sets this) | `8080` |
| `WEBSITES_PORT` | ❌ Optional | Override port (if needed) | `8080` |

## Health Check Endpoint

Your bot exposes a health check endpoint for Azure:

- **URL**: `https://your-app-name.azurewebsites.net/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "bot": "online",
    "uptime": 3600,
    "timestamp": "2025-11-18T14:00:00.000Z",
    "guilds": 5,
    "users": 150
  }
  ```

## Quick Checklist

Before deploying, ensure:

- [ ] Discord bot token is valid
- [ ] Message Content Intent is enabled in Discord Developer Portal
- [ ] MongoDB is accessible from Azure (IP whitelist)
- [ ] All environment variables are set in Azure Configuration
- [ ] Docker image builds successfully locally
- [ ] Bot has required permissions in Discord server
- [ ] "Always On" is enabled in Azure App Service
- [ ] Pricing tier is B1 or higher (not F1 Free)

---

**Happy Deploying! 🚀**
