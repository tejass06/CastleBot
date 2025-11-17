#!/bin/bash

# CastleBot Pre-flight Check Script
# This script validates the bot configuration before starting

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🏰 CastleBot Pre-flight Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Node.js version
echo -n "Checking Node.js version... "
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS+1))
fi

# Check if node_modules exists
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed (run 'npm install')"
    ERRORS=$((ERRORS+1))
fi

# Check if .env file exists
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check for required environment variables
    source .env
    
    echo -n "  - Checking TOKEN... "
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "your_discord_bot_token_here" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC} Not configured"
        ERRORS=$((ERRORS+1))
    fi
    
    echo -n "  - Checking PREFIX... "
    if [ -n "$PREFIX" ]; then
        echo -e "${GREEN}✓${NC} ($PREFIX)"
    else
        echo -e "${RED}✗${NC} Not configured"
        ERRORS=$((ERRORS+1))
    fi
    
    echo -n "  - Checking MONGO_URI... "
    if [ -n "$MONGO_URI" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC} Not configured"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗${NC} Not found (copy .env.example to .env)"
    ERRORS=$((ERRORS+1))
fi

# Check MongoDB connection (basic check)
echo -n "Checking MongoDB... "
if [ -n "$MONGO_URI" ]; then
    if [[ $MONGO_URI == mongodb://localhost* ]] || [[ $MONGO_URI == mongodb://127.0.0.1* ]]; then
        # Check if MongoDB is running locally
        if pgrep -x "mongod" > /dev/null; then
            echo -e "${GREEN}✓${NC} Running locally"
        else
            echo -e "${YELLOW}⚠${NC} Local MongoDB may not be running"
        fi
    else
        echo -e "${GREEN}✓${NC} Using remote MongoDB"
    fi
else
    echo -e "${YELLOW}⊘${NC} Skipped (MONGO_URI not set)"
fi

# Check command files
echo -n "Checking command files... "
COMMAND_COUNT=$(find ./commands -name "*.js" 2>/dev/null | wc -l)
if [ $COMMAND_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $COMMAND_COUNT command files"
else
    echo -e "${RED}✗${NC} No command files found"
    ERRORS=$((ERRORS+1))
fi

# Check model files
echo -n "Checking model files... "
MODEL_COUNT=$(find ./models -name "*.js" 2>/dev/null | wc -l)
if [ $MODEL_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $MODEL_COUNT model files"
else
    echo -e "${YELLOW}⚠${NC} No model files found"
fi

# Check logs directory
echo -n "Checking logs directory... "
if [ -d "logs" ]; then
    echo -e "${GREEN}✓${NC} Exists"
else
    echo -e "${YELLOW}⚠${NC} Not found (creating...)"
    mkdir -p logs
    echo -e "${GREEN}✓${NC} Created"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Bot is ready to start.${NC}"
    echo ""
    echo "To start the bot:"
    echo "  Development: npm start"
    echo "  Production:  npm run pm2:start"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s). Please fix them before starting the bot.${NC}"
    echo ""
    exit 1
fi
