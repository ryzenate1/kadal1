import { NextRequest } from 'next/server';
import { GET as getTracking } from '@/app/api/orders/[orderId]/tracking/route';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ orderId: string }> }
) {
  return getTracking(req, ctx);
}
