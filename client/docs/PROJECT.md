# PROJECT.md - JetFreight Digital Platform (Project Atlas)

## 1. Project Overview & Vision
JetFreight Digital is a digital freight marketplace designed for **Jet Freight Logistics Ltd (JFLL)**[cite: 1]. Its goal is to make freight booking as intuitive as travel booking by streamlining the entire journey—from rate discovery to execution and scaling[cite: 1].

- **Project Name:** Project Atlas (JetFreight Digital)[cite: 1]
- **Starting Scope (Phase 1):** Air Export[cite: 1]
- **Future Expansion:** Sea Export and Imports[cite: 1]
- **Key Proposition:** Instant live quotes across 150+ countries, spot and negotiated rates, 3-step guided booking, and automated tracking—eliminating manual calls and email chains[cite: 1].

---

## 2. Target Audience & User Personas

1. **Spot Exporters / B2B Cargo Handlers:**
   - Need instant rate comparisons without waiting for manual quotes[cite: 1].
   - Require clear pricing breakdowns (all-in rates, fuel & security surcharges, origin charges)[cite: 1].

2. **Contracted Enterprise Customers:**
   - Log in via **UID** to automatically unlock pre-negotiated contractual rates instead of spot pricing[cite: 1].

3. **JFLL Operations & Admin Team:**
   - Receive pre-validated booking data without re-keying[cite: 1].
   - Manage AWB issuance, warehouse cargo tendering, milestone updates, credit limits, and invoicing[cite: 1].

---

## 3. Core Product Features & User Journey

The Phase 1 Air Export flow consists of four primary stages[cite: 1]:

### Stage 1: Rate Discovery (Marketing Homepage & Quote Widget)
- **Input Fields:** Origin (e.g., BOM), Destination (e.g., DXB), Weight (kg), Volume (CBM), Cargo Ready Date, and Cargo Type (General, Perishable, Pharma, Dangerous Goods)[cite: 1].
- **Trust Elements:** Highlights credentials (Since 1986, NSE Listed, 150+ country network, IATA Accredited Agent)[cite: 1].
- **No Account Required:** Instant quotes accessible without forced initial login[cite: 1].

### Stage 2: Quotation & Comparison Engine
- **Live Carrier Rates:** Display options with filters (Recommended, Cheapest, Fastest, Direct Only)[cite: 1].
- **Transparent Breakdown:** Displays actual vs. volumetric weight, total chargeable weight, flight cutoffs, and itemized surcharges[cite: 1].
- **UID Contract Pricing:** Seamless login prompt for contract customers to fetch negotiated rates[cite: 1].

### Stage 3: Guided 3-Step Booking Flow
1. **Shipper & Consignee Details:** Recaptures company names, pickup/delivery addresses, and contact info for reuse on downstream legal documents[cite: 1].
2. **Cargo Details:** Piece-level dimensions ($L \times W \times H$), automatic volumetric/chargeable weight calculations, commodity description, and HS code capture for customs[cite: 1].
3. **Review & Confirm:** All-in charge breakdown, optional door pickup selection, and Terms & Conditions / Dangerous Goods declaration acceptance[cite: 1].

### Stage 4: Confirmation & Tracking Handoff
- **Instant Reference:** Generates booking reference (e.g., `JFLL-AE-2026-04815`)[cite: 1].
- **Operational Timeline:** Clear next steps (AWB issuance timeframe, warehouse tender cutoff times)[cite: 1].
- **Dashboard Handoff:** Direct link to tracking and shipment management[cite: 1].

---

## 4. Platform Architecture & System Responsibilities

| Domain | Platform Scope (JFLL & Fission Labs Architecture) | Vendor / Carrier Scope |
| :--- | :--- | :--- |
| **Vendor Integration** | API integration layer, caching, freshness handling, rate sync[cite: 1]. | Rate endpoints & price quotes[cite: 1]. |
| **Access & Auth** | User accounts, roles, onboarding, KYC verification[cite: 1]. | N/A |
| **Pricing & Quotes** | Sell pricing engine, quote lifecycle, margin control, approval workflows[cite: 1]. | Carrier contracts, allotments, capacity[cite: 1]. |
| **Booking & Ops** | Booking record creation, operational handoff, tracking console, alerts[cite: 1]. | Booking placement, flight/vessel confirmations[cite: 1]. |
| **Payments & Billing** | Payment processing, credit limit enforcement, GST e-invoicing, accounting sync[cite: 1]. | Carrier invoicing[cite: 1]. |
| **Compliance & Data** | Cargo data models, DG compliance, document generation & storage[cite: 1]. | Master reference data alignment[cite: 1]. |

---

## 5. Expected Business Outcomes
- **Faster Quoting:** Instant, self-serve rate discovery replaces multi-system lookup[cite: 1].
- **Single Digital Front Door:** Consolidated experience for exporters and internal operations[cite: 1].
- **Reduced Manual Effort:** Automated commercial logic and zero downstream data re-keying[cite: 1].
- **Built to Scale:** Architecture supports seamless future addition of Sea Export and Imports[cite: 1].