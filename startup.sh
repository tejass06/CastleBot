#!/bin/bash
# Azure startup script
cd /home/site/wwwroot
npm install --production
node index.js
