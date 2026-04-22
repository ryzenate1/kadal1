import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));
      const row = await client.query(
        `SELECT
          notifications_enabled,
          notif_order_updates,
          notif_promotions,
          notif_loyalty_updates,
          notif_newsletter,
          notif_sms,
          notif_email,
          notif_push
         FROM profiles WHERE id = $1`,
        [profile.id]
      );
      const settings = row.rows[0] || {};
      const enabled = settings.notifications_enabled ?? true;
      return {
        enabled,
        orderUpdates: settings.notif_order_updates ?? true,
        promotions: settings.notif_promotions ?? true,
        loyaltyUpdates: settings.notif_loyalty_updates ?? true,
        newsletter: settings.notif_newsletter ?? false,
        smsNotifications: settings.notif_sms ?? true,
        emailNotifications: settings.notif_email ?? true,
        pushNotifications: settings.notif_push ?? true,
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Notifications GET failed:', error);
    return NextResponse.json({ error: 'Failed to load notification settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));
      const current = await client.query(
        `SELECT
          notif_order_updates,
          notif_promotions,
          notif_loyalty_updates,
          notif_newsletter,
          notif_sms,
          notif_email,
          notif_push
         FROM profiles WHERE id = $1`,
        [profile.id]
      );

      const row = current.rows[0] || {};
      const next = {
        orderUpdates: body.orderUpdates ?? row.notif_order_updates ?? true,
        promotions: body.promotions ?? row.notif_promotions ?? true,
        loyaltyUpdates: body.loyaltyUpdates ?? row.notif_loyalty_updates ?? true,
        newsletter: body.newsletter ?? row.notif_newsletter ?? false,
        smsNotifications: body.smsNotifications ?? row.notif_sms ?? true,
        emailNotifications: body.emailNotifications ?? row.notif_email ?? true,
        pushNotifications: body.pushNotifications ?? row.notif_push ?? true,
      };

      if (typeof body.enabled === 'boolean') {
        next.orderUpdates = body.enabled;
        next.promotions = body.enabled;
        next.loyaltyUpdates = body.enabled;
        next.smsNotifications = body.enabled;
        next.emailNotifications = body.enabled;
        next.pushNotifications = body.enabled;
      }

      const enabled = [
        next.orderUpdates,
        next.promotions,
        next.loyaltyUpdates,
        next.smsNotifications,
        next.emailNotifications,
        next.pushNotifications,
      ].some(Boolean);

      await client.query(
        `UPDATE profiles
         SET
          notifications_enabled = $2,
          notif_order_updates = $3,
          notif_promotions = $4,
          notif_loyalty_updates = $5,
          notif_newsletter = $6,
          notif_sms = $7,
          notif_email = $8,
          notif_push = $9,
          updated_at = NOW()
         WHERE id = $1`,
        [
          profile.id,
          enabled,
          next.orderUpdates,
          next.promotions,
          next.loyaltyUpdates,
          next.newsletter,
          next.smsNotifications,
          next.emailNotifications,
          next.pushNotifications,
        ]
      );
      return {
        enabled,
        ...next,
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Notifications PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 });
  }
}
