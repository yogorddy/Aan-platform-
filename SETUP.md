# AAN Platform Deployment & Setup Guide

This guide provides exact, step-by-step instructions for running the Privacy-Preserving Proof-of-Human Identity (AAN) Platform in local development, staging, or production environments.

The AAN Platform is built using **React (Vite) + Express (Node.js)** as a modern full-stack application. It features an **offline-first stateful sandbox memory fallback** for local development, and a **durable cloud database connection via Supabase (PostgreSQL)** for production persistence.

---

## 📋 Table of Contents
1. [Required Tools](#1-required-tools)
2. [Environment Configuration (`.env`)](#2-environment-configuration-env)
3. [Supabase Database & Migration Setup](#3-supabase-database--migration-setup)
4. [Startup & Build Commands](#4-startup--build-commands)
5. [Local vs. Production Parity Notes](#5-local-vs-production-parity-notes)
6. [Troubleshooting & Failure Fixes](#6-troubleshooting--failure-fixes)

---

## 🛠 1. Required Tools

Ensure you have the following installed on your target machine:
* **Node.js** (v18.x or v20.x recommended)
* **npm** (v9.x+ or modern package managers like yarn/pnpm)
* **Supabase Account** (Free tier is perfectly sufficient; optional if running in Sandbox memory mode)

---

## 🔑 2. Environment Configuration (`.env`)

AAN uses environment variables to control its database connectivity, feature flags, and AI integrations.

### Step 1: Copy the Template
Run the following command in your terminal from the project root:
```bash
cp .env.example .env
```

### Step 2: Configure Keys
Open `.env` in your text editor and supply values according to your needs:

| Variable | Description | Requirement | Default / Safe Value |
| :--- | :--- | :--- | :--- |
| `SUPABASE_URL` | Your Supabase Project API URL | Optional (triggers Sandbox fallback if empty) | `"https://abc.supabase.co"` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin JWT token bypassing RLS | Required if `SUPABASE_URL` is set. | `"eyJhbGciOi..."` |
| `SUPABASE_ANON_KEY` | Public anonymous key | Optional | `"eyJhbGciOi..."` |
| `GEMINI_API_KEY` | Key for Google AI services | Optional | Provided by platform |
| `APP_URL` | Base self-referential app URL | Optional (useful for webhooks) | `"http://localhost:3000"` |
| `ACADEMY_ENABLED` | Toggles public Academy access | Optional (Feature Flag) | `false` |
| `BRAND_ENABLED` | Toggles public Brandbook access | Optional (Feature Flag) | `false` |

*Note: For security reasons, server-only secret keys like `SUPABASE_SERVICE_ROLE_KEY` must **never** be prefixed with `VITE_` or exposed to the client browser.*

---

## 🗄 3. Supabase Database & Migration Setup

To secure persistent cloud database storage, you must link AAN to your Supabase project and execute the migrations.

### Step 1: Create a Supabase Project
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**, select your organization, name your database, and choose a region.
3. Wait ~2 minutes for the database to provision.

### Step 2: Retrieve API Keys
1. Go to **Settings (gear icon) -> API** in the left sidebar.
2. Copy the **Project URL** and paste it as `SUPABASE_URL` in your `.env`.
3. Copy the **service_role (secret)** key and paste it as `SUPABASE_SERVICE_ROLE_KEY` in your `.env`.
   * *⚠️ WARNING: Do not copy the public anon key for service-role administrative actions!*

### Step 3: Run Database Migrations
Supabase projects are schema-driven. AAN includes a `supabase_schema.sql` file at the root containing the full table layouts, constraints, indexes, triggers, and Row Level Security (RLS) policies.

1. Open `supabase_schema.sql` in your code editor and select/copy all of its contents.
2. Go to your **Supabase Dashboard** -> click the **SQL Editor** tab (terminal console icon) in the left sidebar.
3. Click **New query**.
4. Paste the copied SQL schema, and click the **Run** button at the bottom right.
5. Verify that the query executed successfully with `"Success. No rows returned."`

---

## 🚀 4. Startup & Build Commands

AAN uses standard npm commands for installation, linting, bundling, and running.

### Clean Install Simulation
To verify a clean install from scratch with no cached state:
```bash
# Delete node_modules and builds
rm -rf node_modules dist package-lock.json

# Fresh install of all dependencies
npm install

# Verify compilation
npm run build

# Start the application
npm run start
```

### Regular Operational Commands
* **Development Server (hot reload with tsx)**:
  ```bash
  npm run dev
  ```
  Starts both the Vite dev middleware and the Express backend API on port `3000`.
* **Build / Compile (Production Bundling)**:
  ```bash
  npm run build
  ```
  Compiles the frontend assets to `dist/` and compiles/bundles the server to `dist/server.cjs` via `esbuild`.
* **Start Server (Production Mode)**:
  ```bash
  npm run start
  ```
  Runs the compiled full-stack bundle (`node dist/server.cjs`) on port `3000`.
* **Clean Artifacts**:
  ```bash
  npm run clean
  ```
* **Type-check & Lint**:
  ```bash
  npm run lint
  ```

---

## 🤝 5. Local vs. Production Parity Notes

To prevent "it works on my machine" deployment failures, AAN enforces several architectural rules:

1. **One Port (Port 3000)**: Both frontend static files and backend API endpoints run behind a single Express instance on port `3000`. The reverse proxy routing is handled automatically in the container environment.
2. **Server-Side Bundling (`esbuild`)**: The production `build` compiles the backend server code into a self-contained CommonJS bundle (`dist/server.cjs`). This prevents file-system relative import bugs in server environments.
3. **Double Preflight Validation**: A preflight script executes before listening on any ports. It validates the configuration and verifies live connection integrity.
4. **Offline Fallback**: If no Supabase credentials are configured in `.env`, the app automatically pivots to an in-memory database simulator. This ensures developers can run the app locally with zero setup, while ensuring production fail-safes are maintained.

---

## 🔧 6. Troubleshooting & Failure Fixes

### ❌ Crash: Database Tables Are Missing
* **Symptoms**: The server crashes on startup with: `❌ [AAN MIGRATION ERROR] Database Tables Are Missing!`.
* **Cause**: You provided `SUPABASE_URL` and keys, but you forgot to execute `supabase_schema.sql` in your Supabase dashboard.
* **Fix**: Follow [Step 3: Run Database Migrations](#step-3-run-database-migrations) to copy and paste the schema into the Supabase SQL editor.

### ❌ Crash: Invalid Supabase Credentials
* **Symptoms**: The server crashes on startup with: `❌ [AAN DATABASE AUTH ERROR] Invalid Supabase Credentials!`.
* **Cause**: The `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_URL` configured in your `.env` is incorrect, incomplete, or expired.
* **Fix**: Double check your Supabase API settings and copy the **service_role (secret)** key exactly. Ensure you did not copy the public anon key by mistake.

### ❌ Crash: Missing Required Environment Variable
* **Symptoms**: Startup fails with `❌ [AAN CONFIG ERROR] Missing Required Environment Variable!`.
* **Cause**: You configured only one of the Supabase keys (e.g. set URL but left key blank).
* **Fix**: Either configure both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to connect to a database, or remove both to run in offline sandbox fallback mode.

### ⚠️ Dev Warn: "Failed to initialize Supabase client"
* **Symptoms**: Log outputs `[AAN DB NOTICE] Switching AAN Platform to offline sandbox memory mode`.
* **Cause**: This warning indicates a transient network error or that the Postgres schema relation lookup failed during runtime operation.
* **Fix**: Check your internet connection and verify that your SQL queries successfully ran on Supabase.
