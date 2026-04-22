import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

type FeedRow = {
  id: string;
  title: string;
  message: string;
  source_type: string;
  source_id: string;
  is_read: boolean;
  created_at: string;
};

function mapFeed(row: FeedRow, profileId: string) {
  return {
    id: row.id,
    userId: profileId,
    title: row.title,
    message: row.message,
    type: row.source_type,
    resourceType: row.source_type,
    resourceId: row.source_id,
    isRead: !!row.is_read,
    createdAt: row.created_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const orders = await client.query(
        `SELECT id, order_number, status, updated_at
         FROM orders
         WHERE profile_id = $1
         ORDER BY updated_at DESC
         LIMIT 50`,
        [profile.id]
      );

      for (const order of orders.rows) {
        const status = String(order.status || 'pending');
        const sourceId = String(order.id);
        const title = status === 'delivered'
          ? 'Order delivered'
          : status === 'shipped'
          ? 'Order shipped'
          : status === 'processing'
          ? 'Order is being prepared'
          : status === 'confirmed'
          ? 'Order confirmed'
          : status === 'cancelled'
          ? 'Order cancelled'
          : 'Order update';

        const message = `Order #${order.order_number} is now ${status}.`;

        await client.query(
          `INSERT INTO user_notifications (profile_id, source_type, source_id, title, message, created_at, updated_at)
           VALUES ($1, 'order_status', $2, $3, $4, $5, NOW())
           ON CONFLICT (profile_id, source_type, source_id)
           DO UPDATE SET title = EXCLUDED.title, message = EXCLUDED.message, updated_at = NOW()`,
          [profile.id, sourceId, title, message, order.updated_at || new Date().toISOString()]
        );
      }

      const rows = await client.query(
        `SELECT id, title, message, source_type, source_id, is_read, created_at
         FROM user_notifications
         WHERE profile_id = $1
         ORDER BY created_at DESC
         LIMIT 100`,
        [profile.id]
      );

      const unread = rows.rows.filter((r) => !r.is_read).length;

      return {
        notifications: rows.rows.map((row: FeedRow) => mapFeed(row, profile.id)),
        unreadCount: unread,
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Notifications feed GET failed:', error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      if (body?.action === 'markAllRead') {
        await client.query(
          `UPDATE user_notifications
           SET is_read = TRUE, updated_at = NOW()
           WHERE profile_id = $1`,
          [profile.id]
        );
      } else if (body?.notificationId) {
        await client.query(
          `UPDATE user_notifications
           SET is_read = TRUE, updated_at = NOW()
           WHERE id = $1 AND profile_id = $2`,
          [body.notificationId, profile.id]
        );
      }

      const unreadRes = await client.query(
        `SELECT COUNT(*)::int AS total
         FROM user_notifications
         WHERE profile_id = $1 AND is_read = FALSE`,
        [profile.id]
      );

      return { unreadCount: Number(unreadRes.rows[0]?.total || 0) };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Notifications feed PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
