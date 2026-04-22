import { NextRequest, NextResponse } from "next/server";
import { db, ensureSchema, withTransaction } from "@/lib/server/database";
import { getAdminUserMeta, upsertAdminUserMeta } from "@/lib/server/adminUserMeta";
import { requireAdmin } from "@/lib/server/adminGuard";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    const { id } = await params;
    await ensureSchema();

    const profileRes = await db.query(
      `
      SELECT
        id,
        auth_user_id,
        name,
        email,
        phone_number,
        loyalty_points,
        created_at,
        updated_at
      FROM profiles
      WHERE id = $1::uuid
      LIMIT 1
      `,
      [id]
    );

    const profile = profileRes.rows?.[0];
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [ordersRes, itemsRes, addressesRes] = await Promise.all([
      db.query(
        `
        SELECT
          id,
          order_number,
          status,
          total_amount,
          created_at
        FROM orders
        WHERE profile_id = $1::uuid
        ORDER BY created_at DESC
        `,
        [id]
      ),
      db.query(
        `
        SELECT
          id,
          order_id,
          product_id,
          product_name,
          product_image,
          quantity,
          price,
          weight,
          created_at
        FROM order_items
        WHERE order_id = ANY(
          SELECT id FROM orders WHERE profile_id = $1::uuid
        )
        ORDER BY created_at ASC
        `,
        [id]
      ),
      db.query(
        `
        SELECT
          id,
          profile_id,
          name,
          phone_number,
          address,
          city,
          state,
          pincode,
          type,
          is_default,
          created_at,
          updated_at
        FROM addresses
        WHERE profile_id = $1::uuid
        ORDER BY updated_at DESC
        `,
        [id]
      ),
    ]);

    const itemsByOrderId = new Map<string, any[]>();
    for (const it of itemsRes.rows || []) {
      const key = String(it.order_id);
      const arr = itemsByOrderId.get(key) || [];
      arr.push({
        id: it.id,
        orderId: it.order_id,
        productId: it.product_id,
        productName: it.product_name,
        productImage: it.product_image,
        quantity: Number(it.quantity || 0),
        price: Number(it.price || 0),
        weight: it.weight ?? null,
        createdAt: it.created_at,
      });
      itemsByOrderId.set(key, arr);
    }

    const meta = await getAdminUserMeta(profile.id);
    const payload = {
      id: profile.id,
      authUserId: profile.auth_user_id,
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phone_number,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      loyaltyPoints: Number(profile.loyalty_points || 0),
      tags: meta.tags,
      isBanned: meta.isBanned,
      isDeleted: meta.isDeleted,
      banReason: meta.banReason,
      notes: meta.notes,
      addresses: (addressesRes.rows || []).map((a) => ({
        id: a.id,
        profileId: a.profile_id,
        name: a.name,
        phoneNumber: a.phone_number,
        address: a.address,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        type: a.type,
        isDefault: Boolean(a.is_default),
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })),
      orders: (ordersRes.rows || []).map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        totalAmount: Number(o.total_amount || 0),
        createdAt: o.created_at,
        items: itemsByOrderId.get(String(o.id)) || [],
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Admin user GET failed:", error);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      phoneNumber?: string;
      tags?: string[];
      isBanned?: boolean;
      isDeleted?: boolean;
      banReason?: string | null;
      notes?: string | null;
    };

    const profile = await withTransaction(async (client) => {
      const existing = await client.query(`SELECT id FROM profiles WHERE id = $1::uuid LIMIT 1`, [id]);
      if (!existing.rows?.[0]) return null;

      const nextName = typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;
      const nextEmail = typeof body.email === "string" ? (body.email.trim() || null) : null;
      const nextPhone = typeof body.phoneNumber === "string" ? (body.phoneNumber.trim() || null) : null;

      await client.query(
        `
        UPDATE profiles
        SET
          name = COALESCE($2::text, name),
          email = CASE WHEN $3::text IS NULL THEN email ELSE $3::text END,
          phone_number = CASE WHEN $4::text IS NULL THEN phone_number ELSE $4::text END,
          updated_at = NOW()
        WHERE id = $1::uuid
        `,
        [id, nextName, nextEmail, nextPhone]
      );

      const updated = await client.query(
        `
        SELECT id, auth_user_id, name, email, phone_number, created_at, updated_at
        FROM profiles
        WHERE id = $1::uuid
        LIMIT 1
        `,
        [id]
      );

      return updated.rows?.[0] || null;
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const meta = await upsertAdminUserMeta(id, {
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      isBanned: typeof body.isBanned === "boolean" ? body.isBanned : undefined,
      isDeleted: typeof body.isDeleted === "boolean" ? body.isDeleted : undefined,
      banReason: typeof body.banReason === "string" || body.banReason === null ? body.banReason : undefined,
      notes: typeof body.notes === "string" || body.notes === null ? body.notes : undefined,
    });

    return NextResponse.json({
      id: profile.id,
      authUserId: profile.auth_user_id,
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phone_number,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      tags: meta.tags,
      isBanned: meta.isBanned,
      isDeleted: meta.isDeleted,
      banReason: meta.banReason,
      notes: meta.notes,
      metaUpdatedAt: meta.updatedAt,
    });
  } catch (error) {
    console.error("Admin user PATCH failed:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    const { id } = await params;
    await ensureSchema();
    const existing = await db.query(`SELECT id FROM profiles WHERE id = $1::uuid LIMIT 1`, [id]);
    if (!existing.rows?.[0]) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const meta = await upsertAdminUserMeta(id, { isDeleted: true });
    return NextResponse.json({ success: true, id, isDeleted: meta.isDeleted });
  } catch (error) {
    console.error("Admin user DELETE failed:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
