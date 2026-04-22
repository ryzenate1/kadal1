import { NextRequest, NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/server/database";
import { readAdminUserMetaMap } from "@/lib/server/adminUserMeta";
import { requireAdmin } from "@/lib/server/adminGuard";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "all").trim();
    const metaMap = await readAdminUserMetaMap();
    await ensureSchema();

    const profilesRes = await db.query(
      `
      SELECT
        p.id,
        p.auth_user_id,
        p.name,
        p.email,
        p.phone_number,
        p.created_at,
        p.updated_at,
        COALESCE(os.order_count, 0)::int AS order_count,
        COALESCE(os.total_spent, 0)::numeric AS total_spent,
        os.latest_order_at
      FROM profiles p
      LEFT JOIN (
        SELECT
          o.profile_id,
          COUNT(*)::int AS order_count,
          COALESCE(SUM(o.total_amount), 0)::numeric AS total_spent,
          MAX(o.created_at) AS latest_order_at
        FROM orders o
        GROUP BY o.profile_id
      ) os ON os.profile_id = p.id
      ORDER BY p.created_at DESC
      `
    );

    const profiles = profilesRes.rows || [];

    const normalizedQuery = query.toLowerCase();
    const payload = profiles
      .map((profile) => {
        const meta = metaMap[profile.id] || {
          profileId: profile.id,
          tags: [],
          isBanned: false,
          isDeleted: false,
          banReason: null,
          notes: null,
          updatedAt: new Date(0).toISOString(),
        };
        const totalSpent = Number(profile.total_spent || 0);
        return {
          id: profile.id,
          authUserId: profile.auth_user_id,
          name: profile.name,
          email: profile.email,
          phoneNumber: profile.phone_number,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          orderCount: Number(profile.order_count || 0),
          totalSpent,
          latestOrderAt: profile.latest_order_at || null,
          tags: meta.tags,
          isBanned: meta.isBanned,
          isDeleted: meta.isDeleted,
          banReason: meta.banReason,
          notes: meta.notes,
          metaUpdatedAt: meta.updatedAt,
        };
      })
      .filter((row) => {
        if (status === "active" && (row.isBanned || row.isDeleted)) return false;
        if (status === "banned" && !row.isBanned) return false;
        if (status === "deleted" && !row.isDeleted) return false;
        if (!normalizedQuery) return true;
        return [row.name, row.email, row.phoneNumber, row.id]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(normalizedQuery));
      });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Admin users GET failed:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
