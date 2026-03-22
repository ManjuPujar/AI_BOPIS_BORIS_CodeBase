# Database Design

## Converse BOPIS & BORIS

**Database:** MongoDB  
**ODM:** Mongoose 8.x  
**Version:** 1.0  
**Last Updated:** March 19, 2026

---

## Table of Contents

1. [Collections Overview](#1-collections-overview)
2. [Schema Definitions](#2-schema-definitions)
3. [Relationships](#3-relationships)
4. [Indexing Strategy](#4-indexing-strategy)
5. [Data Integrity & Transactions](#5-data-integrity--transactions)

---

## 1. Collections Overview

The database consists of **11 collections** organized into four domains:

| Domain | Collection | Purpose |
|--------|-----------|---------|
| **Users** | `customers` | Customer accounts |
| | `storeusers` | Store employee accounts |
| **Catalog** | `products` | Product catalog |
| | `stores` | Physical store locations |
| **Inventory** | `storeinventories` | Per-store, per-SKU/size stock levels |
| | `digitalinventories` | Warehouse/online stock levels |
| **Orders** | `orders` | Order headers |
| | `orderitems` | Order line items |
| | `orderstatushistories` | Audit trail of status changes |
| **Returns** | `returns` | Return headers |
| | `returnitems` | Return line items |

---

## 2. Schema Definitions

### 2.1 Customers

**Collection:** `customers`  
**Model:** `Customer`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `firstName` | String | Yes | Trimmed | Customer first name |
| `lastName` | String | Yes | Trimmed | Customer last name |
| `email` | String | Yes | Unique, lowercase, trimmed | Login email |
| `passwordHash` | String | Yes | Hashed with bcrypt (12 rounds) | Never returned in API responses |
| `phone` | String | No | Trimmed | Contact phone number |
| `addresses` | Array\<Address\> | No | Embedded subdocuments | Saved addresses |
| `refreshToken` | String | No | | JWT refresh token (stripped from JSON) |
| `resetPasswordToken` | String | No | | Password reset token |
| `resetPasswordExpires` | Date | No | | Reset token expiry (1 hour) |
| `isActive` | Boolean | No | Default: `true` | Account active flag |
| `lastLogin` | Date | No | | Last login timestamp |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

**Embedded: Address subdocument**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | Auto-generated | Subdocument ID |
| `label` | String | Trimmed | Address label (e.g., "Home", "Work") |
| `street` | String | Trimmed | Street address |
| `city` | String | Trimmed | City |
| `state` | String | Trimmed | State/province |
| `zipcode` | String | Trimmed | ZIP/postal code |
| `isDefault` | Boolean | Default: `false` | Default address flag |

**Hooks:**
- `pre('save')`: Hashes `passwordHash` field with bcrypt (12 salt rounds) if modified
- `toJSON()`: Strips `passwordHash`, `refreshToken`, `resetPasswordToken`, `resetPasswordExpires`

---

### 2.2 Products

**Collection:** `products`  
**Model:** `Product`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `name` | String | Yes | Trimmed | Product display name |
| `slug` | String | Yes | Unique, lowercase, trimmed | URL-friendly identifier |
| `description` | String | No | Trimmed | Product description |
| `brand` | String | No | Default: `"Converse"`, trimmed | Brand name |
| `category` | String | No | Trimmed | Product category |
| `sku` | String | Yes | Unique, uppercase, trimmed | Stock keeping unit |
| `basePrice` | Number | Yes | Min: 0 | Regular price |
| `salePrice` | Number | No | Min: 0 | Promotional price |
| `images` | Array\<String\> | No | | Image URLs |
| `sizes` | Array\<{size, sizeLabel}\> | No | | Available sizes |
| `colors` | Array\<{name, hex}\> | No | | Available colors |
| `isActive` | Boolean | No | Default: `true` | Product visible in catalog |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

---

### 2.3 Stores

**Collection:** `stores`  
**Model:** `Store`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `name` | String | Yes | Trimmed | Store display name |
| `storeCode` | String | Yes | Unique, uppercase, trimmed | Internal store identifier |
| `address` | Object | No | Embedded | Store physical address |
| `address.street` | String | No | Trimmed | |
| `address.city` | String | No | Trimmed | |
| `address.state` | String | No | Trimmed | |
| `address.zipcode` | String | No | Trimmed | |
| `address.country` | String | No | Default: `"US"`, trimmed | |
| `location` | GeoJSON Point | No | `type: "Point"`, `coordinates: [lng, lat]` | Geospatial coordinates |
| `phone` | String | No | Trimmed | Store phone |
| `email` | String | No | Lowercase, trimmed | Store email |
| `operatingHours` | Object | No | 7 day keys, each with `open`/`close` Strings | Weekly hours |
| `isActive` | Boolean | No | Default: `true` | Store accepting orders |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

---

### 2.4 StoreInventory

**Collection:** `storeinventories`  
**Model:** `StoreInventory`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `storeId` | ObjectId | Yes | References `Store` | Owning store |
| `productId` | ObjectId | Yes | References `Product` | Associated product |
| `sku` | String | Yes | Trimmed | Product SKU |
| `size` | String | Yes | Trimmed | Size variant |
| `color` | String | No | Trimmed | Color variant |
| `quantityOnHand` | Number | No | Default: 0, min: 0 | Physical stock count |
| `quantityReserved` | Number | No | Default: 0, min: 0 | Reserved for pending orders |
| `lastUpdated` | Date | No | Default: `Date.now` | Last stock update |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

**Virtual Field:**
- `quantityAvailable` = `quantityOnHand - quantityReserved` (computed, not stored)

---

### 2.5 DigitalInventory

**Collection:** `digitalinventories`  
**Model:** `DigitalInventory`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `productId` | ObjectId | Yes | References `Product` | Associated product |
| `sku` | String | Yes | Trimmed | Product SKU |
| `size` | String | Yes | Trimmed | Size variant |
| `color` | String | No | Trimmed | Color variant |
| `quantityOnHand` | Number | No | Default: 0, min: 0 | Warehouse stock count |
| `quantityReserved` | Number | No | Default: 0, min: 0 | Reserved for pending orders |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

**Virtual Field:**
- `quantityAvailable` = `quantityOnHand - quantityReserved` (computed, not stored)

---

### 2.6 Orders

**Collection:** `orders`  
**Model:** `Order`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `orderNumber` | String | Yes | Unique, auto-generated | Format: `ORD-{base36Timestamp}-{base36Random}` |
| `customerId` | ObjectId | Yes | References `Customer`, indexed | Ordering customer |
| `deliveryMethod` | String | Yes | Enum: `SHIP_TO_ME`, `SHIP_TO_STORE` | Fulfillment method |
| `storeId` | ObjectId | No | References `Store`, indexed | Pickup store (required if SHIP_TO_STORE) |
| `status` | String | No | Enum (see below), default: `PLACED`, indexed | Current order status |
| `shippingAddress` | Object | No | Embedded (street, city, state, zipcode, country) | For SHIP_TO_ME only |
| `subtotal` | Number | Yes | Min: 0 | Items total before tax |
| `tax` | Number | No | Default: 0, min: 0 | Tax amount (8% of subtotal) |
| `total` | Number | Yes | Min: 0 | Final total including tax |
| `pickupReadyTime` | Date | No | | Estimated pickup time (set by store) |
| `pickupCompletedTime` | Date | No | | Actual pickup completion timestamp |
| `notes` | String | No | Trimmed | Order notes |
| `cancelReason` | String | No | Trimmed | Reason for cancellation |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

**Status Enum Values:**

```
PLACED → AWAITING_STORE_ACCEPTANCE → ACCEPTED → READY_FOR_PICKUP → PICKED_UP → COMPLETED
                                                                                    ↓
                                                                           RETURN_REQUESTED → RETURN_ACCEPTED → RETURN_COMPLETED

Any status (before COMPLETED) → CANCELLED
```

| Status | Description |
|--------|-------------|
| `PLACED` | Order submitted (Ship to Me) |
| `AWAITING_STORE_ACCEPTANCE` | Ship to Store order waiting for store to accept |
| `ACCEPTED` | Store has accepted the order |
| `READY_FOR_PICKUP` | Items prepared and waiting for customer |
| `PICKED_UP` | Customer has collected items |
| `COMPLETED` | Order fulfilled |
| `CANCELLED` | Order cancelled |
| `RETURN_REQUESTED` | Customer initiated a return |
| `RETURN_ACCEPTED` | Store accepted the return |
| `RETURN_COMPLETED` | Return processed, refund issued |

**Hooks:**
- `pre('validate')`: Requires `storeId` when `deliveryMethod` is `SHIP_TO_STORE`
- `pre('save')`: Auto-generates `orderNumber` on new documents

---

### 2.7 OrderItems

**Collection:** `orderitems`  
**Model:** `OrderItem`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `orderId` | ObjectId | Yes | References `Order`, indexed | Parent order |
| `productId` | ObjectId | Yes | References `Product` | Product reference |
| `sku` | String | Yes | Trimmed | Product SKU at time of purchase |
| `productName` | String | Yes | Trimmed | Product name at time of purchase |
| `size` | String | Yes | Trimmed | Selected size |
| `color` | String | No | Trimmed | Selected color |
| `quantity` | Number | Yes | Min: 1 | Quantity ordered |
| `unitPrice` | Number | Yes | Min: 0 | Price per unit at time of purchase |
| `totalPrice` | Number | Yes | Min: 0 | `unitPrice × quantity` |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

---

### 2.8 OrderStatusHistory

**Collection:** `orderstatushistories`  
**Model:** `OrderStatusHistory`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `orderId` | ObjectId | Yes | References `Order`, indexed | Associated order |
| `fromStatus` | String | No | | Previous status (null for initial) |
| `toStatus` | String | Yes | | New status |
| `changedBy` | Object | No | Embedded | Who triggered the change |
| `changedBy.userType` | String | No | Enum: `customer`, `store_employee`, `system` | Actor type |
| `changedBy.userId` | ObjectId | No | | Actor's document ID |
| `notes` | String | No | Trimmed | Contextual note |
| `createdAt` | Date | Auto | Mongoose timestamps | Timestamp of the transition |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

---

### 2.9 Returns

**Collection:** `returns`  
**Model:** `Return`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `returnNumber` | String | Yes | Unique, auto-generated | Format: `RET-{base36Timestamp}-{base36Random}` |
| `orderId` | ObjectId | Yes | References `Order`, indexed | Original order |
| `customerId` | ObjectId | Yes | References `Customer`, indexed | Returning customer |
| `storeId` | ObjectId | Yes | References `Store` | Return-to store |
| `status` | String | No | Enum: `RETURN_REQUESTED`, `RETURN_ACCEPTED`, `RETURN_COMPLETED`, `RETURN_REJECTED`, default: `RETURN_REQUESTED` | Current return status |
| `reason` | String | Yes | Trimmed | Customer-provided reason |
| `notes` | String | No | Trimmed | Additional notes |
| `processedBy` | ObjectId | No | References `StoreUser` | Employee who processed the return |
| `processedAt` | Date | No | | When the return was completed |
| `refundAmount` | Number | No | Min: 0 | Calculated refund (set on completion) |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

**Hooks:**
- `pre('save')`: Auto-generates `returnNumber` on new documents

---

### 2.10 ReturnItems

**Collection:** `returnitems`  
**Model:** `ReturnItem`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `returnId` | ObjectId | Yes | References `Return`, indexed | Parent return |
| `orderItemId` | ObjectId | Yes | References `OrderItem` | Original order line item |
| `productId` | ObjectId | Yes | References `Product` | Product reference |
| `sku` | String | Yes | Trimmed | Product SKU |
| `productName` | String | Yes | Trimmed | Product name |
| `size` | String | Yes | Trimmed | Size being returned |
| `color` | String | No | Trimmed | Color being returned |
| `quantity` | Number | Yes | Min: 1 | Quantity being returned |
| `unitPrice` | Number | Yes | Min: 0 | Unit price (for refund calculation) |
| `condition` | String | No | Enum: `unopened`, `like_new`, `damaged`, default: `like_new` | Physical condition of returned item |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

---

### 2.11 StoreUsers

**Collection:** `storeusers`  
**Model:** `StoreUser`

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | Primary key | |
| `firstName` | String | Yes | Trimmed | Employee first name |
| `lastName` | String | Yes | Trimmed | Employee last name |
| `email` | String | Yes | Unique, lowercase, trimmed | Login email |
| `passwordHash` | String | Yes | Hashed with bcrypt (12 rounds) | Never returned in API responses |
| `storeId` | ObjectId | Yes | References `Store`, indexed | Assigned store |
| `role` | String | Yes | Enum: `store_manager`, `store_associate` | Employee role |
| `isActive` | Boolean | No | Default: `true` | Account active flag |
| `lastLogin` | Date | No | | Last login timestamp |
| `refreshToken` | String | No | | JWT refresh token (stripped from JSON) |
| `createdAt` | Date | Auto | Mongoose timestamps | |
| `updatedAt` | Date | Auto | Mongoose timestamps | |

**Hooks:**
- `pre('save')`: Hashes `passwordHash` field with bcrypt (12 salt rounds) if modified
- `toJSON()`: Strips `passwordHash`, `refreshToken`

---

## 3. Relationships

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Customer   │         │   Product    │         │    Store     │
│              │         │              │         │              │
│  _id ◄───────┼─────────┼──────────────┼─────────┼───── storeId │
│              │    ┌────►│  _id         │◄───┐    │  _id ◄──────┼──────┐
└──────┬───────┘    │    └──────────────┘    │    └──────┬───────┘      │
       │            │                        │           │              │
       │ customerId │ productId              │ productId │ storeId      │ storeId
       │            │                        │           │              │
       ▼            │                        │           ▼              │
┌──────────────┐    │    ┌──────────────┐    │    ┌──────────────┐     │
│    Order     │    │    │ StoreInven-  │    │    │  StoreUser   │     │
│              │    │    │ tory         │    │    │              │     │
│  _id ◄───┐   │    │    │              │    │    │  processedBy─┼──┐  │
│  customerId  │    │    │  storeId─────┼────┼────┤              │  │  │
│  storeId─────┼────┼────┤  productId───┼────┘    └──────────────┘  │  │
└──────┬───────┘    │    └──────────────┘                           │  │
       │            │                                               │  │
       │ orderId    │    ┌──────────────┐                           │  │
       │            │    │ Digital      │                           │  │
       ├────────────┼────┤ Inventory    │                           │  │
       │            │    │              │                           │  │
       ▼            │    │  productId───┼───────────────────────────┘  │
┌──────────────┐    │    └──────────────┘                              │
│  OrderItem   │    │                                                  │
│              │    │                                                  │
│  orderId     │    │                                                  │
│  productId───┼────┘                                                  │
└──────┬───────┘                                                       │
       │                                                               │
       │ orderItemId                                                   │
       │                                                               │
┌──────────────┐         ┌──────────────┐                              │
│OrderStatus-  │         │   Return     │                              │
│History       │         │              │                              │
│              │         │  orderId     │                              │
│  orderId     │         │  customerId  │                              │
│  changedBy   │         │  storeId─────┼──────────────────────────────┘
│   .userId    │         │  processedBy │
└──────────────┘         └──────┬───────┘
                                │
                                │ returnId
                                ▼
                         ┌──────────────┐
                         │ ReturnItem   │
                         │              │
                         │  returnId    │
                         │  orderItemId │
                         │  productId   │
                         └──────────────┘
```

### Relationship Summary

| From | To | Relationship | Field |
|------|----|-------------|-------|
| Order | Customer | Many-to-One | `order.customerId` |
| Order | Store | Many-to-One | `order.storeId` |
| OrderItem | Order | Many-to-One | `orderItem.orderId` |
| OrderItem | Product | Many-to-One | `orderItem.productId` |
| OrderStatusHistory | Order | Many-to-One | `history.orderId` |
| Return | Order | Many-to-One | `return.orderId` |
| Return | Customer | Many-to-One | `return.customerId` |
| Return | Store | Many-to-One | `return.storeId` |
| Return | StoreUser | Many-to-One | `return.processedBy` |
| ReturnItem | Return | Many-to-One | `returnItem.returnId` |
| ReturnItem | OrderItem | Many-to-One | `returnItem.orderItemId` |
| ReturnItem | Product | Many-to-One | `returnItem.productId` |
| StoreInventory | Store | Many-to-One | `storeInventory.storeId` |
| StoreInventory | Product | Many-to-One | `storeInventory.productId` |
| DigitalInventory | Product | Many-to-One | `digitalInventory.productId` |
| StoreUser | Store | Many-to-One | `storeUser.storeId` |
| Customer | Address | One-to-Many | Embedded `customer.addresses[]` |

---

## 4. Indexing Strategy

### 4.1 Unique Indexes

| Collection | Fields | Purpose |
|-----------|--------|---------|
| `customers` | `{ email: 1 }` | Prevent duplicate registrations |
| `products` | `{ slug: 1 }` | Unique URL slugs |
| `products` | `{ sku: 1 }` | Unique product SKU |
| `stores` | `{ storeCode: 1 }` | Unique store codes |
| `storeinventories` | `{ storeId: 1, productId: 1, sku: 1, size: 1 }` | One inventory record per store/product/SKU/size combination |
| `digitalinventories` | `{ productId: 1, sku: 1, size: 1 }` | One inventory record per product/SKU/size |
| `orders` | `{ orderNumber: 1 }` | Unique order numbers |
| `returns` | `{ returnNumber: 1 }` | Unique return numbers |
| `storeusers` | `{ email: 1 }` | Prevent duplicate employee accounts |

### 4.2 Geospatial Index

| Collection | Fields | Type | Purpose |
|-----------|--------|------|---------|
| `stores` | `{ location: '2dsphere' }` | 2dsphere | Proximity search by ZIP code (uses geocoded coordinates) |

### 4.3 Compound & Query Indexes

| Collection | Fields | Purpose |
|-----------|--------|---------|
| `storeinventories` | `{ storeId: 1, productId: 1 }` | Fast inventory lookups for a product at a store |
| `orders` | `{ customerId: 1 }` (schema-level) | Customer order listing |
| `orders` | `{ storeId: 1 }` (schema-level) | Store order listing |
| `orders` | `{ status: 1 }` (schema-level) | Filter orders by status |
| `orderitems` | `{ orderId: 1 }` | Fetch items for an order |
| `orderstatushistories` | `{ orderId: 1 }` | Fetch status history for an order |
| `returns` | `{ orderId: 1 }` | Find returns for an order |
| `returns` | `{ customerId: 1 }` | Customer return listing |
| `returnitems` | `{ returnId: 1 }` | Fetch items for a return |
| `storeusers` | `{ storeId: 1 }` | Find employees for a store |

---

## 5. Data Integrity & Transactions

### 5.1 MongoDB Transactions

The following operations use **multi-document transactions** (`session.startTransaction()`) to ensure atomicity:

| Operation | Documents Modified | Reason |
|-----------|-------------------|--------|
| **Create Order** | Order + OrderItems + OrderStatusHistory + StoreInventory (reserve) | Must either fully create the order with inventory reserved or not at all |
| **Create Return** | Return + ReturnItems + Order (status update) + OrderStatusHistory | Return, line items, and order status must be consistent |

### 5.2 Concurrency Handling

**Inventory reservation** uses atomic `findOneAndUpdate` with a `$expr` guard to prevent overselling:

```javascript
StoreInventory.findOneAndUpdate(
  {
    storeId,
    productId: item.productId,
    sku: item.sku,
    size: item.size,
    $expr: {
      $gte: [
        { $subtract: ['$quantityOnHand', '$quantityReserved'] },
        item.quantity,
      ],
    },
  },
  { $inc: { quantityReserved: item.quantity } },
  { new: true, session }
)
```

The `$expr` condition ensures the available quantity (`quantityOnHand - quantityReserved`) is sufficient *at the time of the atomic update*, preventing race conditions where two concurrent orders could over-reserve the same stock.

### 5.3 Inventory Operations

| Operation | Trigger | Effect on StoreInventory |
|-----------|---------|--------------------------|
| **Reserve** | Order placed (SHIP_TO_STORE) | `quantityReserved += quantity` |
| **Deduct** | Order accepted by store | `quantityOnHand -= quantity`, `quantityReserved -= quantity` |
| **Release** | Order cancelled | `quantityReserved -= quantity` |
| **Restore** | Return completed | `quantityOnHand += quantity` |

### 5.4 Status Transition Validation

All order status transitions are validated against a predefined map before being applied:

```
PLACED                      → [AWAITING_STORE_ACCEPTANCE, CANCELLED]
AWAITING_STORE_ACCEPTANCE   → [ACCEPTED, CANCELLED]
ACCEPTED                    → [READY_FOR_PICKUP, CANCELLED]
READY_FOR_PICKUP            → [PICKED_UP, CANCELLED]
PICKED_UP                   → [COMPLETED]
COMPLETED                   → [RETURN_REQUESTED]
CANCELLED                   → [] (terminal)
RETURN_REQUESTED            → [RETURN_ACCEPTED]
RETURN_ACCEPTED             → [RETURN_COMPLETED]
RETURN_COMPLETED            → [] (terminal)
```

The `isValidTransition(fromStatus, toStatus)` function enforces these rules at the service layer before any database write occurs.

### 5.5 Data Denormalization

Certain fields are intentionally denormalized (copied at write-time) to preserve historical accuracy:

| Denormalized Field | On Collection | Reason |
|-------------------|---------------|--------|
| `productName` | OrderItem, ReturnItem | Product name at time of purchase (may change later) |
| `unitPrice` / `totalPrice` | OrderItem | Price at time of purchase (prices may change) |
| `sku`, `size`, `color` | OrderItem, ReturnItem | Snapshot of variant selected at purchase time |

This ensures order and return records remain accurate even if the product catalog is updated after the transaction.
