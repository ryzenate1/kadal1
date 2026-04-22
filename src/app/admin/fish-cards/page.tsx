"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, Fish } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FishCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  type: string;
  description: string;
  image_url: string;
  base_price: number;
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;
  is_premium: boolean;
  catalog_inventory?: {
    stock_quantity: number;
    low_stock_threshold: number;
  };
};

type FishCardForm = {
  name: string;
  slug: string;
  category: string;
  type: string;
  description: string;
  image_url: string;
  base_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;
  is_premium: boolean;
};

const EMPTY_FORM: FishCardForm = {
  name: "",
  slug: "",
  category: "Fresh Fish",
  type: "Sea Fish",
  description: "",
  image_url: "",
  base_price: "",
  stock_quantity: "25",
  low_stock_threshold: "5",
  is_active: true,
  is_featured: false,
  is_popular: false,
  is_premium: false,
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminFishCardsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [cards, setCards] = useState<FishCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quickPriceSavingId, setQuickPriceSavingId] = useState<string | null>(null);
  const [quickPrices, setQuickPrices] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FishCardForm>(EMPTY_FORM);

  useEffect(() => {
    setAdminKey(localStorage.getItem("kadal_admin_key") || "");
  }, []);

  const loadCards = async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load fish cards");
      const data = (await res.json()) as FishCard[];
      setCards(data);
      setQuickPrices(
        Object.fromEntries(
          data.map((item) => [item.id, String(Number(item.base_price || 0))])
        )
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load fish cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminKey) return;
    void loadCards();
  }, [adminKey]);

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) =>
      [c.name, c.slug, c.category, c.type].some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [cards, query]);

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpenModal(true);
  };

  const startEdit = (card: FishCard) => {
    setEditingId(card.id);
    setForm({
      name: card.name,
      slug: card.slug,
      category: card.category,
      type: card.type,
      description: card.description || "",
      image_url: card.image_url || "",
      base_price: String(card.base_price ?? ""),
      stock_quantity: String(card.catalog_inventory?.stock_quantity ?? 25),
      low_stock_threshold: String(card.catalog_inventory?.low_stock_threshold ?? 5),
      is_active: Boolean(card.is_active),
      is_featured: Boolean(card.is_featured),
      is_popular: Boolean(card.is_popular),
      is_premium: Boolean(card.is_premium),
    });
    setOpenModal(true);
  };

  const onChange = <K extends keyof FishCardForm>(key: K, value: FishCardForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveCard = async () => {
    if (!adminKey) return toast.error("Admin key missing");
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.slug.trim()) return toast.error("Slug is required");
    if (!form.image_url.trim()) return toast.error("Image URL is required");
    if (!form.base_price.trim()) return toast.error("Price is required");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: toSlug(form.slug),
        category: form.category.trim() || "Fresh Fish",
        type: form.type.trim() || "Sea Fish",
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        base_price: Number(form.base_price),
        stock_quantity: Number(form.stock_quantity || 0),
        low_stock_threshold: Number(form.low_stock_threshold || 5),
        is_active: form.is_active,
        is_featured: form.is_featured,
        is_popular: form.is_popular,
        is_premium: form.is_premium,
      };

      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save fish card");

      toast.success(editingId ? "Fish card updated" : "Fish card added");
      setOpenModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadCards();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save fish card");
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = async (id: string) => {
    if (!adminKey) return toast.error("Admin key missing");
    if (!confirm("Delete this fish card?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete fish card");
      toast.success("Fish card removed");
      await loadCards();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete fish card");
    }
  };

  const saveQuickPrice = async (card: FishCard) => {
    if (!adminKey) return toast.error("Admin key missing");
    const next = Number(quickPrices[card.id]);
    if (!Number.isFinite(next) || next < 0) return toast.error("Enter a valid price");
    setQuickPriceSavingId(card.id);
    try {
      const res = await fetch(`/api/admin/products/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ base_price: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update price");
      toast.success(`Price updated for ${card.name}`);
      await loadCards();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update price");
    } finally {
      setQuickPriceSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fish Cards</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage category-style fish cards (add, rename, price/image update, delete).
          </p>
        </div>
        <Button onClick={startCreate} className="bg-red-600 hover:bg-red-700 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add New Card
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fish cards by name, slug, category..."
          className="rounded-xl"
        />
      </div>
      {!adminKey && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
          Admin key not found. Login again in Admin panel, then refresh this page.
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Categories-style Preview</h2>
          <span className="text-xs text-gray-500">{filteredCards.length} cards</span>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading fish cards...</p>
        ) : filteredCards.length === 0 ? (
          <p className="text-sm text-gray-500">No fish cards found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {filteredCards.slice(0, 20).map((card) => (
              <Link key={card.id} href={`/product/${card.slug}`} className="group block">
                <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                  <Image
                    src={card.image_url || "/images/fish/vangaram.jpg"}
                    alt={card.name}
                    fill
                    sizes="(max-width:768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-[11px] text-white font-semibold line-clamp-2">{card.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-left">Fish Card</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price (Quick Edit)</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        {card.image_url ? (
                          <Image src={card.image_url} alt={card.name} fill sizes="44px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Fish className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{card.name}</p>
                        <p className="text-xs text-gray-500">/{card.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{card.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={quickPrices[card.id] ?? String(Number(card.base_price || 0))}
                        onChange={(e) =>
                          setQuickPrices((prev) => ({
                            ...prev,
                            [card.id]: e.target.value,
                          }))
                        }
                        className="h-9 w-28 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-lg"
                        disabled={quickPriceSavingId === card.id}
                        onClick={() => saveQuickPrice(card)}
                      >
                        {quickPriceSavingId === card.id ? "..." : "Save"}
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{card.catalog_inventory?.stock_quantity ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                        card.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {card.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(card)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                        aria-label="Edit fish card"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete fish card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit Fish Card" : "Add Fish Card"}
              </h3>
              <button onClick={() => setOpenModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={form.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange("name", val);
                    if (!editingId) onChange("slug", toSlug(val));
                  }}
                  placeholder="Fish name"
                  className="rounded-xl"
                />
                <Input
                  value={form.slug}
                  onChange={(e) => onChange("slug", toSlug(e.target.value))}
                  placeholder="slug"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={form.category} onChange={(e) => onChange("category", e.target.value)} placeholder="Category" className="rounded-xl" />
                <Input value={form.type} onChange={(e) => onChange("type", e.target.value)} placeholder="Type" className="rounded-xl" />
              </div>

              <Input
                value={form.image_url}
                onChange={(e) => onChange("image_url", e.target.value)}
                placeholder="Image URL or /images path"
                className="rounded-xl"
              />

              <Input
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                placeholder="Short description"
                className="rounded-xl"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  type="number"
                  min={0}
                  value={form.base_price}
                  onChange={(e) => onChange("base_price", e.target.value)}
                  placeholder="Price"
                  className="rounded-xl"
                />
                <Input
                  type="number"
                  min={0}
                  value={form.stock_quantity}
                  onChange={(e) => onChange("stock_quantity", e.target.value)}
                  placeholder="Stock"
                  className="rounded-xl"
                />
                <Input
                  type="number"
                  min={0}
                  value={form.low_stock_threshold}
                  onChange={(e) => onChange("low_stock_threshold", e.target.value)}
                  placeholder="Low stock threshold"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ["is_active", "Active"],
                  ["is_featured", "Featured"],
                  ["is_popular", "Popular"],
                  ["is_premium", "Premium"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form[key as keyof FishCardForm])}
                      onChange={(e) => onChange(key as keyof FishCardForm, e.target.checked as never)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={saveCard} disabled={saving} className="rounded-xl bg-red-600 hover:bg-red-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Card"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

