'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Ticket,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  discount_value: number | null;
  discount_label: string | null;
  min_order: number;
  valid_until: string | null;
  usage_limit: number | null;
  is_active: boolean;
}

const emptyForm = {
  id: "",
  code: "",
  title: "",
  description: "",
  type: "percentage",
  discount_value: "",
  discount_label: "",
  min_order: "0",
  valid_until: "",
  usage_limit: "",
  is_active: true,
};

export default function AdminOffersPage() {
  const [adminKey, setAdminKey] = useState("");
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    const key = localStorage.getItem("kadal_admin_key") || "";
    setAdminKey(key);
    if (key) load(key);
  }, []);

  async function load(key = adminKey) {
    if (!key) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers", { headers: { "x-admin-key": key } });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!adminKey) return;
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const payload = {
        code: form.code,
        title: form.title,
        description: form.description,
        type: form.type,
        discount_value: form.discount_value ? Number(form.discount_value) : null,
        discount_label: form.discount_label || null,
        min_order: Number(form.min_order || 0),
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        is_active: form.is_active,
      };

      const res = await fetch(isEdit ? `/api/admin/offers/${form.id}` : "/api/admin/offers", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEdit ? "Offer updated" : "Offer created");
        setForm({ ...emptyForm });
        load();
      }
    } catch (error) {
      toast.error("Failed to save offer");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this offer?")) return;
    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      if (res.ok) {
        toast.success("Offer deleted");
        load();
      }
    } catch (error) {
      toast.error("Failed to delete offer");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offers & Coupons</h1>
          <p className="text-slate-500 mt-1">Manage promotional codes and special discounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <Input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Admin key"
          className="max-w-xs rounded-xl bg-slate-50 border-slate-100"
        />
        <Button
          className="rounded-xl bg-slate-900 hover:bg-slate-800"
          onClick={() => {
            localStorage.setItem("kadal_admin_key", adminKey);
            load();
          }}
        >
          Verify & Load
        </Button>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Coupon Code</label>
          <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="E.g. KADAL25" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
          <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="E.g. Grand Opening Offer" className="rounded-xl" />
        </div>
        <div className="space-y-1.5 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Offer Type</label>
          <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as any }))} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:ring-red-500 focus:border-red-500">
            <option value="percentage">Percentage Discount</option>
            <option value="flat">Flat Discount</option>
            <option value="bogo">BOGO (Buy 1 Get 1)</option>
            <option value="free_delivery">Free Delivery</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Discount Label</label>
          <Input value={form.discount_label} onChange={(e) => setForm((p) => ({ ...p, discount_label: e.target.value }))} placeholder="e.g. 25% OFF" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Discount Value</label>
          <Input value={form.discount_value} onChange={(e) => setForm((p) => ({ ...p, discount_value: e.target.value }))} placeholder="Value (e.g. 25)" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Min Order (₹)</label>
          <Input value={form.min_order} onChange={(e) => setForm((p) => ({ ...p, min_order: e.target.value }))} placeholder="Minimum Spend" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usage Limit</label>
          <Input value={form.usage_limit} onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))} placeholder="No. of uses" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
          <Input type="datetime-local" value={form.valid_until} onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))} className="rounded-xl" />
        </div>
        <div className="flex items-end pb-2">
          <label className="h-10 flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="w-5 h-5 rounded-lg accent-red-600" />
            Active Coupon
          </label>
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Public Description</label>
          <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Detailed offer information" className="rounded-xl" />
        </div>
        <div className="md:col-span-3 flex gap-3 pt-2">
          <Button onClick={submit} disabled={saving} className="rounded-xl bg-red-600 hover:bg-red-700 px-8 font-bold shadow-lg shadow-red-600/20">
            {form.id ? "Update Offer" : "Create Offer"}
          </Button>
          {form.id && (
            <Button variant="ghost" onClick={() => setForm({ ...emptyForm })} className="rounded-xl text-slate-500 font-semibold">Cancel Editing</Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Coupon Code</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Expires</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td className="px-6 py-10 text-center text-slate-400 italic" colSpan={6}>Syncing data...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-6 py-10 text-center text-slate-400 italic" colSpan={6}>No active offers found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold bg-slate-900 text-white px-2 py-1 rounded text-[10px] tracking-widest">{item.code}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                  <td className="px-6 py-4 text-slate-600 font-bold">{item.discount_label || `${item.discount_value}${item.type === 'percentage' ? '%' : ''}` || "-"}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{item.valid_until ? new Date(item.valid_until).toLocaleDateString() : "Unlimited"}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button size="sm" variant="ghost" onClick={() => {
                        setForm({
                          id: item.id,
                          code: item.code,
                          title: item.title,
                          description: item.description || "",
                          type: item.type,
                          discount_value: item.discount_value?.toString() || "",
                          discount_label: item.discount_label || "",
                          min_order: item.min_order?.toString() || "0",
                          valid_until: item.valid_until ? item.valid_until.slice(0, 16) : "",
                          usage_limit: item.usage_limit?.toString() || "",
                          is_active: item.is_active,
                        });
                      }} className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(item.id)} className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
