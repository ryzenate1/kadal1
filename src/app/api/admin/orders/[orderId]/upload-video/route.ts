import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { withTransaction } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/adminGuard';

export const runtime = 'nodejs';

// POST /api/admin/orders/[orderId]/upload-video
// Admin uploads a processing media file (video/image) for an order.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const unauthorized = requireAdmin(req);
    if (unauthorized) return unauthorized;

    const { orderId } = await params;

    const formData = await req.formData();
    const media = (formData.get('video') || formData.get('image') || formData.get('media')) as File | null;

    if (!media) {
      return NextResponse.json({ error: 'No media file provided (video/image)' }, { status: 400 });
    }
    const isVideo = media.type.startsWith('video/');
    const isImage = media.type.startsWith('image/');
    if (!isVideo && !isImage) {
      return NextResponse.json({ error: 'File must be a video or image' }, { status: 400 });
    }
    if (isVideo && media.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Video must be under 50MB' }, { status: 400 });
    }
    if (isImage && media.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'order-videos');
    await mkdir(uploadsDir, { recursive: true });

    const ext = media.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const fileName = `${orderId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await media.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/order-videos/${fileName}`;

    const result = await withTransaction(async (client) => {
      const orderRes = await client.query(
        `SELECT id, order_number FROM orders WHERE (id::text = $1::text OR order_number = $1::text) LIMIT 1 FOR UPDATE`,
        [orderId]
      );
      const order = orderRes.rows?.[0];
      if (!order) return { notFound: true as const };

      await client.query(
        `UPDATE orders SET processing_video_url = $2::text, updated_at = NOW() WHERE id = $1::uuid`,
        [order.id, publicUrl]
      );

      return { orderId: order.id as string, orderNumber: order.order_number as string };
    });

    if ((result as any)?.notFound) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      videoUrl: publicUrl,
      orderNumber: (result as any).orderNumber,
    });
  } catch (error) {
    console.error('Upload video failed:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}
