#!/bin/bash

# UJC Platform Restoration Script
# This script restores the original site on the server

echo "=== UJC Platform Restoration Script ==="

# Navigate to the repository directory
cd ~/ukx

# Pull the latest changes from GitHub
echo "Pulling latest changes from GitHub..."
git pull

# Restore the original index.html from backup
echo "Restoring original index.html..."
if [ -f "index.htmlold" ]; then
  cp index.htmlold /var/www/ukx/index.html
  echo "Original index.html has been restored!"
else
  echo "Backup file index.htmlold not found. Trying to restore from repository..."
  git checkout 6d023e9d7901e6bb644bee5f78850b9699332448 -- index.html
  cp index.html /var/www/ukx/index.html
  echo "Original index.html has been restored from repository!"
fi

echo "=== Restoration complete! ==="
echo "Your original site should now be back online."
