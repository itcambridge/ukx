# UJC MVP Project

This repository contains the code for the Union Jack Coin (UJC) MVP platform.

## Project Structure

- `/web` - Frontend code
- `/supabase` - Supabase database migrations and configuration
- `/supabase/migrations` - SQL migrations for database setup
- `/functions` - Edge Functions for verification and secure operations
- `/deploy` - Built files ready for deployment (created by build script)

## Environment Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase CLI (optional, for Edge Functions)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Web
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

For production, set these as environment secrets in your hosting platform.

## Development

### Setup

1. Install dependencies:
   ```
   npm install
   cd web
   npm install
   ```

2. Run database migrations:
   ```
   npm run db:migrate
   ```

3. Start the development server:
   ```
   cd web
   npm run dev
   ```

## Deployment

### Local Build

1. Run the build script:
   - On Windows: `deploy.bat`
   - On Linux/Mac: `bash deploy.sh`

2. This will:
   - Install dependencies
   - Build the web application
   - Create a `deploy` directory with all the files needed for deployment
   - Backup the original `index.html` to `index.htmlold`
   - Copy the built `index.html` to the root directory

3. Commit and push the changes to GitHub

### Server Deployment

1. Pull the latest changes on the server:
   ```
   cd ~/ukx
   git pull
   ```

2. Run the server deployment script:
   ```
   bash server-deploy.sh
   ```

3. This will:
   - Pull the latest changes from GitHub
   - Backup the current web root
   - Copy the deploy directory contents to the web root

Alternatively, you can manually copy the files:
```
cp -r deploy/* /var/www/ukx/
```

### Edge Functions

Deploy Edge Functions (requires Supabase CLI):
```
npm run functions:deploy
```

## Fixed Taxonomies

- **Categories**: Environment, Education, Community, Health, Arts
- **Regions**: UK-wide, England, Scotland, Wales, Northern Ireland
