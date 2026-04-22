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

export async function GET(req: NextRequest) {
  // SECURITY: Previous check only tested Boolean(header) — any non-empty value passed.
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const posts = await readPosts();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = (await req.json()) as Partial<BlogPost>;
  if (!body.title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const now = new Date();
  const id = body.id?.trim() || `post-${now.getTime()}`;
  const slug =
    body.slug?.trim() ||
    body.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const post: BlogPost = {
    id,
    title: body.title.trim(),
    slug,
    excerpt: body.excerpt?.trim() || "",
    content: body.content?.trim() || "",
    category: body.category?.trim() || "General",
    author: body.author?.trim() || "Kadal Thunai",
    date: body.date?.trim() || now.toISOString().slice(0, 10),
    image: body.image?.trim() || "",
    isActive: typeof body.isActive === "boolean" ? body.isActive : true,
  };

  const posts = await readPosts();
  if (posts.some((p) => p.id === post.id || p.slug === post.slug)) {
    return NextResponse.json({ error: "Post with same id or slug already exists" }, { status: 409 });
  }

  posts.unshift(post);
  await writePosts(posts);
  return NextResponse.json(post, { status: 201 });
}
