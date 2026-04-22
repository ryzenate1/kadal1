import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'OTP login has been removed. Please use Clerk Email/Password or Google login.',
      code: 'OTP_AUTH_REMOVED',
    },
    { status: 410 }
  );
}
