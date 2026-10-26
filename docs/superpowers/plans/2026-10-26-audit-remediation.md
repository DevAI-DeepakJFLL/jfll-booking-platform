# 14-Point Codebase Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 14 issues identified in the Ponytail audit to make the Jet Freight Booking Hub fully resilient, safe under real load, mathematically consistent, well-tested, lean, and production-ready.

**Architecture:** 
1. Durable local JSON/SQLite storage for bookings and quote inquiries.
2. Hardened security with unified validation and CORS support for standard integration headers.
3. Aligned rate calculations and complete unit conversion for multi-unit dimensions ($cm$, $in$, $m$, $mm$).
4. Local storage persistence for client-side booking tracking and de-duplicated domain logic.
5. Automated test suite for rating math, IATA rounding, and input validation.
6. Lean cleanup: remove 43 unused UI components, 3 skeleton packages, and untrack 12+ MB of audit screenshots.
7. Final post-remediation Ponytail audit.

**Tech Stack:** Node.js (ESM), Express, Next.js / React 19, Tailwind CSS, Google Cloud Gmail API, Vitest / Node native test runner.

---

## Task Breakdown & Checkpoints

### Phase 1: Core Backend Reliability & Security (Must Fix)

#### Task 1: Persistent Storage for Bookings & Inquiries (Finding 1)
- **Files:**
  - Create: `server/lib/storage.mjs`
  - Modify: `server/standalone-api.mjs:L20-40`, `server/standalone-api.mjs:L298-330`, `server/standalone-api.mjs:L360-395`
- [ ] **Step 1:** Create `server/lib/storage.mjs` with atomic file persistence using `fs.writeFileSync` / temp rename pattern for `storage/bookings.json` and `storage/inquiries.json`.
- [ ] **Step 2:** Wire storage helper into `server/standalone-api.mjs` so bookings and inquiries are loaded on startup and appended durably on POST.
- [ ] **Step 3:** Test creating a booking and restarting the server: verify `GET /api/bookings` returns the saved booking.

#### Task 2: Fix CORS Preflight Headers (Finding 2)
- **Files:**
  - Modify: `server/standalone-api.mjs:L201-215`
  - Modify: `server/lambda.mjs:L17-25`
- [ ] **Step 1:** Add `Authorization`, `Idempotency-Key`, and `X-Client-Id` to `Access-Control-Allow-Headers`.
- [ ] **Step 2:** Test with a curl `OPTIONS` preflight request containing `Access-Control-Request-Headers: Authorization, Idempotency-Key` and verify 200 OK with matching allow headers.

#### Task 3: Input Validation for Bookings (Finding 3)
- **Files:**
  - Modify: `server/lib/security.mjs`
  - Modify: `server/standalone-api.mjs:L298-330`
- [ ] **Step 1:** Add `validateBookingInput(payload)` in `server/lib/security.mjs` enforcing valid origin/destination (3-letter IATA), positive weight, positive total amount, and non-empty shipper/consignee names.
- [ ] **Step 2:** Integrate into `POST /api/bookings` to return 400 Bad Request with descriptive errors on malformed payloads.
- [ ] **Step 3:** Test submitting `{}` to `POST /api/bookings` and verify it rejects with 400 instead of 201.

#### Task 4: Unify Backend Start Scripts (Finding 4)
- **Files:**
  - Modify: `server/package.json:L7-10`
  - Modify: `server/src/routes/index.ts`
- [ ] **Step 1:** Update `server/package.json` scripts to run `server/standalone-api.mjs` for `dev` and `start` (or mount bookings/inquiries into `server/src/routes/`).
- [ ] **Step 2:** Verify `pnpm --filter @workspace/api-server dev` starts the server and exposes all 5 API routes.

---

### Phase 2: Pricing Logic, Unit Conversion & Testing (Must Fix / Should Fix)

#### Task 5: Align Rate Calculation Formulas (Finding 5)
- **Files:**
  - Modify: `client/src/services/rate-discovery.service.ts:L285-305`
  - Modify: `server/standalone-api.mjs:L125-145`
- [ ] **Step 1:** Standardize `awbFee` (800 INR) and `originTHC` across both `rate-discovery.service.ts` and `server/standalone-api.mjs`.
- [ ] **Step 2:** Verify both client offline engine and backend API produce the exact same total price for a test 250 kg shipment.

#### Task 6: Implement Multi-Unit Cargo Dimension Conversion (Finding 6)
- **Files:**
  - Modify: `client/src/App.tsx:L58-75`, `client/src/App.tsx:L949-975`, `client/src/App.tsx:L1920-1940`
- [ ] **Step 1:** Add `unit: 'cm' | 'in' | 'm' | 'mm'` to `QuoteForm` (default `'cm'`).
- [ ] **Step 2:** Add conversion function in `freight-domain`:
  - $in \rightarrow cm \times 2.54$
  - $m \rightarrow cm \times 100$
  - $mm \rightarrow cm / 10$
- [ ] **Step 3:** Convert dimensions to $cm$ before applying $(L \times W \times H \times pcs) / 6000$.
- [ ] **Step 4:** Add unit selector tabs/dropdown in the UI step 0 dimension card.
- [ ] **Step 5:** Test: 24 in $\times$ 16 in $\times$ 16 in converts to $60.96 \times 40.64 \times 40.64$ cm $\rightarrow 16.7$ kg volumetric weight.

#### Task 7: Automated Unit & Integration Test Suite (Finding 7)
- **Files:**
  - Create: `server/tests/rates.test.mjs`
  - Create: `server/tests/security.test.mjs`
  - Modify: `server/package.json` (add `"test": "node --test tests/*.test.mjs"`)
- [ ] **Step 1:** Write unit tests for IATA 0.5 kg rounding rule, weight slab break-even logic, and commodity surcharges using Node native test runner (`node:test`).
- [ ] **Step 2:** Write validation tests for `validateQuoteInput`, `validateInquiryInput`, and `validateBookingInput`.
- [ ] **Step 3:** Run `pnpm test` and verify all tests pass with 100% success.

---

### Phase 3: Client Resilience, De-duplication & Architecture (Should Fix)

#### Task 8: Persist Confirmed Bookings in Browser (Finding 8)
- **Files:**
  - Modify: `client/src/App.tsx:L884`, `client/src/App.tsx:L1315-1330`
- [ ] **Step 1:** Initialize `shipmentsList` from `localStorage.getItem('jf_shipments')` (fallback to mock shipments).
- [ ] **Step 2:** In `setShipmentsList`, update `localStorage` whenever a new booking is confirmed.
- [ ] **Step 3:** Test page reload: verify previously booked shipments remain visible in Operations Dashboard and searchable via Quick Track.

#### Task 9: De-duplicate Domain Functions (Finding 10)
- **Files:**
  - Modify: `client/src/App.tsx:L1024-1043`
- [ ] **Step 1:** Delete shadowed local definitions of `parseTransitMinutes` and `parseDepartureMinutes` inside `App.tsx` and use the imported helpers from `lib/freight-domain`.

#### Task 10: Optimize Rate Sheet Loading (Finding 11)
- **Files:**
  - Modify: `client/src/services/rate-discovery.service.ts`
- [ ] **Step 1:** Ensure offline rate table is loaded on demand when the backend is unreachable rather than synchronously slowing initial bundle execution.

#### Task 11: Modularize App.tsx Component Structure (Finding 9)
- **Files:**
  - Create: `client/src/components/booking/BookingWizardSteps.tsx`
  - Create: `client/src/components/dashboard/OperationsDashboardView.tsx`
  - Modify: `client/src/App.tsx`
- [ ] **Step 1:** Extract the 4-step booking wizard and operations dashboard into modular components.
- [ ] **Step 2:** Keep `App.tsx` lean as a clean shell orchestrating high-level routing and modals.
- [ ] **Step 3:** Run `pnpm run typecheck` to confirm zero TypeScript errors.

---

### Phase 4: Lean Repository Cleanup (Nice to Have)

#### Task 12: Delete 43 Unused UI Components (Finding 12)
- **Files:**
  - Delete 43 unreferenced `.tsx` files in `client/src/components/ui/` (`accordion.tsx`, `alert-dialog.tsx`, `avatar.tsx`, `breadcrumb.tsx`, `calendar.tsx`, `chart.tsx`, `drawer.tsx`, etc.).
- [ ] **Step 1:** Remove all 43 unused UI components.
- [ ] **Step 2:** Run `pnpm run typecheck` in client to ensure nothing broken.

#### Task 13: Clean Dead Skeleton Packages (Finding 13)
- **Files:**
  - Delete: `server/lib/api-client-react`, `server/lib/api-spec`, `server/lib/db`
  - Modify: `pnpm-workspace.yaml`
- [ ] **Step 1:** Remove unused packages from `server/lib/` and clean up `pnpm-workspace.yaml`.
- [ ] **Step 2:** Run `pnpm install` to update workspace lockfile.

#### Task 14: Untrack Audit Screenshots from Git (Finding 14)
- **Files:**
  - Modify: `.gitignore`
- [ ] **Step 1:** Add `audit-screenshots/` to `.gitignore`.
- [ ] **Step 2:** Remove screenshots from git index (`git rm -r --cached audit-screenshots`).

---

### Phase 5: Re-Audit with Ponytail

- [ ] **Step 1:** Perform complete end-to-end Ponytail re-audit across the entire codebase.
- [ ] **Step 2:** Verify all 14 issues are resolved and report measured savings (lines deleted, speed, resilience).
