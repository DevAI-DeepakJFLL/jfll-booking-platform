# JetFreight Digital Booking Experience Hub (Project Atlas)

A modern digital freight booking platform designed for **Jet Freight Logistics Ltd (JFLL)**. The platform streamlines air export rate discovery, quote comparison, 3-step guided cargo booking, and automated tracking.

---

## 📦 Monorepo Architecture

This project is organized as a `pnpm` workspace:

### Applications (`artifacts/`)
* **`jetfreight-digital`**: The flagship web application featuring live rate search, instant quote calculations, carrier comparison, cargo specification, and booking workflows.
* **`mockup-sandbox`**: Interactive UI sandbox for component prototyping and design explorations.
* **`api-server`**: Express 5 backend server providing API endpoints, health checks, and service orchestration with structured Pino logging.

### Shared Libraries (`lib/`)
* **`api-spec`**: OpenAPI 3.1 specification for contract-first development with Orval code-generation.
* **`api-zod`**: Zod validation schemas code-generated from the OpenAPI specification.
* **`api-client-react`**: React Query hooks code-generated for end-to-end type safety between backend and frontend.
* **`db`**: PostgreSQL schema definitions and migrations powered by Drizzle ORM.

### Documentation (`docs/`)
* **[`docs/PROJECT.md`](docs/PROJECT.md)**: Product specifications, personas, and roadmap (Air Export Phase 1).
* **[`docs/DESIGN.md`](docs/DESIGN.md)**: UI/UX design tokens, typography, and color palette.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Radix UI primitives
* **Backend**: Node.js, Express 5, TypeScript
* **Database / ORM**: PostgreSQL, Drizzle ORM
* **API Contracts**: OpenAPI 3.1, Orval, Zod
* **Package Manager**: pnpm workspaces

---

## 🚀 Getting Started

### Prerequisites
* Node.js >= 20
* pnpm >= 9

### Installation
```bash
pnpm install
```

### Development
```bash
# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the main frontend application
pnpm --filter @workspace/jetfreight-digital run dev

# Start the mockup sandbox
pnpm --filter @workspace/mockup-sandbox run dev
```

### Type Checking & Building
```bash
# Run type checks across all workspace packages
pnpm run typecheck

# Build all applications and libraries
pnpm run build
```

### Code Generation
```bash
# Regenerate API client and schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```
