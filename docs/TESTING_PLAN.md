# Testing Plan

## Converse BOPIS & BORIS

**Version:** 1.0  
**Last Updated:** March 19, 2026

---

## Table of Contents

1. [Testing Strategy Overview](#1-testing-strategy-overview)
2. [Unit Tests](#2-unit-tests)
3. [Integration Tests](#3-integration-tests)
4. [End-to-End Tests](#4-end-to-end-tests)
5. [Test Scenarios](#5-test-scenarios)
6. [Edge Case Testing](#6-edge-case-testing)
7. [Test Infrastructure](#7-test-infrastructure)

---

## 1. Testing Strategy Overview

### 1.1 Testing Pyramid

```
         ┌───────────┐
         │   E2E     │   Cypress
         │  (few)    │   Critical user journeys
         ├───────────┤
         │Integration│   Supertest + Jest
         │ (medium)  │   API endpoint testing
         ├───────────┤
         │   Unit    │   Jest + React Testing Library
         │  (many)   │   Components, services, utilities
         └───────────┘
```

### 1.2 Tools & Frameworks

| Layer | Tool | Target |
|-------|------|--------|
| Unit (Frontend) | Jest + React Testing Library | React components, hooks, context, utilities |
| Unit (Backend) | Jest | Services, models, utilities, validators |
| Integration | Jest + Supertest | Express API endpoints with MongoDB |
| E2E | Cypress | Full user flows across browser |
| Mocking | Jest mocks, `mongodb-memory-server` | Isolate dependencies |
| Coverage | Istanbul (via Jest `--coverage`) | Minimum 80% line coverage target |

### 1.3 Test Commands

```bash
# Run all tests
npm run test:all

# Individual apps
npm run test:customer     # cd customer-site && npm test
npm run test:store        # cd store-portal && npm test
npm run test:server       # cd server && npm test
```

---

## 2. Unit Tests

### 2.1 Frontend — Customer Site (`customer-site/`)

#### 2.1.1 Components

| Component | Test File | Scenarios |
|-----------|-----------|-----------|
| `Header` | `Header.test.jsx` | Renders logo and nav links; shows login/register when logged out; shows user name and logout when logged in |
| `Footer` | `Footer.test.jsx` | Renders footer content |
| `ProductCard` | `ProductCard.test.jsx` | Renders product image, name, price; shows sale price when available; handles click navigation |
| `ProtectedRoute` | `ProtectedRoute.test.jsx` | Renders children when authenticated; redirects to `/login` when not authenticated |

#### 2.1.2 Pages

| Page | Test File | Scenarios |
|------|-----------|-----------|
| `HomePage` | `HomePage.test.jsx` | Fetches and displays product list; handles loading state; handles empty state; pagination works |
| `ProductPage` | `ProductPage.test.jsx` | Displays product details; size and color selectors work; add-to-cart button calls CartContext; handles product not found |
| `CartPage` | `CartPage.test.jsx` | Renders cart items with quantities; updates quantity; removes items; displays subtotal/tax/total; empty cart message |
| `CheckoutPage` | `CheckoutPage.test.jsx` | Delivery method toggle (Ship to Me / Ship to Store); store search by ZIP code; store selection; order submission; validation errors |
| `OrdersPage` | `OrdersPage.test.jsx` | Lists orders; handles pagination; shows order status badges |
| `OrderDetailPage` | `OrderDetailPage.test.jsx` | Displays order info, items, status history; cancel button appears for cancellable statuses; cancel confirmation |
| `ReturnPage` | `ReturnPage.test.jsx` | Item selection checkboxes; quantity and reason inputs; form validation; submission |
| `LoginPage` | `LoginPage.test.jsx` | Form validation; successful login redirects; error message on invalid credentials |
| `RegisterPage` | `RegisterPage.test.jsx` | Form validation (all fields); password match validation; successful registration redirects |
| `ForgotPasswordPage` | `ForgotPasswordPage.test.jsx` | Email validation; success message after submission |
| `ResetPasswordPage` | `ResetPasswordPage.test.jsx` | Token extraction from URL; password validation; success redirect |
| `AccountPage` | `AccountPage.test.jsx` | Displays profile info; edit profile form; address management (add/edit/delete) |

#### 2.1.3 Context & Hooks

| Module | Test File | Scenarios |
|--------|-----------|-----------|
| `AuthContext` | `AuthContext.test.jsx` | Provides user state; login sets user and token; logout clears state; persists across page loads |
| `CartContext` | `CartContext.test.jsx` | Add item; remove item; update quantity; clear cart; calculate totals |
| `useAuth` | `useAuth.test.js` | Returns auth state and methods; handles token refresh |
| `useCart` | `useCart.test.js` | Returns cart state and manipulation methods |
| `useStoreSearch` | `useStoreSearch.test.js` | Calls store search API; returns results; handles loading/error states |
| `useOrderStatus` | `useOrderStatus.test.js` | Fetches order status; returns formatted status data |

#### 2.1.4 Utilities

| Utility | Test File | Scenarios |
|---------|-----------|-----------|
| `formatCurrency` | `formatCurrency.test.js` | Formats numbers as USD; handles zero; handles negative |
| `validators` | `validators.test.js` | Email validation; password strength; required fields |
| `tokenStorage` | `tokenStorage.test.js` | Get/set/clear token in localStorage |

### 2.2 Frontend — Store Portal (`store-portal/`)

#### 2.2.1 Components

| Component | Test File | Scenarios |
|-----------|-----------|-----------|
| `LoginForm` | `LoginForm.test.jsx` | Form fields render; validation; submit calls onLogin; error display |
| `Header` | `Header.test.jsx` | Shows user name and store; notification badge count |
| `Sidebar` | `Sidebar.test.jsx` | Nav links render; active state highlighting; collapse behavior |
| `Badge` | `Badge.test.jsx` | Renders with correct color for each status |
| `Loader` | `Loader.test.jsx` | Renders spinner |
| `ProtectedRoute` | `ProtectedRoute.test.jsx` | Renders children when authenticated; redirects to login otherwise |

#### 2.2.2 Pages

| Page | Test File | Scenarios |
|------|-----------|-----------|
| `DashboardPage` | `DashboardPage.test.jsx` | Displays order/return counts; pending items count; quick action links |
| `OrdersPage` | `OrdersPage.test.jsx` | Lists orders; status filter tabs; accept order action; status badges |
| `OrderDetailPage` | `OrderDetailPage.test.jsx` | Full order details; item list; status history timeline; action buttons per status |
| `ReturnsPage` | `ReturnsPage.test.jsx` | Lists returns; accept/complete actions; return item details |
| `InventoryPage` | `InventoryPage.test.jsx` | Inventory table; SKU search filter; edit quantity modal; pagination |
| `LoginPage` | `LoginPage.test.jsx` | Login form integration; error handling; redirect on success |

#### 2.2.3 Context & Hooks

| Module | Test File | Scenarios |
|--------|-----------|-----------|
| `AuthContext` | `AuthContext.test.jsx` | Login/logout; stores user with storeId and role |
| `NotificationContext` | `NotificationContext.test.jsx` | Polls for new orders; increments notification count; clears on view |
| `useOrders` | `useOrders.test.js` | Fetches store orders; filters by status; handles accept/update |
| `useReturns` | `useReturns.test.js` | Fetches store returns; handles accept/complete |
| `useNotifications` | `useNotifications.test.js` | Polling interval; detects new orders; count management |

#### 2.2.4 Utilities

| Utility | Test File | Scenarios |
|---------|-----------|-----------|
| `formatDate` | `formatDate.test.js` | Formats ISO dates; handles null/undefined |
| `statusLabels` | `statusLabels.test.js` | Maps status codes to display labels |

### 2.3 Backend — Server (`server/`)

#### 2.3.1 Services

| Service | Test File | Scenarios |
|---------|-----------|-----------|
| `customerAuthService` | `customerAuthService.test.js` | Register (hash password, create customer, issue tokens); login (validate credentials, issue tokens); refresh token; forgot/reset password; profile CRUD; address CRUD |
| `storeAuthService` | `storeAuthService.test.js` | Login; logout (clear refresh token); get profile |
| `orderService` | `orderService.test.js` | Create order (Ship to Store with inventory reservation, Ship to Me with digital check); get customer orders with pagination; get order by ID with items and history; get store orders filtered by status; accept order (validate transition, set pickup time); update status (validate transition, handle cancellation inventory release); cancel order (validate cancellable status, release inventory) |
| `returnService` | `returnService.test.js` | Create return (validate order is COMPLETED, create return + items in transaction); get customer returns; get store returns with items; accept return (validate status); complete return (restore inventory, calculate refund) |
| `inventoryService` | `inventoryService.test.js` | Check store availability (all items, partial, none); reserve inventory (success, insufficient); deduct inventory; release inventory; restore inventory; get store inventory for product; check digital availability |
| `storeSearchService` | `storeSearchService.test.js` | Find nearby stores by ZIP (geospatial query); filter by product availability |
| `emailService` | `emailService.test.js` | Send order confirmation; send pickup ready email; send return confirmation; send password reset email; handle SMTP errors |
| `notificationService` | `notificationService.test.js` | Notify store of new order; notify customer of status update; notify customer of return update |

#### 2.3.2 Models

| Model | Test File | Scenarios |
|-------|-----------|-----------|
| `Customer` | `Customer.test.js` | Password hashing on save; comparePassword method; toJSON strips sensitive fields; email unique constraint |
| `StoreUser` | `StoreUser.test.js` | Password hashing; comparePassword; toJSON; role validation |
| `Order` | `Order.test.js` | Auto-generate orderNumber; require storeId for SHIP_TO_STORE; status enum validation |
| `Return` | `Return.test.js` | Auto-generate returnNumber; status enum validation |
| `StoreInventory` | `StoreInventory.test.js` | quantityAvailable virtual; unique compound index |

#### 2.3.3 Middleware

| Middleware | Test File | Scenarios |
|-----------|-----------|-----------|
| `customerAuth` | `customerAuth.test.js` | Valid token passes; expired token rejects (401); missing token rejects (401); invalid token rejects (401) |
| `storeAuth` | `storeAuth.test.js` | Valid token passes; attaches storeUser to request; rejects inactive users |
| `rateLimiter` | `rateLimiter.test.js` | Allows requests under limit; blocks requests over limit (429) |
| `validateRequest` | `validateRequest.test.js` | Passes when no validation errors; returns 422 with errors array |
| `errorHandler` | `errorHandler.test.js` | Returns 500 for unhandled errors; formats error message |

#### 2.3.4 Validators

| Validator | Test File | Scenarios |
|-----------|-----------|-----------|
| `authValidator` | `authValidator.test.js` | Registration: required fields, email format, password length; login: required fields; change/reset password: new password rules |
| `orderValidator` | `orderValidator.test.js` | Create order: required delivery method, items array non-empty; update status: valid status string |
| `returnValidator` | `returnValidator.test.js` | Create return: required orderId, reason, items array |
| `storeValidator` | `storeValidator.test.js` | Store search: required zipcode; accept order: optional pickupReadyTime date format |

#### 2.3.5 Utilities

| Utility | Test File | Scenarios |
|---------|-----------|-----------|
| `constants` | `constants.test.js` | ORDER_STATUSES enum values; VALID_TRANSITIONS map; isValidTransition returns correct booleans; DELIVERY_METHODS; RETURN_STATUSES |
| `geocode` | `geocode.test.js` | Converts ZIP to coordinates; handles invalid ZIP |

---

## 3. Integration Tests

### 3.1 Setup

Integration tests use **Supertest** to make HTTP requests against the Express app and **mongodb-memory-server** for an isolated in-memory MongoDB instance.

```javascript
// test/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

### 3.2 Customer Auth API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | Register new customer | POST | `/api/customer/auth/register` | 201 with tokens and customer |
| 2 | Register duplicate email | POST | `/api/customer/auth/register` | 400/409 error |
| 3 | Register with missing fields | POST | `/api/customer/auth/register` | 422 validation errors |
| 4 | Login with valid credentials | POST | `/api/customer/auth/login` | 200 with tokens |
| 5 | Login with wrong password | POST | `/api/customer/auth/login` | 401 |
| 6 | Login with non-existent email | POST | `/api/customer/auth/login` | 401 |
| 7 | Logout | POST | `/api/customer/auth/logout` | 200, refresh token cleared |
| 8 | Refresh token | POST | `/api/customer/auth/refresh-token` | 200 with new tokens |
| 9 | Refresh with invalid token | POST | `/api/customer/auth/refresh-token` | 401 |
| 10 | Get profile (authenticated) | GET | `/api/customer/auth/me` | 200 with customer data |
| 11 | Get profile (no token) | GET | `/api/customer/auth/me` | 401 |
| 12 | Update profile | PUT | `/api/customer/auth/profile` | 200 with updated data |
| 13 | Change password | PUT | `/api/customer/auth/change-password` | 200 |
| 14 | Change password (wrong current) | PUT | `/api/customer/auth/change-password` | 400 |
| 15 | Forgot password | POST | `/api/customer/auth/forgot-password` | 200 |
| 16 | Reset password | POST | `/api/customer/auth/reset-password` | 200 |
| 17 | Reset with expired token | POST | `/api/customer/auth/reset-password` | 400 |
| 18 | Add address | POST | `/api/customer/auth/addresses` | 201 |
| 19 | Update address | PUT | `/api/customer/auth/addresses/:id` | 200 |
| 20 | Delete address | DELETE | `/api/customer/auth/addresses/:id` | 200 |

### 3.3 Customer Products API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | List products (default pagination) | GET | `/api/customer/products` | 200 with products array and pagination |
| 2 | List products with search | GET | `/api/customer/products?search=chuck` | 200 with filtered results |
| 3 | List products with category filter | GET | `/api/customer/products?category=Sneakers` | 200 with filtered results |
| 4 | Get product by slug | GET | `/api/customer/products/slug/chuck-taylor-all-star` | 200 with product |
| 5 | Get product by non-existent slug | GET | `/api/customer/products/slug/not-real` | 404 |
| 6 | Get product by ID | GET | `/api/customer/products/:id` | 200 with product |
| 7 | Get product by invalid ID | GET | `/api/customer/products/invalid` | 404 or 400 |

### 3.4 Customer Stores API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | Search stores by ZIP | GET | `/api/customer/stores/search?zipcode=97201` | 200 with stores array |
| 2 | Search stores with product filter | GET | `/api/customer/stores/search?zipcode=97201&productId=...` | 200 with filtered stores |
| 3 | Search with missing ZIP | GET | `/api/customer/stores/search` | 422 validation error |
| 4 | Get store inventory for product | GET | `/api/customer/stores/:storeId/inventory?productId=...` | 200 with inventory array |

### 3.5 Customer Orders API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | Create Ship to Store order | POST | `/api/customer/orders` | 201 with order, status AWAITING_STORE_ACCEPTANCE, inventory reserved |
| 2 | Create order with insufficient inventory | POST | `/api/customer/orders` | 400 error |
| 3 | Create order without auth | POST | `/api/customer/orders` | 401 |
| 4 | Create order with missing fields | POST | `/api/customer/orders` | 422 |
| 5 | List my orders | GET | `/api/customer/orders` | 200 with orders and pagination |
| 6 | List orders (no orders) | GET | `/api/customer/orders` | 200 with empty array |
| 7 | Get order by ID | GET | `/api/customer/orders/:id` | 200 with items and statusHistory |
| 8 | Get another customer's order | GET | `/api/customer/orders/:id` | 403/404 |
| 9 | Cancel order (PLACED) | POST | `/api/customer/orders/:id/cancel` | 200, status CANCELLED, inventory released |
| 10 | Cancel order (ACCEPTED) | POST | `/api/customer/orders/:id/cancel` | 400 error |

### 3.6 Customer Returns API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | Create return for completed order | POST | `/api/customer/returns` | 201, order status → RETURN_REQUESTED |
| 2 | Create return for non-completed order | POST | `/api/customer/returns` | 400 error |
| 3 | Create return without auth | POST | `/api/customer/returns` | 401 |
| 4 | List my returns | GET | `/api/customer/returns` | 200 with returns array |

### 3.7 Store Auth API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | Login store employee | POST | `/api/store/auth/login` | 200 with tokens and user (includes storeId, role) |
| 2 | Login with wrong credentials | POST | `/api/store/auth/login` | 401 |
| 3 | Logout | POST | `/api/store/auth/logout` | 200 |
| 4 | Get store profile | GET | `/api/store/auth/me` | 200 with storeUser data |

### 3.8 Store Orders API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | List store orders | GET | `/api/store/orders` | 200 with orders for the store |
| 2 | List with status filter | GET | `/api/store/orders?status=AWAITING_STORE_ACCEPTANCE` | 200 filtered |
| 3 | Get store order by ID | GET | `/api/store/orders/:id` | 200 with full order details |
| 4 | Get order from different store | GET | `/api/store/orders/:id` | 404 |
| 5 | Accept order | POST | `/api/store/orders/:id/accept` | 200, status → ACCEPTED |
| 6 | Accept already accepted order | POST | `/api/store/orders/:id/accept` | 400 |
| 7 | Update status to READY_FOR_PICKUP | PATCH | `/api/store/orders/:id/status` | 200, status updated |
| 8 | Invalid status transition | PATCH | `/api/store/orders/:id/status` | 400 |
| 9 | Full lifecycle: accept → ready → picked_up → completed | Multiple | Multiple | All transitions succeed |

### 3.9 Store Returns API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | List store returns | GET | `/api/store/returns` | 200 with returns and items |
| 2 | Accept return | POST | `/api/store/returns/:id/accept` | 200, status → RETURN_ACCEPTED |
| 3 | Accept already accepted return | POST | `/api/store/returns/:id/accept` | 400 |
| 4 | Complete return | POST | `/api/store/returns/:id/complete` | 200, status → RETURN_COMPLETED, refundAmount set, inventory restored |
| 5 | Complete return not yet accepted | POST | `/api/store/returns/:id/complete` | 400 |

### 3.10 Store Inventory API

| # | Test | Method | Endpoint | Expected |
|---|------|--------|----------|----------|
| 1 | List inventory | GET | `/api/store/inventory` | 200 with paginated inventory |
| 2 | List with SKU filter | GET | `/api/store/inventory?sku=CONV` | 200 with filtered results |
| 3 | Get inventory item | GET | `/api/store/inventory/:id` | 200 with populated product |
| 4 | Get non-existent item | GET | `/api/store/inventory/:id` | 404 |
| 5 | Update inventory quantity | PUT | `/api/store/inventory/:id` | 200 with updated quantityOnHand |

---

## 4. End-to-End Tests

### 4.1 Setup

E2E tests use **Cypress** with a running backend (seeded database) and both frontend applications.

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      storePortalUrl: 'http://localhost:3001',
      apiUrl: 'http://localhost:5000/api',
    },
    setupNodeEvents(on, config) {
      // seed/reset database before tests
    },
  },
};
```

### 4.2 Customer Site E2E Flows

#### Flow 1: Customer Registration & Login

```
1. Visit /register
2. Fill in firstName, lastName, email, password, confirm password
3. Submit form
4. Assert redirect to home page
5. Assert header shows customer name
6. Logout
7. Visit /login
8. Enter credentials
9. Submit
10. Assert redirect to home page with authenticated state
```

#### Flow 2: Browse Products & Add to Cart

```
1. Visit home page
2. Assert product grid is visible with product cards
3. Search for "Chuck Taylor"
4. Assert filtered results
5. Click on a product card
6. Assert product detail page loads
7. Select size "10"
8. Select color "Black"
9. Click "Add to Cart"
10. Assert cart badge shows count 1
11. Navigate to cart page
12. Assert item appears with correct details and price
```

#### Flow 3: Ship to Store Checkout (BOPIS)

```
1. (Logged in with items in cart)
2. Navigate to /checkout
3. Select "Ship to Store" delivery method
4. Enter ZIP code "97201"
5. Click "Search Stores"
6. Assert nearby stores appear with availability
7. Select a store
8. Click "Place Order"
9. Assert order confirmation page/modal
10. Assert order number displayed
11. Navigate to /orders
12. Assert new order appears with status "AWAITING_STORE_ACCEPTANCE"
```

#### Flow 4: View Order Detail & Cancel

```
1. Navigate to /orders
2. Click on an order with status "AWAITING_STORE_ACCEPTANCE"
3. Assert order detail page with items, store info, status timeline
4. Click "Cancel Order"
5. Confirm cancellation
6. Assert status changes to "CANCELLED"
7. Navigate back to /orders
8. Assert order shows "CANCELLED" badge
```

#### Flow 5: Request a Return (BORIS)

```
1. Navigate to /orders
2. Click on a COMPLETED order
3. Click "Request Return"
4. Select items to return
5. Enter return reason
6. Submit return request
7. Assert success message
8. Navigate to returns page
9. Assert return appears with status "RETURN_REQUESTED"
```

#### Flow 6: Password Reset

```
1. Visit /login
2. Click "Forgot Password?"
3. Enter email address
4. Submit
5. Assert success message ("Password reset email sent")
6. (In test: extract reset token from API/DB)
7. Visit /reset-password/:token
8. Enter new password
9. Submit
10. Assert success redirect to login
11. Login with new password
12. Assert successful login
```

### 4.3 Store Portal E2E Flows

#### Flow 7: Store Employee Login & Dashboard

```
1. Visit store portal (localhost:3001)
2. Enter store employee credentials
3. Submit login
4. Assert dashboard page loads
5. Assert order counts visible
6. Assert sidebar navigation present (Orders, Returns, Inventory)
```

#### Flow 8: Accept Order & Update Status

```
1. (Logged into store portal)
2. Navigate to Orders page
3. Assert pending orders visible
4. Click on an order with "AWAITING_STORE_ACCEPTANCE" status
5. Click "Accept Order"
6. Set pickup ready time
7. Confirm acceptance
8. Assert status updates to "ACCEPTED"
9. Click "Mark as Ready for Pickup"
10. Assert status updates to "READY_FOR_PICKUP"
11. Click "Mark as Picked Up"
12. Assert status updates to "PICKED_UP"
13. Click "Mark as Completed"
14. Assert status updates to "COMPLETED"
```

#### Flow 9: Process a Return

```
1. Navigate to Returns page
2. Assert return request visible with items
3. Click on a return with "RETURN_REQUESTED" status
4. Click "Accept Return"
5. Assert status updates to "RETURN_ACCEPTED"
6. Click "Complete Return"
7. Assert status updates to "RETURN_COMPLETED"
8. Assert refund amount displayed
```

#### Flow 10: Manage Inventory

```
1. Navigate to Inventory page
2. Assert inventory table with products, sizes, quantities
3. Search by SKU
4. Assert filtered results
5. Click edit on an inventory item
6. Update quantity on hand
7. Save
8. Assert updated quantity displayed
```

### 4.4 Cross-Application E2E Flow

#### Flow 11: Full BOPIS Lifecycle (Customer + Store)

```
Customer Site:
  1. Register/Login
  2. Browse products, add to cart
  3. Checkout with Ship to Store
  4. Assert order status: AWAITING_STORE_ACCEPTANCE

Store Portal:
  5. Login as store employee
  6. View new order on Orders page
  7. Accept order with pickup time
  8. Mark as READY_FOR_PICKUP

Customer Site:
  9. View order detail, see READY_FOR_PICKUP status

Store Portal:
  10. Mark as PICKED_UP
  11. Mark as COMPLETED

Customer Site:
  12. Verify order is COMPLETED
  13. Request a return

Store Portal:
  14. Accept return
  15. Complete return

Customer Site:
  16. Verify return is RETURN_COMPLETED with refund amount
```

---

## 5. Test Scenarios

### 5.1 Registration

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Register with all valid fields | 201, customer created, tokens returned |
| 2 | Register with existing email | Error (duplicate email) |
| 3 | Register with missing firstName | 422 validation error |
| 4 | Register with invalid email format | 422 validation error |
| 5 | Register with short password (<6 chars) | 422 validation error |

### 5.2 Login

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Login with correct credentials | 200, tokens returned |
| 2 | Login with wrong password | 401 |
| 3 | Login with non-existent email | 401 |
| 4 | Login with inactive account | 401 or 403 |

### 5.3 Product Browsing

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Fetch products (no filters) | Paginated list of active products |
| 2 | Search by name | Filtered results matching search term |
| 3 | Filter by category | Only products in selected category |
| 4 | Fetch page beyond total pages | Empty products array |
| 5 | Get product by valid slug | Product details returned |
| 6 | Get product by inactive slug | 404 (filtered by isActive) |

### 5.4 Store Search

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Search by valid ZIP | Stores sorted by distance |
| 2 | Search by ZIP with no nearby stores | Empty array |
| 3 | Search with productId filter | Only stores carrying that product |
| 4 | Get inventory for product at store | Inventory by size/color with availability |

### 5.5 Order Placement

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Ship to Store — all items available | Order created, inventory reserved |
| 2 | Ship to Store — one item insufficient | Error, no order created, no reservation |
| 3 | Ship to Store — no storeId provided | 422 validation error |
| 4 | Ship to Me — all items available | Order created with PLACED status |
| 5 | Ship to Me — insufficient digital inventory | Error |
| 6 | Empty items array | 422 validation error |

### 5.6 Order Acceptance

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Accept AWAITING_STORE_ACCEPTANCE order | Status → ACCEPTED, pickupReadyTime set |
| 2 | Accept already ACCEPTED order | 400 invalid transition |
| 3 | Accept order from different store | 404 |
| 4 | Accept with pickup time | pickupReadyTime saved |

### 5.7 Status Updates

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | ACCEPTED → READY_FOR_PICKUP | Success, email sent to customer |
| 2 | READY_FOR_PICKUP → PICKED_UP | Success, pickupCompletedTime set |
| 3 | PICKED_UP → COMPLETED | Success |
| 4 | PLACED → COMPLETED (skip steps) | 400 invalid transition |
| 5 | COMPLETED → CANCELLED | 400 invalid transition |
| 6 | CANCELLED → ACCEPTED | 400 invalid transition (terminal state) |

### 5.8 Returns

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Create return for COMPLETED order | Return created, order → RETURN_REQUESTED |
| 2 | Create return for ACCEPTED order | 400 error |
| 3 | Accept return | Status → RETURN_ACCEPTED |
| 4 | Complete return | Status → RETURN_COMPLETED, inventory restored, refund calculated |
| 5 | Complete return that is only REQUESTED | 400 error (must be ACCEPTED first) |

### 5.9 Inventory Management

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Update quantityOnHand | Value updated, lastUpdated timestamp refreshed |
| 2 | View inventory with product population | Product name, SKU, images included |
| 3 | Filter by SKU | Only matching items returned |
| 4 | Pagination | Correct page/totalPages values |

---

## 6. Edge Case Testing

### 6.1 Concurrent Inventory

| # | Scenario | Test Approach |
|---|----------|---------------|
| 1 | Two customers place orders for the last item simultaneously | Fire two `POST /orders` requests in parallel. One should succeed (201), the other should fail with insufficient inventory error. Verify final `quantityReserved` equals the one successful order. |
| 2 | Order placement + manual inventory update race | Place order while store employee updates quantityOnHand. Verify atomic `$expr` guard prevents negative available quantity. |
| 3 | Cancellation releases exactly the right amount | Place order (reserve), cancel order (release). Verify `quantityReserved` returns to pre-order level. |

### 6.2 Expired Tokens

| # | Scenario | Expected |
|---|----------|----------|
| 1 | API request with expired access token | 401 Unauthorized |
| 2 | Refresh with expired refresh token | 401, must re-login |
| 3 | Password reset with expired token (>1 hour) | 400 error |
| 4 | Password reset with already-used token | 400 error |

### 6.3 Invalid Status Transitions

| # | Transition | Expected |
|---|-----------|----------|
| 1 | PLACED → COMPLETED | 400 |
| 2 | CANCELLED → ACCEPTED | 400 |
| 3 | COMPLETED → PLACED | 400 |
| 4 | RETURN_COMPLETED → RETURN_REQUESTED | 400 |
| 5 | READY_FOR_PICKUP → ACCEPTED (backward) | 400 |

### 6.4 Authorization Boundary

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Customer token used on store endpoint | 401 |
| 2 | Store token used on customer endpoint | 401 |
| 3 | Customer A accessing Customer B's order | 403/404 |
| 4 | Store A accessing Store B's order | 404 |
| 5 | store_associate accessing manager-only features | 403 (if role-restricted) |

### 6.5 Input Validation Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Order with quantity 0 | 422 (min: 1) |
| 2 | Order with negative quantity | 422 |
| 3 | Inventory update to negative quantityOnHand | 400 (min: 0) |
| 4 | Register with empty string email | 422 |
| 5 | XSS in product search query | Sanitized, no injection |
| 6 | SQL/NoSQL injection in query params | Mongoose sanitization, no effect |
| 7 | Extremely long string fields | Handled by validation or truncated |

### 6.6 Network & Error Handling

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Database connection lost during order creation | Transaction aborted, 500 error, no partial data |
| 2 | Email service failure during order placement | Order still created, email failure logged (non-blocking) |
| 3 | Malformed JSON request body | 400 parse error |
| 4 | Request to non-existent endpoint | 404 |

---

## 7. Test Infrastructure

### 7.1 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd server && npm ci
      - run: cd server && npm test -- --coverage
      - uses: codecov/codecov-action@v4

  test-customer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd customer-site && npm ci
      - run: cd customer-site && npm test -- --coverage --watchAll=false

  test-store:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd store-portal && npm ci
      - run: cd store-portal && npm test -- --coverage --watchAll=false

  e2e:
    runs-on: ubuntu-latest
    needs: [test-server, test-customer, test-store]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm run install:all
      - run: npm run start:all &
      - uses: cypress-io/github-action@v6
        with:
          wait-on: 'http://localhost:3000, http://localhost:3001, http://localhost:5000/api'
```

### 7.2 Coverage Targets

| Area | Target |
|------|--------|
| Server services | ≥ 90% line coverage |
| Server controllers | ≥ 85% line coverage |
| Server middleware | ≥ 90% line coverage |
| Customer-site components | ≥ 80% line coverage |
| Store-portal components | ≥ 80% line coverage |
| Overall | ≥ 80% line coverage |

### 7.3 Test Data Seeding

A seed script (`server/test/seed.js`) provides consistent test data:

| Entity | Seed Data |
|--------|-----------|
| Customers | 3 test customers with addresses |
| Products | 10 Converse shoe products with sizes and colors |
| Stores | 3 stores with geospatial coordinates and operating hours |
| StoreInventory | Inventory records for all products across all stores |
| StoreUsers | 1 manager + 1 associate per store |
| Orders | Orders in various statuses for integration/E2E tests |
| Returns | Returns in various statuses |

### 7.4 Mocking Strategy

| Dependency | Mock Approach |
|-----------|---------------|
| MongoDB | `mongodb-memory-server` for integration tests; Jest mocks for unit tests |
| Nodemailer | Jest mock (`jest.mock('nodemailer')`) — verify `sendMail` called with correct args |
| Geocode API | Jest mock returning fixed coordinates for test ZIP codes |
| JWT | Real JWT generation/verification in integration tests; mocked in unit tests |
| `Date.now()` | `jest.useFakeTimers()` for token expiry and timestamp tests |
