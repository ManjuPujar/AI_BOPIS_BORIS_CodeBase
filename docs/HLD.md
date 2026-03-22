# High-Level Design (HLD)

## Converse BOPIS & BORIS

**Version:** 1.0  
**Last Updated:** March 19, 2026

---

## 1. System Architecture

```
┌─────────────────────┐        ┌─────────────────────┐
│                     │        │                     │
│   Customer Site     │        │   Store Portal      │
│   (React.js)        │        │   (React.js)        │
│   Port 3000         │        │   Port 3001         │
│                     │        │                     │
│  ┌───────────────┐  │        │  ┌───────────────┐  │
│  │  AuthContext   │  │        │  │  AuthContext   │  │
│  │  CartContext   │  │        │  │  Notification  │  │
│  │  Pages/Hooks  │  │        │  │  Context       │  │
│  └───────┬───────┘  │        │  └───────┬───────┘  │
│          │          │        │          │          │
└──────────┼──────────┘        └──────────┼──────────┘
           │                              │
           │  HTTP / REST                 │  HTTP / REST
           │  /api/customer/*             │  /api/store/*
           │                              │
           ▼                              ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Node.js Express API Server             │
│                    Port 5000                        │
│                                                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │  Routes   │  │ Middleware │  │   Validators     │ │
│  │  /customer│  │ Auth (JWT) │  │   (express-      │ │
│  │  /store   │  │ RateLimiter│  │    validator)    │ │
│  └────┬─────┘  └───────────┘  └──────────────────┘ │
│       │                                             │
│  ┌────▼─────────────────────────────────────────┐   │
│  │              Controllers                     │   │
│  │  customer/  auth, product, store,            │   │
│  │             order, return                    │   │
│  │  store/     auth, order, return, inventory   │   │
│  └────┬─────────────────────────────────────────┘   │
│       │                                             │
│  ┌────▼─────────────────────────────────────────┐   │
│  │              Services                        │   │
│  │  customerAuth, storeAuth, order, return,     │   │
│  │  inventory, storeSearch, notification, email │   │
│  └────┬─────────────────────────────────────────┘   │
│       │                                             │
│  ┌────▼─────────────────────────────────────────┐   │
│  │         Mongoose Models (ODM)                │   │
│  │  Customer, Product, Store, StoreInventory,   │   │
│  │  DigitalInventory, Order, OrderItem,         │   │
│  │  OrderStatusHistory, Return, ReturnItem,     │   │
│  │  StoreUser                                   │   │
│  └────┬─────────────────────────────────────────┘   │
│       │                                             │
└───────┼─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │
│     MongoDB         │       │   SMTP Server       │
│   (Primary Store)   │       │   (Nodemailer)      │
│                     │       │                     │
│  11 Collections     │       │  Order Confirmation │
│  Geospatial Index   │       │  Pickup Ready       │
│  Transactions       │       │  Password Reset     │
│                     │       │  Return Updates     │
└─────────────────────┘       └─────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Customer Site (`customer-site/`)

A React.js single-page application for end consumers.

| Layer | Contents | Purpose |
|-------|----------|---------|
| **Pages** | `HomePage`, `ProductPage`, `CartPage`, `CheckoutPage`, `OrdersPage`, `OrderDetailPage`, `ReturnPage`, `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `AccountPage` | Route-level views |
| **Components** | `Header`, `Footer`, `ProductCard`, `ProtectedRoute` | Shared UI elements |
| **Context** | `AuthContext`, `CartContext` | Global state for authentication and cart |
| **Hooks** | `useAuth`, `useCart`, `useStoreSearch`, `useOrderStatus` | Reusable stateful logic |
| **Services** | `api`, `authService`, `productService`, `storeService`, `cartService`, `orderService`, `returnService` | HTTP client wrappers |
| **Utils** | `tokenStorage`, `validators`, `formatCurrency` | Helper functions |

**Key Characteristics:**
- React Router for client-side navigation
- Axios-based API client with JWT interceptors
- `ProtectedRoute` wrapper redirects unauthenticated users to login
- Cart state persists through React Context (client-side)

### 2.2 Store Portal (`store-portal/`)

A React.js single-page application for store employees.

| Layer | Contents | Purpose |
|-------|----------|---------|
| **Pages** | `LoginPage`, `DashboardPage`, `OrdersPage`, `OrderDetailPage`, `ReturnsPage`, `InventoryPage` | Route-level views |
| **Components** | `Header`, `Sidebar`, `Badge`, `Loader`, `LoginForm`, `ProtectedRoute` | Shared UI elements |
| **Context** | `AuthContext`, `NotificationContext` | Global state for auth and polling notifications |
| **Hooks** | `useAuth`, `useOrders`, `useReturns`, `useNotifications` | Reusable stateful logic |
| **Services** | `api`, `authService`, `orderService`, `returnService`, `inventoryService` | HTTP client wrappers |
| **Utils** | `formatDate`, `statusLabels` | Helper functions |

**Key Characteristics:**
- Dashboard view with order/return counts
- Sidebar navigation for orders, returns, and inventory
- Polling-based notification system via `NotificationContext`
- Role-aware UI (store_manager vs store_associate)

### 2.3 API Server (`server/`)

A Node.js Express application that exposes RESTful endpoints.

| Layer | Contents | Purpose |
|-------|----------|---------|
| **Routes** | `customer/` (auth, products, stores, orders, returns), `store/` (auth, orders, returns, inventory) | URL-to-controller mapping |
| **Controllers** | Mirror route structure | Request/response handling |
| **Services** | `customerAuthService`, `storeAuthService`, `orderService`, `returnService`, `inventoryService`, `storeSearchService`, `notificationService`, `emailService` | Business logic |
| **Models** | 11 Mongoose schemas | Database access layer |
| **Middleware** | `customerAuth`, `storeAuth`, `roleMiddleware`, `rateLimiter`, `errorHandler`, `validateRequest` | Cross-cutting concerns |
| **Validators** | `authValidator`, `orderValidator`, `returnValidator`, `storeValidator` | Input validation rules (express-validator) |
| **Config** | `db`, `env`, `cors` | Environment and connection config |

### 2.4 Shared (`shared/`)

Modules consumed by both frontend and backend.

| File | Exports | Purpose |
|------|---------|---------|
| `apiEndpoints.js` | `CUSTOMER_API`, `STORE_API` | Centralized endpoint URL definitions |
| `orderStatuses.js` | `ORDER_STATUSES`, `VALID_TRANSITIONS`, `isValidTransition()` | Status enum and transition validation |
| `roles.js` | `STORE_ROLES`, `CUSTOMER_ROLE` | Role constants |

---

## 3. API Design

### 3.1 Namespace Strategy

All API endpoints are prefixed with `/api` and split into two namespaces:

| Namespace | Audience | Auth Middleware |
|-----------|----------|-----------------|
| `/api/customer/*` | Customer Site | `customerAuth` (JWT) |
| `/api/store/*` | Store Portal | `storeAuth` (JWT) |

### 3.2 Route Groups

```
/api
├── /customer
│   ├── /auth          (register, login, logout, refresh, forgot/reset password, profile, addresses)
│   ├── /products      (list, get by ID, get by slug)
│   ├── /stores        (search by ZIP, get store inventory)
│   ├── /orders        (create, list, get by ID, cancel)
│   └── /returns       (create, list)
│
└── /store
    ├── /auth          (login, logout, profile)
    ├── /orders        (list, get by ID, accept, update status)
    ├── /returns       (list, accept, complete)
    └── /inventory     (list, get by ID, update)
```

### 3.3 Request/Response Conventions

- **Content-Type:** `application/json`
- **Pagination:** Query params `page` and `limit`; response includes `{ data, total, page, totalPages }`
- **Errors:** `{ message: "..." }` with appropriate HTTP status codes (400, 401, 403, 404, 500)
- **Validation:** express-validator rules run before controllers; failures return `422` with field-level errors

---

## 4. Authentication

### 4.1 Dual JWT Strategy

The system uses separate JWT tokens for customers and store employees to enforce strict domain separation.

```
┌──────────────────┐      ┌──────────────────┐
│ Customer JWT     │      │ Store JWT        │
│                  │      │                  │
│ Payload:         │      │ Payload:         │
│  _id             │      │  _id             │
│  email           │      │  email           │
│  role: customer  │      │  storeId         │
│                  │      │  role: store_*   │
│ Signed with:     │      │ Signed with:     │
│ CUSTOMER_JWT_    │      │ STORE_JWT_       │
│ SECRET           │      │ SECRET           │
└──────────────────┘      └──────────────────┘
```

### 4.2 Token Lifecycle

| Step | Action |
|------|--------|
| Login | Server issues access token (short-lived) + refresh token (long-lived, stored in DB) |
| Request | Client sends `Authorization: Bearer <accessToken>` header |
| Refresh | Client sends refresh token to `/refresh-token` to get a new access token |
| Logout | Server clears the stored refresh token |

### 4.3 Password Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- Reset tokens generated with `crypto.randomBytes()`, stored on the user record with a 1-hour TTL
- Rate limiting on auth endpoints (`authLimiter` middleware)

---

## 5. Data Flow — Key Scenarios

### 5.1 Place a Ship to Store Order

```
Customer Site                 API Server                    MongoDB
     │                            │                            │
     │  POST /api/customer/orders │                            │
     │  { deliveryMethod:         │                            │
     │    "SHIP_TO_STORE",        │                            │
     │    storeId, items }        │                            │
     │ ────────────────────────►  │                            │
     │                            │  Start Transaction         │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Validate products exist   │
     │                            │  Calculate prices/tax      │
     │                            │                            │
     │                            │  Reserve inventory         │
     │                            │  (inc quantityReserved)    │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Create Order (status:     │
     │                            │  AWAITING_STORE_ACCEPTANCE)│
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Create OrderItems         │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Create StatusHistory      │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Commit Transaction        │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Send confirmation email   │
     │  ◄──── 201 { order }       │                            │
     │                            │                            │
```

### 5.2 Store Accepts an Order

```
Store Portal                  API Server                    MongoDB
     │                            │                            │
     │  POST /api/store/orders/   │                            │
     │  :orderId/accept           │                            │
     │  { pickupReadyTime }       │                            │
     │ ────────────────────────►  │                            │
     │                            │  Validate transition       │
     │                            │  AWAITING → ACCEPTED       │
     │                            │                            │
     │                            │  Update order status       │
     │                            │  Set pickupReadyTime       │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Create StatusHistory      │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Send email to customer    │
     │  ◄──── 200 { order }       │                            │
     │                            │                            │
```

### 5.3 Customer Requests a Return (BORIS)

```
Customer Site                 API Server                    MongoDB
     │                            │                            │
     │  POST /api/customer/       │                            │
     │  returns                   │                            │
     │  { orderId, reason,        │                            │
     │    items: [...] }          │                            │
     │ ────────────────────────►  │                            │
     │                            │  Verify order is COMPLETED │
     │                            │  Validate order items      │
     │                            │                            │
     │                            │  Start Transaction         │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Create Return record      │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Create ReturnItems        │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Update order status       │
     │                            │  → RETURN_REQUESTED        │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Create StatusHistory      │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Commit Transaction        │
     │  ◄──── 201 { return }      │                            │
     │                            │                            │
```

### 5.4 Store Completes a Return

```
Store Portal                  API Server                    MongoDB
     │                            │                            │
     │  POST /api/store/returns/  │                            │
     │  :returnId/complete        │                            │
     │ ────────────────────────►  │                            │
     │                            │  Validate status is        │
     │                            │  RETURN_ACCEPTED           │
     │                            │                            │
     │                            │  Restore inventory         │
     │                            │  (inc quantityOnHand)      │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Calculate refund amount   │
     │                            │  = Σ(unitPrice × qty)      │
     │                            │                            │
     │                            │  Update return status      │
     │                            │  → RETURN_COMPLETED        │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │                            │  Update order status       │
     │                            │  → RETURN_COMPLETED        │
     │                            │ ─────────────────────────► │
     │                            │                            │
     │  ◄──── 200 { return }      │                            │
     │                            │                            │
```

---

## 6. Notification Approach

### 6.1 Email (Nodemailer)

Transactional emails are sent via SMTP using Nodemailer at the following lifecycle points:

| Trigger | Recipient | Email Content |
|---------|-----------|---------------|
| Order placed | Customer | Order confirmation with item list and total |
| Order ready for pickup | Customer | Pickup-ready notice with estimated time |
| Order cancelled | Customer | Cancellation notice with reason |
| Order completed | Customer | Completion confirmation |
| Password reset requested | Customer | Reset link with 1-hour expiry |
| Return status update | Customer | Return confirmation with refund amount |

### 6.2 Store Portal Polling

The Store Portal uses a **polling-based notification system** via `NotificationContext`:

- The portal periodically fetches new/updated orders from `/api/store/orders`
- The `useNotifications` hook compares fetched data with the previously known state
- New or status-changed orders trigger in-app notification indicators

> **Future Enhancement:** Replace polling with WebSocket (Socket.io) for real-time push to the store portal (`io.to('store_${storeId}').emit('new_order', order)`).

---

## 7. Scalability Considerations

### 7.1 Current Architecture

| Aspect | Approach |
|--------|----------|
| **Database** | Single MongoDB instance with Mongoose ODM |
| **API** | Single Express process |
| **Frontend** | Two static React SPAs served by development servers |

### 7.2 Scaling Path

| Concern | Strategy |
|---------|----------|
| **API throughput** | Horizontal scaling behind a load balancer (PM2 cluster mode or Kubernetes pods) |
| **Database reads** | MongoDB replica set with read preference `secondaryPreferred` for read-heavy queries (products, inventory) |
| **Database writes** | MongoDB transactions ensure atomicity for order placement and return creation; sharding by `storeId` for store-scoped collections |
| **Geospatial queries** | `2dsphere` index on `Store.location` for efficient proximity searches |
| **Inventory concurrency** | Atomic `findOneAndUpdate` with `$expr` guards prevent overselling under concurrent reservations |
| **Static assets** | Deploy React builds to CDN (CloudFront, Vercel) |
| **Email delivery** | Offload to a message queue (Bull/BullMQ with Redis) for async email sending to avoid blocking API responses |
| **Real-time updates** | Migrate from polling to WebSocket (Socket.io) for store portal; use Redis adapter for multi-instance WebSocket |
| **Caching** | Redis cache for product catalog and store listings (cache-aside pattern with TTL) |
| **Monitoring** | Winston logging (already in place); add APM (Datadog, New Relic) and structured JSON logs |

### 7.3 Security Considerations

| Concern | Implementation |
|---------|----------------|
| **Authentication** | Separate JWT secrets for customer and store domains |
| **Rate limiting** | Applied to auth endpoints to prevent brute force |
| **Input validation** | express-validator on all write endpoints |
| **Password storage** | bcrypt with 12 salt rounds |
| **CORS** | Configured to allow only known origins (customer-site, store-portal) |
| **Sensitive fields** | `toJSON()` overrides strip `passwordHash`, `refreshToken` from API responses |
