"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image?: string;
  isActive?: boolean;
};

function getAdminKey(): string | null {
  try {
    return localStorage.getItem("kadal_admin_key");
  } catch {
    return null;
  }
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => (p.title || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q));
  }, [posts, query]);

  const load = async () => {
    setLoading(true);
    try {
      const key = getAdminKey();
      const res = await fetch("/api/admin/blog-posts", {
        headers: key ? { "x-admin-key": key } : {},
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load posts");
      const data = (await res.json()) as BlogPost[];
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createDraft = async () => {
    setSaving(true);
    try {
      const key = getAdminKey();
      const res = await fetch("/api/admin/blog-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "x-admin-key": key } : {}),
        },
        body: JSON.stringify({
          title: "New post",
          excerpt: "",
          content: "",
          category: "General",
          author: "Kadal Thunai",
          isActive: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create");
      toast.success("Post created");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (post: BlogPost) => {
    try {
      const key = getAdminKey();
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "x-admin-key": key } : {}),
        },
        body: JSON.stringify({ isActive: !post.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update");
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data : p)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const remove = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      const key = getAdminKey();
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, {
        method: "DELETE",
        headers: key ? { "x-admin-key": key } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete");
      toast.success("Deleted");
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blog posts</h1>
          <p className="text-sm text-gray-500">Create, publish, and manage posts shown on the website.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={createDraft} disabled={saving}>
            New post
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Search by title or slug..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="grid grid-cols-12 gap-3 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">No posts</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-4">
                <div className="col-span-5">
                  <div className="font-semibold text-gray-900">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.slug}</div>
                </div>
                <div className="col-span-3 text-sm text-gray-700">{p.category}</div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(p)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.isActive ? "Published" : "Draft"}
                  </button>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Link href={`/admin/blog/${p.id}`} className="text-sm font-medium text-red-600 hover:underline">
                    Edit
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => remove(p)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

