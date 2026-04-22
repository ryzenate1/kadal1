import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('profileImage');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:${file.type};base64,${base64}`;

    await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));
      await client.query(
        `UPDATE profiles SET profile_image = $2, updated_at = NOW() WHERE id = $1`,
        [profile.id, imageUrl]
      );
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Upload image failed:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
