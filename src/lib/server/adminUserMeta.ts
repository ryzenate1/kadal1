import { promises as fs } from "fs";
import path from "path";

export type AdminUserMeta = {
  profileId: string;
  tags: string[];
  isBanned: boolean;
  isDeleted: boolean;
  banReason?: string | null;
  notes?: string | null;
  updatedAt: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "admin-user-meta.json");

type AdminUserMetaMap = Record<string, AdminUserMeta>;

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return Array.from(
    new Set(
      tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter(Boolean)
        .slice(0, 20)
    )
  );
}

function normalizeMeta(profileId: string, incoming?: Partial<AdminUserMeta>): AdminUserMeta {
  return {
    profileId,
    tags: normalizeTags(incoming?.tags),
    isBanned: Boolean(incoming?.isBanned),
    isDeleted: Boolean(incoming?.isDeleted),
    banReason: incoming?.banReason?.trim() || null,
    notes: incoming?.notes?.trim() || null,
    updatedAt: incoming?.updatedAt || new Date().toISOString(),
  };
}

async function readRawMap(): Promise<AdminUserMetaMap> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const entries = Object.entries(parsed as Record<string, unknown>);
    const mapped: AdminUserMetaMap = {};
    for (const [profileId, value] of entries) {
      mapped[profileId] = normalizeMeta(profileId, value as Partial<AdminUserMeta>);
    }
    return mapped;
  } catch {
    return {};
  }
}

async function writeRawMap(map: AdminUserMetaMap): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(map, null, 2) + "\n", "utf8");
}

export async function readAdminUserMetaMap(): Promise<AdminUserMetaMap> {
  return readRawMap();
}

export async function getAdminUserMeta(profileId: string): Promise<AdminUserMeta> {
  const map = await readRawMap();
  return map[profileId] || normalizeMeta(profileId);
}

export async function upsertAdminUserMeta(
  profileId: string,
  patch: Partial<AdminUserMeta>
): Promise<AdminUserMeta> {
  const map = await readRawMap();
  const current = map[profileId] || normalizeMeta(profileId);
  const next = normalizeMeta(profileId, {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  map[profileId] = next;
  await writeRawMap(map);
  return next;
}

export async function isProfileBlocked(profileId?: string | null): Promise<boolean> {
  if (!profileId) return false;
  const meta = await getAdminUserMeta(profileId);
  return meta.isBanned || meta.isDeleted;
}

export async function getBlockedProfileReason(profileId?: string | null): Promise<string | null> {
  if (!profileId) return null;
  const meta = await getAdminUserMeta(profileId);
  if (meta.isDeleted) return "This account is no longer available.";
  if (meta.isBanned) return meta.banReason || "This account has been restricted by admin.";
  return null;
}
