# Project Context Information

## 🚨 **LIVING DOCUMENT: KEEP UPDATED!** 🚨
*   **Purpose:** This file is Sage's primary context and memory between sessions. It contains critical rules, configurations, and procedures.
*   **Responsibility:** Both Chef and Sage are responsible for ensuring this document remains accurate and reflects the current state of the project plan, infrastructure, and agreed-upon workflows.
*   **Updates:** Any changes to deployment procedures, server configurations, critical environment variables, or operational rules MUST be reflected here immediately. Sage MUST request updates from Chef. Chef can update directly.
*   **Review:** Review this file periodically, especially before complex operations or after significant changes.

## ⚠️ CRITICAL BUILD & DEPLOYMENT RULES (aka Sage's Law) ⚠️
### 1. BUILD RESPONSIBILITY
   - Sage (AI) NEVER performs builds
   - Chef (user) ALWAYS handles all builds
   - Sage must REQUEST builds from Chef when needed
   - NO EXCEPTIONS to this rule
   - IMPORTANT: Builds take over 4 minutes and often timeout in remote sessions
   - DO NOT attempt builds through SSH/remote connection

### 2. DEPLOYMENT WORKFLOW
   - Sage: Makes code changes
   - Sage: Copies files to server using scp
   - Sage: STOPS here and REQUESTS build from Chef
   - Chef: Handles all build/rebuild operations locally to avoid timeouts
   - IMPORTANT: Docker containers DO NOT support hot-reload
   - Simply copying files to the server is NOT sufficient
   - Container rebuilds are REQUIRED for changes to take effect
   - This applies to BOTH frontend and backend services

### 3. SERVER OPERATIONS
   - Sage NEVER restarts servers or services
   - Chef ALWAYS handles all server restarts
   - Sage must REQUEST server restarts from Chef when needed
   - NO EXCEPTIONS to this rule

### 4. ⚠️ GIT VERSION CONTROL RULES ⚠️
- Sage (AI) NEVER COMMITS TO GIT, ONLY CHEF
- Sage NEVER uses git add, git commit, git push, or any other git commands
- Sage should act as if git does not exist
- Chef handles ALL version control operations
- NO EXCEPTIONS to this rule

### 5. NODE.JS VERSION REQUIREMENTS ⚠️
- ALWAYS use Node.js LTS version (v18.x or newer)
- System default Node.js v14 WILL NOT WORK with this application
- Run `nvm use --lts` before starting any server or client
- Chef manages the servers in a terminal window running Node.js LTS
- Do NOT attempt to fix Node.js compatibility issues in the code
- If Node.js errors appear (e.g., `Unexpected token '||='`), this indicates the wrong Node version
- NEVER try to restart servers or clients without the correct Node.js version

### 6. CRITICAL CONFIGURATION NOTES
**IMPORTANT: THE DEV SERVER IS ON PORT 5001, NOT 5000. DO NOT ARGUE THIS POINT.**

---

Dev servers should run locally for frontend and backend
Mongo server should use the prod one in the docker container, even for dev
This means the local development backend server (running on Chef's machine) will connect to the MongoDB container running inside Docker **on the server (192.168.1.17)** using the `DB_URI` specified in `server/.env.local`.

---

## Server Access & Services

### Server Connection
- SSH Command: `ssh server`
- Project Path: `/mnt/Media/Docker/NoteGeek/`
- Server IP: 192.168.1.17

### Frontend Service Port (Host)
*   The frontend Nginx container exposes its internal port 80 on host port **`9988`**.
*   Chef's external reverse proxy should connect to this port (`9988`) on the host (`192.168.1.17`).

## Database Credentials
# These credentials are used by the MongoDB container on the server
# They are sourced from the root .env file on the server
MONGO_INITDB_ROOT_USERNAME=ngeek_usr_f8z3k9b1
MONGO_INITDB_ROOT_PASSWORD=NotePass_ngk_7Hq-pLm5sRzYtW2_K

---

## Special Notes
1. Always check `.env` (production) or `.env.local` (development) file for current credentials and configuration.
2. Use `docker compose` commands from within `/mnt/Media/Docker/notegeek` on the server
3. Frontend container needs to be rebuilt after most changes due to static file serving
4. Development is done on macOS machine with deployment to Linux server

## GeekSuite Overview
- You must consult GeekSuite_Unified_Design_System.md for any design related work.
- GeekSuite is a collection of custom applications designed to replace commonly used programs
- All apps share consistent design patterns and tech stack:
  - Frontend: React (PWA), Material-UI (MUI)
  - Backend: Node.js/Express
  - Database: MongoDB (shared via baseGeek)
  - Authentication: baseGeek centralized auth system
  - Deployment: Docker/Docker Compose
- Known Apps in Suite:
  - baseGeek (Central): User management and authentication hub
  - NoteGeek: Markdown-based note-taking app
  - FitnessGeek (Current): Nutrition and fitness tracking
  - Future apps will follow same patterns and infrastructure

## baseGeek Integration
- **Production URL**: https://basegeek.clintgeek.com
- **Purpose**: Centralized authentication and user management for all GeekSuite apps
- **Database**: Shared MongoDB instance for user data
- **Authentication**: JWT-based with app-specific tokens
- **Integration**: All GeekSuite apps use baseGeek for user auth and profile management

## Project Status
- Currently implementing core note-taking functionality
- Recent completions:
  - Tag system with snake_case formatting
  - Note editing with save/delete functionality
  - Basic layout and navigation
- Next priorities:
  - Complete remaining core features from plan
  - Add mind mapping capability
  - Ensure consistent styling with FitnessGeek

## Project Plan & Features
- The complete project plan is maintained in `NoteGeekPlan.md`
- This document serves as the primary reference for project architecture, features, and implementation details
- Any new major features should be added to the plan document first
- All GeekSuite apps will maintain consistent:
  - Tech stack
  - UI/UX patterns
  - Deployment strategies
  - Development workflows
