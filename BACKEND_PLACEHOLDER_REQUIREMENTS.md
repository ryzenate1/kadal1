# Backend Placeholder Requirements

This document defines the backend contracts needed to move from the current client-side placeholder flow to production.

## Current Frontend Placeholder Behavior

- Auth session and user profile are stored in browser localStorage.
- Orders are created and persisted in localStorage.
- Account pages read profile, preferences, and order history from localStorage-backed helpers.
- Tracking page reads order status from localStorage and simulates timeline updates.

These placeholders are implemented so the ecommerce flow is testable end-to-end without a server.

## Required Production APIs

### Auth

- POST /api/auth/login
  - Input: phoneNumber, password
  - Output: accessToken, refreshToken, user
- POST /api/auth/register
  - Input: name, email, phoneNumber, password
  - Output: accessToken, refreshToken, user
- POST /api/auth/refresh
  - Input: refreshToken cookie
  - Output: new accessToken
- POST /api/auth/logout
  - Input: refreshToken cookie
  - Output: success

Security requirements:
- Store refresh token in HttpOnly secure cookie.
- Access token expiry: 15 minutes.
- Refresh token expiry: 7 to 30 days.
- Enable brute-force protection and rate limiting on login endpoints.

### User Profile

- GET /api/user/profile
- PATCH /api/user/profile
- PATCH /api/user/notifications
- POST /api/user/upload-image

Validation requirements:
- Name length and character validation.
- Email format validation.
- Phone number validation for region.
- Image MIME and file-size validation.

### Orders

- POST /api/orders
  - Creates order from cart snapshot.
  - Must return orderId, orderNumber, trackingNumber, status.
- GET /api/user/orders
  - Returns paginated order history for authenticated user.
- PATCH /api/user/orders/:orderId/cancel
  - Cancels only cancellable states.
- GET /api/user/orders/:orderId/invoice
  - Returns invoice PDF or HTML.
- GET /api/orders/:orderId/tracking
  - Returns current tracking state + event timeline.

Order processing requirements:
- Reserve inventory at order creation.
- Confirm payment state transition.
- Generate invoice and trigger notification events.
- Push status transitions: confirmed, processing, shipped, delivered, cancelled.

### Cart (Optional if server-side cart is desired)

- GET /api/user/cart
- PUT /api/user/cart
- DELETE /api/user/cart/items/:itemId

## Data Model Requirements

Minimum tables/collections:
- users
- user_profiles
- addresses
- products
- inventory
- orders
- order_items
- payments
- order_events

## Integration Plan

1. Keep current clientStorage fallback for local development.
2. Add feature flag NEXT_PUBLIC_USE_PLACEHOLDER_BACKEND=true for local mode.
3. When false, frontend calls real API and only falls back on explicit failure in development.
4. Remove fallback-only simulation once production APIs are stable.

## Definition of Done

- User can log in and remain authenticated via refresh flow.
- User can place order, see it in account history, and track status.
- Profile updates are persisted server-side.
- Invoices are downloadable.
- All auth and order endpoints are secured and validated.
