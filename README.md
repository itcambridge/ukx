# UJC MVP Project

This repository contains the code for the Union Jack Coin (UJC) MVP platform.

## Project Structure

- `/web` - Frontend code
- `/supabase` - Supabase database migrations and configuration
- `/supabase/migrations` - SQL migrations for database setup
- `/functions` - Edge Functions for verification and secure operations

## Environment Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase CLI

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
   ```

2. Run database migrations:
   ```
   npm run db:migrate
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Edge Functions

Deploy Edge Functions:
```
npm run functions:deploy
```

## Fixed Taxonomies

- **Categories**: Environment, Education, Community, Health, Arts
- **Regions**: UK-wide, England, Scotland, Wales, Northern Ireland
