import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import {
  applyAuthoritativePricing,
  CheckoutIntent,
  createCheckoutSessionToken,
  validateCheckoutIntent,
} from '@/lib/server/checkoutSecurity';
import { ensureSchema, db } from '@/lib/server/database';

export const runtime = 'nodejs';

type CreateOrderBody = CheckoutIntent & {
  currency?: string;
  receipt?: string;
};

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: NextRequest) {
  try {
    const client = getRazorpayClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Razorpay is not configured on server' },
        { status: 500 }
      );
    }

    const body = (await req.json()) as CreateOrderBody;
    const validation = validateCheckoutIntent(body);
    if (!validation.intent) {
      return NextResponse.json({ error: validation.error || 'Invalid checkout request' }, { status: 400 });
    }

    if (validation.intent.paymentMethod !== 'razorpay') {
      return NextResponse.json({ error: 'Online payment must use Razorpay' }, { status: 400 });
    }

    await ensureSchema();
    const authoritative = await applyAuthoritativePricing(db, validation.intent);
    if (!authoritative.intent) {
      return NextResponse.json({ error: authoritative.error || 'Unable to price checkout' }, { status: 400 });
    }

    const currency = (body.currency || 'INR').toUpperCase();
    const receipt = (body.receipt || `rcpt_${Date.now()}`).slice(0, 40);
    const amount = Math.max(100, Math.round(authoritative.intent.totalAmount * 100));

    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise' },
        { status: 400 }
      );
    }

    const order = await client.orders.create({
      amount,
      currency,
      receipt,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      receipt: order.receipt,
      checkoutToken: createCheckoutSessionToken({
        intent: authoritative.intent,
        amountPaise: Number(order.amount),
        currency: order.currency,
        razorpayOrderId: order.id,
      }),
    });
  } catch (error: any) {
    const statusCode = Number(error?.statusCode || error?.status || 500);
    if (statusCode === 401) {
      return NextResponse.json(
        { error: 'Razorpay authentication failed' },
        { status: 401 }
      );
    }

    console.error('Razorpay create order failed:', error);
    return NextResponse.json(
      { error: 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
