#!/bin/bash

# UJC Platform Server Deployment Script
# This script deploys the UJC platform on the server

echo "=== UJC Platform Server Deployment Script ==="

# Navigate to the repository directory
cd ~/ukx

# Pull the latest changes from GitHub
echo "Pulling latest changes from GitHub..."
git pull

# Check if the deploy directory exists
if [ -d "deploy" ]; then
  echo "Deploy directory found. Deploying to web root..."
  
  # Backup the current web root
  echo "Backing up current web root..."
  timestamp=$(date +%Y%m%d%H%M%S)
  mkdir -p ~/backups
  cp -r /var/www/ukx ~/backups/ukx-$timestamp
  
  # Copy the deploy directory contents to the web root
  echo "Copying new files to web root..."
  cp -r deploy/* /var/www/ukx/
  
  echo "Deployment complete!"
else
  echo "Deploy directory not found. Please run the build script on your local machine first."
  echo "Then push the changes to GitHub and try again."
fi
