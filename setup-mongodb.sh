#!/bin/bash

# Quick MongoDB Atlas Setup Helper
# This script helps you set up MongoDB Atlas connection

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🍃 MongoDB Atlas Setup Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Follow these steps to set up MongoDB Atlas:"
echo ""
echo "1. Go to: https://www.mongodb.com/cloud/atlas/register"
echo "2. Create a free account (or login)"
echo "3. Create a new cluster:"
echo "   - Choose FREE M0 Sandbox tier"
echo "   - Select a cloud provider and region"
echo "   - Click 'Create Cluster'"
echo ""
echo "4. Set up database access:"
echo "   - Go to 'Database Access' in left menu"
echo "   - Click 'Add New Database User'"
echo "   - Create a username and password"
echo "   - Give 'Read and write to any database' role"
echo "   - Click 'Add User'"
echo ""
echo "5. Set up network access:"
echo "   - Go to 'Network Access' in left menu"
echo "   - Click 'Add IP Address'"
echo "   - Click 'Allow Access from Anywhere' (or add your IP)"
echo "   - Click 'Confirm'"
echo ""
echo "6. Get connection string:"
echo "   - Go to 'Databases' in left menu"
echo "   - Click 'Connect' on your cluster"
echo "   - Choose 'Connect your application'"
echo "   - Copy the connection string"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Have you completed the above steps? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the setup and run this script again."
    exit 1
fi

echo ""
echo "Great! Now let's configure your .env file."
echo ""
read -p "Paste your MongoDB Atlas connection string: " MONGO_URI

if [ -z "$MONGO_URI" ]; then
    echo "❌ No connection string provided. Exiting."
    exit 1
fi

# Update .env file
if [ -f ".env" ]; then
    # Backup current .env
    cp .env .env.backup
    echo "✅ Backed up current .env to .env.backup"
    
    # Update MONGO_URI in .env
    if grep -q "^MONGO_URI=" .env; then
        sed -i "s|^MONGO_URI=.*|MONGO_URI=$MONGO_URI|" .env
        echo "✅ Updated MONGO_URI in .env"
    else
        echo "MONGO_URI=$MONGO_URI" >> .env
        echo "✅ Added MONGO_URI to .env"
    fi
else
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    sed -i "s|^MONGO_URI=.*|MONGO_URI=$MONGO_URI|" .env
    echo "✅ Created .env with MongoDB URI"
    echo "⚠️  Don't forget to add your Discord TOKEN and PREFIX!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MongoDB Atlas configuration complete!"
echo ""
echo "Testing connection..."
echo ""

# Test the connection by starting the bot for a few seconds
timeout 5 node index.js 2>&1 | grep -E "(Connected to MongoDB|Could not connect)" || echo "Testing..."

echo ""
echo "If you see '✅ Connected to MongoDB successfully!' above,"
echo "then everything is working!"
echo ""
echo "Start your bot with: npm start"
echo ""
