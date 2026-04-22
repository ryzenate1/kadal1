"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  image?: string;
  base_price?: number;
  price?: number;
};

type PremiumRow = {
  id: string;
  product_id: string;
  tag: string | null;
  discount_percent: number;
  default_weight: string;
  display_order: number;
  is_active: boolean;
  name: string;
  slug: string;
  image_url: string;
  base_price: number;
};

export default function AdminPremiumCollectionsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [rows, setRows] = useState<PremiumRow[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newDiscount, setNewDiscount] = useState("0");
  const [newWeight, setNewWeight] = useState("500g");
  const [newOrder, setNewOrder] = useState("0");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setAdminKey(localStorage.getItem("kadal_admin_key") || "");
  }, []);

  const load = async () => {
    if (!adminKey) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [premiumRes, productsRes, publicProductsRes] = await Promise.all([
        fetch("/api/admin/premium-collections", { headers: { "x-admin-key": adminKey }, cache: "no-store" }),
        fetch("/api/admin/products", { headers: { "x-admin-key": adminKey }, cache: "no-store" }),
        fetch("/api/catalog/products?limit=300", { cache: "no-store" }),
      ]);
      if (!premiumRes.ok) {
        if (premiumRes.status === 401) throw new Error("Invalid admin key for Premium Collections API.");
        throw new Error("Failed to load premium collections");
      }
      const premiumData = (await premiumRes.json()) as PremiumRow[];
      setRows(premiumData || []);

      // Prefer admin products. If unauthorized/empty, fall back to public catalog so add-form never stays blank.
      let productsData: ProductItem[] = [];
      if (productsRes.ok) {
        productsData = (await productsRes.json()) as ProductItem[];
      }
      if ((!productsData || productsData.length === 0) && publicProductsRes.ok) {
        const publicData = (await publicProductsRes.json()) as { products?: Array<{ id: string; name: string; slug: string; image: string; price: number }> };
        productsData = (publicData.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.image,
          price: p.price,
        }));
      }
      setProducts(productsData || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load data";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminKey) return;
    void load();
  }, [adminKey]);

  const availableProducts = useMemo(() => {
    const used = new Set(rows.map((r) => r.product_id));
    return products.filter((p) => !used.has(p.id));
  }, [products, rows]);

  const addItem = async () => {
    if (!adminKey) return toast.error("Admin key missing");
    if (!selectedProductId) return toast.error("Select a product");
    try {
      const res = await fetch("/api/admin/premium-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          productId: selectedProductId,
          tag: newTag || null,
          discountPercent: Number(newDiscount || 0),
          defaultWeight: newWeight || "500g",
          displayOrder: Number(newOrder || 0),
          isActive: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to add premium item");
      toast.success("Added to Premium Collections");
      setSelectedProductId("");
      setNewTag("");
      setNewDiscount("0");
      setNewWeight("500g");
      setNewOrder("0");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add premium item");
    }
  };

  const updateRow = async (id: string, patch: Partial<PremiumRow>) => {
    if (!adminKey) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/premium-collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          tag: patch.tag,
          discountPercent: patch.discount_percent,
          defaultWeight: patch.default_weight,
          displayOrder: patch.display_order,
          isActive: patch.is_active,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update premium item");
      toast.success("Updated");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update premium item");
    } finally {
      setSavingId(null);
    }
  };

  const deleteRow = async (id: string) => {
    if (!adminKey) return;
    if (!confirm("Remove this card from Premium Collections?")) return;
    try {
      const res = await fetch(`/api/admin/premium-collections/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to remove premium item");
      toast.success("Removed from Premium Collections");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove premium item");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Premium Collections</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the home page sliding premium fish cards with full CRUD.
        </p>
      </div>
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Add to Slider</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm"
          >
            <option value="">Select product</option>
            {availableProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Tag (e.g. Fresh)" className="rounded-xl" />
          <Input type="number" min={0} max={99} value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} placeholder="Discount %" className="rounded-xl" />
          <Input value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Default Weight (e.g. 500g)" className="rounded-xl" />
          <div className="flex gap-2">
            <Input type="number" min={0} value={newOrder} onChange={(e) => setNewOrder(e.target.value)} placeholder="Order" className="rounded-xl" />
            <Button onClick={addItem} className="rounded-xl bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-left">Card</th>
                <th className="px-4 py-3 text-left">Tag</th>
                <th className="px-4 py-3 text-left">Discount %</th>
                <th className="px-4 py-3 text-left">Default Weight</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6 text-gray-500" colSpan={7}>Loading premium collection items...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-4 py-6 text-gray-500" colSpan={7}>No premium collection items yet.</td></tr>
              ) : (
                rows.map((row) => (
                  <PremiumRowEditor
                    key={row.id}
                    row={row}
                    saving={savingId === row.id}
                    onSave={updateRow}
                    onDelete={deleteRow}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PremiumRowEditor({
  row,
  saving,
  onSave,
  onDelete,
}: {
  row: PremiumRow;
  saving: boolean;
  onSave: (id: string, patch: Partial<PremiumRow>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [tag, setTag] = useState(row.tag || "");
  const [discount, setDiscount] = useState(String(row.discount_percent || 0));
  const [weight, setWeight] = useState(row.default_weight || "500g");
  const [order, setOrder] = useState(String(row.display_order || 0));
  const [active, setActive] = useState(Boolean(row.is_active));

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={row.image_url || "/images/fish/vangaram.jpg"} alt={row.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
          <div>
            <p className="font-semibold text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">/{row.slug} • ₹{Number(row.base_price || 0).toFixed(0)}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><Input value={tag} onChange={(e) => setTag(e.target.value)} className="h-9 rounded-lg" /></td>
      <td className="px-4 py-3"><Input type="number" min={0} max={99} value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-9 rounded-lg w-24" /></td>
      <td className="px-4 py-3"><Input value={weight} onChange={(e) => setWeight(e.target.value)} className="h-9 rounded-lg w-28" /></td>
      <td className="px-4 py-3"><Input type="number" min={0} value={order} onChange={(e) => setOrder(e.target.value)} className="h-9 rounded-lg w-20" /></td>
      <td className="px-4 py-3">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active
        </label>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg"
            disabled={saving}
            onClick={() =>
              onSave(row.id, {
                tag,
                discount_percent: Number(discount || 0),
                default_weight: weight || "500g",
                display_order: Number(order || 0),
                is_active: active,
              })
            }
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <button
            onClick={() => onDelete(row.id)}
            className="h-9 w-9 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
            aria-label="Delete premium collection item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

