"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const defaultForm = {
  id: "",
  name: "",
  price: "",
  originalPrice: "",
  image: "",
  weight: "",
  description: "",
  slug: "",
  tag: "",
  imageFile: null as File | null,
};

export function FeaturedProductsManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ ...defaultForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products?featured=true");
      const data = await res.json();
      setProducts(data);
    } catch {
      toast({ title: "Error", description: "Could not load featured products.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: any) {
    const { name, value, files } = e.target;
    if (name === "image") setForm(f => ({ ...f, imageFile: files[0] }));
    else setForm(f => ({ ...f, [name]: value }));
  }

  async function handleImageUpload(file: File) {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = form.image;
    if (form.imageFile) imageUrl = await handleImageUpload(form.imageFile);
    const payload = {
      ...form,
      image: imageUrl,
      featured: true,
      imageFile: undefined,
    };
    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setForm({ ...defaultForm });
    setEditingId(null);
    fetchProducts();
    setLoading(false);
  }

  function handleEdit(product: any) {
    setForm({ ...product, imageFile: null });
    setEditingId(product.id);
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Featured Products Manager</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
            <Input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (URL)" required />
            <Input name="tag" value={form.tag} onChange={handleChange} placeholder="Tag (e.g. Premium)" />
            <Input name="weight" value={form.weight} onChange={handleChange} placeholder="Weight (e.g. 500g)" />
            <Input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" required />
            <Input name="originalPrice" value={form.originalPrice} onChange={handleChange} placeholder="Original Price" type="number" />
          </div>
          <div className="space-y-2">
            <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={4} />
            <Input name="image" type="file" accept="image/*" onChange={handleChange} />
            {form.image && !form.imageFile && <img src={form.image} alt="Preview" className="h-24 mt-2" />}
            {form.imageFile && <img src={URL.createObjectURL(form.imageFile)} alt="Preview" className="h-24 mt-2" />}
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>{editingId ? "Update" : "Add"} Product</Button>
          {editingId && <Button type="button" variant="outline" onClick={() => { setForm({ ...defaultForm }); setEditingId(null); }}>Cancel</Button>}
        </div>
      </form>
      <div>
        {loading ? <div>Loading...</div> : products.length === 0 ? <div>No featured products found.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <Card key={product.id} className="flex flex-col">
                <div className="relative h-48 w-full bg-gray-100">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                  {product.originalPrice > product.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {product.tag}
                  </div>
                </div>
                <CardContent className="flex-1 flex flex-col p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <div className="text-xs text-gray-500 mb-1">{product.weight}</div>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-grow">{product.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-blue-600">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>Delete</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}