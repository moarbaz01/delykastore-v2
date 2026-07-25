# Aluu API Documentation

**Base URL**: `https://aluu.in/api/v.1`

---

## Overview
This document covers the Products & Order API. 

## Authentication
Send your API key on every request via the headers:

```http
Headers:
  x-api-key: YOUR_API_KEY
```

---

## Important Notes
- For order creation, send `game`, `denom`, `userid`, and if required also `serverid` or `charname`.
- Use `/api/v.1/server-options` before order creation for games that require server selection.
- `serverMode` can be `select`, `manual`, or `none`.
- `partner_webhook_url` must be **HTTPS**.
- When an order reaches a final status, we send a `POST` request to your `partner_webhook_url`.
- Verify webhook callbacks using HMAC-SHA256 with `timestamp + "." + raw_request_body`.
- `partner_orderid` must be unique per user.

---

## Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v.1/balance` | Get your current wallet balance |
| `GET` | `/api/v.1/games` | Get game list |
| `GET` | `/api/v.1/products/:gameCode` | Get products by game code |
| `GET` | `/api/v.1/server-options?gamecode=...` | Get available server options for a game |
| `POST` | `/api/v.1/create` | Create order |
| `GET` | `/api/v.1/:partner_orderid` | Get single order |
| `POST`| `/api/v.1/:partner_orderid/track`| Track order status |

---

### `GET /balance`
Return your account's current wallet balance.

**Request:**
```http
GET /api/v.1/balance
Headers:
  x-api-key: YOUR_API_KEY
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "wallet_balance": 123.456,
    "currency": "USD"
  }
}
```

---

### `GET /games`
Return all available games.

**Request:**
```http
GET /api/v.1/games
Headers:
  x-api-key: YOUR_API_KEY
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "Name": "Mobile Legends",
      "gamecode": "mlbb",
      "image": "/productImages/mlbb.jpg",
      "totalProducts": 12
    },
    {
      "Name": "PUBG Mobile",
      "gamecode": "pubgm",
      "image": "/productImages/pubgm.jpg",
      "totalProducts": 8
    }
  ]
}
```

---

### `GET /products/:gameCode`
Return all active products for the selected game code.

**Request:**
```http
GET /api/v.1/products/mlbb
Headers:
  x-api-key: YOUR_API_KEY
```

**Response (200 OK):**
```json
{
  "success": true,
  "gameCode": "mlbb",
  "count": 2,
  "data": [
    {
      "_id": "67f1234567890abcdef12345",
      "name": "86 Diamonds",
      "image": "/gallery/packlogo.png",
      "gamecode": "mlbb",
      "Pack": "86",
      "requiresUserId": true,
      "requiresServerId": true,
      "requiresCharName": false,
      "price": 120,
      "stockStatus": "in_stock",
      "updatedAt": "2026-03-28T10:00:00.000Z",
      "lastRateUpdatedAt": "2026-03-28T10:10:00.000Z"
    },
    {
      "_id": "67f1234567890abcdef12346",
      "name": "Weekly Pass",
      "image": "/gallery/weekly.png",
      "gamecode": "mlbb",
      "Pack": "weekly",
      "requiresUserId": true,
      "requiresServerId": true,
      "requiresCharName": false,
      "price": 180,
      "stockStatus": "in_stock",
      "updatedAt": "2026-03-28T10:00:00.000Z",
      "lastRateUpdatedAt": "2026-03-28T10:10:00.000Z"
    }
  ]
}
```

---

### `GET /server-options`
Return available server options for the selected game code.

**Request:**
```http
GET /api/v.1/server-options?gamecode=honkai
Headers:
  x-api-key: YOUR_API_KEY
```

**Response (200 OK):**
```json
{
  "success": true,
  "requiresServerId": true,
  "serverMode": "select",
  "servers": [
    { "value": "os_asia", "label": "os_asia" },
    { "value": "os_euro", "label": "os_euro" },
    { "value": "os_cht", "label": "os_cht" },
    { "value": "os_usa", "label": "os_usa" }
  ]
}
```

---

### `POST /create`
Create a new order.

**Request:**
```http
POST /api/v.1/create
Headers:
  x-api-key: YOUR_API_KEY
  Content-Type: application/json
```
```json
{
  "game": "mlbb",
  "denom": "86",
  "userid": "12345678",
  "serverid": "1234",
  "charname": "",
  "partner_webhook_url": "https://yourdomain.com/webhook/order-status",
  "partner_orderid": "ORDER-10001"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order accepted",
  "data": {
    "orderid":           "ORDER-10001",
    "reference":         "API-ABC123456",
    "status":            "pending",
    "amount":            120,
    "username":          "Arjun",
    "provider_order_id": "",
    "game":              "mlbb",
    "denom":             "86",
    "userid":            "12345678",
    "serverid":          "1234",
    "charname":          "",
    "createdAt":         "2026-03-28T10:15:00.000Z",
    "updatedAt":         "2026-03-28T10:15:00.000Z"
  }
}
```

---

### `GET /:partner_orderid`
Fetch a single order by partner order id.

**Request:**
```http
GET /api/v.1/ORDER-10001
Headers:
  x-api-key: YOUR_API_KEY
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderid":           "ORDER-10001",
    "reference":         "API-ABC123456",
    "status":            "successful",
    "amount":            120,
    "username":          "Arjun",
    "provider_order_id": "78256402205090116",
    "game":              "mlbb",
    "denom":             "86",
    "userid":            "12345678",
    "serverid":          "1234",
    "charname":          "",
    "createdAt":         "2026-03-28T10:15:00.000Z",
    "updatedAt":         "2026-03-28T10:17:00.000Z"
  }
}
```

---

### `POST /:partner_orderid/track`
Track and refresh order status.

**Request:**
```http
POST /api/v.1/ORDER-10001/track
Headers:
  x-api-key: YOUR_API_KEY
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderid":           "ORDER-10001",
    "reference":         "API-ABC123456",
    "status":            "successful",
    "amount":            120,
    "username":          "Arjun",
    "provider_order_id": "78256402205090116",
    "game":              "mlbb",
    "denom":             "86",
    "userid":            "12345678",
    "serverid":          "1234",
    "charname":          "",
    "createdAt":         "2026-03-28T10:15:00.000Z",
    "updatedAt":         "2026-03-28T10:17:00.000Z"
  }
}
```

---

## Webhook Callback

When an order reaches a final status, Aluu sends a `POST` request to your configured `partner_webhook_url`.

**Request:**
```http
POST https://yourdomain.com/webhook/order-status
Content-Type: application/json
X-Webhook-Timestamp: 1711600000
X-Webhook-Signature: GENERATED_HMAC_SHA256_SIGNATURE
```
```json
{
  "success": true,
  "data": {
    "orderid":           "ORDER-10001",
    "reference":         "API-ABC123456",
    "status":            "successful",
    "amount":            120,
    "provider_order_id": "78256402205090116",
    "game":              "mlbb",
    "denom":             "86",
    "userid":            "12345678",
    "serverid":          "1234",
    "charname":          "",
    "createdAt":         "2026-03-28T10:15:00.000Z",
    "updatedAt":         "2026-03-28T10:17:00.000Z"
  }
}
```

### Webhook Signature Verification
Verify every webhook callback using HMAC-SHA256.

**Signature format:**
```text
signature = hex(hmac_sha256(YOUR_SECRET_KEY, timestamp + "." + raw_request_body))
```

---

## Quick Test Snippets

### cURL
```bash
curl -X GET "https://aluu.in/api/v.1/games" \
  -H "x-api-key: YOUR_API_KEY"

curl -X GET "https://aluu.in/api/v.1/products/mlbb" \
  -H "x-api-key: YOUR_API_KEY"

curl -X GET "https://aluu.in/api/v.1/server-options?gamecode=honkai" \
  -H "x-api-key: YOUR_API_KEY"

curl -X POST "https://aluu.in/api/v.1/create" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "game":"mlbb",
    "denom":"86",
    "userid":"12345678",
    "serverid":"1234",
    "charname":"",
    "partner_webhook_url":"https://yourdomain.com/webhook/order-status",
    "partner_orderid":"ORDER-10001"
  }'
```

### Example Webhook Receiver (Node.js)
```javascript
const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString("utf8");
  }
}));

function verifyWebhook({ timestamp, rawBody, signature, secret }) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(String(signature || ""), "utf8")
  );
}

app.post("/webhook/order-status", (req, res) => {
  const timestamp = req.header("X-Webhook-Timestamp");
  const signature = req.header("X-Webhook-Signature");
  const secret = process.env.SECRET_KEY;

  const now = Math.floor(Date.now() / 1000);
  if (!timestamp || Math.abs(now - Number(timestamp)) > 300) {
    return res.status(400).json({ success: false, message: "Stale webhook timestamp" });
  }

  const ok = verifyWebhook({
    timestamp,
    rawBody: req.rawBody,
    signature,
    secret,
  });

  if (!ok) {
    return res.status(401).json({ success: false, message: "Invalid signature" });
  }

  console.log("Verified webhook:", req.body);
  return res.json({ success: true });
});

app.listen(3000, () => {
  console.log("Webhook listener running on port 3000");
});
```

---

## Errors

| Status | Error | Response Snippet |
|---|---|---|
| **400** | Bad Request | `{"success": false, "message": "gamecode is required"}` |
| **401** | Unauthorized | `{"success": false, "message": "Unauthorized"}` |
| **404** | Not Found | `{"success": false, "message": "Order not found"}` |
| **409** | Conflict | `{"success": false, "message": "Duplicate partner_orderid", "data": {...}}` |
| **429** | Too Many Requests | `{"success": false, "message": "Too many requests"}` |
| **400** | Webhook - Stale Timestamp | `{"success": false, "message": "Stale webhook timestamp"}` |
| **401** | Webhook - Invalid Signature | `{"success": false, "message": "Invalid signature"}` |
