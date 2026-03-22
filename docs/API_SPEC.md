# API Specification

## Converse BOPIS & BORIS

**Base URL:** `http://localhost:5000/api`  
**Version:** 1.0  
**Last Updated:** March 19, 2026

---

## Table of Contents

1. [Customer Auth](#1-customer-auth-apicustomerauth) (12 endpoints)
2. [Customer Products](#2-customer-products-apicustomerproducts) (3 endpoints)
3. [Customer Stores](#3-customer-stores-apicustomerstores) (2 endpoints)
4. [Customer Orders](#4-customer-orders-apicustomerorders) (4 endpoints)
5. [Customer Returns](#5-customer-returns-apicustomerreturns) (2 endpoints)
6. [Store Auth](#6-store-auth-apistoreauth) (3 endpoints)
7. [Store Orders](#7-store-orders-apistoreorders) (4 endpoints)
8. [Store Returns](#8-store-returns-apistorereturns) (3 endpoints)
9. [Store Inventory](#9-store-inventory-apistoreinventory) (3 endpoints)

---

## Common Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | All POST/PUT/PATCH requests |
| `Authorization` | `Bearer <token>` | All authenticated endpoints |

## Error Response Format

All errors follow this structure:

```json
{
  "message": "Human-readable error description"
}
```

Validation errors (422):

```json
{
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

---

## 1. Customer Auth (`/api/customer/auth`)

### 1.1 Register

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/auth/register` |
| **Auth** | No |
| **Rate Limited** | Yes |

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecureP@ss123",
  "phone": "555-123-4567"
}
```

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "customer": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "addresses": [],
    "isActive": true,
    "createdAt": "2026-03-19T10:00:00.000Z",
    "updatedAt": "2026-03-19T10:00:00.000Z"
  }
}
```

---

### 1.2 Login

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/auth/login` |
| **Auth** | No |
| **Rate Limited** | Yes |

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "customer": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "addresses": [],
    "isActive": true,
    "lastLogin": "2026-03-19T10:05:00.000Z"
  }
}
```

---

### 1.3 Logout

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/auth/logout` |
| **Auth** | Yes (Customer JWT) |

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

---

### 1.4 Refresh Token

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/auth/refresh-token` |
| **Auth** | No |

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 1.5 Forgot Password

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/auth/forgot-password` |
| **Auth** | No |

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Response (200):**

```json
{
  "message": "Password reset email sent"
}
```

---

### 1.6 Reset Password

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/auth/reset-password` |
| **Auth** | No |

**Request Body:**

```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewSecureP@ss456"
}
```

**Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

---

### 1.7 Get Profile

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/auth/me` |
| **Auth** | Yes (Customer JWT) |

**Response (200):**

```json
{
  "_id": "665a1b2c3d4e5f6a7b8c9d0e",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-123-4567",
  "addresses": [
    {
      "_id": "665a1b2c3d4e5f6a7b8c9d10",
      "label": "Home",
      "street": "123 Main St",
      "city": "Portland",
      "state": "OR",
      "zipcode": "97201",
      "isDefault": true
    }
  ],
  "isActive": true,
  "lastLogin": "2026-03-19T10:05:00.000Z",
  "createdAt": "2026-03-19T10:00:00.000Z",
  "updatedAt": "2026-03-19T10:05:00.000Z"
}
```

---

### 1.8 Update Profile

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/api/customer/auth/profile` |
| **Auth** | Yes (Customer JWT) |

**Request Body:**

```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phone": "555-987-6543"
}
```

**Response (200):** Updated customer object (same shape as Get Profile).

---

### 1.9 Change Password

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/api/customer/auth/change-password` |
| **Auth** | Yes (Customer JWT) |

**Request Body:**

```json
{
  "currentPassword": "SecureP@ss123",
  "newPassword": "EvenMoreSecure789"
}
```

**Response (200):**

```json
{
  "message": "Password changed successfully"
}
```

---

### 1.10 Add Address

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/auth/addresses` |
| **Auth** | Yes (Customer JWT) |

**Request Body:**

```json
{
  "label": "Work",
  "street": "456 Office Blvd",
  "city": "Portland",
  "state": "OR",
  "zipcode": "97205",
  "isDefault": false
}
```

**Response (201):** Updated customer object with new address in the `addresses` array.

---

### 1.11 Update Address

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/api/customer/auth/addresses/:addressId` |
| **Auth** | Yes (Customer JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `addressId` | ObjectId | ID of the address to update |

**Request Body:**

```json
{
  "label": "Work HQ",
  "street": "789 Corporate Ave",
  "city": "Portland",
  "state": "OR",
  "zipcode": "97210",
  "isDefault": true
}
```

**Response (200):** Updated customer object.

---

### 1.12 Delete Address

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/api/customer/auth/addresses/:addressId` |
| **Auth** | Yes (Customer JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `addressId` | ObjectId | ID of the address to delete |

**Response (200):** Updated customer object with address removed.

---

## 2. Customer Products (`/api/customer/products`)

### 2.1 List Products

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/products` |
| **Auth** | No |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 12 | Items per page |
| `search` | String | — | Search by product name (case-insensitive regex) |
| `category` | String | — | Filter by category |

**Response (200):**

```json
{
  "products": [
    {
      "_id": "665a2f1a3b4c5d6e7f8a9b0c",
      "name": "Chuck Taylor All Star",
      "slug": "chuck-taylor-all-star",
      "description": "The iconic Chuck Taylor sneaker.",
      "brand": "Converse",
      "category": "Sneakers",
      "sku": "CONV-CTA-001",
      "basePrice": 65.00,
      "salePrice": null,
      "images": [
        "https://images.converse.com/chuck-taylor-black.jpg"
      ],
      "sizes": [
        { "size": "8", "sizeLabel": "US 8" },
        { "size": "9", "sizeLabel": "US 9" },
        { "size": "10", "sizeLabel": "US 10" }
      ],
      "colors": [
        { "name": "Black", "hex": "#000000" },
        { "name": "White", "hex": "#FFFFFF" }
      ],
      "isActive": true,
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-03-10T12:00:00.000Z"
    }
  ],
  "total": 48,
  "page": 1,
  "totalPages": 4
}
```

---

### 2.2 Get Product by Slug

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/products/slug/:slug` |
| **Auth** | No |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `slug` | String | Product URL slug |

**Response (200):** Single product object (same shape as in list).

**Error (404):**

```json
{
  "message": "Product not found"
}
```

---

### 2.3 Get Product by ID

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/products/:id` |
| **Auth** | No |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | ObjectId | Product ID |

**Response (200):** Single product object.

**Error (404):**

```json
{
  "message": "Product not found"
}
```

---

## 3. Customer Stores (`/api/customer/stores`)

### 3.1 Search Stores

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/stores/search` |
| **Auth** | No |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `zipcode` | String | Yes | ZIP code for proximity search |
| `productId` | ObjectId | No | Filter stores that carry this product |

**Response (200):**

```json
[
  {
    "_id": "665b3c4d5e6f7a8b9c0d1e2f",
    "name": "Converse Portland Downtown",
    "storeCode": "PDX-001",
    "address": {
      "street": "100 SW Morrison St",
      "city": "Portland",
      "state": "OR",
      "zipcode": "97204",
      "country": "US"
    },
    "location": {
      "type": "Point",
      "coordinates": [-122.6784, 45.5189]
    },
    "phone": "503-555-0100",
    "email": "portland.downtown@converse.com",
    "operatingHours": {
      "monday": { "open": "09:00", "close": "21:00" },
      "tuesday": { "open": "09:00", "close": "21:00" },
      "wednesday": { "open": "09:00", "close": "21:00" },
      "thursday": { "open": "09:00", "close": "21:00" },
      "friday": { "open": "09:00", "close": "22:00" },
      "saturday": { "open": "10:00", "close": "22:00" },
      "sunday": { "open": "10:00", "close": "18:00" }
    },
    "distance": 2.3,
    "isActive": true
  }
]
```

---

### 3.2 Get Store Inventory for Product

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/stores/:storeId/inventory` |
| **Auth** | No |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `storeId` | ObjectId | Store ID |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | ObjectId | Yes | Product to check availability for |

**Response (200):**

```json
[
  {
    "_id": "665c4d5e6f7a8b9c0d1e2f3a",
    "storeId": "665b3c4d5e6f7a8b9c0d1e2f",
    "productId": {
      "_id": "665a2f1a3b4c5d6e7f8a9b0c",
      "name": "Chuck Taylor All Star",
      "sku": "CONV-CTA-001",
      "images": ["https://images.converse.com/chuck-taylor-black.jpg"]
    },
    "sku": "CONV-CTA-001",
    "size": "10",
    "color": "Black",
    "quantityOnHand": 15,
    "quantityReserved": 3,
    "quantityAvailable": 12,
    "lastUpdated": "2026-03-18T14:00:00.000Z"
  }
]
```

---

## 4. Customer Orders (`/api/customer/orders`)

> All endpoints in this group require Customer JWT authentication.

### 4.1 Create Order

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/orders` |
| **Auth** | Yes (Customer JWT) |

**Request Body:**

```json
{
  "deliveryMethod": "SHIP_TO_STORE",
  "storeId": "665b3c4d5e6f7a8b9c0d1e2f",
  "items": [
    {
      "productId": "665a2f1a3b4c5d6e7f8a9b0c",
      "sku": "CONV-CTA-001",
      "size": "10",
      "color": "Black",
      "quantity": 1
    },
    {
      "productId": "665a2f1a3b4c5d6e7f8a9b0d",
      "sku": "CONV-OS-002",
      "size": "10",
      "color": "White",
      "quantity": 2
    }
  ]
}
```

**Response (201):**

```json
{
  "_id": "665d5e6f7a8b9c0d1e2f3a4b",
  "orderNumber": "ORD-M1A2B3C-D4E5F",
  "customerId": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "deliveryMethod": "SHIP_TO_STORE",
  "storeId": {
    "_id": "665b3c4d5e6f7a8b9c0d1e2f",
    "name": "Converse Portland Downtown",
    "storeCode": "PDX-001",
    "address": {
      "street": "100 SW Morrison St",
      "city": "Portland",
      "state": "OR",
      "zipcode": "97204"
    }
  },
  "status": "AWAITING_STORE_ACCEPTANCE",
  "subtotal": 195.00,
  "tax": 15.60,
  "total": 210.60,
  "items": [
    {
      "_id": "665e6f7a8b9c0d1e2f3a4b5c",
      "orderId": "665d5e6f7a8b9c0d1e2f3a4b",
      "productId": "665a2f1a3b4c5d6e7f8a9b0c",
      "sku": "CONV-CTA-001",
      "productName": "Chuck Taylor All Star",
      "size": "10",
      "color": "Black",
      "quantity": 1,
      "unitPrice": 65.00,
      "totalPrice": 65.00
    },
    {
      "_id": "665e6f7a8b9c0d1e2f3a4b5d",
      "orderId": "665d5e6f7a8b9c0d1e2f3a4b",
      "productId": "665a2f1a3b4c5d6e7f8a9b0d",
      "sku": "CONV-OS-002",
      "productName": "One Star Platform",
      "size": "10",
      "color": "White",
      "quantity": 2,
      "unitPrice": 65.00,
      "totalPrice": 130.00
    }
  ],
  "createdAt": "2026-03-19T11:00:00.000Z",
  "updatedAt": "2026-03-19T11:00:00.000Z"
}
```

---

### 4.2 List My Orders

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/orders` |
| **Auth** | Yes (Customer JWT) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 10 | Items per page |

**Response (200):**

```json
{
  "orders": [
    {
      "_id": "665d5e6f7a8b9c0d1e2f3a4b",
      "orderNumber": "ORD-M1A2B3C-D4E5F",
      "deliveryMethod": "SHIP_TO_STORE",
      "storeId": {
        "_id": "665b3c4d5e6f7a8b9c0d1e2f",
        "name": "Converse Portland Downtown",
        "storeCode": "PDX-001",
        "address": { "street": "100 SW Morrison St", "city": "Portland", "state": "OR", "zipcode": "97204" }
      },
      "status": "AWAITING_STORE_ACCEPTANCE",
      "subtotal": 195.00,
      "tax": 15.60,
      "total": 210.60,
      "items": [ /* ... OrderItem objects ... */ ],
      "createdAt": "2026-03-19T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### 4.3 Get Order by ID

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/orders/:orderId` |
| **Auth** | Yes (Customer JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `orderId` | ObjectId | Order ID |

**Response (200):**

```json
{
  "_id": "665d5e6f7a8b9c0d1e2f3a4b",
  "orderNumber": "ORD-M1A2B3C-D4E5F",
  "customerId": {
    "_id": "665a1b2c3d4e5f6a7b8c9d0e",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  },
  "deliveryMethod": "SHIP_TO_STORE",
  "storeId": {
    "_id": "665b3c4d5e6f7a8b9c0d1e2f",
    "name": "Converse Portland Downtown",
    "storeCode": "PDX-001",
    "address": { "street": "100 SW Morrison St", "city": "Portland", "state": "OR", "zipcode": "97204" },
    "phone": "503-555-0100"
  },
  "status": "ACCEPTED",
  "subtotal": 195.00,
  "tax": 15.60,
  "total": 210.60,
  "pickupReadyTime": "2026-03-19T15:00:00.000Z",
  "items": [ /* ... OrderItem objects ... */ ],
  "statusHistory": [
    {
      "_id": "665f7a8b9c0d1e2f3a4b5c6d",
      "orderId": "665d5e6f7a8b9c0d1e2f3a4b",
      "fromStatus": null,
      "toStatus": "AWAITING_STORE_ACCEPTANCE",
      "changedBy": { "userType": "customer", "userId": "665a1b2c3d4e5f6a7b8c9d0e" },
      "notes": "Order placed",
      "createdAt": "2026-03-19T11:00:00.000Z"
    },
    {
      "_id": "665f7a8b9c0d1e2f3a4b5c6e",
      "orderId": "665d5e6f7a8b9c0d1e2f3a4b",
      "fromStatus": "AWAITING_STORE_ACCEPTANCE",
      "toStatus": "ACCEPTED",
      "changedBy": { "userType": "store_employee", "userId": "665g8b9c0d1e2f3a4b5c6d7e" },
      "notes": "Order accepted by store",
      "createdAt": "2026-03-19T11:30:00.000Z"
    }
  ],
  "createdAt": "2026-03-19T11:00:00.000Z",
  "updatedAt": "2026-03-19T11:30:00.000Z"
}
```

---

### 4.4 Cancel Order

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/orders/:orderId/cancel` |
| **Auth** | Yes (Customer JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `orderId` | ObjectId | Order ID |

**Note:** Cancellation is only allowed when order status is `PLACED` or `AWAITING_STORE_ACCEPTANCE`.

**Response (200):** Updated order object with `status: "CANCELLED"`.

**Error (400):**

```json
{
  "message": "Cannot cancel order in status: ACCEPTED"
}
```

---

## 5. Customer Returns (`/api/customer/returns`)

> All endpoints in this group require Customer JWT authentication.

### 5.1 Create Return

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/customer/returns` |
| **Auth** | Yes (Customer JWT) |

**Request Body:**

```json
{
  "orderId": "665d5e6f7a8b9c0d1e2f3a4b",
  "storeId": "665b3c4d5e6f7a8b9c0d1e2f",
  "reason": "Wrong size - need to exchange",
  "items": [
    {
      "orderItemId": "665e6f7a8b9c0d1e2f3a4b5c",
      "quantity": 1,
      "condition": "like_new"
    }
  ]
}
```

**Response (201):**

```json
{
  "_id": "665h9c0d1e2f3a4b5c6d7e8f",
  "returnNumber": "RET-N2B3C4D-E5F6G",
  "orderId": {
    "_id": "665d5e6f7a8b9c0d1e2f3a4b",
    "orderNumber": "ORD-M1A2B3C-D4E5F",
    "total": 210.60
  },
  "customerId": "665a1b2c3d4e5f6a7b8c9d0e",
  "storeId": "665b3c4d5e6f7a8b9c0d1e2f",
  "status": "RETURN_REQUESTED",
  "reason": "Wrong size - need to exchange",
  "createdAt": "2026-03-19T14:00:00.000Z",
  "updatedAt": "2026-03-19T14:00:00.000Z"
}
```

**Error (400):**

```json
{
  "message": "Cannot create return for order in status: ACCEPTED. Order must be COMPLETED."
}
```

---

### 5.2 List My Returns

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/customer/returns` |
| **Auth** | Yes (Customer JWT) |

**Response (200):**

```json
[
  {
    "_id": "665h9c0d1e2f3a4b5c6d7e8f",
    "returnNumber": "RET-N2B3C4D-E5F6G",
    "orderId": {
      "_id": "665d5e6f7a8b9c0d1e2f3a4b",
      "orderNumber": "ORD-M1A2B3C-D4E5F",
      "total": 210.60
    },
    "storeId": {
      "_id": "665b3c4d5e6f7a8b9c0d1e2f",
      "name": "Converse Portland Downtown",
      "storeCode": "PDX-001",
      "address": { "street": "100 SW Morrison St", "city": "Portland", "state": "OR", "zipcode": "97204" }
    },
    "status": "RETURN_REQUESTED",
    "reason": "Wrong size - need to exchange",
    "refundAmount": null,
    "createdAt": "2026-03-19T14:00:00.000Z"
  }
]
```

---

## 6. Store Auth (`/api/store/auth`)

### 6.1 Login

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/store/auth/login` |
| **Auth** | No |
| **Rate Limited** | Yes |

**Request Body:**

```json
{
  "email": "manager@converse-pdx.com",
  "password": "StoreP@ss123"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "665g8b9c0d1e2f3a4b5c6d7e",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "manager@converse-pdx.com",
    "storeId": "665b3c4d5e6f7a8b9c0d1e2f",
    "role": "store_manager",
    "isActive": true,
    "lastLogin": "2026-03-19T08:00:00.000Z"
  }
}
```

---

### 6.2 Logout

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/store/auth/logout` |
| **Auth** | Yes (Store JWT) |

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

---

### 6.3 Get Profile

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/store/auth/me` |
| **Auth** | Yes (Store JWT) |

**Response (200):**

```json
{
  "_id": "665g8b9c0d1e2f3a4b5c6d7e",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "manager@converse-pdx.com",
  "storeId": "665b3c4d5e6f7a8b9c0d1e2f",
  "role": "store_manager",
  "isActive": true,
  "lastLogin": "2026-03-19T08:00:00.000Z",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-03-19T08:00:00.000Z"
}
```

---

## 7. Store Orders (`/api/store/orders`)

> All endpoints in this group require Store JWT authentication. Orders are automatically scoped to the authenticated user's `storeId`.

### 7.1 List Store Orders

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/store/orders` |
| **Auth** | Yes (Store JWT) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | String | — | Filter by order status (e.g., `AWAITING_STORE_ACCEPTANCE`) |

**Response (200):**

```json
{
  "orders": [
    {
      "_id": "665d5e6f7a8b9c0d1e2f3a4b",
      "orderNumber": "ORD-M1A2B3C-D4E5F",
      "customerId": {
        "_id": "665a1b2c3d4e5f6a7b8c9d0e",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "555-123-4567"
      },
      "deliveryMethod": "SHIP_TO_STORE",
      "status": "AWAITING_STORE_ACCEPTANCE",
      "subtotal": 195.00,
      "tax": 15.60,
      "total": 210.60,
      "items": [ /* ... OrderItem objects ... */ ],
      "createdAt": "2026-03-19T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

---

### 7.2 Get Order by ID

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/store/orders/:orderId` |
| **Auth** | Yes (Store JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `orderId` | ObjectId | Order ID |

**Response (200):** Full order object with `items`, `statusHistory`, populated `customerId` and `storeId`. Same structure as Customer Get Order by ID (section 4.3).

---

### 7.3 Accept Order

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/store/orders/:orderId/accept` |
| **Auth** | Yes (Store JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `orderId` | ObjectId | Order ID |

**Request Body:**

```json
{
  "pickupReadyTime": "2026-03-19T15:00:00.000Z"
}
```

**Response (200):** Updated order object with `status: "ACCEPTED"` and `pickupReadyTime` set.

**Error (400):**

```json
{
  "message": "Cannot accept order in status: ACCEPTED"
}
```

---

### 7.4 Update Order Status

| | |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/api/store/orders/:orderId/status` |
| **Auth** | Yes (Store JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `orderId` | ObjectId | Order ID |

**Request Body:**

```json
{
  "status": "READY_FOR_PICKUP"
}
```

**Valid Status Values:**
`READY_FOR_PICKUP`, `PICKED_UP`, `COMPLETED`, `CANCELLED`

**Response (200):** Updated order object with new status.

**Error (400):**

```json
{
  "message": "Invalid status transition: PLACED -> COMPLETED"
}
```

---

## 8. Store Returns (`/api/store/returns`)

> All endpoints in this group require Store JWT authentication. Returns are automatically scoped to the authenticated user's `storeId`.

### 8.1 List Store Returns

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/store/returns` |
| **Auth** | Yes (Store JWT) |

**Response (200):**

```json
[
  {
    "_id": "665h9c0d1e2f3a4b5c6d7e8f",
    "returnNumber": "RET-N2B3C4D-E5F6G",
    "orderId": {
      "_id": "665d5e6f7a8b9c0d1e2f3a4b",
      "orderNumber": "ORD-M1A2B3C-D4E5F",
      "total": 210.60
    },
    "customerId": {
      "_id": "665a1b2c3d4e5f6a7b8c9d0e",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "555-123-4567"
    },
    "status": "RETURN_REQUESTED",
    "reason": "Wrong size - need to exchange",
    "refundAmount": null,
    "items": [
      {
        "_id": "665i0d1e2f3a4b5c6d7e8f9a",
        "returnId": "665h9c0d1e2f3a4b5c6d7e8f",
        "orderItemId": "665e6f7a8b9c0d1e2f3a4b5c",
        "productId": "665a2f1a3b4c5d6e7f8a9b0c",
        "sku": "CONV-CTA-001",
        "productName": "Chuck Taylor All Star",
        "size": "10",
        "color": "Black",
        "quantity": 1,
        "unitPrice": 65.00,
        "condition": "like_new"
      }
    ],
    "createdAt": "2026-03-19T14:00:00.000Z"
  }
]
```

---

### 8.2 Accept Return

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/store/returns/:returnId/accept` |
| **Auth** | Yes (Store JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `returnId` | ObjectId | Return ID |

**Response (200):**

```json
{
  "_id": "665h9c0d1e2f3a4b5c6d7e8f",
  "returnNumber": "RET-N2B3C4D-E5F6G",
  "orderId": {
    "_id": "665d5e6f7a8b9c0d1e2f3a4b",
    "orderNumber": "ORD-M1A2B3C-D4E5F",
    "total": 210.60
  },
  "storeId": {
    "_id": "665b3c4d5e6f7a8b9c0d1e2f",
    "name": "Converse Portland Downtown",
    "storeCode": "PDX-001"
  },
  "status": "RETURN_ACCEPTED",
  "reason": "Wrong size - need to exchange",
  "processedBy": "665g8b9c0d1e2f3a4b5c6d7e",
  "createdAt": "2026-03-19T14:00:00.000Z",
  "updatedAt": "2026-03-19T14:30:00.000Z"
}
```

**Error (400):**

```json
{
  "message": "Cannot accept return in status: RETURN_COMPLETED"
}
```

---

### 8.3 Complete Return

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/store/returns/:returnId/complete` |
| **Auth** | Yes (Store JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `returnId` | ObjectId | Return ID |

**Response (200):**

```json
{
  "_id": "665h9c0d1e2f3a4b5c6d7e8f",
  "returnNumber": "RET-N2B3C4D-E5F6G",
  "orderId": {
    "_id": "665d5e6f7a8b9c0d1e2f3a4b",
    "orderNumber": "ORD-M1A2B3C-D4E5F",
    "total": 210.60
  },
  "storeId": {
    "_id": "665b3c4d5e6f7a8b9c0d1e2f",
    "name": "Converse Portland Downtown",
    "storeCode": "PDX-001"
  },
  "status": "RETURN_COMPLETED",
  "reason": "Wrong size - need to exchange",
  "processedBy": "665g8b9c0d1e2f3a4b5c6d7e",
  "processedAt": "2026-03-19T15:00:00.000Z",
  "refundAmount": 65.00,
  "createdAt": "2026-03-19T14:00:00.000Z",
  "updatedAt": "2026-03-19T15:00:00.000Z"
}
```

**Error (400):**

```json
{
  "message": "Cannot complete return in status: RETURN_REQUESTED"
}
```

---

## 9. Store Inventory (`/api/store/inventory`)

> All endpoints in this group require Store JWT authentication. Inventory is automatically scoped to the authenticated user's `storeId`.

### 9.1 List Inventory

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/store/inventory` |
| **Auth** | Yes (Store JWT) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 20 | Items per page |
| `sku` | String | — | Filter by SKU (case-insensitive regex) |

**Response (200):**

```json
{
  "inventory": [
    {
      "_id": "665c4d5e6f7a8b9c0d1e2f3a",
      "storeId": "665b3c4d5e6f7a8b9c0d1e2f",
      "productId": {
        "_id": "665a2f1a3b4c5d6e7f8a9b0c",
        "name": "Chuck Taylor All Star",
        "sku": "CONV-CTA-001",
        "images": ["https://images.converse.com/chuck-taylor-black.jpg"],
        "basePrice": 65.00
      },
      "sku": "CONV-CTA-001",
      "size": "10",
      "color": "Black",
      "quantityOnHand": 15,
      "quantityReserved": 3,
      "quantityAvailable": 12,
      "lastUpdated": "2026-03-18T14:00:00.000Z",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-03-18T14:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

---

### 9.2 Get Inventory Item

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/store/inventory/:inventoryId` |
| **Auth** | Yes (Store JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `inventoryId` | ObjectId | StoreInventory record ID |

**Response (200):** Single inventory item object (same shape as items in the list response).

**Error (404):**

```json
{
  "message": "Inventory item not found"
}
```

---

### 9.3 Update Inventory

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/api/store/inventory/:inventoryId` |
| **Auth** | Yes (Store JWT) |

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `inventoryId` | ObjectId | StoreInventory record ID |

**Request Body:**

```json
{
  "quantityOnHand": 20
}
```

**Response (200):** Updated inventory item object.

**Error (404):**

```json
{
  "message": "Inventory item not found"
}
```

---

## Endpoint Summary Table

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | POST | `/api/customer/auth/register` | No | Register new customer |
| 2 | POST | `/api/customer/auth/login` | No | Customer login |
| 3 | POST | `/api/customer/auth/logout` | Customer | Customer logout |
| 4 | POST | `/api/customer/auth/refresh-token` | No | Refresh access token |
| 5 | POST | `/api/customer/auth/forgot-password` | No | Request password reset |
| 6 | POST | `/api/customer/auth/reset-password` | No | Reset password with token |
| 7 | GET | `/api/customer/auth/me` | Customer | Get customer profile |
| 8 | PUT | `/api/customer/auth/profile` | Customer | Update customer profile |
| 9 | PUT | `/api/customer/auth/change-password` | Customer | Change password |
| 10 | POST | `/api/customer/auth/addresses` | Customer | Add new address |
| 11 | PUT | `/api/customer/auth/addresses/:addressId` | Customer | Update address |
| 12 | DELETE | `/api/customer/auth/addresses/:addressId` | Customer | Delete address |
| 13 | GET | `/api/customer/products` | No | List products (paginated) |
| 14 | GET | `/api/customer/products/slug/:slug` | No | Get product by slug |
| 15 | GET | `/api/customer/products/:id` | No | Get product by ID |
| 16 | GET | `/api/customer/stores/search` | No | Search stores by ZIP |
| 17 | GET | `/api/customer/stores/:storeId/inventory` | No | Get store inventory for product |
| 18 | POST | `/api/customer/orders` | Customer | Create new order |
| 19 | GET | `/api/customer/orders` | Customer | List customer orders |
| 20 | GET | `/api/customer/orders/:orderId` | Customer | Get order details |
| 21 | POST | `/api/customer/orders/:orderId/cancel` | Customer | Cancel order |
| 22 | POST | `/api/customer/returns` | Customer | Create return request |
| 23 | GET | `/api/customer/returns` | Customer | List customer returns |
| 24 | POST | `/api/store/auth/login` | No | Store employee login |
| 25 | POST | `/api/store/auth/logout` | Store | Store employee logout |
| 26 | GET | `/api/store/auth/me` | Store | Get store employee profile |
| 27 | GET | `/api/store/orders` | Store | List store orders |
| 28 | GET | `/api/store/orders/:orderId` | Store | Get store order details |
| 29 | POST | `/api/store/orders/:orderId/accept` | Store | Accept order |
| 30 | PATCH | `/api/store/orders/:orderId/status` | Store | Update order status |
| 31 | GET | `/api/store/returns` | Store | List store returns |
| 32 | POST | `/api/store/returns/:returnId/accept` | Store | Accept return |
| 33 | POST | `/api/store/returns/:returnId/complete` | Store | Complete return |
| 34 | GET | `/api/store/inventory` | Store | List store inventory |
| 35 | GET | `/api/store/inventory/:inventoryId` | Store | Get inventory item |
| 36 | PUT | `/api/store/inventory/:inventoryId` | Store | Update inventory quantity |
