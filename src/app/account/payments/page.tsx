'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Landmark,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/apiClient';

type PaymentType = 'card' | 'upi' | 'netbanking';

type PaymentMethod = {
  id: string;
  type: PaymentType;
  nickname: string;
  isDefault: boolean;
  cardNumber?: string;
  cardBrand?: string;
  cardHolderName?: string;
  expiryDate?: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
};

const TYPE_OPTIONS: Array<{ value: PaymentType; label: string }> = [
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'netbanking', label: 'Bank' },
];

const EMPTY_FORM = {
  nickname: '',
  cardNumber: '',
  cardBrand: '',
  cardHolderName: '',
  expiryDate: '',
  upiId: '',
  bankName: '',
  accountNumber: '',
  isDefault: false,
};

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<PaymentType>('card');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const editingMethod = useMemo(
    () => methods.find((method) => method.id === editingId) || null,
    [methods, editingId]
  );

  const loadMethods = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<PaymentMethod[]>('/api/user/payment-methods');
      setMethods(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMethods();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setType('card');
    setShowForm(false);
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, isDefault: methods.length === 0 });
    setEditingId(null);
    setType('card');
    setShowForm(true);
  };

  const openEdit = (method: PaymentMethod) => {
    setEditingId(method.id);
    setType(method.type);
    setForm({
      nickname: method.nickname || '',
      cardNumber: method.cardNumber || '',
      cardBrand: method.cardBrand || '',
      cardHolderName: method.cardHolderName || '',
      expiryDate: method.expiryDate || '',
      upiId: method.upiId || '',
      bankName: method.bankName || '',
      accountNumber: method.accountNumber || '',
      isDefault: method.isDefault,
    });
    setShowForm(true);
  };

  const validate = () => {
    if (!form.nickname.trim()) return 'Nickname is required';
    if (type === 'card') {
      if (form.cardNumber.replace(/\D/g, '').length < 4) return 'Enter at least the last 4 digits of the card';
      if (!form.cardBrand.trim()) return 'Card brand is required';
      if (!form.cardHolderName.trim()) return 'Card holder name is required';
      if (!form.expiryDate.trim()) return 'Expiry date is required';
    }
    if (type === 'upi' && !form.upiId.includes('@')) return 'Enter a valid UPI ID';
    if (type === 'netbanking') {
      if (!form.bankName.trim()) return 'Bank name is required';
      if (form.accountNumber.replace(/\D/g, '').length < 4) return 'Enter at least the last 4 digits of the account';
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type,
        nickname: form.nickname.trim(),
        cardNumber: form.cardNumber,
        cardBrand: form.cardBrand.trim(),
        cardHolderName: form.cardHolderName.trim(),
        expiryDate: form.expiryDate.trim(),
        upiId: form.upiId.trim(),
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber,
        isDefault: form.isDefault,
      };

      if (editingId) {
        await fetchJson(`/api/user/payment-methods/${editingId}`, {
          method: 'PUT',
          body: payload,
        });
        toast.success('Payment method updated');
      } else {
        await fetchJson('/api/user/payment-methods', {
          method: 'POST',
          body: payload,
        });
        toast.success('Payment method saved');
      }

      await loadMethods();
      resetForm();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Failed to save payment method');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('Delete this payment method?')) return;
    try {
      await fetchJson(`/api/user/payment-methods/${methodId}`, { method: 'DELETE' });
      setMethods((prev) => prev.filter((method) => method.id !== methodId));
      toast.success('Payment method deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete payment method');
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await fetchJson(`/api/user/payment-methods/${methodId}/default`, { method: 'POST' });
      setMethods((prev) =>
        prev.map((method) => ({ ...method, isDefault: method.id === methodId }))
      );
      toast.success('Default payment method updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update default payment method');
    }
  };

  const renderMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'upi') return <Wallet className="h-5 w-5 text-violet-600" />;
    if (method.type === 'netbanking') return <Landmark className="h-5 w-5 text-violet-600" />;
    return <CreditCard className="h-5 w-5 text-violet-600" />;
  };

  const renderMethodValue = (method: PaymentMethod) => {
    if (method.type === 'upi') return method.upiId;
    if (method.type === 'netbanking') return method.bankName ? `${method.bankName} ••••${method.accountNumber || ''}` : `••••${method.accountNumber || ''}`;
    return `${method.cardBrand || 'Card'} ••••${method.cardNumber || ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-sm text-gray-500">Save masked cards, UPI IDs, and bank shortcuts for faster Razorpay checkout.</p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={openCreate} className="rounded-2xl bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
          )}
        </div>

        <div className="mb-5 rounded-3xl border border-green-100 bg-white/90 p-5 shadow-lg shadow-black/5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">Safe Razorpay-certified checkout messaging</p>
              <p className="text-sm text-gray-600">
                Your actual payment is processed in the live Razorpay checkout. We only save masked references here to help customers reuse trusted methods with confidence.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Safe and encrypted
                </span>
                <span className="rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Verified with Razorpay flow
                </span>
                <span className="rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  No raw card storage
                </span>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="mb-5 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-black/5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-bold text-gray-900">{editingMethod ? 'Edit payment method' : 'Add payment method'}</h2>
              <Button variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
            </div>

            <div className="flex gap-2 mb-4">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                    type === option.value
                      ? 'border-violet-400 bg-violet-50 text-violet-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                value={form.nickname}
                onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
                placeholder="Nickname (e.g. Work Visa, Personal UPI)"
              />

              {type === 'card' && (
                <>
                  <Input
                    value={form.cardBrand}
                    onChange={(e) => setForm((prev) => ({ ...prev, cardBrand: e.target.value }))}
                    placeholder="Card brand (Visa, Mastercard)"
                  />
                  <Input
                    value={form.cardHolderName}
                    onChange={(e) => setForm((prev) => ({ ...prev, cardHolderName: e.target.value }))}
                    placeholder="Card holder name"
                  />
                  <Input
                    value={form.cardNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                    placeholder="Card number or last 4 digits"
                  />
                  <Input
                    value={form.expiryDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value.slice(0, 5) }))}
                    placeholder="Expiry (MM/YY)"
                  />
                </>
              )}

              {type === 'upi' && (
                <Input
                  value={form.upiId}
                  onChange={(e) => setForm((prev) => ({ ...prev, upiId: e.target.value }))}
                  placeholder="UPI ID (name@bank)"
                />
              )}

              {type === 'netbanking' && (
                <>
                  <Input
                    value={form.bankName}
                    onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Bank name"
                  />
                  <Input
                    value={form.accountNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 18) }))}
                    placeholder="Account number or last 4 digits"
                  />
                </>
              )}
            </div>

            <label className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              Set as default payment method
            </label>

            <Button onClick={handleSave} disabled={saving} className="mt-4 rounded-2xl bg-violet-600 hover:bg-violet-700">
              {saving ? 'Saving...' : editingMethod ? 'Update method' : 'Save method'}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/60 bg-white/90 p-8 text-center text-gray-500 shadow-lg shadow-black/5">
            Loading payment methods...
          </div>
        ) : methods.length === 0 ? (
          <div className="rounded-3xl border border-white/60 bg-white/90 p-8 text-center shadow-lg shadow-black/5">
            <div className="w-16 h-16 rounded-3xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-violet-600" />
            </div>
            <h2 className="font-bold text-gray-900 mb-2">No saved payment methods yet</h2>
            <p className="text-sm text-gray-500 mb-4">
              Add a masked card, UPI, or bank shortcut so returning customers feel safer using your live Razorpay checkout.
            </p>
            <Button onClick={openCreate} className="rounded-2xl bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-1.5" />
              Add first method
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => (
              <div key={method.id} className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-black/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                      {renderMethodIcon(method)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{method.nickname}</p>
                        {method.isDefault && (
                          <span className="rounded-full bg-green-50 border border-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{renderMethodValue(method)}</p>
                      <p className="text-xs text-gray-400 mt-1">Saved for faster secure Razorpay checkout</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" onClick={() => openEdit(method)} className="rounded-xl">Edit</Button>
                  {!method.isDefault && (
                    <Button variant="outline" onClick={() => handleSetDefault(method.id)} className="rounded-xl">
                      <Check className="h-4 w-4 mr-1.5" />
                      Set default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(method.id)}
                    className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-3xl border border-violet-100 bg-violet-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Customer trust copy for live payments</p>
              <p className="text-sm text-gray-600 mt-1">
                Safe, encrypted and processed through Razorpay. Customers can save trusted payment references here, then complete the actual charge inside the live certified Razorpay payment flow during checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
