# JetFreight Digital Booking Experience Hub (Project Atlas)

A full-stack, enterprise-grade digital freight marketplace designed for **Jet Freight Logistics Ltd (JFLL)**. The platform streamlines international air export rate discovery, dynamic IATA weight-break quote calculations, itemized carrier comparison, heavy cargo spot allocations (>500 kg), 3-step guided booking, and operational milestone tracking.

---

## 🏛️ Application Architecture

The repository is organized into dedicated frontend and backend workspaces:

```
Booking-Experience-Hub/
├── client/                     ──► Next.js 15 & React 19 Frontend Web Application
│   ├── src/
│   │   ├── app/                ──► Next.js App Router (Layout, Page, Metadata)
│   │   ├── components/         ──► Radix UI primitives, rates widgets, booking wizards
│   │   ├── components/rates/   ──► Heavy cargo spot allocation desk & inquiry form
│   │   ├── data/               ──► Bundled consolidated offline fallback rates
│   │   ├── services/           ──► Rate discovery client service & spot inquiry dispatch
│   │   └── App.tsx             ──► Main application coordinator & stepped wizard
│   ├── public/airlines/        ──► Cached carrier airline vector and PNG logos
│   └── package.json
│
├── server/                     ──► Standalone Node.js & Production API Server
│   ├── standalone-api.mjs      ──► Standalone HTTP server (zero-dependency, port 4000)
│   ├── lib/
│   │   ├── freight-domain.mjs  ──► Carrier schedules, transit parsing, and proper name mappings
│   │   └── security.mjs        ──► Input sanitization, 64KB bounded stream, defense headers
│   ├── data/                   ──► Consolidated master air freight tariff CSVs
│   └── scripts/
│       └── deploy-floci.mjs    ──► S3 deployment script for Floci AWS emulator
│
├── .github/workflows/          ──► Continuous Deployment (CI/CD)
│   └── deploy-aws.yml          ──► Automated GitHub Actions deployment to AWS S3, CloudFront & EC2
│
├── AWS_DEPLOYMENT_GUIDE.md     ──► Complete AWS Free Tier & CI/CD deployment guide
├── .gitignore                  ──► Strict Git exclusion rules for node, next, and build artifacts
└── README.md                   ──► Project documentation
```

---

## ⚡ Core Features & Systems

### 1. Dynamic IATA Rate & Surcharge Engine (< 500 kg)
* Evaluates step tariffs across standard IATA weight breaks: $\text{Normal } (-45\text{kg}), +45\text{kg}, +100\text{kg}, +250\text{kg}, +300\text{kg}, +500\text{kg}, +1000\text{kg}$.
* Automatically calculates Volumetric Weight ($\max(\text{CBM} \times 167, \sum (L \times W \times H) / 6000)$) against Gross Weight to determine **Chargeable Weight (CW)**.
* Itemizes and applies:
  * **Fuel Surcharge (FSC)** and **Security Surcharge (SSC)**
  * **Terminal X-Ray Screening** and **Export Handling (Misc / THC)**
  * **Cartage / Documentation (CTG)**, **AWB Issuance Fee**, and **AMS Manifest Filings**
  * **Indian Export GST (5%)**

### 2. Heavy Cargo Spot Allocation Desk (> 500 kg)
* For shipments exceeding $500\text{ kg}$, automated small-cargo tariffs are withheld.
* Automatically surfaces dynamic spot desk banner in Step 0 and transforms CTA to **"Request Heavy Cargo Quote (>500 kg)"**.
* Collects detailed shipper contact details, company information, 10-digit DGFT IEC code, and special cargo handling requirements (palletized, temperature controlled, forklift needed).
* Generates an official RFQ reference (e.g. `JFLL-RFQ-2026-44297`) with direct 2-hour SLA response window and direct Pricing Desk hotline escalation.

### 3. Comprehensive Security & Boundary Protection
* **Payload Bound Protection**: Request bodies are capped at 64 KB using streaming buffer limits to prevent memory exhaustion and buffer overflow DoS attacks.
* **Input Sanitization**: All incoming text is sanitized, stripping HTML injection, angle brackets, and control characters.
* **Defense-in-Depth Headers**: Includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, and `Referrer-Policy: strict-origin-when-cross-origin`.
* **Zero Client Blue Highlights**: Focus outlines are unified to Jet Freight’s signature corporate teal ring (`#187e9c`).

---

## 🚀 Local Development

### Prerequisites
* Node.js >= 20
* pnpm >= 9

### 1. Run the Backend API Server (Port 4000)
```bash
node server/standalone-api.mjs
# Health check: http://localhost:4000/api/health
```

### 2. Run the Frontend Client (Port 3000)
```bash
pnpm --dir client run dev
# Live preview: http://localhost:3000
```

### 3. Production Build & Static Export
```bash
# Type check TypeScript
pnpm --dir client run typecheck

# Build static production bundle into client/out
pnpm --dir client run build
```

---

## ☁️ AWS Free Tier Deployment & CI/CD

For a complete, beginner-friendly walkthrough on how to deploy this project to **AWS Free Tier** (AWS S3 + CloudFront CDN for frontend, AWS EC2 for backend) with **Automated GitHub Actions CI/CD** on every push, see:

👉 **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)**
