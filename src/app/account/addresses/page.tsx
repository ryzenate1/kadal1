"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin, Plus, Edit, Trash2, ArrowLeft, Check,
  X, Star, Home, Building, Briefcase, Loader2,
  AlertCircle, CheckCircle, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchJson } from "@/lib/apiClient";
import { notifyAddressBookUpdated, subscribeToAddressBookUpdates } from "@/lib/addressSync";

type AddressType = 'home' | 'work' | 'other';

interface Address {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: AddressType;
  isDefault: boolean;
}

interface PincodeInfo {
  valid: boolean;
  city?: string;
  state?: string;
  district?: string;
  error?: string;
}

const ADDRESS_TYPES = [
  { value: 'home' as AddressType, label: 'Home', icon: Home },
  { value: 'work' as AddressType, label: 'Work', icon: Briefcase },
  { value: 'other' as AddressType, label: 'Other', icon: Building },
];

async function validatePincode(pincode: string): Promise<PincodeInfo> {
  if (!/^\d{6}$/.test(pincode)) return { valid: false, error: 'Enter a valid 6-digit pincode' };
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      return { valid: true, city: po.District || po.Name, state: po.State, district: po.District };
    }
    return { valid: false, error: 'Pincode not found in our database' };
  } catch {
    return { valid: true }; // Allow if API unavailable
  }
}

function AddressForm({ initial, onSave, onCancel, isSaving }: {
  initial?: Partial<Address>;
  onSave: (data: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    phoneNumber: initial?.phoneNumber || '',
    address: initial?.address || '',
    city: initial?.city || '',
    state: initial?.state || '',
    pincode: initial?.pincode || '',
    type: initial?.type || 'home' as AddressType,
    isDefault: initial?.isDefault || false,
  });
  const [pincodeInfo, setPincodeInfo] = useState<PincodeInfo | null>(null);
  const [validatingPin, setValidatingPin] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: any) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const handlePincodeChange = useCallback(async (val: string) => {
    set('pincode', val);
    if (val.length === 6) {
      setValidatingPin(true);
      const info = await validatePincode(val);
      setPincodeInfo(info);
      if (info.valid && info.city && !form.city) {
        set('city', info.city);
      }
      if (info.valid && info.state && !form.state) {
        set('state', info.state);
      }
      setValidatingPin(false);
    } else {
      setPincodeInfo(null);
    }
  }, [form.city, form.state]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Address label is required';
    if (!form.address.trim() || form.address.trim().length < 5) errs.address = 'Enter a complete street address';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) errs.pincode = 'Valid 6-digit pincode required';
    if (pincodeInfo && !pincodeInfo.valid) errs.pincode = pincodeInfo.error || 'Invalid pincode';
    if (form.phoneNumber && !/^\d{10}$/.test(form.phoneNumber.replace(/\D/g, ''))) errs.phoneNumber = 'Enter valid 10-digit phone';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-black/5 p-5 mb-5">
      <h2 className="font-bold text-gray-900 mb-4">{initial?.id ? 'Edit Address' : 'Add New Address'}</h2>

      {/* Type selector */}
      <div className="flex gap-2 mb-4">
        {ADDRESS_TYPES.map(({ value, label, icon: Icon }) => (
          <button key={value} onClick={() => set('type', value)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border transition-all ${form.type === value ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}>
            <Icon className="h-4 w-4" />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address Label *</label>
          <Input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g., Home, Office, Parents' House"
            className={`mt-1.5 rounded-xl ${errors.name ? 'border-red-400' : ''}`} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone (optional)</label>
          <Input value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit phone number"
            className={`mt-1.5 rounded-xl ${errors.phoneNumber ? 'border-red-400' : ''}`} />
          {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
        </div>

        {/* Street address */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Street Address *</label>
          <Input value={form.address} onChange={e => set('address', e.target.value)}
            placeholder="Flat/House no., Street, Area"
            className={`mt-1.5 rounded-xl ${errors.address ? 'border-red-400' : ''}`} />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>

        {/* Pincode row */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pincode *</label>
          <div className="relative mt-1.5">
            <Input value={form.pincode} onChange={e => handlePincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit pincode"
              maxLength={6}
              className={`rounded-xl pr-10 ${errors.pincode ? 'border-red-400' : pincodeInfo?.valid ? 'border-green-400' : ''}`} />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validatingPin && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              {!validatingPin && pincodeInfo?.valid && <CheckCircle className="h-4 w-4 text-green-500" />}
              {!validatingPin && pincodeInfo && !pincodeInfo.valid && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
          {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
          {pincodeInfo?.valid && pincodeInfo.city && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />{pincodeInfo.city}, {pincodeInfo.state}
            </p>
          )}
          {pincodeInfo && !pincodeInfo.valid && (
            <p className="text-xs text-red-500 mt-1">{pincodeInfo.error}</p>
          )}
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">City *</label>
            <Input value={form.city} onChange={e => set('city', e.target.value)}
              placeholder="City"
              className={`mt-1.5 rounded-xl ${errors.city ? 'border-red-400' : ''}`} />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">State *</label>
            <Input value={form.state} onChange={e => set('state', e.target.value)}
              placeholder="State"
              className={`mt-1.5 rounded-xl ${errors.state ? 'border-red-400' : ''}`} />
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
          </div>
        </div>

        {/* Default */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4" />
          <span className="text-sm text-gray-600">Set as default delivery address</span>
        </label>
      </div>

      <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
        <Button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-11">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1.5" />{initial?.id ? 'Update' : 'Save'} Address</>}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving} className="rounded-xl h-11 px-4">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login?redirect=/account/addresses');
  }, [loading, isAuthenticated, router]);

  const fetchAddresses = async () => {
    setPageLoading(true);
    try {
      const data = await fetchJson<Address[]>('/api/user/addresses');
      setAddresses(data);
    } catch { toast.error('Failed to load addresses'); }
    finally { setPageLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    void fetchAddresses();

    return subscribeToAddressBookUpdates(() => {
      void fetchAddresses();
    });
  }, [isAuthenticated, user?.id]);

  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      if (editTarget) {
        const updated = await fetchJson<Address>(`/api/user/addresses/${editTarget.id}`, {
          method: 'PATCH',
          body: data,
        });
        setAddresses((prev) =>
          prev.map((address) => (address.id === editTarget.id ? updated : address))
        );
        toast.success('Address updated!');
      } else {
        const created = await fetchJson<Address>('/api/user/addresses', {
          method: 'POST',
          body: data,
        });
        setAddresses((prev) => {
          const next = [created, ...prev.filter((address) => address.id !== created.id)];
          return next.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
        });
        toast.success('Address saved!');
      }
      notifyAddressBookUpdated();
      setShowForm(false);
      setEditTarget(null);
    } catch { toast.error('Failed to save address'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await fetchJson(`/api/user/addresses/${id}`, { method: 'DELETE' });
      toast.success('Address deleted');
      setAddresses(prev => prev.filter(a => a.id !== id));
      notifyAddressBookUpdated();
    } catch { toast.error('Failed to delete address'); }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetchJson(`/api/user/addresses/${id}/default`, {
        method: 'PATCH',
      });
      toast.success('Default address updated');
      notifyAddressBookUpdated();
      await fetchAddresses();
    } catch { toast.error('Failed to set default'); }
  };

  if (loading || pageLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-emerald-50/30">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
              <p className="text-sm text-gray-400">{addresses.length} saved location{addresses.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="bg-red-600 hover:bg-red-700 rounded-2xl h-9">
              <Plus className="h-4 w-4 mr-1.5" />Add
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <AddressForm
            initial={editTarget || undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
            isSaving={isSaving}
          />
        )}

        {/* Address list */}
        {addresses.length === 0 && !showForm ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-10 text-center shadow-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No addresses yet</h3>
            <p className="text-sm text-gray-400 mb-4">Add your first delivery address</p>
            <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 rounded-2xl">
              Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => {
              const TypeIcon = ADDRESS_TYPES.find(t => t.value === addr.type)?.icon || Home;
              return (
                <div key={addr.id} className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-black/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 text-sm">{addr.name}</p>
                        {addr.isDefault && (
                          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="h-2.5 w-2.5" />Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{addr.address}</p>
                      <p className="text-xs text-gray-500">{addr.city}, {addr.state} – {addr.pincode}</p>
                      {addr.phoneNumber && <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phoneNumber}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <Button variant="outline" size="sm" onClick={() => { setEditTarget(addr); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="rounded-xl text-xs h-8 gap-1">
                      <Edit className="h-3 w-3" />Edit
                    </Button>
                    {!addr.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr.id)}
                        className="rounded-xl text-xs h-8 gap-1">
                        <Star className="h-3 w-3" />Set Default
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(addr.id)}
                      className="rounded-xl text-xs h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50 ml-auto">
                      <Trash2 className="h-3 w-3" />Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
