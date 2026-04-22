import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

function isAuthenticatedRequest(req: NextRequest) {
  const reqUser = getRequestUser(req);
  return Boolean(reqUser.id || reqUser.authUserId || reqUser.email || reqUser.accessToken);
}

type AddressRow = {
  id: string;
  name: string;
  phone_number: string | null;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  type: 'home' | 'work' | 'other';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { addressId } = await params;

    const updated = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      if (body.isDefault === true) {
        await client.query(`UPDATE addresses SET is_default = FALSE WHERE profile_id = $1`, [profile.id]);
      }

      const result = await client.query(
        `UPDATE addresses
         SET
          name = COALESCE($3, name),
          phone_number = COALESCE($4, phone_number),
          address = COALESCE($5, address),
          city = COALESCE($6, city),
          state = COALESCE($7, state),
          pincode = COALESCE($8, pincode),
          type = COALESCE($9, type),
          is_default = COALESCE($10, is_default),
          updated_at = NOW()
         WHERE id = $1 AND profile_id = $2
         RETURNING id, name, phone_number, address, city, state, pincode, type, is_default, created_at, updated_at`,
        [
          addressId,
          profile.id,
          body.name ?? null,
          body.phoneNumber ?? null,
          body.address ?? null,
          body.city ?? null,
          body.state ?? null,
          body.pincode ?? null,
          body.type ?? null,
          typeof body.isDefault === 'boolean' ? body.isDefault : null,
        ]
      );

      return result.rows[0] ? mapAddress(result.rows[0] as AddressRow) : null;
    });

    if (!updated) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Address PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    if (!isAuthenticatedRequest(req)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { addressId } = await params;

    const result = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const deleted = await client.query(
        `DELETE FROM addresses
         WHERE id = $1 AND profile_id = $2
         RETURNING id, is_default`,
        [addressId, profile.id]
      );

      if (!deleted.rows[0]) return null;

      if (deleted.rows[0].is_default) {
        await client.query(
          `UPDATE addresses
           SET is_default = TRUE
           WHERE id = (
             SELECT id FROM addresses WHERE profile_id = $1 ORDER BY updated_at DESC LIMIT 1
           )`,
          [profile.id]
        );
      }

      return { success: true };
    });

    if (!result) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Address DELETE failed:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
