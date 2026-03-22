# Converse Omnichannel Enablement: BORIS + BOPIS
## Business Case & Architecture — Executive Presentation Deck

---

### Presentation Theme & Visual Standards

| Element | Specification |
|---------|--------------|
| Background | Dark gradient `#0d0d0d` → `#1a1a1a`, minimal and premium |
| Primary Text | White `#FFFFFF` |
| Secondary Text | Light gray `#A0A0A0` |
| Accent Color | Converse Red `#C8102E` — CTAs, highlights, section dividers only |
| Typography | Clean sans-serif (Helvetica Neue, Inter, or Proxima Nova) |
| Card/Box Style | Rounded corners (8px), subtle borders `#2A2A2A`, no drop shadows |
| Icons | Line-style (Feather / Phosphor family), white or red |
| Slide Dimensions | 16:9 widescreen |

---

## SLIDE 1 — Title Slide

### Title
**Converse Omnichannel Enablement: BORIS + BOPIS Business Case & Architecture**

### Subtitle
Enabling Buy Online, Pick Up In Store & Buy Online, Return In Store for Converse.com

### Footer
Confidential | [Date] | Converse Digital Engineering

### Recommended Visual
- Full-bleed dark background with subtle Converse star chevron watermark at 5% opacity
- Red accent line (2px) under the title
- Converse logo bottom-right corner

### Speaker Notes
> Welcome to the Converse Omnichannel Enablement presentation. Today we will walk through the business case, customer and operational benefits, technical architecture, and implementation roadmap for introducing BOPIS and BORIS capabilities to the Converse ecommerce platform. These capabilities are not available on the current Converse site and represent a significant opportunity to reduce costs, improve inventory efficiency, and elevate the customer experience.

---

## SLIDE 2 — Executive Summary

### Title
Executive Summary

### Bullets
- Converse.com currently offers **only Ship-to-Me** fulfillment — no store pickup or in-store return capability
- Introducing **BOPIS** (Buy Online, Pick Up In Store) and **BORIS** (Buy Online, Return In Store) to unlock omnichannel fulfillment
- Two new digital experiences: enhanced **Customer Site** (React.js) and a new **Store Portal** (React.js) for store operations
- Backed by a **Node.js API layer**, **MongoDB** data store, and **real-time notification system**
- Expected outcomes:
  - Delivery cost reduction of **Z%**
  - Markdown reduction of **A%**
  - Improved inventory turnover
  - Higher customer satisfaction (NPS)

### Recommended Visual
- 3 icon blocks horizontally centered:

| Icon | Label | Description |
|------|-------|-------------|
| Shopping Bag | BOPIS | Buy Online, Pick Up In Store |
| Return Arrow | BORIS | Buy Online, Return In Store |
| Store Building | Store Portal | Staff order & return management |

### Speaker Notes
> We are proposing two new fulfillment capabilities for the Converse ecommerce platform. BOPIS allows customers to order online and pick up at a nearby store, while BORIS enables customers to return online purchases at a physical store location. These require both a customer-facing experience upgrade and a completely new store employee portal. The solution is built on a modern React + Node.js + MongoDB stack, designed for reliability, real-time operations, and scalability.

---

## SLIDE 3 — Problem Statement (Current Gaps)

### Title
Current Gaps in the Converse Platform

### Bullets
- **No store pickup option** — All orders ship via carrier (UPS/FedEx), incurring per-order delivery charges
- **No in-store return path** — All returns go through reverse logistics — costly and slow
- **Store inventory underutilized** — Physical store stock sits idle while digital orders ship from distribution centers
- **Markdown risk** — Slow-moving store inventory leads to end-of-season markdowns and margin erosion
- **Single fulfillment model** — No flexibility for customers who prefer pickup or immediate in-store returns
- **No store operations tooling** — Store staff have no digital portal for order management or inventory visibility

### Recommended Visual
- "Before" state diagram:

```
┌──────────────────┐        UPS / FedEx        ┌──────────────┐
│  Distribution     │ ─────────────────────────→│   Customer   │
│  Center (Ontario) │   $X per shipment         │              │
└──────────────────┘                            └──────────────┘

     ✗ No Store Pickup          ✗ No Store Returns          ✗ No Store Portal
```

- Red "X" marks beside each gap label

### Speaker Notes
> The current Converse platform operates a single-channel fulfillment model. Every order ships from a distribution center via carrier, regardless of whether the customer lives near a Converse store. This creates unnecessary shipping costs, underutilizes store inventory, and forces all returns through a reverse-logistics pipeline. Stores have no digital tools to participate in order fulfillment or manage local inventory. These gaps represent both cost inefficiency and missed customer experience opportunities.

---

## SLIDE 4 — What Is BOPIS / BORIS

### Title
BOPIS & BORIS: Definitions and Customer Value

### Two-Column Layout

#### Left Column — BOPIS (Buy Online, Pick Up In Store)

- Customer selects **"Pick Up In Store"** on the Product Detail Page
- Searches stores by **ZIP code**; sees **real-time store-level inventory**
- Places order → store receives **instant notification**
- Store prepares order → marks **"Ready for Pickup"**
- Customer receives **4-digit OTP code** via email
- Presents OTP at store → **secure verified handoff**
- **Value**: Free delivery, ready in hours, reduced cart abandonment

#### Right Column — BORIS (Buy Online, Return In Store)

- Customer initiates return from **Order Confirmation** or **Order Detail** page
- Selects items to return with **reason** and **condition**
- Brings item to store → staff **inspects and verifies** product condition
- Store accepts return → **inventory automatically restored** to store stock
- **Refund processed immediately** upon completion
- **Value**: Instant resolution, no shipping label needed, reduced reverse-logistics cost

### Recommended Visual
- Side-by-side dark cards with accent borders
- Shopping bag icon (BOPIS) | Return arrow icon (BORIS)
- Red accent highlights on "Free delivery" and "Instant resolution"

### Speaker Notes
> BOPIS and BORIS are the two core capabilities we are introducing. BOPIS enables customers to purchase online and collect their order from a Converse store, with the entire flow secured by OTP verification at pickup. BORIS allows customers to return purchases at any Converse store, with store staff performing product verification before accepting the return. Both capabilities are designed to reduce fulfillment costs, improve customer satisfaction, and drive traffic to physical stores.

---

## SLIDE 5 — Business Justification (Cost & Margin Drivers)

### Title
Business Justification: Cost and Margin Impact

### Bullets

- **Shipping Cost Reduction**
  - Each home delivery costs an estimated **$X** per order
  - BOPIS eliminates carrier cost entirely for store pickups
  - Target BOPIS adoption: **Y%** of eligible orders

- **Consolidation Advantage**
  - Store replenishment ships **multiple products per delivery** vs. single-item shipments to individual customers
  - Estimated courier cost reduction: **Z%**

- **Markdown Reduction**
  - Store inventory clears faster through BOPIS fulfillment
  - Reduces end-of-season markdowns by an estimated **A%**

- **Mix Shift**
  - Shifting **Y%** of orders from Ship-to-Me to Ship-to-Store
  - Reduces overall delivery cost as a percentage of revenue

- **BORIS Savings**
  - Each carrier return costs an estimated **$B** in reverse logistics
  - In-store returns eliminate carrier cost and process returns in real-time
  - Expected return handling cost reduction: **B%**

- **Increased Conversion**
  - "Ready in hours" messaging reduces cart abandonment
  - Drives incremental sales and in-store add-on purchases

### Recommended Visual
- 4 metric callout boxes across the bottom:

| Callout | Placeholder |
|---------|-------------|
| Saved per BOPIS Order | **$X** |
| BOPIS Adoption Target | **Y%** |
| Markdown Reduction | **A%** |
| Return Cost Reduction | **B%** |

### Speaker Notes
> The business case is built on five pillars. First, shipping cost reduction — every order picked up in store avoids carrier delivery charges entirely. Second, consolidation — instead of shipping individual items to individual customers, we ship bulk replenishment to stores. Third, markdown reduction — BOPIS increases sell-through velocity for store inventory, reducing the need for end-of-season markdowns. Fourth, BORIS reduces reverse-logistics costs by allowing customers to return items at a nearby store. Finally, the "ready in hours" value proposition drives higher conversion rates and reduces cart abandonment.

---

## SLIDE 6 — Cost Example (Ontario → UPS Shipping vs. Store Pickup)

### Title
Cost Comparison: Ontario Ship-to-Me vs. Store Pickup

### Comparison Table (Two Cards Side by Side)

| Attribute | Ship-to-Me | Ship-to-Store (BOPIS) |
|-----------|-----------|----------------------|
| Order Value | $85.00 | $85.00 |
| Carrier | UPS Ground from Ontario DC | N/A (store stock on-hand) |
| Delivery Charge to Customer | Free (absorbed by Converse) | Free |
| **Converse Cost per Shipment** | **$X** | **~$0** |
| Delivery Time | 3–5 business days | Ready in **2 hours** |
| Customer Experience | Standard | **Premium** — fast, convenient, personal |

### Bottom Callout
> **Net savings per BOPIS order: $X**
> At **Y%** adoption across **N** eligible orders/year = **$M annual savings**

### Recommended Visual
- Side-by-side comparison cards on dark background
- Truck icon (Ship-to-Me) vs. Store icon (BOPIS)
- Red accent highlight on the "Converse Cost" and "Delivery Time" rows to show the advantage
- Large savings callout bar at the bottom with red background

### Speaker Notes
> This slide illustrates the cost impact using a concrete example. When a customer in the Ontario region orders a pair of Converse shoes via Ship-to-Me, the item ships from the distribution center via UPS, costing Converse an estimated $X in carrier fees. With BOPIS, if the customer selects a nearby store that has the item in stock, no shipping occurs — the item is already at the store. The customer picks it up in as little as two hours, and Converse avoids the carrier cost entirely. At scale, even modest BOPIS adoption rates generate significant annual savings.

---

## SLIDE 7 — Operational Benefits

### Title
Operational Benefits

### Bullets (with icons)

| Icon | Benefit | Detail |
|------|---------|--------|
| Clock | **Faster Fulfillment** | BOPIS orders ready in hours vs. 3–5 day shipping; store staff receive instant alerts |
| Store | **Better Store Utilization** | Physical stores become fulfillment nodes; store inventory serves both walk-in and online customers |
| Package | **Reduced Single-Item Shipments** | BOPIS eliminates individual parcel shipments; replenishment ships in bulk |
| Chart Up | **Higher Conversion** | "Pick up today" and "Free pickup" messaging reduces abandonment at checkout |
| Footprints | **Increased Store Traffic** | BOPIS drives incremental foot traffic — opportunity for add-on sales |
| Refresh | **Returns Efficiency** | BORIS processes returns immediately in-store with product verification, avoiding reverse-logistics pipeline |
| Shield Check | **Inventory Accuracy** | Real-time store-level inventory sync via atomic reservation and restoration ensures accurate availability |

### Recommended Visual
- 6-icon grid (3x2) with icon, bold title, and one-line description per cell
- Dark cards with subtle border, red icon accents

### Speaker Notes
> Beyond cost savings, BOPIS and BORIS deliver significant operational improvements. Stores become active fulfillment participants, improving inventory efficiency and driving foot traffic. The real-time inventory system uses atomic operations to reserve stock at order time and restore it when returns are completed, ensuring accuracy. Store staff benefit from instant notifications and a purpose-built portal that streamlines the accept, prepare, and pickup verification workflow.

---

## SLIDE 8 — Customer Journey (BOPIS)

### Title
Customer Journey — Buy Online, Pick Up In Store

### Flow Diagram (Horizontal, 7 Steps)

```
  ┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
  │ Browse   │    │ Select      │    │ Search Store │    │ Place       │
  │ Product  │───→│ "Pick Up    │───→│ by ZIP Code  │───→│ Order       │
  │ (PDP)    │    │  In Store"  │    │              │    │             │
  └─────────┘    └─────────────┘    └──────────────┘    └─────────────┘
                                                              │
       ┌──────────────────────────────────────────────────────┘
       ▼
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
  │ Receive     │    │ Visit Store  │    │ Order        │
  │ "Ready"     │───→│ Present OTP  │───→│ Complete     │
  │ Email + OTP │    │ for Verify   │    │              │
  └─────────────┘    └──────────────┘    └──────────────┘
```

### Step Details

| Step | Action | System Behavior |
|------|--------|-----------------|
| 1 | **Product Detail Page** | Customer views product; selects "Pick Up In Store" via enhanced card selector (green badge, ARIA accessible) |
| 2 | **Store Search** | Customer enters ZIP code; system shows nearby stores with real-time inventory availability via geolocation search |
| 3 | **Checkout** | Order created with status `AWAITING_STORE_ACCEPTANCE`; store inventory atomically reserved via `reserveStoreInventory()` |
| 4 | **Store Acceptance** | Store receives browser notification + sound alert + toast; accepts order; status → `ACCEPTED` |
| 5 | **Ready for Pickup** | Store marks ready; system generates 4-digit OTP (SHA-256 hashed); customer receives email with OTP; status updates via 10-second polling |
| 6 | **Pickup Verification** | Customer provides OTP; store enters in portal; hash comparison; max 5 attempts; 24-hour expiry; status → `OTP_VERIFIED` → `PICKED_UP` |
| 7 | **Completion** | Order marked `COMPLETED`; inventory reservation finalized; customer eligible for returns |

### Recommended Visual
- Horizontal journey map with circular numbered step icons connected by lines
- Customer avatar icon on far left, store icon on far right
- Red accent circle on the "OTP Verified" step
- Light timeline bar at the bottom

### Speaker Notes
> The BOPIS customer journey begins on the Product Detail Page where the customer selects "Pick Up In Store" using an accessible, visually prominent delivery selector. They search for nearby stores by ZIP code and see real-time inventory availability. At checkout, inventory is atomically reserved at the selected store. The store receives an instant notification and can accept or reject based on actual stock. Once the order is prepared, the customer receives an email with a secure 4-digit OTP. At the store, the associate verifies the OTP through the portal — with a maximum of 5 attempts and a 24-hour expiry for security. Upon verification, the order is complete.

---

## SLIDE 9 — Store Journey (BOPIS Operations)

### Title
Store Operations — BOPIS Order Handling

### Flow Diagram (Horizontal, 6 Steps)

```
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
  │ New Order    │    │ Review       │    │ Accept /     │
  │ Alert        │───→│ Order Detail │───→│ Reject       │
  │ (5s polling) │    │ Page         │    │              │
  └─────────────┘    └──────────────┘    └──────────────┘
                                                │
       ┌────────────────────────────────────────┘
       ▼
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │ Prepare &    │    │ Customer     │    │ Order        │
  │ Mark Ready   │───→│ Arrives →    │───→│ Complete     │
  │              │    │ Verify OTP   │    │              │
  └──────────────┘    └──────────────┘    └──────────────┘
```

### Step Details

| Step | Store Action | Technical Detail |
|------|-------------|------------------|
| 1 | **Alert** | Store Portal polls every 5 seconds; browser notification + sound alert + in-app toast for new `AWAITING_STORE_ACCEPTANCE` orders |
| 2 | **Review** | Manager clicks order row → navigates to dedicated **Order Detail Page** with full order info, customer details, item list |
| 3 | **Accept/Reject** | Accept: inventory confirmed, status → `ACCEPTED`. Reject: inventory released via `releaseStoreInventory()`, customer notified via email |
| 4 | **Prepare** | Staff prepares order; clicks "Mark Ready"; system generates OTP and emails customer; status → `READY_FOR_PICKUP` |
| 5 | **OTP Verification** | Customer provides 4-digit OTP; store enters in portal; SHA-256 hash comparison server-side; status → `OTP_VERIFIED` then `PICKED_UP` |
| 6 | **Complete** | Order finalized as `COMPLETED`; optimistic UI update (no page refresh required); customer now eligible for BORIS returns |

### Status Pipeline Bar

```
AWAITING_STORE_ACCEPTANCE → ACCEPTED → READY_FOR_PICKUP → OTP_VERIFIED → PICKED_UP → COMPLETED
```

### Recommended Visual
- Horizontal flow diagram with step boxes
- Status pipeline bar below the flow (colored segments, active step highlighted in red)
- Optional: Store Portal screenshot/wireframe showing the Order Detail Page with action buttons

### Speaker Notes
> The Store Portal is a purpose-built React application for store staff. When a new BOPIS order arrives, the portal immediately alerts the store via browser notifications, sound alerts, and in-app toasts — polling every 5 seconds to minimize delay. The store manager navigates to a dedicated Order Detail Page to review the full order and take action. The entire flow from acceptance through OTP-verified pickup is managed through the portal with optimistic UI updates — no page refreshes required. Each status transition is validated server-side against a strict state machine to prevent invalid operations.

---

## SLIDE 10 — BORIS Flow (Return In Store)

### Title
BORIS — Buy Online, Return In Store

### Flow Diagram (Horizontal, with Branch)

**Primary Path (Happy Path):**

```
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │ Customer     │    │ Store        │    │ Accept       │    │ Verify       │
  │ Initiates    │───→│ Receives     │───→│ Return       │───→│ Product      │
  │ Return       │    │ Request      │    │              │    │ Condition    │
  └─────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                    │
       ┌────────────────────────────────────────────────────────────┘
       ▼
  ┌──────────────┐    ┌──────────────┐
  │ Verification │    │ Complete     │
  │ PASS         │───→│ Return +     │
  │              │    │ Refund       │
  └──────────────┘    └──────────────┘
```

**Alternate Path (Fail):**

```
  Verification FAIL ───→ Cancel Return
```

### Step Details

| Step | Action | Technical Detail |
|------|--------|------------------|
| 1 | **Initiate** | Customer clicks "Return" on completed order (Order Confirmation or Order Detail page); selects items, quantity, reason, and condition (unopened / like_new / damaged) |
| 2 | **Store Notification** | Store Portal Returns section shows new request with badge count; polls every 5 seconds; toast + browser notification |
| 3 | **Accept** | Store navigates to dedicated **Return Detail Page**; accepts return; status → `RETURN_ACCEPTED`; optimistic UI update |
| 4 | **Verify** | Store inspects physical product; marks condition in portal; status → `RETURN_VERIFIED_PASS` or `RETURN_VERIFIED_FAIL` |
| 5 | **Complete** | On PASS: store clicks "Complete Return with Refund"; inventory automatically restored via `restoreStoreInventory()`; refund amount calculated; status → `RETURN_COMPLETED` |
| 6 | **Reject/Cancel** | If FAIL: store can cancel return. If fraudulent request: store rejects. Status → `RETURN_CANCELLED` or `RETURN_REJECTED` |

### Return Status Pipeline

```
RETURN_REQUESTED → RETURN_ACCEPTED → RETURN_VERIFICATION_PENDING → RETURN_VERIFIED_PASS → RETURN_COMPLETED
                                                                  ↘ RETURN_VERIFIED_FAIL → RETURN_CANCELLED
```

### Key Callout Box (Red Accent Border)
> **BORIS eliminates reverse-logistics costs. No shipping label. No carrier return. Inventory is back on the shelf immediately.**

### Recommended Visual
- Journey flow map: customer icon on far left, store icon on far right
- Inspection checkpoint highlighted with magnifying glass icon
- Red accent on "Inventory Restored" step
- Callout box at bottom with red left-border accent

### Speaker Notes
> The BORIS flow enables customers to return online purchases at any Converse store. The customer initiates the return from the website, and the store receives the request instantly through the portal. The store manager navigates to a dedicated Return Detail Page to inspect the product, verify its condition, and complete the return. Upon completion, inventory is automatically restored to the store's stock through an atomic operation, and the refund amount is recorded. This eliminates the need for shipping labels, carrier returns, and the entire reverse-logistics pipeline — reducing costs by an estimated $B per return and delivering an instant resolution experience for the customer.

---

## SLIDE 11 — Architecture Diagram

### Title
System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                              │
│                                                                                              │
│   ┌───────────────────────────────────┐     ┌───────────────────────────────────┐            │
│   │      Customer Web App             │     │        Store Portal               │            │
│   │      React 18 · Port 3000         │     │        React 18 · Port 3001       │            │
│   │                                   │     │                                   │            │
│   │  • Home / Product Catalog         │     │  • Dashboard                      │            │
│   │  • Product Detail Page (PDP)      │     │  • Orders (list + detail)         │            │
│   │  • Cart & Checkout                │     │  • Returns (list + detail)        │            │
│   │  • Order Tracking & History       │     │  • Inventory Management           │            │
│   │  • Returns Initiation             │     │  • In-Store Sales                 │            │
│   │  • Account & Auth                 │     │  • Auth                           │            │
│   │                                   │     │                                   │            │
│   │  Context: AuthContext, CartContext │     │  Context: AuthContext,            │            │
│   │                                   │     │  NotificationContext              │            │
│   └───────────────┬───────────────────┘     └───────────────┬───────────────────┘            │
│                   │                                         │                                │
└───────────────────┼─────────────────────────────────────────┼────────────────────────────────┘
                    │  HTTPS / REST API (Axios)               │  HTTPS / REST API (Axios)
                    ▼                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                                               │
│                                                                                              │
│                      Node.js / Express API Server · Port 5000                                │
│                                                                                              │
│   ┌─────────────────────────────────┐   ┌──────────────────────────────────────────┐        │
│   │  Security & Middleware          │   │  Route Groups                            │        │
│   │                                 │   │                                          │        │
│   │  • JWT Auth (Customer + Store)  │   │  /api/customer/auth     (register,      │        │
│   │  • bcrypt Password Hashing      │   │                          login, profile) │        │
│   │  • Rate Limiting                │   │  /api/customer/products  (catalog)       │        │
│   │  • Helmet Security Headers      │   │  /api/customer/stores    (search, inv)  │        │
│   │  • CORS                         │   │  /api/customer/orders    (CRUD, OTP)    │        │
│   │  • express-validator            │   │  /api/customer/returns   (create, list) │        │
│   │  • Morgan Request Logging       │   │  /api/store/auth         (login)        │        │
│   │                                 │   │  /api/store/orders       (manage, OTP)  │        │
│   │                                 │   │  /api/store/returns      (full CRUD)    │        │
│   │                                 │   │  /api/store/inventory    (view, update) │        │
│   │                                 │   │  /api/store/in-store-sales              │        │
│   └─────────────────────────────────┘   └──────────────────────────────────────────┘        │
│                                                                                              │
└──────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SERVICE LAYER                                               │
│                                                                                              │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│   │   Order       │ │  Inventory   │ │   Return     │ │ Notification │ │ Store Search │     │
│   │   Service     │ │  Service     │ │   Service    │ │ Service      │ │ Service      │     │
│   │              │ │              │ │              │ │              │ │              │     │
│   │ • Create     │ │ • Reserve    │ │ • Create     │ │ • New order  │ │ • Geocode    │     │
│   │ • Accept     │ │ • Release    │ │ • Accept     │ │   email      │ │   ZIP code   │     │
│   │ • Reject     │ │ • Restore    │ │ • Verify     │ │ • Pickup     │ │ • Find near  │     │
│   │ • Status     │ │ • Deduct     │ │ • Complete   │ │   ready OTP  │ │   stores     │     │
│   │   transitions│ │ • Check      │ │ • Reject     │ │ • Return     │ │ • Check      │     │
│   │ • Cancel     │ │   availability│ │ • Cancel     │ │   updates    │ │   product    │     │
│   │ • OTP gen    │ │   (store +   │ │              │ │              │ │   inventory  │     │
│   │ • OTP verify │ │    digital)  │ │              │ │              │ │              │     │
│   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                                                              │
│   ┌──────────────┐ ┌──────────────┐                                                        │
│   │  Auth         │ │ In-Store     │                                                        │
│   │  Service      │ │ Sale Service │                                                        │
│   │              │ │              │                                                        │
│   │ • Customer   │ │ • Create     │                                                        │
│   │   JWT + auth │ │   sale       │                                                        │
│   │ • Store      │ │ • Deduct     │                                                        │
│   │   JWT + auth │ │   inventory  │                                                        │
│   │ • Refresh    │ │ • List       │                                                        │
│   │   tokens     │ │   sales      │                                                        │
│   │ • Password   │ │              │                                                        │
│   │   reset      │ │              │                                                        │
│   └──────────────┘ └──────────────┘                                                        │
│                                                                                              │
└──────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DATA LAYER                                                 │
│                                                                                              │
│                          MongoDB (via Mongoose ODM)                                          │
│                                                                                              │
│   ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐          │
│   │  Orders & Fulfillment  │ │  Products & Inventory  │ │  Users & Returns       │          │
│   │                        │ │                        │ │                        │          │
│   │  • Orders              │ │  • Products            │ │  • Customers           │          │
│   │  • OrderItems          │ │  • Stores              │ │  • StoreUsers          │          │
│   │  • OrderStatusHistory  │ │  • StoreInventory      │ │  • Returns             │          │
│   │  • InventoryTxns       │ │  • DigitalInventory    │ │  • ReturnItems         │          │
│   │                        │ │                        │ │  • InStoreSales        │          │
│   └────────────────────────┘ └────────────────────────┘ └────────────────────────┘          │
│                                                                                              │
│   Total: 14 MongoDB Collections                                                             │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘


EXTERNAL INTEGRATIONS (connected via dashed lines to API Gateway):

  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
  │  Email Provider (Nodemailer / SMTP)            │
  │  • Order confirmations                         │
  │  • Pickup ready notifications (with OTP)       │
  │  • Return status updates                       │
  │  • Password reset emails                       │
  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘

  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
  │  Payment Provider (placeholder)                │
  │  • Refund processing for BORIS returns         │
  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘

  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
  │  Carrier / Shipping Provider (placeholder)     │
  │  • Ship-to-Me fulfillment via UPS/FedEx        │
  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

### Key Callouts
- **Monorepo**: Customer Site (port 3000), Store Portal (port 3001), API Server (port 5000)
- **7 Core Services**: Order, Inventory, Return, Notification, Store Search, Auth, In-Store Sale
- **14 MongoDB Collections** via Mongoose ODM
- **Security**: Separate JWT flows for customer and store, bcrypt password hashing, SHA-256 OTP hashing, rate limiting, Helmet security headers
- **Real-time**: 5-second polling with browser notifications, sound alerts, and toast messages

### Data Flow — BOPIS Order Lifecycle

```
Order Placed → Inventory Reserved → Store Notified → Order Accepted → Prepared →
Ready for Pickup → OTP Generated → OTP Verified → Pickup Complete → Inventory Finalized
```

### Data Flow — BORIS Return Lifecycle

```
Order Completed → Return Requested → Store Accepts → Product Verified →
Return Completed → Inventory Restored → Refund Processed
```

### Color Coding for PPT Reconstruction

| Component | Style |
|-----------|-------|
| Customer-facing | White text on dark card |
| Store-facing | White text on dark card, red left-border accent |
| Services | Subtle `#2A2A2A` border, dark card |
| MongoDB | Dark card with subtle blue `#1E40AF` accent |
| External | Dashed borders (indicating optional/external) |
| Arrows | White solid (internal), white dashed (external) |

### Speaker Notes
> The architecture follows a clean layered pattern. Two React single-page applications — the Customer Site and the Store Portal — communicate with a shared Node.js/Express API backend. The backend is organized into controllers, services, and models. Seven core services handle order management, inventory operations, returns processing, notifications, OTP verification, store search, and authentication. MongoDB stores all data across 14 collections with Mongoose as the ODM. Authentication uses separate JWT flows for customers and store staff, with bcrypt for passwords and SHA-256 for OTP hashing. The system is designed for real-time operations with 5-second polling cycles and browser notifications.

---

## SLIDE 12 — KPIs & Success Metrics

### Title
KPIs and Success Metrics

### Dashboard Layout (2x3 Metric Cards)

| Metric | Target | How We Measure |
|--------|--------|----------------|
| **BOPIS Adoption Rate** | **Y%** of eligible orders | % of orders selecting "Pick Up In Store" vs. total orders |
| **Delivery Cost per Order** | Reduced by **Z%** | Average carrier cost per order: before vs. after BOPIS launch |
| **Markdown Reduction** | **A%** improvement | End-of-season markdown percentage on store inventory items |
| **Inventory Turnover** | **T%** improvement | Store inventory turnover rate (units sold / average units on hand) |
| **Return Handling Time** | Reduced by **R%** | Average elapsed time from return initiation to resolution (BORIS vs. carrier) |
| **Customer Satisfaction** | +**N** NPS points | Post-purchase NPS survey for BOPIS and BORIS orders vs. Ship-to-Me baseline |

### Recommended Visual
- 6 metric cards in a 3-column x 2-row grid
- Each card: icon (top-left), metric name (bold), large placeholder number (center), measurement description (bottom)
- Gauge or progress indicator graphic in each card
- Dark card background, white text, red accent on the target number

### Speaker Notes
> We will measure success across six key performance indicators. BOPIS adoption rate tracks the percentage of eligible orders fulfilled via store pickup. Delivery cost per order measures the direct carrier cost savings. Markdown reduction captures the improved sell-through velocity of store inventory. Inventory turnover measures how efficiently stores move stock. Return handling time tracks the speed of BORIS processing versus carrier returns. Finally, customer satisfaction via NPS measures the experience quality of the new fulfillment options. All targets use placeholders and will be baselined during the Phase 1 pilot.

---

## SLIDE 13 — Risks & Mitigations

### Title
Risks and Mitigations

### Risk Cards (2x2 Grid)

#### Risk 1: Inventory Accuracy
- **Risk**: Store inventory in the system may not reflect actual shelf stock, leading to failed fulfillment
- **Mitigation**:
  - Atomic reservation using MongoDB `$expr` guards — prevents over-reservation at the database level
  - `InventoryTransaction` audit trail logs every reserve, release, restore, and deduct operation
  - Real-time sync on every order creation, cancellation, rejection, and return completion

#### Risk 2: Store Adoption
- **Risk**: Store staff may resist new workflows, miss incoming orders, or find the portal confusing
- **Mitigation**:
  - Purpose-built Store Portal with intuitive Order Detail and Return Detail pages
  - Aggressive alerting: browser notifications + sound alerts + in-app toasts, polling every 5 seconds
  - Minimal training required — clear action buttons with confirmation modals (no native browser alerts)

#### Risk 3: Fraud
- **Risk**: Unauthorized pickups or fraudulent/abusive returns
- **Mitigation**:
  - Pickup secured by SHA-256 hashed OTP with 24-hour expiry and maximum 5 verification attempts
  - BORIS requires mandatory product condition verification (unopened / like_new / damaged) before return can be completed
  - Return cannot be completed without passing verification step (server-side enforcement)

#### Risk 4: SLA Compliance
- **Risk**: Stores may not accept or prepare orders within an acceptable timeframe
- **Mitigation**:
  - Store acceptance window with configurable escalation rules
  - Real-time visibility into pending order and return counts via sidebar badges
  - Notification counts and timestamps enable SLA monitoring and reporting

### Recommended Visual
- 4 cards in a 2x2 grid
- Each card: warning triangle icon (top), risk name in bold, risk description, then bullet list of mitigations
- Dark cards with subtle red top-border accent

### Speaker Notes
> We have identified four primary risks and designed mitigations directly into the architecture. Inventory accuracy is protected by atomic database operations that use MongoDB expressions to guard against over-reservation, with a full audit trail of every inventory transaction. Store adoption is addressed through a clean, intuitive portal with aggressive notification mechanisms — stores cannot miss a new order. Fraud is mitigated through secure OTP verification for pickups and mandatory product condition checks for returns. SLA risk is managed through real-time visibility, configurable escalation windows, and badge-based monitoring.

---

## SLIDE 14 — Implementation Roadmap

### Title
Implementation Roadmap

### Three-Phase Horizontal Timeline

---

#### Phase 1 — BOPIS MVP (Weeks 1–6)

**Customer Site:**
- Product Detail Page delivery selector (Pick Up In Store / Ship to Me)
- Store search by ZIP code with real-time inventory availability
- BOPIS checkout flow with store selection
- Order Confirmation Page with status tracking
- Order Detail Page with real-time status polling

**Store Portal:**
- Store staff login and authentication
- Dashboard with order counts
- Orders list with dedicated Order Detail Page
- Accept / Reject / Mark Ready workflow
- OTP verification and order completion

**Backend:**
- Order Service (create, accept, reject, status transitions, cancel)
- Inventory Service (reserve, release, availability check for store + digital)
- Store Search Service (geolocation by ZIP)
- OTP Service (generate, verify, regenerate — SHA-256 hashed, 24h expiry, 5 max attempts)
- Notification Service (email: order confirmation, pickup ready with OTP)
- Customer and Store authentication (JWT, bcrypt, refresh tokens)

**Data:**
- MongoDB collections: Orders, OrderItems, OrderStatusHistory, Products, Stores, StoreInventory, DigitalInventory, Customers, StoreUsers, InventoryTransactions

---

#### Phase 2 — BORIS + Returns (Weeks 7–10)

**Customer Site:**
- Return initiation flow (from Order Confirmation and Order Detail pages)
- Return status tracking with visual timeline/progress tracker
- Guest order linking (match by email when guest creates an account)

**Store Portal:**
- Returns list page with notification badges
- Dedicated Return Detail Page with full workflow
- Accept / Verify Product / Complete / Reject / Cancel actions
- Custom confirmation modals (no native browser alerts)
- Optimistic UI updates (no page refresh required)

**Backend:**
- Return Service (create, accept, verify, complete, reject, cancel)
- Inventory restoration on return completion (`restoreStoreInventory`)
- Return status state machine (8 statuses with validated transitions)
- Return notification emails to customers

**Data:**
- MongoDB collections: Returns, ReturnItems
- OrderStatusHistory extended with return statuses

---

#### Phase 3 — Optimization (Weeks 11–14)

- **Real-time push**: Replace 5-second polling with WebSocket/SSE for instant store notifications
- **Analytics dashboard**: BOPIS adoption rates, average fulfillment time, return rates, cost metrics
- **SLA monitoring**: Store acceptance time tracking, escalation automation
- **In-store sales activation**: Already scaffolded (InStoreSale model + endpoints) — connect to store POS
- **Performance**: API response caching, pagination tuning, CDN for static assets
- **Cost tuning**: Delivery cost tracking, BOPIS vs. Ship-to-Me comparison reporting

---

### Recommended Visual
- Horizontal timeline with 3 phase blocks
- Each phase block contains key deliverables as compact bullet list
- Red milestone markers at phase boundaries (Week 0, Week 6, Week 10, Week 14)
- Current state indicator if presenting mid-implementation

### Speaker Notes
> The implementation is structured in three phases. Phase 1 delivers the BOPIS MVP — customers can select store pickup, search for nearby stores, and place orders that stores can accept, prepare, and verify via OTP. Phase 2 adds the full BORIS returns capability, including product verification and automated inventory restoration. Phase 3 focuses on optimization — replacing polling with WebSocket-based real-time updates, adding analytics dashboards, and tuning cost and SLA parameters. The in-store sales module is already scaffolded in the codebase and can be activated in Phase 3.

---

## SLIDE 15 — Closing / Ask

### Title
Next Steps & Ask

### Bullets

- **Approval**: Requesting budget approval for Phases 1–3 development — **$[Budget]**
- **Team**:
  - 2 Frontend Engineers (React.js)
  - 1 Backend Engineer (Node.js / MongoDB)
  - 1 QA Engineer
  - 1 Product Owner
- **Timeline**: 14-week delivery from kickoff to Phase 3 completion
- **Pilot**: Recommend pilot with **[N]** stores in the Ontario region before nationwide rollout
- **Dependencies**:
  - Store staff training and onboarding
  - Email/SMS provider configuration (SMTP)
  - Payment provider integration for refund processing
- **Immediate Next Steps**:
  1. Stakeholder alignment and budget sign-off
  2. Store pilot location selection
  3. Sprint 1 kickoff — BOPIS MVP development

### Recommended Visual
- Clean closing slide layout
- Converse logo centered or bottom-right
- "Thank You" in large text
- Contact information and team leads
- Red accent line divider

### Speaker Notes
> We are requesting approval to proceed with the BOPIS and BORIS implementation across three phases over 14 weeks. The recommended approach is a pilot launch with a small number of stores in the Ontario region to validate the operational model before scaling nationwide. The core team requires two frontend engineers, one backend engineer, one QA engineer, and a product owner. Key dependencies include store staff training and external provider configuration for email and payment processing. We are ready to begin Sprint 1 immediately upon approval.

---
---

## APPENDIX: Architecture Diagram — PPT Reconstruction Guide

This section provides the exact box-and-arrow layout to recreate the architecture diagram in PowerPoint or any diagramming tool.

### Layer 1 — Client Layer (Top of Slide)

**Position**: Top third of the slide

Two boxes side by side, centered:

| Box | Label | Subtitle | Sub-Items | Icon |
|-----|-------|----------|-----------|------|
| Left | Customer Web App | React 18 · Port 3000 | Home, PDP, Cart, Checkout, Orders, Returns, Account | Globe / Browser |
| Right | Store Portal | React 18 · Port 3001 | Dashboard, Orders, Returns, Inventory, In-Store Sales | Store / Building |

**Arrows**: Each box has a downward arrow labeled **"HTTPS / REST API (Axios)"** pointing to the API Gateway box.

---

### Layer 2 — API Gateway (Middle of Slide)

**Position**: Center of slide, full width

One wide box:

| Label | Subtitle |
|-------|----------|
| Node.js / Express API Server | Port 5000 |

**Left section**: Security & Middleware — JWT Auth (Customer + Store), Rate Limiting, Helmet, CORS, express-validator, Morgan

**Right section**: Route Groups — `/api/customer/*` (auth, products, stores, orders, returns) · `/api/store/*` (auth, orders, returns, inventory, in-store-sales)

---

### Layer 3 — Services (Below API Gateway)

**Position**: Below center, spanning width

Seven boxes in a row (or 5 + 2):

| # | Service | Key Functions |
|---|---------|---------------|
| 1 | Order Service | Create, accept/reject, status transitions, cancel, OTP generate/verify/regenerate |
| 2 | Inventory Service | Reserve, release, restore, deduct, check availability (store + digital) |
| 3 | Return Service | Create, accept, verify product, complete, reject, cancel |
| 4 | Notification Service | Email alerts: order confirmation, pickup ready (OTP), return updates, password reset |
| 5 | Store Search Service | Geolocation search by ZIP, nearby stores with product inventory availability |
| 6 | Auth Service | Customer + Store JWT generation, bcrypt hashing, refresh tokens, password reset |
| 7 | In-Store Sale Service | Create sale, deduct store inventory, list sales |

**Arrows**: API Gateway box has arrows down to each service box.

---

### Layer 4 — Data Layer (Bottom of Slide)

**Position**: Bottom third of slide, full width

One wide box:

| Label | Subtitle |
|-------|----------|
| MongoDB | Mongoose ODM |

Collections organized in 3 columns:

| Column 1 (Orders) | Column 2 (Products) | Column 3 (Users) |
|-------------------|---------------------|-------------------|
| Orders | Products | Customers |
| OrderItems | Stores | StoreUsers |
| OrderStatusHistory | StoreInventory | Returns |
| InventoryTransactions | DigitalInventory | ReturnItems |
| | | InStoreSales |

**Arrows**: Service boxes have arrows down to the MongoDB box.

---

### Layer 5 — External Integrations (Right Side)

**Position**: Right side of slide, stacked vertically alongside the API Gateway

Three boxes with **dashed borders**:

| # | Integration | Purpose |
|---|-------------|---------|
| 1 | Email Provider (Nodemailer/SMTP) | Order confirmations, pickup ready emails, return updates, password reset |
| 2 | Payment Provider (placeholder) | Refund processing for BORIS returns |
| 3 | Carrier/Shipping Provider (placeholder) | Ship-to-Me fulfillment via UPS/FedEx |

**Arrows**: Dashed arrows from API Gateway to each external integration box.

---

### Diagram Color Coding

| Component Type | Background | Border | Text | Accent |
|---------------|------------|--------|------|--------|
| Customer Web App | `#1a1a1a` | `#2A2A2A` | White | — |
| Store Portal | `#1a1a1a` | `#2A2A2A` | White | Red `#C8102E` left-border |
| API Gateway | `#1a1a1a` | `#2A2A2A` | White | — |
| Services | `#1a1a1a` | `#2A2A2A` | White | — |
| MongoDB | `#1a1a1a` | `#1E40AF` (blue) | White | Blue accent |
| External | Transparent | `#2A2A2A` dashed | `#A0A0A0` gray | — |
| Internal Arrows | — | — | — | White solid |
| External Arrows | — | — | — | White dashed |

---

### Data Flow Diagram (Optional Second Sub-Slide for Slide 11)

**BOPIS Order Flow** (left to right):

```
[Order Placed] → [Inventory Reserved] → [Store Notified] → [Order Accepted] →
[Prepared] → [Ready for Pickup] → [OTP Generated] → [OTP Verified] →
[Pickup Complete] → [Inventory Finalized]
```

**BORIS Return Flow** (left to right):

```
[Order Completed] → [Return Requested] → [Store Accepts] →
[Product Verified] → [Return Completed] → [Inventory Restored] → [Refund Processed]
```

Use arrow connectors between rounded-rectangle boxes. BOPIS flow in white, BORIS flow with red accent connectors.
