# Product Requirements Document (PRD)

## Converse BOPIS & BORIS

**Version:** 1.0  
**Last Updated:** March 19, 2026  
**Status:** Active Development

---

## 1. Product Overview

Converse BOPIS & BORIS is a full-stack ecommerce platform for **Converse shoes** that supports two fulfillment models:

| Model | Full Name | Description |
|-------|-----------|-------------|
| **BOPIS** | Buy Online, Pick Up In Store | Customers browse and purchase shoes online, then pick them up at a selected Converse retail store. |
| **BORIS** | Buy Online, Return In Store | Customers return previously purchased items by visiting a store, with full inventory restoration and refund processing. |

The platform consists of two web applications — a **Customer Site** for shoppers and a **Store Portal** for retail employees — backed by a shared Node.js API and MongoDB database.

### 1.1 Goals

- Allow customers to browse the Converse catalog and place orders for **Ship to Store** pickup.
- Provide store employees with tools to accept incoming orders, manage pickup flow, and process in-store returns.
- Maintain accurate real-time inventory across stores through reservation, deduction, and restoration mechanisms.
- Deliver email notifications at key lifecycle points (order confirmation, pickup ready, return updates).

### 1.2 Target Users

| Persona | Description |
|---------|-------------|
| **Customer** | Online shopper who wants to purchase Converse shoes and pick them up at a nearby store. |
| **Store Associate** | In-store employee who handles day-to-day order fulfillment and return processing. |
| **Store Manager** | Senior store employee with full access to orders, returns, and inventory management. |

### 1.3 Tech Stack

| Layer | Technology |
|-------|-----------|
| Customer Site | React.js (port 3000) |
| Store Portal | React.js (port 3001) |
| API Server | Node.js + Express (port 5000) |
| Database | MongoDB |
| Email | Nodemailer (SMTP) |

---

## 2. Customer Stories

### 2.1 Browsing & Product Discovery

| ID | Story | Priority |
|----|-------|----------|
| CS-01 | As a customer, I want to browse the Converse shoe catalog so I can discover products I'd like to buy. | P0 |
| CS-02 | As a customer, I want to search products by name and filter by category so I can quickly find what I'm looking for. | P0 |
| CS-03 | As a customer, I want to view detailed product information including images, sizes, colors, and pricing so I can make an informed decision. | P0 |

### 2.2 Store Search & Delivery Selection

| ID | Story | Priority |
|----|-------|----------|
| CS-04 | As a customer, I want to select "Ship to Store" as my delivery method so I can pick up my order at a convenient location. | P0 |
| CS-05 | As a customer, I want to search for nearby stores by ZIP code so I can choose the most convenient pickup location. | P0 |
| CS-06 | As a customer, I want to see product availability at each store so I only select a store that has my items in stock. | P0 |

### 2.3 Cart & Checkout

| ID | Story | Priority |
|----|-------|----------|
| CS-07 | As a customer, I want to add shoes to my cart with a selected size, color, and quantity so I can build my order before checkout. | P0 |
| CS-08 | As a customer, I want to review my cart with subtotal, tax, and total before placing my order so I know exactly what I'm paying. | P0 |
| CS-09 | As a customer, I want to place a Ship to Store order and receive an order confirmation email so I know the order was submitted. | P0 |

### 2.4 Order Management

| ID | Story | Priority |
|----|-------|----------|
| CS-10 | As a customer, I want to view all my past and current orders so I can track their status. | P0 |
| CS-11 | As a customer, I want to view detailed order information including items, status history, and store details so I can stay informed. | P1 |
| CS-12 | As a customer, I want to cancel my order while it is still in PLACED or AWAITING_STORE_ACCEPTANCE status so I can change my mind before it's processed. | P1 |

### 2.5 Returns (BORIS)

| ID | Story | Priority |
|----|-------|----------|
| CS-13 | As a customer, I want to request a return for a completed order by selecting items and providing a reason so I can get a refund. | P0 |
| CS-14 | As a customer, I want to view all my return requests and their current status so I can track refund progress. | P1 |

### 2.6 Authentication & Account

| ID | Story | Priority |
|----|-------|----------|
| CS-15 | As a visitor, I want to register with my name, email, and password so I can create an account. | P0 |
| CS-16 | As a customer, I want to log in with my email and password so I can access my account. | P0 |
| CS-17 | As a customer, I want to reset my password via email if I forget it so I can regain access. | P1 |
| CS-18 | As a customer, I want to update my profile and manage saved addresses so my information stays current. | P2 |
| CS-19 | As a customer, I want to change my password from my account settings so I can keep my account secure. | P2 |

---

## 3. Store Employee Stories

### 3.1 Authentication

| ID | Story | Priority |
|----|-------|----------|
| SE-01 | As a store employee, I want to log in to the Store Portal with my credentials so I can access store operations. | P0 |
| SE-02 | As a store employee, I want to see my profile including my role and assigned store so I know my access level. | P2 |

### 3.2 Order Management

| ID | Story | Priority |
|----|-------|----------|
| SE-03 | As a store employee, I want to view all incoming Ship to Store orders for my store so I can manage fulfillment. | P0 |
| SE-04 | As a store employee, I want to accept an incoming order and optionally set an estimated pickup time so the customer knows when to arrive. | P0 |
| SE-05 | As a store employee, I want to mark an order as READY_FOR_PICKUP when items are prepared so the customer is notified via email. | P0 |
| SE-06 | As a store employee, I want to update order status through the lifecycle (ACCEPTED → READY_FOR_PICKUP → PICKED_UP → COMPLETED) so the order is tracked end-to-end. | P0 |
| SE-07 | As a store employee, I want to view detailed order information including customer details, items, and status history so I can assist customers effectively. | P1 |
| SE-08 | As a store employee, I want to filter orders by status so I can focus on orders needing attention. | P1 |

### 3.3 Return Processing (BORIS)

| ID | Story | Priority |
|----|-------|----------|
| SE-09 | As a store employee, I want to view all return requests for my store so I can process them. | P0 |
| SE-10 | As a store employee, I want to accept a return request after verifying items in person so I can proceed to refund. | P0 |
| SE-11 | As a store employee, I want to complete a return, which restores inventory and calculates the refund amount so the customer is reimbursed. | P0 |

### 3.4 Inventory Management

| ID | Story | Priority |
|----|-------|----------|
| SE-12 | As a store employee, I want to view my store's inventory with product details, quantities, and reserved counts so I know current stock levels. | P1 |
| SE-13 | As a store employee, I want to update the quantity on hand for an inventory item so the system reflects physical stock counts. | P1 |

---

## 4. Acceptance Criteria

### 4.1 Order Placement (BOPIS)

| # | Criterion |
|---|-----------|
| AC-01 | Customer can select "Ship to Store" delivery method during checkout. |
| AC-02 | System searches stores within proximity of the given ZIP code using geospatial queries. |
| AC-03 | Only stores with sufficient inventory for ALL cart items are selectable. |
| AC-04 | On order placement, inventory is reserved (quantityReserved incremented) within a MongoDB transaction. |
| AC-05 | Order is created with status `AWAITING_STORE_ACCEPTANCE` for Ship to Store orders. |
| AC-06 | An order confirmation email is sent to the customer. |
| AC-07 | A unique order number is generated in format `ORD-{timestamp}-{random}`. |

### 4.2 Store Order Acceptance

| # | Criterion |
|---|-----------|
| AC-08 | Store employee sees new orders on their dashboard with status `AWAITING_STORE_ACCEPTANCE`. |
| AC-09 | Accepting an order transitions status to `ACCEPTED` and optionally records a pickup ready time. |
| AC-10 | A status history entry is created for every status transition. |
| AC-11 | When order reaches `READY_FOR_PICKUP`, the customer receives a pickup-ready email notification. |

### 4.3 Order Status Lifecycle

| # | Criterion |
|---|-----------|
| AC-12 | Status transitions are validated against the allowed transitions map. |
| AC-13 | Invalid transitions are rejected with an appropriate error message. |
| AC-14 | The full status flow is: `PLACED → AWAITING_STORE_ACCEPTANCE → ACCEPTED → READY_FOR_PICKUP → PICKED_UP → COMPLETED`. |
| AC-15 | Cancellation is allowed only from `PLACED` or `AWAITING_STORE_ACCEPTANCE` statuses. |
| AC-16 | On cancellation, reserved inventory is released back. |

### 4.4 Return Processing (BORIS)

| # | Criterion |
|---|-----------|
| AC-17 | Returns can only be requested for orders with status `COMPLETED`. |
| AC-18 | Customer specifies which order items to return, quantity, and reason. |
| AC-19 | A unique return number is generated in format `RET-{timestamp}-{random}`. |
| AC-20 | Store employee can accept and then complete a return in a two-step process. |
| AC-21 | On return completion, returned item quantities are restored to store inventory. |
| AC-22 | Refund amount is calculated as `sum(unitPrice × quantity)` for all returned items. |
| AC-23 | Return lifecycle is: `RETURN_REQUESTED → RETURN_ACCEPTED → RETURN_COMPLETED`. |

### 4.5 Authentication

| # | Criterion |
|---|-----------|
| AC-24 | Customer passwords are hashed with bcrypt (12 salt rounds) before storage. |
| AC-25 | JWT access tokens are issued on login; refresh tokens are stored in the database. |
| AC-26 | Customer and Store employee authentication use separate JWT secrets and middleware. |
| AC-27 | Password reset tokens expire after 1 hour. |
| AC-28 | Rate limiting is applied to login and registration endpoints. |

---

## 5. Business Rules

| # | Rule |
|---|------|
| BR-01 | **Single store per order** — All items in a Ship to Store order must be fulfilled by the same store. |
| BR-02 | **Inventory reservation on placement** — When a Ship to Store order is placed, `quantityReserved` is incremented for each item at the selected store. If any item has insufficient available quantity (`quantityOnHand - quantityReserved < requested`), the order is rejected. |
| BR-03 | **Inventory deduction on acceptance** — When the store accepts the order, `quantityOnHand` and `quantityReserved` are both decremented (stock physically allocated). |
| BR-04 | **All items must be available** — A store is only eligible for selection if it has sufficient available quantity for every item in the cart. |
| BR-05 | **Return only for completed orders** — Customers can only initiate a return for orders that have reached `COMPLETED` status. |
| BR-06 | **Inventory restoration on return** — When a return is completed, `quantityOnHand` is incremented for each returned item at the store. |
| BR-07 | **Inventory release on cancellation** — When an order is cancelled, `quantityReserved` is decremented for each item, freeing the reserved stock. |
| BR-08 | **Tax rate** — Tax is calculated at a flat 8% of the subtotal. |
| BR-09 | **Order number format** — Auto-generated as `ORD-{base36Timestamp}-{base36Random}`. |
| BR-10 | **Return number format** — Auto-generated as `RET-{base36Timestamp}-{base36Random}`. |
| BR-11 | **Status transition enforcement** — All status changes are validated against a predefined transition map; invalid transitions throw errors. |
| BR-12 | **Customer cancellation window** — Customers can only cancel orders in `PLACED` or `AWAITING_STORE_ACCEPTANCE` statuses. |

---

## 6. Out of Scope (v1)

- Payment gateway integration (Stripe, PayPal)
- Real-time WebSocket push notifications (currently logging/email only; store portal uses polling)
- Multi-store split orders
- Shipping carrier integration for "Ship to Me" fulfillment tracking
- Admin dashboard for platform-wide management
- Mobile native applications
- Promotions, coupons, and discount codes
