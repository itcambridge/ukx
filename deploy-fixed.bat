@echo off
SETLOCAL

REM UJC Platform Build & Deploy Script for Windows
REM This script builds the web application and prepares it for deployment

echo === UJC Platform Build & Deploy Script ===
echo Building web application...

REM Navigate to web directory
cd web

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build the application
echo Building application...
call npm run build

REM Create a deployment directory
echo Preparing deployment files...
if not exist ..\deploy mkdir ..\deploy

REM Copy the built files to the deployment directory
echo Copying built files to deploy directory...
xcopy /E /Y dist\* ..\deploy\

REM Copy assets to the deployment directory
echo Copying assets to deploy directory...
if not exist ..\deploy\assets mkdir ..\deploy\assets
xcopy /E /Y ..\assets\* ..\deploy\assets\

REM Copy the original index.html to index.htmlold for backup
echo Backing up original index.html...
copy ..\index.html ..\index.htmlold

REM Copy the built index.html to the root directory
echo Copying new index.html to root...
copy dist\index.html ..\index.html

echo === Build complete! ===
echo The built files are in the 'deploy' directory.
echo The original index.html has been backed up to index.htmlold.
echo The new index.html has been copied to the root directory.
echo.
echo To deploy to your server:
echo 1. Push these changes to GitHub
echo 2. Pull on your server
echo 3. Copy the deploy directory contents to your web root
echo    cp -r deploy/* /var/www/ukx/

REM Return to the original directory
cd ..

ENDLOCAL
pause
