import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema, db } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    await ensureSchema();
    const [orderMetricsRes, activeProductsRes, recentOrdersRes] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*)::int AS total_orders,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'paid' AND status <> 'cancelled'), 0)::numeric AS total_revenue,
          COUNT(DISTINCT profile_id)::int AS active_customers,
          COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_orders,
          COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS paid_orders,
          COUNT(*) FILTER (WHERE payment_status = 'failed')::int AS failed_orders,
          COALESCE(SUM(total_amount) FILTER (
            WHERE payment_status = 'paid' AND status IN ('confirmed', 'processing', 'shipped')
          ), 0)::numeric AS captured_payments
        FROM orders
      `),
      db.query(`SELECT COUNT(*)::int AS count FROM catalog_products WHERE is_active = TRUE`),
      db.query(
        `
        SELECT
          id,
          order_number,
          status,
          total_amount,
          payment_status,
          shipping_name,
          created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 5
        `
      ),
    ]);

    const metrics = orderMetricsRes.rows?.[0] || {};
    const totalOrders = Number(metrics.total_orders || 0);
    const deliveredOrders = Number(metrics.delivered_orders || 0);
    const paidOrders = Number(metrics.paid_orders || 0);
    const failedOrders = Number(metrics.failed_orders || 0);
    const paymentAttempts = paidOrders + failedOrders;

    const stats = {
      totalOrders,
      totalRevenue: Number(metrics.total_revenue || 0),
      activeProducts: Number(activeProductsRes.rows?.[0]?.count || 0),
      activeCustomers: Number(metrics.active_customers || 0),
      fulfilledRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
      paymentSuccessRate: paymentAttempts > 0 ? Math.round((paidOrders / paymentAttempts) * 100) : 0,
      capturedPayments: Number(metrics.captured_payments || 0),
      recentOrders: (recentOrdersRes.rows || []).map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        paymentStatus: o.payment_status,
        totalAmount: Number(o.total_amount || 0),
        shippingName: o.shipping_name,
        createdAt: o.created_at,
      })),
    };

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
