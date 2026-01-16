# Spec Tree - Startup Guide

**Generated:** January 16, 2026

This guide explains how to run the Spec Tree application locally.

---

## Prerequisites

- **Node.js:** v18.x or v20.x (required by Strapi)
- **npm:** v6.0.0+
- **PostgreSQL:** v13+ (for Strapi database)
- **OpenAI API Key:** Required for AI features

---

## Quick Start

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-repo/spec-tree.git
cd spec-tree

# Install all dependencies
cd Client && npm install && cd ..
cd Server && npm install && cd ..
cd Microservice && npm install && cd ..
```

### 2. Environment Setup

#### Client `.env.local`

Create `Client/.env.local`:
```bash
# Strapi Connection
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_TOKEN=your-strapi-api-token-here

# Microservice Connection
NEXT_PUBLIC_MICROSERVICE_URL=http://localhost:3001
```

#### Server `.env`

Create `Server/.env`:
```bash
# Server
HOST=0.0.0.0
PORT=1337

# Security Keys (generate unique values)
APP_KEYS="your-app-key-1,your-app-key-2"
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=spec_tree
DATABASE_USERNAME=your-postgres-user
DATABASE_PASSWORD=your-postgres-password
DATABASE_SSL=false
```

**Generate secure keys:**
```bash
# Generate random keys
openssl rand -base64 32  # Run multiple times for each key
```

#### Microservice `.env`

Create `Microservice/.env`:
```bash
# Server
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb spec_tree

# Or using psql
psql -U postgres -c "CREATE DATABASE spec_tree;"
```

### 4. Start Services

**Option A: Three Terminal Windows**

```bash
# Terminal 1: Start Strapi (Server)
cd Server
npm run develop

# Terminal 2: Start Microservice
cd Microservice
npm run dev

# Terminal 3: Start Next.js Client
cd Client
npm run dev
```

**Option B: Using concurrently (recommended)**

Install in root:
```bash
npm install -g concurrently

# Create root package.json with scripts
```

Then run:
```bash
concurrently "cd Server && npm run develop" "cd Microservice && npm run dev" "cd Client && npm run dev"
```

### 5. Access Applications

| Service | URL | Purpose |
|---------|-----|---------|
| Client | http://localhost:3000 | Main application |
| Strapi Admin | http://localhost:1337/admin | CMS admin panel |
| Microservice | http://localhost:3001 | AI proxy API |

---

## First-Time Strapi Setup

1. Open http://localhost:1337/admin
2. Create your admin account
3. Generate an API token:
   - Go to Settings → API Tokens
   - Create new token with "Full access"
   - Copy token to Client `.env.local`

---

## Verification Checklist

### Server (Strapi)
```bash
# Health check
curl http://localhost:1337/_health
# Expected: {"status":"ok"}

# List content types
curl http://localhost:1337/api/apps
# Expected: JSON response (may be empty)
```

### Microservice
```bash
# Health check
curl http://localhost:3001/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test OpenAI (requires valid API key)
curl -X POST http://localhost:3001/api/openai/completion \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"system","content":"Say hello"},{"role":"user","content":"Hi"}]}'
```

### Client
1. Open http://localhost:3000
2. Should see home page
3. Navigate to /login
4. Create account or login

---

## Common Issues

### Issue: Strapi won't start
**Error:** `Database connection failed`
**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check database credentials in `.env`
3. Ensure database exists: `psql -l | grep spec`

### Issue: Client can't connect to Strapi
**Error:** `Network error` or `401 Unauthorized`
**Solution:**
1. Verify Strapi is running on port 1337
2. Check `NEXT_PUBLIC_STRAPI_API_URL` is correct
3. Verify API token is valid and has permissions

### Issue: AI features not working
**Error:** `Failed to generate completion`
**Solution:**
1. Check `OPENAI_API_KEY` is valid
2. Verify Microservice is running on port 3001
3. Check `NEXT_PUBLIC_MICROSERVICE_URL` in Client

### Issue: npm install fails
**Error:** `ERESOLVE unable to resolve dependency tree`
**Solution:**
```bash
npm install --legacy-peer-deps
```

### Issue: TypeScript errors on build
**Solution:**
```bash
cd Client
npm run build
# Check error output and fix issues
```

---

## Development Workflow

### Making Changes

1. **Frontend changes:** Edit files in `Client/`, auto-reloads
2. **Backend changes:** Edit files in `Server/src/`, auto-reloads
3. **Microservice changes:** Edit files in `Microservice/src/`, auto-reloads

### Creating Strapi Content Types

1. Open Strapi Admin
2. Go to Content-Type Builder
3. Create or modify types
4. Restart Strapi for schema changes

### Testing AI Features

1. Navigate to Spec Tree (/user-dashboard/spec-tree)
2. Create a new app with description
3. Click "Generate Epics"
4. Watch AI generate structured content

---

## Build for Production

### Client
```bash
cd Client
npm run build
npm start
```

### Microservice
```bash
cd Microservice
npm run build
npm start
```

### Server (Strapi)
```bash
cd Server
npm run build
npm start
```

---

## Environment Variable Reference

### Client

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_STRAPI_API_URL` | Yes | Strapi base URL |
| `NEXT_PUBLIC_STRAPI_TOKEN` | Yes | Strapi API token |
| `NEXT_PUBLIC_MICROSERVICE_URL` | Yes | AI microservice URL |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics ID |

### Server

| Variable | Required | Description |
|----------|----------|-------------|
| `HOST` | Yes | Server host (0.0.0.0) |
| `PORT` | Yes | Server port (1337) |
| `APP_KEYS` | Yes | Comma-separated app keys |
| `API_TOKEN_SALT` | Yes | Salt for API tokens |
| `ADMIN_JWT_SECRET` | Yes | Admin JWT secret |
| `JWT_SECRET` | Yes | User JWT secret |
| `DATABASE_CLIENT` | Yes | Database type (postgres) |
| `DATABASE_HOST` | Yes | Database host |
| `DATABASE_PORT` | Yes | Database port (5432) |
| `DATABASE_NAME` | Yes | Database name |
| `DATABASE_USERNAME` | Yes | Database user |
| `DATABASE_PASSWORD` | Yes | Database password |
| `DATABASE_SSL` | No | Enable SSL (false for local) |
| `SENDGRID_API_KEY` | No | For email functionality |

### Microservice

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (3001) |
| `NODE_ENV` | Yes | Environment (development/production) |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `CORS_ORIGIN` | Yes | Allowed CORS origin |
| `RATE_LIMIT_MAX` | No | Max requests per window (100) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window (900000) |

---

## Support

If you encounter issues not covered here:
1. Check the console for error messages
2. Review the relevant service logs
3. Ensure all environment variables are set correctly
4. Verify all services are running
