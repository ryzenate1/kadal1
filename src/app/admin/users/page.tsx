"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Save, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminUserListItem = {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  orderCount: number;
  totalSpent: number;
  tags: string[];
  isBanned: boolean;
  isDeleted: boolean;
};

type AdminUserDetails = {
  id: string;
  authUserId?: string | null;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  tags: string[];
  isBanned: boolean;
  isDeleted: boolean;
  banReason?: string | null;
  notes?: string | null;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
};

function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("kadal_admin_key") || "";
}

export default function AdminUsersPage() {
  const [adminKey, setAdminKey] = useState("");
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned" | "deleted">("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [details, setDetails] = useState<AdminUserDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setAdminKey(getAdminKey());
  }, []);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const loadUsers = async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?q=${encodeURIComponent(query)}&status=${encodeURIComponent(statusFilter)}`,
        { headers: { "x-admin-key": adminKey }, cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to load users");
      const data = (await res.json()) as AdminUserListItem[];
      setUsers(data);
      if (data.length && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (id: string) => {
    if (!adminKey) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load user");
      const data = (await res.json()) as AdminUserDetails;
      setDetails(data);
      setTagInput(data.tags.join(", "));
    } catch {
      toast.error("Failed to load user details");
    }
  };

  useEffect(() => {
    if (adminKey) {
      loadUsers();
    }
  }, [adminKey, statusFilter]);

  useEffect(() => {
    if (selectedUserId) {
      loadDetails(selectedUserId);
    }
  }, [selectedUserId]);

  const saveAdminKey = () => {
    localStorage.setItem("kadal_admin_key", adminKey);
    toast.success("Admin key saved");
    loadUsers();
  };

  const saveUser = async () => {
    if (!details || !adminKey) return;
    setSaving(true);
    try {
      const tags = tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const res = await fetch(`/api/admin/users/${details.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          phoneNumber: details.phoneNumber,
          tags,
          isBanned: details.isBanned,
          isDeleted: details.isDeleted,
          banReason: details.banReason || null,
          notes: details.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast.success("User updated");
      await loadUsers();
      await loadDetails(details.id);
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const softDeleteUser = async () => {
    if (!details || !adminKey) return;
    if (!confirm(`Delete user ${details.name}?`)) return;
    const res = await fetch(`/api/admin/users/${details.id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    if (!res.ok) {
      toast.error("Failed to delete user");
      return;
    }
    toast.success("User marked deleted");
    await loadUsers();
    await loadDetails(details.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-sm text-gray-500">Manage customer profiles, tags, bans, and order visibility.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin key"
            className="max-w-xs rounded-xl border-gray-200"
          />
          <Button onClick={saveAdminKey} className="rounded-xl bg-red-600 hover:bg-red-700">
            <Save className="mr-2 h-4 w-4" />
            Save key
          </Button>
          <Button variant="outline" onClick={loadUsers} className="rounded-xl">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px,1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name/email/phone"
              className="rounded-xl border-gray-200"
            />
          </div>

          <div className="mb-4 flex gap-2">
            {(["all", "active", "banned", "deleted"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  statusFilter === status ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading users...</p>
          ) : (
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full rounded-2xl border p-3 text-left ${
                    selectedUserId === user.id
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-gray-100 bg-white hover:border-red-200"
                  }`}
                >
                  <p className="text-sm font-semibold">{user.name || "Unnamed user"}</p>
                  <p className={`text-xs ${selectedUserId === user.id ? "text-white/80" : "text-gray-500"}`}>
                    {user.email || user.phoneNumber || user.id}
                  </p>
                  <p className={`mt-1 text-xs ${selectedUserId === user.id ? "text-white/80" : "text-gray-500"}`}>
                    Orders: {user.orderCount} | Spent: Rs {user.totalSpent.toFixed(0)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          {!details ? (
            <p className="text-sm text-gray-500">Select a user to view details.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{details.name || "Customer"}</h2>
                  <p className="text-xs text-gray-500">{details.id}</p>
                </div>
                {selectedUser && (
                  <Link
                    href="/admin/orders"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Open order operations
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  value={details.name || ""}
                  onChange={(e) => setDetails((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  placeholder="Name"
                  className="rounded-xl border-gray-200"
                />
                <Input
                  value={details.phoneNumber || ""}
                  onChange={(e) => setDetails((prev) => (prev ? { ...prev, phoneNumber: e.target.value } : prev))}
                  placeholder="Phone number"
                  className="rounded-xl border-gray-200"
                />
                <Input
                  value={details.email || ""}
                  onChange={(e) => setDetails((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                  placeholder="Email"
                  className="rounded-xl border-gray-200 md:col-span-2"
                />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Tags (comma separated)"
                  className="rounded-xl border-gray-200 md:col-span-2"
                />
                <Input
                  value={details.banReason || ""}
                  onChange={(e) => setDetails((prev) => (prev ? { ...prev, banReason: e.target.value } : prev))}
                  placeholder="Ban reason"
                  className="rounded-xl border-gray-200 md:col-span-2"
                />
                <Input
                  value={details.notes || ""}
                  onChange={(e) => setDetails((prev) => (prev ? { ...prev, notes: e.target.value } : prev))}
                  placeholder="Admin notes"
                  className="rounded-xl border-gray-200 md:col-span-2"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={details.isBanned}
                    onChange={(e) =>
                      setDetails((prev) => (prev ? { ...prev, isBanned: e.target.checked } : prev))
                    }
                  />
                  Ban user
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={details.isDeleted}
                    onChange={(e) =>
                      setDetails((prev) => (prev ? { ...prev, isDeleted: e.target.checked } : prev))
                    }
                  />
                  Mark deleted
                </label>
                <Button onClick={saveUser} disabled={saving} className="rounded-xl bg-red-600 hover:bg-red-700">
                  Save changes
                </Button>
                <Button variant="outline" onClick={softDeleteUser} className="rounded-xl border-gray-200">
                  Delete user
                </Button>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-600">Customer orders</p>
                <div className="space-y-2">
                  {details.orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">#{order.orderNumber}</span>
                      <span className="text-gray-500">{order.status}</span>
                      <span className="font-semibold text-gray-900">Rs {order.totalAmount.toFixed(0)}</span>
                    </div>
                  ))}
                  {details.orders.length === 0 && (
                    <p className="text-sm text-gray-500">No orders found for this customer.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
