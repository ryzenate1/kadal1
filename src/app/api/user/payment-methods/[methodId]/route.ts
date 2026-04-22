import { NextRequest, NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/database';
import { getRequestUser, resolveProfile } from '@/lib/server/requestUser';

export const runtime = 'nodejs';

type PaymentType = 'card' | 'upi' | 'netbanking';

type PaymentMethodRow = {
  id: string;
  type: PaymentType;
  nickname: string;
  provider: string | null;
  masked_value: string | null;
  card_holder_name: string | null;
  expiry_date: string | null;
  upi_id: string | null;
  bank_name: string | null;
  account_last4: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function last4(value?: string | null) {
  const digits = (value || '').replace(/\D/g, '');
  return digits ? digits.slice(-4) : '';
}

function mapPaymentMethod(row: PaymentMethodRow) {
  return {
    id: row.id,
    type: row.type,
    nickname: row.nickname,
    isDefault: !!row.is_default,
    cardNumber: row.masked_value || undefined,
    cardBrand: row.provider || undefined,
    cardHolderName: row.card_holder_name || undefined,
    expiryDate: row.expiry_date || undefined,
    upiId: row.upi_id || undefined,
    bankName: row.bank_name || undefined,
    accountNumber: row.account_last4 || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizePayload(body: Record<string, unknown>) {
  const type = String(body.type || 'card') as PaymentType;
  const nickname = String(body.nickname || '').trim();

  if (!nickname) {
    throw new Error('Nickname is required');
  }

  if (!['card', 'upi', 'netbanking'].includes(type)) {
    throw new Error('Unsupported payment method type');
  }

  if (type === 'card') {
    const cardNumber = String(body.cardNumber || '');
    const cardBrand = String(body.cardBrand || '').trim();
    const cardHolderName = String(body.cardHolderName || '').trim();
    const expiryDate = String(body.expiryDate || '').trim();

    if (last4(cardNumber).length !== 4 || !cardBrand || !cardHolderName || !expiryDate) {
      throw new Error('Valid card details are required');
    }

    return {
      type,
      nickname,
      provider: cardBrand,
      maskedValue: last4(cardNumber),
      cardHolderName,
      expiryDate,
      upiId: null,
      bankName: null,
      accountLast4: null,
      isDefault: Boolean(body.isDefault),
    };
  }

  if (type === 'upi') {
    const upiId = String(body.upiId || '').trim();
    if (!upiId.includes('@')) {
      throw new Error('Valid UPI ID is required');
    }

    return {
      type,
      nickname,
      provider: 'UPI',
      maskedValue: upiId,
      cardHolderName: null,
      expiryDate: null,
      upiId,
      bankName: null,
      accountLast4: null,
      isDefault: Boolean(body.isDefault),
    };
  }

  const bankName = String(body.bankName || '').trim();
  const accountNumber = String(body.accountNumber || '').trim();
  if (!bankName || !last4(accountNumber)) {
    throw new Error('Bank name and account number are required');
  }

  return {
    type,
    nickname,
    provider: bankName,
    maskedValue: last4(accountNumber),
    cardHolderName: null,
    expiryDate: null,
    upiId: null,
    bankName,
    accountLast4: last4(accountNumber),
    isDefault: Boolean(body.isDefault),
  };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ methodId: string }> }
) {
  try {
    const body = await req.json();
    const { methodId } = await params;
    const normalized = normalizePayload(body);

    const updated = await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const existing = await client.query(
        `SELECT id, is_default FROM payment_methods WHERE id = $1 AND profile_id = $2 LIMIT 1`,
        [methodId, profile.id]
      );

      if (!existing.rows[0]) {
        throw new Error('Payment method not found');
      }

      const isDefault = normalized.isDefault || Boolean(existing.rows[0].is_default);
      if (isDefault) {
        await client.query(`UPDATE payment_methods SET is_default = FALSE WHERE profile_id = $1`, [profile.id]);
      }

      const result = await client.query(
        `UPDATE payment_methods
         SET
          type = $3,
          nickname = $4,
          provider = $5,
          masked_value = $6,
          card_holder_name = $7,
          expiry_date = $8,
          upi_id = $9,
          bank_name = $10,
          account_last4 = $11,
          is_default = $12,
          updated_at = NOW()
         WHERE id = $1 AND profile_id = $2
         RETURNING id, type, nickname, provider, masked_value, card_holder_name, expiry_date, upi_id, bank_name, account_last4, is_default, created_at, updated_at`,
        [
          methodId,
          profile.id,
          normalized.type,
          normalized.nickname,
          normalized.provider,
          normalized.maskedValue,
          normalized.cardHolderName,
          normalized.expiryDate,
          normalized.upiId,
          normalized.bankName,
          normalized.accountLast4,
          isDefault,
        ]
      );

      return mapPaymentMethod(result.rows[0] as PaymentMethodRow);
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Payment methods PUT failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to update payment method';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ methodId: string }> }
) {
  try {
    const { methodId } = await params;

    await withTransaction(async (client) => {
      const profile = await resolveProfile(client, getRequestUser(req));

      const existing = await client.query(
        `SELECT id, is_default FROM payment_methods WHERE id = $1 AND profile_id = $2 LIMIT 1`,
        [methodId, profile.id]
      );

      if (!existing.rows[0]) {
        throw new Error('Payment method not found');
      }

      await client.query(`DELETE FROM payment_methods WHERE id = $1 AND profile_id = $2`, [methodId, profile.id]);

      if (existing.rows[0].is_default) {
        await client.query(
          `UPDATE payment_methods
           SET is_default = TRUE, updated_at = NOW()
           WHERE id = (
             SELECT id FROM payment_methods
             WHERE profile_id = $1
             ORDER BY updated_at DESC
             LIMIT 1
           )`,
          [profile.id]
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment methods DELETE failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete payment method';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
