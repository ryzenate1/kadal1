import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

function isAuthenticatedRequest(req: NextRequest) {
  const reqUser = getRequestUser(req);
  return Boolean(reqUser.id || reqUser.authUserId || reqUser.email || reqUser.accessToken);
}

type AddressType = 'home' | 'work' | 'other';

type AddressRow = {
  id: string;
  name: string;
  phone_number: string | null;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  type: AddressType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function mapAddress(row: AddressRow) {
  return {
    id: row.id,
    name: row.name,
    phoneNumber: row.phone_number || '',
    address: row.address,
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    type: row.type || 'home',
    isDefault: !!row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));
      const result = await client.query(
        `SELECT id, name, phone_number, address, city, state, pincode, type, is_default, created_at, updated_at
         FROM addresses
         WHERE profile_id = $1
         ORDER BY is_default DESC, updated_at DESC`,
        [profile.id]
      );
      return result.rows.map((row: AddressRow) => mapAddress(row));
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Addresses GET failed:', error);
    return NextResponse.json({ error: 'Failed to load addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();

    if (!body?.name || !body?.address || !body?.pincode) {
      return NextResponse.json({ error: 'name, address and pincode are required' }, { status: 400 });
    }

    const created = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const existing = await client.query(
        `SELECT COUNT(*)::int AS total FROM addresses WHERE profile_id = $1`,
        [profile.id]
      );

      const isDefault = Boolean(body.isDefault) || Number(existing.rows[0]?.total || 0) === 0;
      if (isDefault) {
        await client.query(`UPDATE addresses SET is_default = FALSE WHERE profile_id = $1`, [profile.id]);
      }

      const insert = await client.query(
        `INSERT INTO addresses (
          profile_id, name, phone_number, address, city, state, pincode, type, is_default
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id, name, phone_number, address, city, state, pincode, type, is_default, created_at, updated_at`,
        [
          profile.id,
          body.name,
          body.phoneNumber || null,
          body.address,
          body.city || null,
          body.state || null,
          body.pincode,
          (body.type as AddressType) || 'home',
          isDefault,
        ]
      );

      return mapAddress(insert.rows[0] as AddressRow);
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Addresses POST failed:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
