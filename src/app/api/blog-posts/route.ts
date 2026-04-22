import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

export async function GET() {
  const posts = await readPosts();
  const active = posts.filter((p) => p?.isActive !== false);
  return NextResponse.json(active);
}

