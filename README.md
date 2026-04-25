# Rivet - AI Automation platform 

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/shashank-poola/rivet)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933.svg)](https://nodejs.org/)

> Connect anything. Automate everything. No complexity.

A modern, open-source workflow automation platform that lets you connect APIs, services, and applications together with a visual drag-and-drop interface. Inspired by n8n, built for developers who value simplicity and power in equal measure.

## System Architecture

![architecture](apps/web/public/demo/architecture.png)

## Live Preview

![livepreview](apps/web/public/demo/workflow.png)

## Why This Exists

You've been there. Copy data from one service, paste it into another. Wait for an email, then manually trigger something else. Check a dashboard every hour just to see if something changed.

**Or you could automate it.**

But most automation tools either:
- Require a PhD to set up (looking at you, enterprise software)
- Lock you into their ecosystem with pricing that scales... aggressively
- Give you a visual builder that's so limited you end up writing code anyway
- Charge per execution like it's 1999

**RIVET is different.**

Visual when you want it. Code when you need it. Self-hosted. Open source. Built with modern tech that developers actually enjoy using.

## What It Does

Build workflows that connect your entire stack. Drag nodes onto a canvas. Wire them together. Hit run. That's it.

**Core Features:**

**Visual Workflow Builder**
- Drag-and-drop node interface powered by ReactFlow
- Real-time connection validation
- Branching logic and parallel execution
- Template library to get started fast

**Powerful Integrations**
- **Email** — Send rich emails via Resend with Mustache templating
- **Telegram** — Bot integration for notifications and commands
- **AI Agents** — Google Gemini integration via LangChain for intelligent automation
- **Webhooks** — Trigger workflows from external services
- **Forms** — Pause workflows for human input when needed

**Production Ready**
- Queue-based execution using Redis (no lost jobs, no race conditions)
- PostgreSQL for persistent storage
- JWT authentication with bcrypt password hashing
- Real-time execution logs and debugging
- Credential management with secure storage
- REST API for programmatic access
- Template system for reusable workflows

**Developer Experience**
- TypeScript everywhere (frontend and backend)
- Monorepo architecture with Turborepo
- Hot reload in development
- Docker Compose for local setup
- Prisma ORM for type-safe database access
- Extensible node system — add custom integrations easily

**What It Doesn't Do:**
- Doesn't charge per execution (it's yours, run it as much as you want)
- Doesn't vendor lock you (MIT licensed, self-hosted, open source)
- Doesn't require cloud services (runs on your hardware)
- Doesn't track you or phone home (your data stays yours)

## Technical Details

**Stack:**

**Frontend:**
- React 18.3.1 with TypeScript 5.8.3
- Vite 5.4.19 for lightning-fast builds
- ReactFlow 11.11.4 for the node-based UI
- Radix UI for accessible components
- TailwindCSS for styling
- TanStack React Query for data fetching
- React Router DOM for navigation

**Backend:**
- Node.js (>= 20) with Express 4.19.2
- TypeScript 5.0.0
- Prisma 6.16.1 ORM with PostgreSQL
- Redis 5.8.2 for job queuing
- JWT + bcrypt for authentication
- LangChain for AI agent integration

**Infrastructure:**
- Turborepo 2.5.5 for monorepo management
- Bun 1.2.21 as package manager
- Docker & Docker Compose
- Morgan for logging

**Architecture:**
```
rivet/
├── apps/
│   ├── web/              → React frontend (Vite + ReactFlow)
│   ├── server/           → Express backend + REST API
│   │   ├── controller/   → Route handlers (auth, workflows, webhooks)
│   │   ├── worker/       → Background job processor
│   │   │   └── nodes/    → Node implementations (email, telegram, AI)
│   │   └── redis/        → Queue management
│   └── docs/             → Documentation site
│
└── packages/
    ├── prisma-db/        → Shared database schema & Prisma client
    ├── ui/               → Shared UI components (Radix + Tailwind)
    └── typescript-config/→ Shared TS configs
```

**Database Schema:**
- **User** — Authentication and user accounts
- **Credentials** — Encrypted API keys and tokens
- **Workflow** — Workflow definitions with nodes (JSON)
- **Execution** — Workflow run history with status tracking
- **Webhook** — Webhook trigger configurations
- **Form** — Interactive form definitions
- **FormSubmission** — User-submitted form data

**Workflow Execution Flow:**
1. User builds workflow in visual editor → Saved to PostgreSQL
2. Workflow triggered (webhook, manual, or scheduled)
3. Execution record created with PENDING status
4. Starting nodes pushed to Redis queue as jobs
5. Worker picks up jobs (blocking BLPOP) and processes nodes
6. Each node updates context and enqueues downstream nodes
7. Execution status updated to COMPLETED or FAILED
8. Results stored with full execution history

**Node Types:**
- **Webhook Node** — HTTP triggers from external services
- **Email Node** — Send emails via Resend with Mustache templates
- **Telegram Node** — Send messages via Telegram Bot API
- **Gemini AI Node** — AI agent automation using Google Gemini
- **Form Node** — Pause workflow for user input
- **Manual Node** — Manually triggered workflows

Each node type is pluggable — add your own by implementing the node interface in `apps/server/worker/nodes/`.

## Installation

### Prerequisites
- **Node.js** >= 20
- **Bun** 1.2.21 (or npm/yarn/pnpm)
- **PostgreSQL** (for persistent data)
- **Redis** (for job queue)
- **Docker & Docker Compose** (recommended for local development)

### Quick Start

**1. Clone the repository:**
```bash
git clone https://github.com/shashank-poola/rivet.git
cd rivet
```

**2. Install dependencies:**
```bash
bun install
```

**3. Set up environment variables:**

Create `.env` files in `apps/server/` and `apps/web/`:

**apps/server/.env:**
```env
DATABASE_URL="postgresql://user:password@localhost:5433/rivet"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
RESEND_API_KEY="your-resend-api-key"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
GEMINI_API_KEY="your-gemini-api-key"
```

**apps/web/.env:**
```env
VITE_API_URL="http://localhost:3000"
```

**4. Start Docker services (PostgreSQL + Redis):**
```bash
docker compose up -d
```

**5. Run database migrations:**
```bash
cd packages/prisma-db
bun run prisma migrate dev
bun run prisma generate
```

**6. Start development servers:**
```bash
# From root directory
bun run dev
```

This starts:
- **Web app** at http://localhost:5173
- **Backend API** at http://localhost:3000
- **Worker** for background job processing

**7. Start the worker (in a separate terminal):**
```bash
cd apps/server
bun run dev worker/nodesexecution.ts
```

### Production Build

```bash
# Build all apps
bun run build

# Start production server
cd apps/server
bun run start

# Start worker
bun run start worker/nodesexecution.ts
```

## How It Works

**Building Workflows:**

The visual editor uses ReactFlow to create a node-based interface. Each node represents an action (send email, call API, run AI agent). Connect nodes by dragging from output ports to input ports. Data flows through the workflow via a shared context object.

**Triggering Workflows:**

- **Manual** — Click "Run" in the UI
- **Webhook** — POST to `/api/webhooks/:webhookId` from external services
- **Scheduled** — (Coming soon) Cron-based triggers

**Execution Engine:**

When a workflow runs:
1. An **Execution** record is created in PostgreSQL with status `PENDING`
2. Starting nodes (webhooks, manual triggers) are identified
3. Each starting node is pushed to the Redis queue as a job
4. The **Worker** polls the queue using blocking pop (`BLPOP`)
5. For each job, the worker:
   - Fetches the node configuration from the database
   - Executes the node logic (send email, call API, etc.)
   - Updates the execution context with results
   - Identifies connected downstream nodes
   - Pushes downstream nodes to the queue
6. When all nodes complete, execution status → `COMPLETED`
7. If any node fails, execution status → `FAILED` with error details

**Context Passing:**

Each node receives a `context` object containing outputs from previous nodes. For example:

```typescript
// Webhook node receives user data
{ userId: 123, email: "user@example.com" }

// Email node uses context in Mustache template
"Hello {{email}}, your user ID is {{userId}}"
```

**Form Nodes (Human-in-the-Loop):**

Form nodes pause workflow execution. When encountered:
1. Execution status → `PAUSED`
2. Form is displayed to the user
3. User submits form data
4. Execution resumes with form data in context
5. Downstream nodes continue processing

**Persistence Strategy:**

- **Workflows** stored as JSON with node definitions and connections
- **Credentials** encrypted before storage (API keys, tokens)
- **Executions** tracked with full history: status, start time, end time, results
- **Templates** reusable workflows shared across users

## Documentation

![documentation](apps/web/public/demo/docs.png)

## Philosophy

> "Automation should be so simple it's boring. The magic happens when boring tools do extraordinary things."

Most workflow automation platforms fall into two camps:

1. **Enterprise monsters** — Powerful but require a 40-page manual and a dedicated team
2. **No-code toys** — Easy to start, impossible to scale when you need real logic

**RIVET sits in the middle.**

Simple enough to build a workflow in 5 minutes. Powerful enough to orchestrate your entire backend. Visual when you want to move fast. Extensible when you need custom logic.

**This isn't trying to replace your entire infrastructure. It's trying to be the glue that holds it together.**

## Roadmap

- [x] Visual workflow builder with ReactFlow ✓
- [x] Queue-based execution with Redis ✓
- [x] Email integration (Resend) ✓
- [x] Telegram bot integration ✓
- [x] AI agent integration (Gemini) ✓
- [x] Webhook triggers ✓
- [x] Form nodes for human-in-the-loop ✓
- [x] JWT authentication ✓
- [x] Template library ✓
- [ ] Cron-based scheduling
- [ ] Error handling & retry logic
- [ ] Conditional branching nodes
- [ ] Loop nodes for batch processing
- [ ] More integrations (Slack, Discord, GitHub, etc.)
- [ ] Workflow versioning
- [ ] Execution history search & filtering
- [ ] Performance metrics & monitoring
- [ ] Multi-user workspaces
- [ ] Role-based access control
- [ ] Workflow import/export
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Custom node SDK

## Privacy & Security

RIVET respects your privacy because it's **your instance**:

- **Self-hosted** — All data stays on your infrastructure
- **No tracking** — Zero analytics, no phone home
- **No vendor lock-in** — MIT licensed, you own everything
- **Secure by default** — JWT auth, bcrypt passwords, encrypted credentials
- **Open source** — Full code transparency

Read the full [Privacy Policy](PRIVACY_POLICY.md) for details.

## Contributing

Found a bug? Want to add an integration? Contributions welcome!

**Ways to contribute:**
- Report bugs via [GitHub Issues](https://github.com/shashank-poola/rivet/issues)
- Submit PRs for features or fixes
- Add new node types (see `apps/server/worker/nodes/` for examples)
- Improve documentation
- Share workflow templates

**Adding a Custom Node:**

1. Create a new file in `apps/server/worker/nodes/yournode.ts`
2. Implement the node interface:
```typescript
export async function executeYourNode(
  nodeId: string,
  executionId: string,
  context: Record<string, any>
) {
  // Your logic here
  return { success: true, data: "result" };
}
```
3. Register it in the worker execution flow
4. Add UI component in the web app
5. Submit a PR!

## License

MIT License — Copyright 2025 [shasha.ink](https://shasha.ink)

Use it. Fork it. Build on it. Share it.

## Links

- **GitHub:** [github.com/shashank-poola/rivet](https://github.com/shashank-poola/rivet)
- **Documentation:** [Coming soon]
- **Issues:** [Report bugs](https://github.com/shashank-poola/rivet/issues)
- **Author:** [shasha.ink](https://shasha.ink)

---

**Built with ❤️ by developers, for developers.**

**Questions?** Open an issue or reach out.

**Want to see what people are building?** Share your workflows by tagging #RivetWorkflows
