import { NextResponse } from 'next/server';
import { getCatalogCategories } from '@/lib/catalogData';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(getCatalogCategories());
}
