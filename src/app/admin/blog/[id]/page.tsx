"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

export default function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { id } = await params;
        const key = getAdminKey();
        const res = await fetch(`/api/admin/blog-posts/${id}`, {
          headers: key ? { "x-admin-key": key } : {},
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");
        setPost(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params]);

  const update = (patch: Partial<BlogPost>) => setPost((p) => (p ? { ...p, ...patch } : p));

  const save = async () => {
    if (!post) return;
    setSaving(true);
    try {
      const key = getAdminKey();
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "x-admin-key": key } : {}),
        },
        body: JSON.stringify(post),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setPost(data);
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  if (!post) return <div className="p-6 text-sm text-gray-500">Not found</div>;

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit blog post</h1>
          <p className="text-sm text-gray-500">Update content and publish when ready.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog">
            <Button variant="outline">Back</Button>
          </Link>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-500">Title</div>
            <Input value={post.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-500">Slug</div>
            <Input value={post.slug} onChange={(e) => update({ slug: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-500">Category</div>
            <Input value={post.category} onChange={(e) => update({ category: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-500">Author</div>
            <Input value={post.author} onChange={(e) => update({ author: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-500">Date (YYYY-MM-DD)</div>
            <Input value={post.date} onChange={(e) => update({ date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-gray-500">Image URL</div>
            <Input value={post.image || ""} onChange={(e) => update({ image: e.target.value })} />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-medium text-gray-500">Excerpt</div>
          <Textarea value={post.excerpt} onChange={(e) => update({ excerpt: e.target.value })} rows={3} />
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-medium text-gray-500">Content (HTML)</div>
          <Textarea value={post.content} onChange={(e) => update({ content: e.target.value })} rows={10} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <div className="text-sm font-semibold text-gray-900">Published</div>
            <div className="text-xs text-gray-500">Toggle to show this post on the website.</div>
          </div>
          <button
            type="button"
            onClick={() => update({ isActive: !post.isActive })}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              post.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            {post.isActive ? "Published" : "Draft"}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <div className="text-sm font-semibold text-gray-900">Preview</div>
            <div className="text-xs text-gray-500">Open the public blog post page.</div>
          </div>
          <Button variant="outline" onClick={() => router.push(`/blog/${post.slug}`)}>
            Open
          </Button>
        </div>
      </div>
    </div>
  );
}

