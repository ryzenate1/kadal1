import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';
import {
  applyAuthoritativePricing,
  CheckoutIntent,
  NormalizedCheckoutIntent,
  round2,
  validateCheckoutIntent,
  verifyCheckoutSessionToken,
  verifyVerifiedPaymentToken,
} from '@/lib/server/checkoutSecurity';
import { createAppToken } from '@/lib/server/appToken';

export const runtime = 'nodejs';

class OrderRejectionError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'OrderRejectionError';
    this.status = status;
  }
}

type OrderItemRow = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number | string;
  price: number | string;
  weight: string | null;
};

type CreateOrderBody = Partial<CheckoutIntent> & {
  checkoutToken?: string;
  verifiedPaymentToken?: string;
};

type PaymentContext = {
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'paid' | 'pending';
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paymentVerifiedAt: string | null;
};

function buildOrderResponse(orderRow: any, items: OrderItemRow[]) {
  return {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    trackingNumber: orderRow.tracking_number,
    status: orderRow.status,
    totalAmount: Number(orderRow.total_amount),
    paymentStatus: orderRow.payment_status,
    paymentMethod: orderRow.payment_method,
    estimatedDelivery: orderRow.estimated_delivery,
    pointsEarned: orderRow.points_earned,
    createdAt: orderRow.created_at,
    updatedAt: orderRow.updated_at,
    address: {
      name: orderRow.shipping_name,
      address: orderRow.shipping_address,
      city: orderRow.shipping_city,
      state: orderRow.shipping_state,
      pincode: orderRow.shipping_pincode,
    },
    items: items.map((it) => ({
      id: it.id,
      productId: it.product_id,
      productName: it.product_name,
      productImage: it.product_image,
      quantity: Number(it.quantity),
      price: Number(it.price),
      weight: it.weight,
    })),
  };
}

function resolveCheckoutIntent(body: CreateOrderBody): {
  intent?: NormalizedCheckoutIntent;
  payment?: PaymentContext;
  error?: string;
} {
  const checkoutToken = body.checkoutToken?.trim();
  const verifiedPaymentToken = body.verifiedPaymentToken?.trim();

  if (checkoutToken) {
    const checkoutSession = verifyCheckoutSessionToken(checkoutToken);
    if (!checkoutSession) {
      return { error: 'Checkout session expired. Please retry payment.' };
    }

    if (checkoutSession.intent.paymentMethod === 'razorpay') {
      if (!verifiedPaymentToken) {
        return { error: 'A verified payment is required before creating this order.' };
      }

      const verifiedPayment = verifyVerifiedPaymentToken(verifiedPaymentToken);
      if (!verifiedPayment) {
        return { error: 'Payment verification expired. Please retry payment.' };
      }

      if (
        verifiedPayment.razorpayOrderId !== checkoutSession.razorpayOrderId ||
        verifiedPayment.amountPaise !== checkoutSession.amountPaise ||
        verifiedPayment.currency !== checkoutSession.currency
      ) {
        return { error: 'Payment details do not match this checkout session.' };
      }

      return {
        intent: checkoutSession.intent,
        payment: {
          paymentMethod: 'razorpay',
          paymentStatus: 'paid',
          razorpayOrderId: verifiedPayment.razorpayOrderId,
          razorpayPaymentId: verifiedPayment.razorpayPaymentId,
          razorpaySignature: verifiedPayment.razorpaySignature,
          paymentVerifiedAt: new Date().toISOString(),
        },
      };
    }

    return {
      intent: checkoutSession.intent,
      payment: {
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        razorpayOrderId: null,
        razorpayPaymentId: null,
        razorpaySignature: null,
        paymentVerifiedAt: null,
      },
    };
  }

  const validation = validateCheckoutIntent(body as CheckoutIntent);
  if (!validation.intent) {
    return { error: validation.error };
  }

  if (validation.intent.paymentMethod === 'cod' && !validation.intent.shippingAddress.phone) {
    return { error: 'A phone number is required for guest checkout.' };
  }

  if (validation.intent.paymentMethod !== 'cod') {
    return { error: 'Online payments must be created through the secure checkout flow.' };
  }

  return {
    intent: validation.intent,
    payment: {
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySignature: null,
      paymentVerifiedAt: null,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderBody;
    const checkout = resolveCheckoutIntent(body);
    if (!checkout.intent || !checkout.payment) {
      return NextResponse.json({ error: checkout.error || 'Invalid order payload' }, { status: 400 });
    }

    const normalizedBody = checkout.intent;
    const payment = checkout.payment;
    const safeTotal = round2(normalizedBody.totalAmount);
    const reqUser = getRequestUser(req);

    const enrichedUser = {
      ...reqUser,
      name: reqUser.name || normalizedBody.shippingAddress.name || undefined,
      phoneNumber: reqUser.phoneNumber || normalizedBody.shippingAddress.phone || undefined,
    };

    const order = await withTransaction(async (client) => {
      let normalizedIntent = normalizedBody;
      if (!body.checkoutToken) {
        const authoritative = await applyAuthoritativePricing(client, normalizedIntent);
        if (!authoritative.intent) {
          throw new OrderRejectionError(authoritative.error || 'Unable to price checkout');
        }
        normalizedIntent = authoritative.intent;
      }

      const profile = await resolveProfile(client, enrichedUser);

      if (payment.razorpayPaymentId) {
        const paidDuplicate = await client.query(
          `SELECT *
           FROM orders
           WHERE razorpay_payment_id = $1
           LIMIT 1`,
          [payment.razorpayPaymentId]
        );

        if (paidDuplicate.rows[0]) {
          const existing = paidDuplicate.rows[0];
          const existingItems = await client.query(
            `SELECT id, product_id, product_name, product_image, quantity, price, weight
             FROM order_items
             WHERE order_id = $1
             ORDER BY created_at ASC`,
            [existing.id]
          );
          return buildOrderResponse(existing, existingItems.rows as OrderItemRow[]);
        }
      }

      const now = Date.now();
      const orderNumber = `KT${now}`;
      const trackingNumber = `TRK${String(now).slice(-8)}`;
      const estimatedDelivery = new Date(now + 45 * 60 * 1000).toISOString();
      const pricedTotal = round2(normalizedIntent.totalAmount);
      const pointsEarned = Math.floor((pricedTotal || 0) / 20);

      let claimedCouponDiscount = 0;
      let claimedCouponId: string | null = null;
      const claimedCouponCode = normalizedBody.claimedCouponCode?.trim().toUpperCase();
      if (claimedCouponCode) {
        const couponRow = await client.query(
          `SELECT id, discount_amount, expires_at, is_used
           FROM loyalty_claimed_coupons
           WHERE profile_id = $1 AND code = $2
           LIMIT 1
           FOR UPDATE`,
          [profile.id, claimedCouponCode]
        );
        const coupon = couponRow.rows[0];
        if (!coupon) {
          throw new OrderRejectionError('Invalid claimed coupon');
        }
        if (coupon.is_used) {
          throw new OrderRejectionError('Claimed coupon already used');
        }
        if (new Date(String(coupon.expires_at)).getTime() < Date.now()) {
          throw new OrderRejectionError('Claimed coupon expired');
        }
        claimedCouponDiscount = Math.min(Number(coupon.discount_amount || 0), pricedTotal);
        claimedCouponId = coupon.id as string;
      }

      const duplicateCheck = await client.query(
        `SELECT *
         FROM orders
         WHERE profile_id = $1
           AND status IN ('confirmed', 'pending')
           AND total_amount = $2
           AND payment_method = $3
           AND shipping_address = $4
           AND created_at > NOW() - INTERVAL '45 seconds'
         ORDER BY created_at DESC
         LIMIT 1`,
        [profile.id, pricedTotal, payment.paymentMethod, normalizedIntent.shippingAddress.address]
      );

      if (duplicateCheck.rows[0]) {
        const existing = duplicateCheck.rows[0];
        const existingItems = await client.query(
          `SELECT id, product_id, product_name, product_image, quantity, price, weight
           FROM order_items
           WHERE order_id = $1
           ORDER BY created_at ASC`,
          [existing.id]
        );
        return buildOrderResponse(existing, existingItems.rows as OrderItemRow[]);
      }

      const finalTotal = round2(Math.max(0, pricedTotal - claimedCouponDiscount));

      const insertedOrder = await client.query(
        `INSERT INTO orders (
          order_number, profile_id, status, total_amount, payment_status, payment_method,
          tracking_number, estimated_delivery, shipping_name, shipping_phone,
          shipping_address, shipping_city, shipping_state, shipping_pincode,
          delivery_slot, points_earned, razorpay_order_id, razorpay_payment_id,
          razorpay_signature, payment_verified_at
        )
        VALUES (
          $1, $2, 'confirmed', $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, $12, $13,
          $14, $15, $16, $17,
          $18, $19
        )
        RETURNING *`,
        [
          orderNumber,
          profile.id,
          finalTotal,
          payment.paymentStatus,
          payment.paymentMethod,
          trackingNumber,
          estimatedDelivery,
          normalizedIntent.shippingAddress.name || profile.name,
          normalizedIntent.shippingAddress.phone || profile.phone_number,
          normalizedIntent.shippingAddress.address,
          normalizedIntent.shippingAddress.city,
          normalizedIntent.shippingAddress.state,
          normalizedIntent.shippingAddress.pincode,
          normalizedIntent.deliverySlot || null,
          pointsEarned,
          payment.razorpayOrderId,
          payment.razorpayPaymentId,
          payment.razorpaySignature,
          payment.paymentVerifiedAt,
        ]
      );

      const orderRow = insertedOrder.rows[0];

      if (claimedCouponId) {
        await client.query(
          `UPDATE loyalty_claimed_coupons
           SET is_used = TRUE, used_at = NOW(), used_order_id = $2, updated_at = NOW()
           WHERE id = $1`,
          [claimedCouponId, orderRow.id]
        );
      }

      for (const item of normalizedIntent.items) {
        if (item.productId) {
          const inventoryResult = await client.query(
            `SELECT stock_quantity, allow_backorder
             FROM catalog_inventory
             WHERE product_id = $1
             LIMIT 1`,
            [item.productId]
          );

          const inventory = inventoryResult.rows[0];
          if (inventory) {
            const currentStock = Number(inventory.stock_quantity || 0);
            const allowBackorder = Boolean(inventory.allow_backorder);
            if (!allowBackorder && currentStock < item.quantity) {
              throw new OrderRejectionError(`Insufficient stock for ${item.name}`);
            }

            if (!allowBackorder) {
              await client.query(
                `UPDATE catalog_inventory
                 SET stock_quantity = stock_quantity - $2, updated_at = NOW()
                 WHERE product_id = $1`,
                [item.productId, item.quantity]
              );
            }
          }
        }

        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            orderRow.id,
            item.productId || null,
            item.name,
            item.image || '/images/fish/mackerel.jpg',
            item.quantity,
            item.price,
            item.weight || null,
          ]
        );
      }

      await client.query(
        `INSERT INTO order_events (order_id, status, description, location)
         VALUES ($1, 'confirmed', 'Order confirmed and sent to kitchen', 'Kadal Thunai Kitchen')`,
        [orderRow.id]
      );

      if (claimedCouponCode && claimedCouponDiscount > 0) {
        await client.query(
          `INSERT INTO order_events (order_id, status, description, location)
           VALUES ($1, 'confirmed', $2, 'Checkout')`,
          [orderRow.id, `Claimed coupon ${claimedCouponCode} applied. Discount: Rs ${claimedCouponDiscount.toFixed(0)}`]
        );
      }

      const items = await client.query(
        `SELECT id, product_id, product_name, product_image, quantity, price, weight
         FROM order_items
         WHERE order_id = $1
         ORDER BY created_at ASC`,
        [orderRow.id]
      );

      const response = buildOrderResponse(orderRow, items.rows as OrderItemRow[]);
      const shouldIssueGuestToken = !reqUser.id && !reqUser.accessToken;
      return shouldIssueGuestToken
        ? {
            ...response,
            sessionToken: createAppToken({
              profileId: profile.id as string,
              name: String(profile.name || normalizedIntent.shippingAddress.name || ''),
              email: typeof profile.email === 'string' ? profile.email : null,
              phoneNumber: typeof profile.phone_number === 'string' ? profile.phone_number : null,
              expiresInSec: 60 * 60 * 24 * 7,
            }),
          }
        : response;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof OrderRejectionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.name === 'ACCOUNT_BLOCKED') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Create order failed:', error);
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
  }
}
