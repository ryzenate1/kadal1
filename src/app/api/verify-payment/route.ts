import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import {
  createVerifiedPaymentToken,
  verifyCheckoutSessionToken,
} from '@/lib/server/checkoutSecurity';

export const runtime = 'nodejs';

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

type VerifyPaymentBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  checkoutToken?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VerifyPaymentBody;
    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();
    const checkoutToken = body.checkoutToken?.trim();

    if (!orderId || !paymentId || !signature || !checkoutToken) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    const checkoutSession = verifyCheckoutSessionToken(checkoutToken);
    if (!checkoutSession || checkoutSession.razorpayOrderId !== orderId) {
      return NextResponse.json(
        { error: 'Invalid checkout session' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Razorpay secret is not configured on server' },
        { status: 500 }
      );
    }

    const payload = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac('sha256', keySecret).update(payload).digest('hex');

    const isMatch =
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    const client = getRazorpayClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Razorpay is not configured on server' },
        { status: 500 }
      );
    }

    const [payment, order] = await Promise.all([
      client.payments.fetch(paymentId),
      client.orders.fetch(orderId),
    ]);

    if (payment.order_id !== orderId) {
      return NextResponse.json({ error: 'Payment does not belong to this order' }, { status: 400 });
    }
    if (String(payment.currency).toUpperCase() !== checkoutSession.currency) {
      return NextResponse.json({ error: 'Payment currency mismatch' }, { status: 400 });
    }
    if (Number(payment.amount) !== checkoutSession.amountPaise) {
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
    }
    if (!payment.captured && String(payment.status).toLowerCase() !== 'captured') {
      return NextResponse.json({ error: 'Payment is not captured yet' }, { status: 400 });
    }
    if (String(order.status).toLowerCase() !== 'paid' || Number(order.amount_paid) < checkoutSession.amountPaise) {
      return NextResponse.json({ error: 'Razorpay order is not fully paid' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      verifiedPaymentToken: createVerifiedPaymentToken({
        amountPaise: checkoutSession.amountPaise,
        currency: checkoutSession.currency,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      }),
    });
  } catch (error) {
    console.error('Razorpay verify payment failed:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
