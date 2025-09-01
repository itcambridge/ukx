#!/bin/bash

# UJC Platform Deployment Script
# This script deploys the platform pages to the server

echo "=== UJC Platform Deployment Script ==="

# Navigate to the repository directory
cd ~/ukx

# Pull the latest changes from GitHub
echo "Pulling latest changes from GitHub..."
git pull

# Create platform directory in web root if it doesn't exist
echo "Creating platform directory structure..."
mkdir -p /var/www/ukx/platform/projects
mkdir -p /var/www/ukx/platform/governance

# Copy platform files to web root
echo "Copying platform files to web root..."
cp -f platform/index.html /var/www/ukx/platform/
cp -f platform/projects/index.html /var/www/ukx/platform/projects/
cp -f platform/governance/index.html /var/www/ukx/platform/governance/

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 /var/www/ukx/platform

echo "=== Deployment complete! ==="
echo "The platform is now available at your domain/platform"
