"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ClaimedCoupon = {
  id: string;
  code: string;
  points_redeemed: number;
  discount_amount: number;
  expires_at: string;
  is_used: boolean;
  used_at?: string | null;
  created_at: string;
  profile_id: string;
  profile_name: string;
  profile_email?: string | null;
  profile_phone?: string | null;
  used_order_number?: string | null;
};

export default function AdminClaimedCouponsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [rows, setRows] = useState<ClaimedCoupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAdminKey(localStorage.getItem("kadal_admin_key") || "");
  }, []);

  const load = async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/claimed-coupons", {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load claimed coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) load();
  }, [adminKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Claimed Coupons</h1>
        <p className="text-sm text-gray-500">One-time coupons generated from loyalty points.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-2">
        <Input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Admin key"
          className="max-w-xs rounded-xl"
        />
        <Button
          onClick={() => {
            localStorage.setItem("kadal_admin_key", adminKey);
            load();
          }}
          className="rounded-xl bg-red-600 hover:bg-red-700"
        >
          Save & Load
        </Button>
        <Button variant="outline" onClick={load} className="rounded-xl">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100">
          <div className="col-span-2">Code</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-1">Points</div>
          <div className="col-span-1">Discount</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-2">Expires</div>
          <div className="col-span-2">Status</div>
        </div>
        {loading ? (
          <div className="px-4 py-8 text-sm text-gray-500">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-8 text-sm text-gray-500">No claimed coupons yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-12 gap-3 px-4 py-3 text-sm">
                <div className="col-span-2 font-mono font-semibold text-gray-900">{row.code}</div>
                <div className="col-span-2">
                  <p className="text-gray-900">{row.profile_name}</p>
                  <p className="text-xs text-gray-500">{row.profile_email || row.profile_phone || row.profile_id}</p>
                </div>
                <div className="col-span-1 text-gray-700">{row.points_redeemed}</div>
                <div className="col-span-1 text-gray-700">₹{Number(row.discount_amount).toFixed(0)}</div>
                <div className="col-span-2 text-gray-600">{new Date(row.created_at).toLocaleString("en-IN")}</div>
                <div className="col-span-2 text-gray-600">{new Date(row.expires_at).toLocaleString("en-IN")}</div>
                <div className="col-span-2">
                  {row.is_used ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      Used {row.used_order_number ? `(${row.used_order_number})` : ""}
                    </span>
                  ) : new Date(row.expires_at).getTime() < Date.now() ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">Expired</span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
