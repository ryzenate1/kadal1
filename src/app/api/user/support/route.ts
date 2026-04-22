import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || null;
    const userName = req.headers.get('x-user-name') || 'Guest';
    const userEmail = req.headers.get('x-user-email') || '';
    const userPhone = req.headers.get('x-user-phone') || '';
    const body = await req.json();
    const { subject, category, message, priority = 'normal' } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    const created = await withTransaction(async (client) => {
      const reqUser = getRequestUser(req);
      const profile = await resolveProfile(client, reqUser);
      const effectiveUserId = userId || profile.id;

      const result = await client.query(
        `INSERT INTO support_tickets (
          ticket_number, user_id, user_name, user_email, user_phone, subject, category, message, priority, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'open')
        RETURNING id, ticket_number, status`,
        [
          ticketNumber,
          effectiveUserId,
          userName || profile.name || 'Guest',
          userEmail || profile.email || null,
          userPhone || profile.phone_number || null,
          subject,
          category || 'general',
          message,
          priority || 'normal',
        ]
      );

      return result.rows[0];
    });

    return NextResponse.json({
      id: created.id,
      ticketNumber: created.ticket_number,
      status: created.status,
      message: 'Ticket created successfully',
    });
  } catch (err) {
    console.error('Support ticket error:', err);
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const data = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));
      const result = await client.query(
        `SELECT *
         FROM support_tickets
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [profile.id]
      );
      return result.rows;
    });
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([]);
  }
}
