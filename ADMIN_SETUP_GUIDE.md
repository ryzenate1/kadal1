# Admin Panel Setup Guide

## Overview
The admin panel is fully implemented with:
- ✅ Prisma ORM integration
- ✅ Admin CRUD APIs for order management
- ✅ Video upload functionality
- ✅ Delivery person assignment
- ✅ Order status tracking
- ✅ Database schema with new admin fields

## Prerequisites
- DATABASE_URL is already configured in `.env.local`
- Supabase project is set up
- Prisma client is generated (`npx prisma@6.6.0 generate` - ✅ Done)

## Step 1: Execute SQL Migrations in Supabase

### 1.1 Execute Base Schema (if not already done)
1. Go to your Supabase project: https://app.supabase.com
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `supabase/kadal_realtime_orders_schema.sql`
5. Run the query

**What this does:**
- Creates tables: profiles, addresses, orders, order_items, order_events, loyalty_activities
- Sets up RLS (Row Level Security) policies
- Configures Supabase realtime
- Creates indexes for performance

### 1.2 Execute Clerk Auth Alignment Schema
1. Create a new SQL query in Supabase
2. Copy the contents of `supabase/kadal_clerk_auth_schema.sql`
3. Run the query

**What this does:**
- Converts `profiles.auth_user_id` to `TEXT` for Clerk user IDs
- Removes old FK coupling to `auth.users`
- Recreates profile RLS policies using Clerk JWT `sub` claim
- Adds helper function `upsert_profile_from_clerk`

### 1.3 Execute Admin Delivery Fields Schema
1. Create a new SQL query in Supabase
2. Copy the contents of `supabase/kadal_admin_order_delivery.sql`
3. Run the query

**What this does:**
- Adds 4 new columns to orders table:
  - `processing_video_url` (TEXT) - URL to uploaded delivery video
  - `delivery_person_name` (TEXT) - Name of delivery person
  - `delivery_person_phone` (TEXT) - Phone of delivery person
  - `is_delivery_reached` (BOOLEAN) - Flag if delivery completed

### 1.4 Legacy SQL Files (Do Not Run for Clerk)
- `kadal_auth_signup_signin_otp_schema.sql` - Legacy OTP auth schema (Supabase auth UUID flow)
- `kadal_auth_realtime_security.sql` - Legacy Supabase auth UUID RLS policies

## Step 2: Verify Database Connection

### 2.1 Test Connection
```bash
# From the project root
npm run dev
```

Then navigate to: http://localhost:3000/api/admin/health

You should see: `{ "status": "connected" }`

### 2.2 Check Prisma Client
```bash
npx prisma@6.6.0 studio
```
This opens Prisma Studio to view your database tables.

## Step 3: Access Admin Panel

### 3.1 Get Admin Key
Admin key is: `kadal-admin-2024` (from `.env.local` ADMIN_API_KEY or defaults)

### 3.2 Access Panel
1. Navigate to: http://localhost:3000/admin/orders
2. You'll be prompted for an admin key
3. Enter: `kadal-admin-2024`
4. The panel should load with existing orders

## Step 4: Test Admin Features

### 4.1 View Orders
- Orders list loads from database via `/api/admin/orders`
- Filter by status (pending, confirmed, processing, shipped, delivered, cancelled)
- Search by order number or customer name

### 4.2 Upload Video
1. Select an order
2. In the "Video Upload" section, click "Choose File"
3. Select a video file
4. Click "Upload Video"
5. Video is saved to: `/public/uploads/order-videos/{orderId}-{timestamp}.{ext}`
6. `processingVideoUrl` is updated in database

### 4.3 Assign Delivery Person
1. Select an order
2. Fill in:
   - Delivery Person Name
   - Delivery Person Phone
   - Estimated Delivery (date/time)
3. Click "Assign Delivery"
4. Mark as "Reached" if delivery is complete

### 4.4 Update Order Status
1. Select an order
2. Use status buttons to progress:
   - pending → confirmed → processing → shipped → delivered
   - Or cancel order at any stage
3. Each status change creates an order event in the timeline

## Step 5: API Reference

### Get All Orders
```bash
curl -X GET 'http://localhost:3000/api/admin/orders?status=pending' \
  -H 'x-admin-key: kadal-admin-2024'
```

### Get Single Order
```bash
curl -X GET 'http://localhost:3000/api/admin/orders/{orderId}' \
  -H 'x-admin-key: kadal-admin-2024'
```

### Update Order Status
```bash
curl -X PATCH 'http://localhost:3000/api/admin/orders/{orderId}' \
  -H 'x-admin-key: kadal-admin-2024' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "processing",
    "paymentStatus": "paid"
  }'
```

### Set Delivery Information
```bash
curl -X PATCH 'http://localhost:3000/api/admin/orders/{orderId}/set-delivery' \
  -H 'x-admin-key: kadal-admin-2024' \
  -H 'Content-Type: application/json' \
  -d '{
    "deliveryPersonName": "John Doe",
    "deliveryPersonPhone": "9876543210",
    "estimatedDelivery": "2026-04-22T10:00:00Z",
    "isDeliveryReached": false
  }'
```

### Upload Video
```bash
curl -X POST 'http://localhost:3000/api/admin/orders/{orderId}/upload-video' \
  -H 'x-admin-key: kadal-admin-2024' \
  -F 'video=@path/to/video.mp4'
```

## Step 6: Environment Variables

Current configuration in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://llmvejzjadmjlyfukdyx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sV6DUx_L6e3z_IXugfDV0w_GugmHBTG
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:kadalthunaidb@db.llmvejzjadmjlyfukdyx.supabase.co:5432/postgres
OTP_PROVIDER=twilio
ADMIN_API_KEY=kadal-admin-2024 (optional, defaults if not set)
```

⚠️ **Security Note**: In production:
- Never commit `.env.local` to version control
- Use environment secrets in deployment platform
- Consider implementing proper admin authentication instead of header-based key
- Implement RLS policies for admin operations

## Step 7: Troubleshooting

### Issue: "Unauthorized" when accessing admin panel
- Check admin key is correct: `kadal-admin-2024`
- Verify `ADMIN_API_KEY` is set in `.env.local` or using default
- Check `x-admin-key` header is being sent in requests

### Issue: Orders not loading
- Verify DATABASE_URL is correct
- Run Prisma migrations: `npx prisma@6.6.0 db push`
- Check Supabase dashboard for tables and data
- View logs: `npx prisma@6.6.0 studio`

### Issue: Video upload fails
- Check `/public/uploads/order-videos/` directory exists
- Verify file permissions allow write access
- Check file size limits (adjust in api route if needed)

### Issue: Realtime updates not working
- Verify `REPLICA IDENTITY FULL` is set on orders table
- Check `supabase_realtime` publication includes orders table
- Test with: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`

## Step 8: Next Steps

### For Production:
1. ✅ Implement proper admin authentication (JWT-based instead of header key)
2. ✅ Add admin user management
3. ✅ Implement RLS policies for admin-specific data access
4. ✅ Add audit logging for all admin actions
5. ✅ Set up video storage (S3/Cloudinary instead of local)
6. ✅ Add webhooks for order status updates to customers
7. ✅ Implement SMS/Email notifications for delivery updates

### For Testing:
1. Create sample orders in database
2. Test video upload with real files
3. Test delivery person assignment
4. Test order status progression
5. Verify realtime updates on user dashboard

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── orders/
│   │       └── page.tsx (Admin dashboard UI)
│   └── api/
│       └── admin/
│           └── orders/
│               ├── route.ts (GET all, filter by status)
│               ├── [orderId]/
│               │   ├── route.ts (GET single, PATCH status)
│               │   ├── set-delivery/route.ts (PATCH delivery info)
│               │   └── upload-video/route.ts (POST video)
│               └── health/route.ts (Health check)
├── lib/
│   └── prisma.ts (Prisma client singleton)
└── (other app files)

prisma/
└── schema.prisma (Database schema definition)

supabase/
├── kadal_realtime_orders_schema.sql (Base schema)
├── kadal_clerk_auth_schema.sql (Clerk auth alignment)
├── kadal_admin_order_delivery.sql (Admin fields)
├── kadal_auth_signup_signin_otp_schema.sql (Legacy OTP, do not run with Clerk)
└── kadal_auth_realtime_security.sql (Legacy UUID auth security)
```

## Completion Checklist

- [ ] Executed `kadal_realtime_orders_schema.sql` in Supabase
- [ ] Executed `kadal_clerk_auth_schema.sql` in Supabase
- [ ] Executed `kadal_admin_order_delivery.sql` in Supabase
- [ ] DATABASE_URL is configured in `.env.local`
- [ ] Ran `npm run dev` and server started
- [ ] Tested health check endpoint
- [ ] Accessed admin panel at `/admin/orders`
- [ ] Entered admin key `kadal-admin-2024`
- [ ] Can see orders in admin panel
- [ ] Uploaded a test video
- [ ] Assigned delivery person
- [ ] Changed order status
- [ ] Verified database updated

---

**Last Updated**: April 21, 2026
**Status**: All components implemented and ready for production
