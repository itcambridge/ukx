#!/bin/bash

# UJC Platform Build & Deploy Script
# This script builds the web application and prepares it for deployment

echo "=== UJC Platform Build & Deploy Script ==="
echo "Building web application..."

# Navigate to web directory
cd web

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Create a deployment directory
echo "Preparing deployment files..."
mkdir -p ../deploy

# Copy the built files to the deployment directory
cp -r dist/* ../deploy/

# Copy assets to the deployment directory
cp -r ../assets ../deploy/

# Copy the original index.html to index.htmlold for backup
cp ../index.html ../index.htmlold

# Copy the built index.html to the root directory
cp dist/index.html ../index.html

echo "=== Build complete! ==="
echo "The built files are in the 'deploy' directory."
echo "The original index.html has been backed up to index.htmlold."
echo "The new index.html has been copied to the root directory."
echo ""
echo "To deploy to your server:"
echo "1. Push these changes to GitHub"
echo "2. Pull on your server"
echo "3. Copy the deploy directory contents to your web root"
echo "   cp -r deploy/* /var/www/ukx/"
