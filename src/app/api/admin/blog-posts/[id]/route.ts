import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/server/adminGuard";

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

const BLOG_PATH = path.join(process.cwd(), "data", "blog-posts.json");

async function readPosts(): Promise<BlogPost[]> {
  try {
    const raw = await fs.readFile(BLOG_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as BlogPost[]) : [];
  } catch {
    return [];
  }
}

async function writePosts(posts: BlogPost[]) {
  await fs.mkdir(path.dirname(BLOG_PATH), { recursive: true });
  await fs.writeFile(BLOG_PATH, JSON.stringify(posts, null, 2) + "\n", "utf8");
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // SECURITY: Previous check only tested Boolean(header) — any non-empty value passed.
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const posts = await readPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const updates = (await req.json()) as Partial<BlogPost>;

  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const next: BlogPost = {
    ...posts[idx],
    ...updates,
    id,
    title: updates.title?.trim() ?? posts[idx].title,
    slug: updates.slug?.trim() ?? posts[idx].slug,
    excerpt: updates.excerpt?.trim() ?? posts[idx].excerpt,
    content: updates.content?.trim() ?? posts[idx].content,
    category: updates.category?.trim() ?? posts[idx].category,
    author: updates.author?.trim() ?? posts[idx].author,
    date: updates.date?.trim() ?? posts[idx].date,
    image: updates.image?.trim() ?? posts[idx].image,
    isActive: typeof updates.isActive === "boolean" ? updates.isActive : posts[idx].isActive,
  };

  if (posts.some((p) => p.id !== id && p.slug === next.slug)) {
    return NextResponse.json({ error: "slug already exists" }, { status: 409 });
  }

  posts[idx] = next;
  await writePosts(posts);
  return NextResponse.json(next);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const posts = await readPosts();
  const next = posts.filter((p) => p.id !== id);
  await writePosts(next);
  return NextResponse.json({ success: true });
}
