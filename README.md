# Converse BOPIS & BORIS

A full-stack ecommerce platform implementing **Buy Online, Pick Up In Store (BOPIS)** and **Buy Online, Return In Store (BORIS)** for the Converse brand. The system consists of a customer-facing shopping site, a store employee management portal, and a shared REST API backend.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Customer Site](#customer-site)
- [Store Portal](#store-portal)
- [API Reference](#api-reference)
- [Database Design](#database-design)
- [Order Lifecycle](#order-lifecycle)
- [Return Lifecycle](#return-lifecycle)
- [Authentication](#authentication)
- [Shared Constants](#shared-constants)
- [UI/UX Design](#uiux-design)
- [Documentation](#documentation)

---

## Overview

This platform enables Converse customers to browse shoes, add them to cart, select a nearby store for pickup, and place BOPIS orders. Store employees can then accept or reject orders, manage inventory, process pickups, and handle in-store returns (BORIS). Guest checkout is supported — customers can track orders without creating an account.

### Key Capabilities

- **Customers**: Browse catalog, search by category, select color/size variants, check real-time store inventory by zipcode, place pickup orders (guest or authenticated), track orders live, and initiate returns.
- **Store Employees**: View incoming orders with notifications, accept/reject with reasons, set pickup ready times, update order status through lifecycle stages, process returns with verification, manage store inventory, and record in-store sales.

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   Customer Site      │     │    Store Portal      │
│   React (port 3000)  │     │   React (port 3001)  │
└─────────┬───────────┘     └─────────┬───────────┘
          │                           │
          │     HTTP / REST API       │
          └───────────┬───────────────┘
                      │
          ┌───────────▼───────────┐
          │    API Server          │
          │  Express (port 5000)   │
          │                        │
          │  /api/customer/*       │
          │  /api/store/*          │
          └───────────┬───────────┘
                      │
          ┌───────────▼───────────┐
          │      MongoDB           │
          │  (or in-memory server) │
          └───────────────────────┘
```

The backend exposes two API namespaces — one consumed by the customer site (with customer JWT auth) and one by the store portal (with store employee JWT auth). Both frontends are independent React applications that communicate with the shared API.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Customer Site** | React 18, React Router 6, Axios, Framer Motion, React Icons, React Toastify |
| **Store Portal** | React 18, React Router 6, Axios, React Icons, React Toastify |
| **API Server** | Node.js, Express 4, Mongoose 8, bcryptjs, jsonwebtoken, express-validator, Helmet, CORS, express-rate-limit, Morgan, Winston |
| **Database** | MongoDB (with mongodb-memory-server for development) |
| **Email** | Nodemailer (password reset flows) |
| **Scheduling** | node-cron |
| **Testing** | Jest, Supertest, mongodb-memory-server |

---

## Project Structure

```
converse-bopis-boris/
├── customer-site/                 # Customer-facing React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Header.jsx         # Navigation bar with cart, auth, categories
│   │   │   ├── Footer.jsx         # Site footer with links
│   │   │   ├── ProductCard.jsx    # Product grid card
│   │   │   └── ProtectedRoute.jsx # Auth route guard
│   │   ├── context/               # React Context providers
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   └── CartContext.jsx    # Shopping cart state
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.js         # Auth operations
│   │   │   ├── useCart.js         # Cart operations
│   │   │   ├── useOrderStatus.js  # Order polling/tracking
│   │   │   └── useStoreSearch.js  # Store search by zipcode
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── HomePage.jsx       # Landing + product listing (PLP)
│   │   │   ├── ProductPage.jsx    # Product detail (PDP)
│   │   │   ├── CartPage.jsx       # Shopping cart + store selection
│   │   │   ├── CheckoutPage.jsx   # Checkout with validation
│   │   │   ├── OrderConfirmationPage.jsx  # Post-order confirmation
│   │   │   ├── OrdersPage.jsx     # Order history
│   │   │   ├── OrderDetailPage.jsx # Single order with live tracking
│   │   │   ├── TrackOrderPage.jsx  # Guest order tracking
│   │   │   ├── ReturnPage.jsx      # Return initiation
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── AccountPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── services/              # API client functions
│   │   │   ├── api.js             # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── cartService.js
│   │   │   ├── orderService.js
│   │   │   ├── returnService.js
│   │   │   └── storeService.js
│   │   ├── utils/                 # Utilities
│   │   │   ├── formatCurrency.js
│   │   │   ├── tokenStorage.js
│   │   │   └── validators.js
│   │   ├── theme/                 # Centralized theme tokens
│   │   │   ├── colors.js
│   │   │   └── gradients.js
│   │   ├── routes.jsx             # Route definitions
│   │   ├── index.js               # App entry point
│   │   └── index.css              # Global styles + CSS variables
│   └── package.json
│
├── store-portal/                  # Store employee React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── common/
│   │   │       ├── Header.jsx     # Top bar with notifications
│   │   │       ├── Sidebar.jsx    # Navigation with order badges
│   │   │       ├── Badge.jsx
│   │   │       └── Loader.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx  # Polling for new orders
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useNotifications.js
│   │   │   ├── useOrders.js
│   │   │   └── useReturns.js
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx   # Overview cards + quick stats
│   │   │   ├── OrdersPage.jsx      # Order list with status tabs
│   │   │   ├── OrderDetailPage.jsx  # Accept/reject/status management
│   │   │   ├── ReturnsPage.jsx      # Return processing
│   │   │   ├── InventoryPage.jsx    # Stock management
│   │   │   ├── InStoreSalePage.jsx  # POS-style in-store sales
│   │   │   └── LoginPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── orderService.js
│   │   │   ├── returnService.js
│   │   │   └── inventoryService.js
│   │   ├── utils/
│   │   │   ├── formatDate.js
│   │   │   └── statusLabels.js
│   │   ├── theme/
│   │   │   ├── colors.js
│   │   │   └── gradients.js
│   │   ├── routes.jsx
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── server/                        # Backend API server
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── cors.js            # CORS configuration
│   │   │   └── env.js             # Environment variables
│   │   ├── controllers/
│   │   │   ├── customer/          # Customer-facing endpoints
│   │   │   │   ├── authController.js
│   │   │   │   ├── productController.js
│   │   │   │   ├── storeController.js
│   │   │   │   ├── orderController.js
│   │   │   │   └── returnController.js
│   │   │   └── store/             # Store portal endpoints
│   │   │       ├── authController.js
│   │   │       ├── orderController.js
│   │   │       ├── returnController.js
│   │   │       ├── inventoryController.js
│   │   │       └── inStoreSaleController.js
│   │   ├── middleware/
│   │   │   ├── customerAuth.js         # Customer JWT verification
│   │   │   ├── storeAuth.js            # Store employee JWT verification
│   │   │   ├── optionalCustomerAuth.js # Auth optional (guest support)
│   │   │   ├── roleMiddleware.js       # Role-based access control
│   │   │   ├── validateRequest.js      # express-validator runner
│   │   │   ├── rateLimiter.js          # Rate limiting
│   │   │   └── errorHandler.js         # Global error handler
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── Customer.js
│   │   │   ├── StoreUser.js
│   │   │   ├── Product.js
│   │   │   ├── Store.js           # With 2dsphere geo index
│   │   │   ├── StoreInventory.js
│   │   │   ├── DigitalInventory.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── OrderStatusHistory.js
│   │   │   ├── Return.js
│   │   │   ├── ReturnItem.js
│   │   │   ├── InStoreSale.js
│   │   │   └── InventoryTransaction.js
│   │   ├── routes/
│   │   │   ├── index.js           # Route aggregator
│   │   │   ├── customer/          # /api/customer/* routes
│   │   │   │   ├── authRoutes.js
│   │   │   │   ├── productRoutes.js
│   │   │   │   ├── storeRoutes.js
│   │   │   │   ├── orderRoutes.js
│   │   │   │   └── returnRoutes.js
│   │   │   └── store/             # /api/store/* routes
│   │   │       ├── authRoutes.js
│   │   │       ├── orderRoutes.js
│   │   │       ├── returnRoutes.js
│   │   │       ├── inventoryRoutes.js
│   │   │       └── inStoreSaleRoutes.js
│   │   ├── services/              # Business logic layer
│   │   │   ├── customerAuthService.js
│   │   │   ├── storeAuthService.js
│   │   │   ├── orderService.js
│   │   │   ├── returnService.js
│   │   │   ├── inventoryService.js
│   │   │   ├── inStoreSaleService.js
│   │   │   ├── storeSearchService.js
│   │   │   ├── emailService.js
│   │   │   └── notificationService.js
│   │   ├── validators/            # express-validator chains
│   │   │   ├── authValidator.js
│   │   │   ├── orderValidator.js
│   │   │   ├── returnValidator.js
│   │   │   └── storeValidator.js
│   │   └── utils/
│   │       ├── constants.js
│   │       ├── geocode.js         # Zipcode to coordinates
│   │       └── logger.js          # Winston logger
│   ├── seed.js                    # Database seeding script
│   ├── seed-and-start.js          # Seed + start in one command
│   ├── server.js                  # Entry point
│   └── package.json
│
├── shared/                        # Constants shared across apps
│   ├── apiEndpoints.js            # API URL constants
│   ├── orderStatuses.js           # Status enums + transitions
│   └── roles.js                   # User role constants
│
├── docs/                          # Design documentation
│   ├── PRD.md                     # Product Requirements Document
│   ├── HLD.md                     # High-Level Design
│   ├── API_SPEC.md                # API Specification
│   ├── DB_DESIGN.md               # Database Design
│   └── TESTING_PLAN.md            # Testing Strategy
│
├── package.json                   # Root workspace scripts
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- MongoDB is **not required** — the project uses `mongodb-memory-server` by default, which spins up an in-memory MongoDB instance automatically during development.

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AI_Project_BOPIS_BORIS

# Install root dependencies (concurrently)
npm install

# Install all sub-project dependencies
npm run install:all
```

### Running the Application

```bash
# Start all three applications simultaneously
npm run start:all
```

This launches:
- **API Server** at [http://localhost:5000](http://localhost:5000) (seeds the database automatically)
- **Customer Site** at [http://localhost:3000](http://localhost:3000)
- **Store Portal** at [http://localhost:3001](http://localhost:3001)

### Default Seed Data

The `seed-and-start` script populates the database with:
- Sample Converse shoe products (Chuck Taylor, One Star, Run Star) with variants
- Multiple store locations with coordinates and inventory
- A default store employee account for testing

---

## Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | API server port |
| `MONGO_URI` | `mongodb://localhost:27017/converse_bopis` | MongoDB connection string |
| `USE_MEMORY_DB` | `false` | Use in-memory MongoDB (no external DB needed) |
| `CUSTOMER_JWT_SECRET` | — | Secret for customer tokens |
| `STORE_JWT_SECRET` | — | Secret for store employee tokens |
| `CUSTOMER_JWT_EXPIRES_IN` | `7d` | Customer token expiry |
| `STORE_JWT_EXPIRES_IN` | `8h` | Store token expiry |
| `EMAIL_HOST` | — | SMTP host for emails |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_USER` | — | SMTP username |
| `EMAIL_PASS` | — | SMTP password |
| `EMAIL_FROM` | `noreply@converse.com` | Sender address |
| `GEOCODE_API_KEY` | — | Geocoding service key |
| `NODE_ENV` | `development` | Environment mode |

---

## Available Scripts

### Root

| Script | Command | Description |
|--------|---------|-------------|
| `start:all` | `npm run start:all` | Start server + both frontends concurrently |
| `start:server` | `npm run start:server` | Start API server (seeds DB first) |
| `start:customer` | `npm run start:customer` | Start customer site on port 3000 |
| `start:store` | `npm run start:store` | Start store portal on port 3001 |
| `install:all` | `npm run install:all` | Install dependencies for all sub-projects |
| `test:all` | `npm run test:all` | Run all test suites |

### Server

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node server.js` | Start server |
| `dev` | `nodemon server.js` | Start with auto-reload |
| `seed` | `node seed.js` | Seed database only |
| `seed-start` | `node seed-and-start.js` | Seed then start |
| `test` | `jest --coverage` | Run tests with coverage |

---

## Customer Site

### Routes

| Path | Page | Auth Required | Description |
|------|------|:---:|-------------|
| `/` | Home | No | Hero section, categories, product grid |
| `/products` | Home | No | Product listing with filters |
| `/product/:id` | Product Detail | No | PDP with variants, store inventory, add to cart |
| `/cart` | Cart | No | Cart items, delivery method, store selection |
| `/checkout` | Checkout | No | Shipping/payment form with validation |
| `/order-confirmation/:orderId` | Confirmation | No | Live status tracker, order details |
| `/track-order` | Track Order | No | Guest order lookup by ID + email |
| `/orders/:orderId` | Order Detail | No | Detailed order view with status timeline |
| `/login` | Login | No | Customer sign-in |
| `/register` | Register | No | Account creation |
| `/account` | Account | Yes | Profile, addresses, password |
| `/orders` | My Orders | Yes | Order history list |
| `/returns/:orderId` | Return | Yes | Initiate a return |
| `/forgot-password` | Forgot Password | No | Request reset email |
| `/reset-password/:token` | Reset Password | No | Set new password |

### Key Features

- **Product Detail Page (PDP)**: Variant-specific stock counts per store, color/size selection, store search by zipcode, fulfillment method toggle (Ship / Pickup).
- **Cart**: Delivery method selection, store search with distance sorting, inventory availability checks.
- **Checkout**: Full form validation (shipping address, credit card with Luhn check, contact info), disabled submission when items are unavailable.
- **Order Confirmation**: Live status polling, step-by-step tracker, BOPIS disclaimer about store acceptance.
- **Add to Cart Modal**: Slide-in panel showing added item and cart summary (replaces toast notification).

---

## Store Portal

### Routes

| Path | Page | Description |
|------|------|-------------|
| `/login` | Login | Store employee sign-in |
| `/` | Dashboard | Overview cards — pending orders, ready for pickup, returns, inventory |
| `/orders` | Orders | Tabbed order list (All / Pending / Accepted / Ready / Completed) |
| `/orders/:orderId` | Order Detail | Accept/reject, set pickup time, update status, view timeline |
| `/returns` | Returns | Return requests with accept/complete/reject actions |
| `/inventory` | Inventory | Search, view, edit stock quantities |
| `/in-store-sales` | In-Store Sales | POS interface for walk-in purchases |

### Key Features

- **Notification System**: Sidebar badge with polling, header notification dropdown, instant refresh after actions.
- **Order Management**: Accept with pickup time, reject with reason selection, status progression through lifecycle.
- **Inline Feedback**: Prominent success/error banners after order actions (not just toasts).
- **Inventory Management**: Edit stock quantities inline, search products, paginated listing.
- **In-Store Sales**: Product search, variant selection, cart builder, sale recording.

---

## API Reference

### Customer API (`/api/customer`)

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create customer account |
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/logout` | Sign out |
| `POST` | `/auth/refresh-token` | Refresh JWT |
| `GET` | `/auth/me` | Get current user |
| `PUT` | `/auth/profile` | Update profile |
| `PUT` | `/auth/change-password` | Change password |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password with token |
| `POST` | `/auth/addresses` | Add address |
| `PUT` | `/auth/addresses/:addressId` | Update address |
| `DELETE` | `/auth/addresses/:addressId` | Delete address |

#### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List products (paginated, filterable) |
| `GET` | `/products/slug/:slug` | Get product by slug |
| `GET` | `/products/:id` | Get product by ID |

#### Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stores/search?zipcode=` | Search stores by zipcode (geospatial) |
| `GET` | `/stores/:storeId/inventory?productId=` | Get store inventory for a product |

#### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orders` | Optional | Create order (guest or authenticated) |
| `GET` | `/orders` | Required | List customer's orders |
| `GET` | `/orders/guest/lookup` | No | Lookup guest order |
| `GET` | `/orders/:orderId` | Optional | Get order details |
| `POST` | `/orders/:orderId/cancel` | Optional | Cancel order |

#### Returns
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/returns` | Create return request |
| `GET` | `/returns` | List customer's returns |

### Store API (`/api/store`)

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Store employee sign in |
| `POST` | `/auth/logout` | Sign out |
| `GET` | `/auth/me` | Get current employee |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders` | List store's orders (paginated, filterable) |
| `GET` | `/orders/:orderId` | Get order details |
| `POST` | `/orders/:orderId/accept` | Accept order + set pickup time |
| `POST` | `/orders/:orderId/reject` | Reject order with reason |
| `PATCH` | `/orders/:orderId/status` | Update order status |

#### Returns
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/returns` | List store's returns |
| `POST` | `/returns/:returnId/accept` | Accept return |
| `POST` | `/returns/:returnId/complete` | Complete return processing |

#### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/inventory` | List store inventory (paginated) |
| `GET` | `/inventory/:inventoryId` | Get inventory item details |
| `PUT` | `/inventory/:inventoryId` | Update stock quantity |

#### In-Store Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/in-store-sales` | Record an in-store sale |
| `GET` | `/in-store-sales` | List in-store sales |

---

## Database Design

### Collections (11 total)

| Collection | Description |
|-----------|-------------|
| `customers` | Customer accounts with embedded addresses |
| `storeusers` | Store employee accounts with roles |
| `products` | Product catalog with variants (colors, sizes, images) |
| `stores` | Store locations with coordinates (2dsphere geo index) |
| `storeinventories` | Per-store, per-product variant stock levels |
| `digitalinventories` | Online/digital stock tracking |
| `orders` | Order records with status, fulfillment info |
| `orderitems` | Individual items within an order |
| `orderstatushistories` | Audit trail of status changes |
| `returns` | Return requests |
| `returnitems` | Individual items within a return |
| `instoresales` | Walk-in sale records |
| `inventorytransactions` | Inventory movement audit log |

### Key Concepts

- **Inventory**: Tracks `quantityOnHand`, `quantityReserved`, and computes virtual `quantityAvailable`.
- **Atomic Operations**: Uses `findOneAndUpdate` with conditions to prevent overselling.
- **Transactions**: Order creation and return creation use MongoDB transactions.
- **Geospatial**: Stores have `2dsphere` indexed coordinates for proximity search.

---

## Order Lifecycle

```
                                    ┌──── CANCELLED
                                    │
PLACED ──► AWAITING_STORE_ACCEPTANCE ──► ACCEPTED ──► READY_FOR_PICKUP ──► PICKED_UP ──► COMPLETED
                    │                                                                        │
                    ▼                                                                        ▼
                REJECTED                                                            (Return eligible)
```

| Status | Actor | Description |
|--------|-------|-------------|
| `PLACED` | System | Order created |
| `AWAITING_STORE_ACCEPTANCE` | System | Assigned to store, awaiting action |
| `ACCEPTED` | Store | Store confirmed order, pickup time set |
| `REJECTED` | Store | Store declined (reason provided) |
| `READY_FOR_PICKUP` | Store | Items packed and ready |
| `PICKED_UP` | Store | Customer collected the order |
| `COMPLETED` | System | Order fulfilled |
| `CANCELLED` | Customer | Cancelled before pickup |

---

## Return Lifecycle

```
RETURN_REQUESTED ──► RETURN_ACCEPTED ──► RETURN_VERIFICATION_PENDING ──► RETURN_VERIFIED_PASS ──► RETURN_COMPLETED
                          │                        │
                          ▼                        ▼
                   RETURN_CANCELLED         RETURN_VERIFIED_FAIL
```

| Status | Actor | Description |
|--------|-------|-------------|
| `RETURN_REQUESTED` | Customer | Return initiated |
| `RETURN_ACCEPTED` | Store | Store accepts the return |
| `RETURN_VERIFICATION_PENDING` | Store | Item being inspected |
| `RETURN_VERIFIED_PASS` | Store | Item passes inspection |
| `RETURN_VERIFIED_FAIL` | Store | Item fails inspection |
| `RETURN_COMPLETED` | Store | Refund processed, inventory restored |
| `RETURN_CANCELLED` | Either | Return cancelled |

---

## Authentication

The system uses **dual JWT authentication** — separate tokens and secrets for customers and store employees.

| Aspect | Customer Auth | Store Auth |
|--------|--------------|------------|
| Token Prefix | Customer JWT | Store JWT |
| Secret | `CUSTOMER_JWT_SECRET` | `STORE_JWT_SECRET` |
| Expiry | 7 days | 8 hours |
| Middleware | `customerAuth` | `storeAuth` |
| Guest Support | Yes (`optionalCustomerAuth`) | No |

**Guest checkout** is supported — orders can be placed without an account using email. Guests can track orders via order ID + email on the Track Order page.

---

## Shared Constants

### Order Statuses (`shared/orderStatuses.js`)

Defines all valid statuses and legal transitions between them via `isValidTransition(from, to)`.

### Roles (`shared/roles.js`)

- `STORE_ROLES.STORE_MANAGER` — Full store access
- `STORE_ROLES.STORE_ASSOCIATE` — Limited store access
- `CUSTOMER_ROLE` — Customer role

### API Endpoints (`shared/apiEndpoints.js`)

Centralized URL constants for all API endpoints consumed by both frontends.

---

## UI/UX Design

### Theme

The application uses a **premium dark theme** with a cinematic violet-to-black gradient background, designed to match luxury sneaker brand aesthetics.

- **Background**: Violet/purple edges degrading to black center — applied site-wide
- **Surfaces**: Flat dark cards (`#1b1b1f`) with subtle borders and soft shadows — no gradients on cards
- **Typography**: Off-white primary text (`#E8E8E8`), muted secondary (`#8E8E92`), ghost text (`#5C5C60`)
- **Accent**: Converse red (`#c8102e`) for primary CTAs — solid matte buttons, no glossy gradients
- **Status Colors**: Green (`#34d399`), Blue (`#60a5fa`), Amber (`#fbbf24`), Red (`#f87171`)
- **Interactions**: Subtle 220ms transitions, minimal hover lift (1-2px translateY), no scale or glow effects

### Branding

- Converse wordmark with star logo in header/sidebar
- Scrolling announcement banner on customer site
- Category tiles with brand-aligned color accents

---

## Documentation

Detailed design documents are available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Product requirements, user stories, acceptance criteria, business rules |
| [HLD](docs/HLD.md) | System architecture, component design, data flows, auth strategy |
| [API Spec](docs/API_SPEC.md) | Complete REST API reference with request/response formats |
| [DB Design](docs/DB_DESIGN.md) | MongoDB collections, schemas, indexes, relationships, transactions |
| [Testing Plan](docs/TESTING_PLAN.md) | Test strategy, unit/integration/E2E scenarios, coverage targets |

---

## License

ISC
