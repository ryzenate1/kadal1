"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  User, HelpCircle, LogOut, ChevronRight, Award,
  Phone, Mail, Package, CreditCard, Home, Edit,
  Bell, Settings, Star, Gift, Camera, Check, X, Download,
  AlertCircle, Copy, Share2, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchJson } from "@/lib/apiClient";

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-black/5 ${className}`}>
    {children}
  </div>
);

const StatChip = ({ value, label, accent, onClick }: { value: string | number; label: string; accent: string; onClick?: () => void }) => (
  <button onClick={onClick} className={`flex-1 ${accent} rounded-2xl p-3 text-center hover:opacity-90 transition-opacity`}>
    <p className="text-lg font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </button>
);

const MenuRow = ({ icon: Icon, label, desc, href, accent = 'bg-red-100 text-red-600', onClick }: {
  icon: any; label: string; desc: string; href?: string; accent?: string; onClick?: () => void;
}) => {
  const router = useRouter();
  const handle = () => onClick ? onClick() : href && router.push(href);
  return (
    <button onClick={handle}
      className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-black/[0.03] transition-colors group text-left">
      <div className={`p-2.5 rounded-xl ${accent} flex-shrink-0`}>
        <Icon className="h-[1.1rem] w-[1.1rem]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-400 truncate">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </button>
  );
};

// Detect OTP-auto-generated name
function isPlaceholderName(name: string) {
  return !name || name.startsWith('KadalUser_') || name === 'Kadal Thunai' || name.toLowerCase().includes('kadalthunai');
}
function isPlaceholderEmail(email: string) {
  return !email || email.includes('@kadalthunai') || email.endsWith('@placeholder.com');
}

const menuGroups = [
  {
    title: 'Orders & Payments',
    items: [
      { icon: Package, label: 'My Orders', desc: 'View history & track deliveries', href: '/account/orders', accent: 'bg-blue-100 text-blue-600' },
      { icon: CreditCard, label: 'Payment Methods', desc: 'Saved cards & UPI', href: '/account/payments', accent: 'bg-violet-100 text-violet-600' },
    ]
  },
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Personal Info', desc: 'Name, email, phone', href: '/account/profile', accent: 'bg-orange-100 text-orange-600' },
      { icon: Home, label: 'Addresses', desc: 'Saved delivery locations', href: '/account/addresses', accent: 'bg-green-100 text-green-600' },
      { icon: Award, label: 'Loyalty Points', desc: 'Rewards & redemption', href: '/account/loyalty', accent: 'bg-yellow-100 text-yellow-600' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', desc: 'Manage alerts', href: '/account/notifications', accent: 'bg-pink-100 text-pink-600' },
      { icon: Settings, label: 'App Settings', desc: 'Customize your experience', href: '/account/settings', accent: 'bg-slate-100 text-slate-600' },
      { icon: HelpCircle, label: 'Help & Support', desc: 'Get help with orders', href: '/account/help', accent: 'bg-cyan-100 text-cyan-600' },
    ]
  },
];

type AccountProfileResponse = {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  profileImage?: string | null;
  memberSince?: string;
  loyaltyPoints?: number;
  totalOrders?: number;
  savedAmount?: number;
};

function normalizeProfileResponse(data?: AccountProfileResponse | null) {
  return {
    id: data?.id || '',
    name: data?.name || '',
    email: data?.email || '',
    phoneNumber: data?.phoneNumber || '',
    profileImage: data?.profileImage || null,
    memberSince: data?.memberSince,
    loyaltyPoints: typeof data?.loyaltyPoints === 'number' ? data.loyaltyPoints : undefined,
    totalOrders: typeof data?.totalOrders === 'number' ? data.totalOrders : undefined,
    savedAmount: typeof data?.savedAmount === 'number' ? data.savedAmount : undefined,
  };
}

function ReferralSheet({ referralCode, onClose }: { referralCode: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Gift className="h-7 w-7" />
          </div>
          <h2 className="font-black text-xl">Refer & Earn</h2>
          <p className="text-pink-100 text-sm mt-1">Share the love, earn rewards together</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Your Referral Code</p>
            <p className="font-mono font-black text-2xl text-gray-900 tracking-widest">{referralCode}</p>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p>Share your code with friends & family</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p>They get <strong>₹50 off</strong> on their first order</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p>You earn <strong>100 loyalty points</strong> when they order!</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={copy} className="flex-1 bg-pink-600 hover:bg-pink-700 rounded-2xl h-11">
              {copied ? <><Check className="h-4 w-4 mr-1.5" />Copied!</> : <><Copy className="h-4 w-4 mr-1.5" />Copy Code</>}
            </Button>
            <Button variant="outline" onClick={onClose} className="rounded-2xl h-11 px-4">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, loading, logout, updateUserProfile } = useAuth();

  const [user, setUser] = useState({
    id: '', name: '', phoneNumber: '', email: '',
    profileImage: null as string | null,
    memberSince: 'January 2024',
    loyaltyPoints: 0, totalOrders: 0, savedAmount: 0,
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  const referralCode = `KADAL${(user.id || 'XXXX').slice(-4).toUpperCase()}`;

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login?redirect=/account');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (authUser) {
      setUser(prev => ({
        ...prev,
        id: authUser.id || '',
        name: authUser.name || '',
        email: authUser.email || '',
        phoneNumber: authUser.phoneNumber || '',
        profileImage: authUser.profileImage || null,
        loyaltyPoints: authUser.loyaltyPoints || 0,
        totalOrders: 0,
        savedAmount: 0,
      }));

      if (!nudgeDismissed && (isPlaceholderName(authUser.name || '') || isPlaceholderEmail(authUser.email || ''))) {
        setShowNudge(true);
      }

      if (isAuthenticated) {
        fetchJson<AccountProfileResponse>('/api/user/profile').then(data => {
          if (data) {
            const normalized = normalizeProfileResponse(data);
            setUser(prev => ({
              ...prev,
              ...normalized,
              memberSince: normalized.memberSince || prev.memberSince,
              loyaltyPoints: typeof normalized.loyaltyPoints === 'number' ? normalized.loyaltyPoints : prev.loyaltyPoints,
              totalOrders: typeof normalized.totalOrders === 'number' ? normalized.totalOrders : prev.totalOrders,
              savedAmount: typeof normalized.savedAmount === 'number' ? normalized.savedAmount : prev.savedAmount,
            }));
            if (!nudgeDismissed && (isPlaceholderName(normalized.name) || isPlaceholderEmail(normalized.email))) {
              setShowNudge(true);
            }
          }
        }).catch(() => {});
      }
    }
  }, [authUser, isAuthenticated]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      const result = await fetchJson<{ imageUrl: string }>('/api/user/upload-image', {
        method: 'POST',
        body: formData,
      });
      setUser(prev => ({ ...prev, profileImage: result.imageUrl }));
      if (updateUserProfile) await updateUserProfile({ profileImage: result.imageUrl });
      toast.success('Profile photo updated!');
    } catch { toast.error('Failed to upload photo'); }
    finally { setIsUpdating(false); e.target.value = ''; }
  };

  const handleSaveField = async () => {
    if (!editingField || !tempValue.trim()) return;
    setIsUpdating(true);
    try {
      const nextValue = editingField === 'phoneNumber'
        ? tempValue.replace(/\D/g, '').slice(0, 10)
        : tempValue.trim();
      if (!nextValue) throw new Error('Value cannot be empty');
      if (editingField === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextValue)) {
        throw new Error('Enter a valid email address');
      }
      if (editingField === 'phoneNumber' && !/^\d{10}$/.test(nextValue)) {
        throw new Error('Enter a valid 10-digit phone number');
      }

      const payload = { name: user.name, email: user.email, phoneNumber: user.phoneNumber, [editingField]: nextValue };
      const updated = await fetchJson<AccountProfileResponse>('/api/user/profile', {
        method: 'PATCH',
        body: payload,
      });
      const normalized = normalizeProfileResponse(updated);
      setUser(prev => ({
        ...prev,
        ...normalized,
        memberSince: normalized.memberSince || prev.memberSince,
        loyaltyPoints: typeof normalized.loyaltyPoints === 'number' ? normalized.loyaltyPoints : prev.loyaltyPoints,
        totalOrders: typeof normalized.totalOrders === 'number' ? normalized.totalOrders : prev.totalOrders,
        savedAmount: typeof normalized.savedAmount === 'number' ? normalized.savedAmount : prev.savedAmount,
      }));
      if (updateUserProfile) await updateUserProfile(normalized as Parameters<NonNullable<typeof updateUserProfile>>[0]);
      setEditingField(null);
      setShowNudge(false);
      toast.success('Updated!');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to update'); }
    finally { setIsUpdating(false); }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-500 border-t-transparent" />
    </div>
  );

  if (!isAuthenticated) return null;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'KT';
  const displayName = isPlaceholderName(user.name) ? 'My Account' : user.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/60 via-white to-orange-50/40">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-72 h-72 bg-rose-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 py-8">

        {/* OTP Nudge */}
        {showNudge && !nudgeDismissed && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 mb-4 flex gap-3 items-start">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">Hey! Your profile is incomplete</p>
              <p className="text-xs text-amber-700 mt-0.5">Please update your name and email for a better experience and smoother delivery.</p>
              <div className="flex gap-2 mt-2.5">
                <Button size="sm" onClick={() => { setShowNudge(false); router.push('/account/profile'); }}
                  className="bg-amber-600 hover:bg-amber-700 rounded-xl h-8 text-xs px-4">
                  Update Profile
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setNudgeDismissed(true); setShowNudge(false); }}
                  className="h-8 text-xs text-amber-600 hover:bg-amber-100 rounded-xl px-3">
                  Skip for now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Profile hero */}
        <GlassCard className="p-6 mb-5">
          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <Avatar className="h-20 w-20 ring-4 ring-white shadow-xl">
                <AvatarImage src={user.profileImage || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-red-400 to-orange-500 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-red-700 transition-colors">
                <Camera className="h-3.5 w-3.5 text-white" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUpdating} />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900 truncate">{displayName}</h1>
                <button onClick={() => { setEditingField('name'); setTempValue(user.name || ''); }}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
                  <Edit className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">Member since {user.memberSince}</p>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span>+91 {user.phoneNumber || '—'}</span>
                  <button onClick={() => { setEditingField('phoneNumber'); setTempValue(user.phoneNumber || ''); }}
                    className="p-0.5 rounded hover:bg-gray-100 flex-shrink-0">
                    <Edit className="h-3 w-3 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{isPlaceholderEmail(user.email) ? '— Add email' : user.email}</span>
                  <button onClick={() => { setEditingField('email'); setTempValue(user.email || ''); }}
                    className="p-0.5 rounded hover:bg-gray-100 flex-shrink-0">
                    <Edit className="h-3 w-3 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
            <StatChip value={user.totalOrders} label="Orders" accent="bg-blue-50" onClick={() => router.push('/account/orders')} />
            <StatChip value={`₹${user.savedAmount}`} label="Saved" accent="bg-green-50" onClick={() => router.push('/offers')} />
            <StatChip value={user.loyaltyPoints} label="Points" accent="bg-amber-50" onClick={() => router.push('/account/loyalty')} />
          </div>
        </GlassCard>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { icon: Package, label: 'Reorder', accent: 'bg-blue-100 text-blue-600', action: () => router.push('/account/orders') },
            { icon: Star, label: 'Offers', accent: 'bg-amber-100 text-amber-600', action: () => router.push('/offers') },
            { icon: Gift, label: 'Refer', accent: 'bg-pink-100 text-pink-600', action: () => setShowReferral(true) },
            { icon: HelpCircle, label: 'Support', accent: 'bg-cyan-100 text-cyan-600', action: () => router.push('/account/help') },
          ].map(({ icon: Icon, label, accent, action }) => (
            <button key={label} onClick={action}
              className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all">
              <div className={`p-2.5 rounded-xl ${accent}`}><Icon className="h-4 w-4" /></div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </button>
          ))}
        </div>

        {/* Menu groups */}
        <div className="space-y-4">
          {menuGroups.map(group => (
            <GlassCard key={group.title} className="p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <MenuRow key={item.href} {...item} />
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Account actions */}
        <GlassCard className="p-4 mt-4">
          <MenuRow icon={Download} label="Export My Data" desc="Download your data as JSON"
            accent="bg-gray-100 text-gray-600"
            onClick={async () => {
              try {
                const res = await fetch('/api/user/export-data', { headers: { 'x-user-id': authUser?.id || '', 'x-user-name': authUser?.name || '', 'x-user-email': authUser?.email || '', 'x-user-phone': authUser?.phoneNumber || '' } });
                if (!res.ok) throw new Error('Failed');
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'kadal-data.json';
                document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
                toast.success('Data exported!');
              } catch { toast.error('Export failed'); }
            }} />
          <button onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-red-50 transition-colors group text-left mt-0.5">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600 flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-600 text-sm">Sign Out</p>
              <p className="text-xs text-red-400">Log out of your account</p>
            </div>
          </button>
        </GlassCard>

        <p className="text-center text-xs text-gray-400 mt-6 pb-4">Kadal Thunai v2.1.0 · © {new Date().getFullYear()}</p>
      </div>

      {/* Edit modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">
              Edit {editingField === 'phoneNumber' ? 'Phone' : editingField === 'email' ? 'Email' : 'Name'}
            </h3>
            <Input value={tempValue} onChange={e => setTempValue(e.target.value)}
              placeholder={`New ${editingField}`} autoFocus
              type={editingField === 'email' ? 'email' : editingField === 'phoneNumber' ? 'tel' : 'text'}
              maxLength={editingField === 'phoneNumber' ? 10 : undefined}
              className="rounded-xl mb-4 text-base h-12" />
            <div className="flex gap-3">
              <Button onClick={handleSaveField} disabled={isUpdating}
                className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-11">
                {isUpdating ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="h-4 w-4 mr-1" />Save</>}
              </Button>
              {editingField === 'email' && (
                <Button variant="ghost" onClick={() => setEditingField(null)} disabled={isUpdating}
                  className="rounded-xl h-11 text-gray-500 text-sm">Skip</Button>
              )}
              <Button variant="outline" onClick={() => setEditingField(null)} disabled={isUpdating}
                className="rounded-xl h-11 px-4">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Referral modal */}
      {showReferral && (
        <ReferralSheet referralCode={referralCode} onClose={() => setShowReferral(false)} />
      )}
    </div>
  );
}
