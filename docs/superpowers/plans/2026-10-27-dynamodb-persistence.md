# Amazon DynamoDB Cloud Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add durable, zero-cost Amazon DynamoDB cloud persistence for all bookings and quote inquiries in AWS Lambda with seamless local fallback to JSON storage for offline development.

**Architecture:** 
1. Build an isomorphic storage engine in `server/lib/storage.mjs` that connects to Amazon DynamoDB when configured via environment variables (`DYNAMODB_TABLE_BOOKINGS`, `DYNAMODB_TABLE_INQUIRIES`) and falls back to local file storage (`server/storage/*.json`) when running offline or in tests.
2. Update the API route handlers in `server/lambda.mjs` and `server/standalone-api.mjs` to asynchronously await persistence operations before returning HTTP 201 Created.
3. Package the updated serverless bundle into `server/lambda.zip` for instant deployment to AWS Lambda (`ap-southeast-2`).

**Tech Stack:** Node.js (ESM), AWS Lambda (Node.js 18+/20+ runtime), `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, Node.js native test runner (`node --test`).

## Global Constraints

- **Zero Breaking Changes**: The API contract (`POST /api/bookings`, `GET /api/bookings`, `POST /api/inquiries/quote-request`, `GET /api/inquiries/quote-request`) remains unchanged.
- **Local Dev Resilience**: Running `pnpm dev` or `npm test` locally must work 100% without requiring AWS credentials or network access.
- **Preserve Documentation**: Retain all existing comments, docstrings, and error handling.
- **Clean Repo Structure**: Artifacts and temp files must not clutter root; `lambda.zip` placed in `server/`.

---

### Task 1: Upgrade Storage Adapter for DynamoDB + Local Fallback

**Files:**
- Modify: `server/lib/storage.mjs`
- Test: `server/tests/rates.test.mjs`

**Interfaces:**
- Consumes: `process.env.DYNAMODB_TABLE_BOOKINGS`, `process.env.DYNAMODB_TABLE_INQUIRIES`, `process.env.AWS_REGION`
- Produces: 
  - `async function saveBooking(booking): Promise<booking>`
  - `async function loadBookings(forceRefresh): Promise<Array<booking>>`
  - `async function saveInquiry(inquiry): Promise<inquiry>`
  - `async function loadInquiries(forceRefresh): Promise<Array<inquiry>>`

- [ ] **Step 1: Update `server/lib/storage.mjs` to dynamically load DynamoDB DocumentClient when configured**
- [ ] **Step 2: Implement DynamoDB `PutCommand` and `ScanCommand` for bookings and inquiries**
- [ ] **Step 3: Ensure fallback to `readJsonArray` / `writeJsonArray` if DynamoDB is unconfigured or unavailable**
- [ ] **Step 4: Update `server/tests/rates.test.mjs` to await `saveBooking`, `loadBookings`, `saveInquiry`, `loadInquiries`**
- [ ] **Step 5: Run `npm test` in `server/` to verify tests pass**

---

### Task 2: Update Lambda & Standalone API Route Handlers

**Files:**
- Modify: `server/lambda.mjs`
- Modify: `server/standalone-api.mjs`

**Interfaces:**
- Consumes: Async `saveBooking`, `loadBookings`, `saveInquiry`, `loadInquiries` from `storage.mjs`
- Produces: Correct async execution flow guaranteeing write completion before HTTP 201 response.

- [ ] **Step 1: In `server/lambda.mjs`, await `saveBooking`, `loadBookings`, `saveInquiry`, and `loadInquiries`**
- [ ] **Step 2: In `server/standalone-api.mjs`, await `saveBooking`, `loadBookings`, `saveInquiry`, and `loadInquiries`**
- [ ] **Step 3: Run `npm test` to verify API logic integrity**

---

### Task 3: Build Lambda Deployment Bundle & Prepare Verification

**Files:**
- Create: `server/lambda.zip` (containing `lambda.mjs`, `package.json`, `lib/**`, `data/**`)
- Test script: `server/scripts/verify-persistence.mjs`

- [ ] **Step 1: Create script to package `server/lambda.zip` cleanly**
- [ ] **Step 2: Generate `server/lambda.zip`**
- [ ] **Step 3: Write verification probe script to test `POST /api/bookings` and `GET /api/bookings` against live Lambda URL**

---

### Task 4: Deployment & Verification

- [ ] **Step 1: User uploads `server/lambda.zip` to AWS Lambda console**
- [ ] **Step 2: Run verification probe against `https://52dp2vnbdlsogsjjqgm6oxsvgy0ladtt.lambda-url.ap-southeast-2.on.aws`**
- [ ] **Step 3: Confirm booking record persists and appears in `GET /api/bookings`**
- [ ] **Step 4: Commit changes and update project status**
