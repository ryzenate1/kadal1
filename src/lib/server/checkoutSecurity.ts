import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import type { PoolClient } from 'pg';

export type CheckoutIntentItem = {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  weight?: string;
};

export type CheckoutIntentPricing = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax?: number;
  total: number;
};

export type CheckoutIntentAddress = {
  name: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type CheckoutIntent = {
  items: CheckoutIntentItem[];
  totalAmount: number;
  pricing?: CheckoutIntentPricing;
  paymentMethod: string;
  shippingAddress: CheckoutIntentAddress;
  deliverySlot?: string;
  claimedCouponCode?: string;
};

export type NormalizedCheckoutIntent = {
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    weight?: string;
  }>;
  totalAmount: number;
  pricing?: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    tax: number;
    total: number;
  };
  paymentMethod: 'razorpay' | 'cod';
  shippingAddress: {
    name: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliverySlot?: string;
  claimedCouponCode?: string;
};

type CheckoutSessionPayload = {
  type: 'checkout_session';
  intent: NormalizedCheckoutIntent;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  nonce: string;
  exp: number;
};

type VerifiedPaymentPayload = {
  type: 'verified_payment';
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod: 'razorpay';
  exp: number;
};

function getCheckoutTokenSecret(): string {
  const secret =
    process.env.CHECKOUT_TOKEN_SECRET ||
    process.env.APP_TOKEN_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.RAZORPAY_KEY_SECRET;

  if (!secret || !secret.trim()) {
    if (process.env.NODE_ENV !== 'production') {
      return 'dev-only-checkout-secret-change-me';
    }
    throw new Error('CHECKOUT_TOKEN_SECRET is required in production');
  }

  return secret.trim();
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(unsignedToken: string) {
  return createHmac('sha256', getCheckoutTokenSecret()).update(unsignedToken).digest('base64url');
}

function createToken<T extends { type: string; exp: number }>(payload: T) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `kadalpay.${body}`;
  return `${unsignedToken}.${sign(unsignedToken)}`;
}

function verifyToken<T extends { type: string; exp: number }>(token: string, type: T['type']): T | null {
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'kadalpay') return null;

  const unsignedToken = `${parts[0]}.${parts[1]}`;
  const actual = Buffer.from(parts[2]);
  const expected = Buffer.from(sign(unsignedToken));

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as T;
    if (payload.type !== type || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

type CatalogPricingRow = {
  id: string;
  name: string;
  base_price: number | string;
  available_weights: Array<{ value?: string; label?: string; multiplier?: number }> | null;
  is_active: boolean;
};

export function validateCheckoutIntent(body: CheckoutIntent): { intent?: NormalizedCheckoutIntent; error?: string } {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { error: 'Order items are required' };
  }

  if (!body.shippingAddress?.address || !body.shippingAddress?.city || !body.shippingAddress?.state || !body.shippingAddress?.pincode) {
    return { error: 'Shipping address is incomplete' };
  }

  const paymentMethod = String(body.paymentMethod || '').trim().toLowerCase();
  if (paymentMethod !== 'razorpay' && paymentMethod !== 'cod') {
    return { error: 'Unsupported payment method' };
  }

  const items = body.items.map((item) => ({
    productId: item.productId?.trim() || undefined,
    name: String(item.name || '').trim(),
    quantity: Number(item.quantity),
    price: Number(item.price),
    image: item.image?.trim() || undefined,
    weight: item.weight?.trim() || undefined,
  }));

  for (const item of items) {
    if (!item.name) return { error: 'Each item must have a name' };
    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99) {
      return { error: 'Each item quantity must be between 1 and 99' };
    }
    if (!Number.isFinite(item.price) || item.price <= 0 || item.price > 100000) {
      return { error: 'Each item price must be valid' };
    }
  }

  const serverSubtotal = round2(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

  let safeTotal = round2(Number(body.totalAmount || 0));
  let pricing: NormalizedCheckoutIntent['pricing'];

  if (body.pricing) {
    const pricingSubtotal = round2(Number(body.pricing.subtotal || 0));
    const pricingDelivery = round2(Number(body.pricing.deliveryFee || 0));
    const pricingDiscount = round2(Number(body.pricing.discount || 0));
    const pricingTax = round2(Number(body.pricing.tax || 0));
    const pricingTotal = round2(Number(body.pricing.total || 0));

    if (Math.abs(pricingSubtotal - serverSubtotal) > 0.01) {
      return { error: 'Subtotal mismatch. Please refresh checkout.' };
    }

    const recomputed = round2(pricingSubtotal + pricingDelivery + pricingTax - pricingDiscount);
    if (Math.abs(recomputed - pricingTotal) > 1) {
      return { error: 'Order total mismatch. Please refresh checkout.' };
    }

    safeTotal = pricingTotal;
    pricing = { subtotal: pricingSubtotal, deliveryFee: pricingDelivery, discount: pricingDiscount, tax: pricingTax, total: pricingTotal };
  } else if (!Number.isFinite(safeTotal) || safeTotal <= 0) {
    safeTotal = serverSubtotal;
  }

  return {
    intent: {
      items,
      totalAmount: safeTotal,
      pricing,
      paymentMethod: paymentMethod as 'razorpay' | 'cod',
      shippingAddress: {
        name: String(body.shippingAddress.name || '').trim(),
        phone: body.shippingAddress.phone?.trim() || undefined,
        address: String(body.shippingAddress.address || '').trim(),
        city: String(body.shippingAddress.city || '').trim(),
        state: String(body.shippingAddress.state || '').trim(),
        pincode: String(body.shippingAddress.pincode || '').trim(),
      },
      deliverySlot: body.deliverySlot?.trim() || undefined,
      claimedCouponCode: body.claimedCouponCode?.trim().toUpperCase() || undefined,
    },
  };
}

function resolveWeightMultiplier(
  selectedWeight: string | undefined,
  availableWeights: CatalogPricingRow['available_weights']
) {
  if (!selectedWeight || !availableWeights?.length) return 1;
  const normalized = selectedWeight.trim().toLowerCase();
  const matched = availableWeights.find((entry) => {
    const value = String(entry?.value || '').trim().toLowerCase();
    const label = String(entry?.label || '').trim().toLowerCase();
    return normalized === value || normalized === label;
  });
  return matched?.multiplier && Number.isFinite(Number(matched.multiplier)) ? Number(matched.multiplier) : 1;
}

export async function applyAuthoritativePricing(
  client: Pick<PoolClient, 'query'>,
  intent: NormalizedCheckoutIntent
): Promise<{ intent?: NormalizedCheckoutIntent; error?: string }> {
  // Collect productIds that actually exist
  const productIds = Array.from(
    new Set(intent.items.map((item) => item.productId).filter(Boolean))
  ) as string[];

  // Build pricing map only for items that have productIds
  const pricingMap = new Map<string, CatalogPricingRow>();
  if (productIds.length > 0) {
    const pricingResult = await client.query(
      `SELECT id, name, base_price, available_weights, is_active
       FROM catalog_products
       WHERE id = ANY($1::text[])`,
      [productIds]
    );
    for (const row of pricingResult.rows as CatalogPricingRow[]) {
      pricingMap.set(row.id, row);
    }
  }

  const authoritativeItems = [];
  for (const item of intent.items) {
    if (item.productId) {
      // Has productId — validate against catalog
      const product = pricingMap.get(item.productId);
      if (!product || !product.is_active) {
        return { error: `${item.name} is no longer available. Please refresh checkout.` };
      }
      const multiplier = resolveWeightMultiplier(item.weight, product.available_weights);
      const authoritativePrice = round2(Number(product.base_price) * multiplier);
      if (!Number.isFinite(authoritativePrice) || authoritativePrice <= 0) {
        return { error: `Unable to price ${product.name}. Please refresh checkout.` };
      }
      authoritativeItems.push({ ...item, name: product.name || item.name, price: authoritativePrice });
    } else {
      // No productId — trust client price (COD path without catalog reference)
      authoritativeItems.push({ ...item });
    }
  }

  const subtotal = round2(authoritativeItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryFee = round2(Number(intent.pricing?.deliveryFee || 0));
  const discount = round2(Number(intent.pricing?.discount || 0));
  const tax = round2(Number(intent.pricing?.tax || 0));
  const total = round2(Math.max(0, subtotal + deliveryFee + tax - discount));

  return {
    intent: {
      ...intent,
      items: authoritativeItems,
      totalAmount: total,
      pricing: { subtotal, deliveryFee, discount, tax, total },
    },
  };
}

export function createCheckoutSessionToken(input: {
  intent: NormalizedCheckoutIntent;
  amountPaise: number;
  currency?: string;
  razorpayOrderId: string;
}) {
  return createToken<CheckoutSessionPayload>({
    type: 'checkout_session',
    intent: input.intent,
    amountPaise: input.amountPaise,
    currency: (input.currency || 'INR').toUpperCase(),
    razorpayOrderId: input.razorpayOrderId,
    nonce: randomUUID(),
    exp: Math.floor(Date.now() / 1000) + 20 * 60,
  });
}

export function verifyCheckoutSessionToken(token: string) {
  return verifyToken<CheckoutSessionPayload>(token, 'checkout_session');
}

export function createVerifiedPaymentToken(input: {
  amountPaise: number;
  currency?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return createToken<VerifiedPaymentPayload>({
    type: 'verified_payment',
    amountPaise: input.amountPaise,
    currency: (input.currency || 'INR').toUpperCase(),
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
    paymentMethod: 'razorpay',
    exp: Math.floor(Date.now() / 1000) + 20 * 60,
  });
}

export function verifyVerifiedPaymentToken(token: string) {
  return verifyToken<VerifiedPaymentPayload>(token, 'verified_payment');
}
