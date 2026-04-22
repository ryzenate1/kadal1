"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon, Mail, Phone, Camera, ArrowLeft,
  Edit3, Check, X, Loader2, AlertCircle, ChevronRight, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { fetchJson } from "@/lib/apiClient";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  memberSince: string;
  totalOrders: number;
  savedAmount: number;
  loyaltyPoints: number;
  isOtpUser?: boolean;
}

// Detect if user is OTP-registered (no real name/email set)
function isOtpGeneratedName(name: string) {
  return !name || name.startsWith('KT-User-') || name === 'Kadal Thunai' || name === 'KadalThunai' || name.toLowerCase().includes('kadalthunai');
}
function isOtpGeneratedEmail(email: string) {
  return !email || email.includes('kadalthunai') || email.endsWith('@placeholder.com') || email.endsWith('@temp.com');
}

function OtpUserNudge({ onUpdate, onSkip }: { onUpdate: () => void; onSkip: () => void }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex gap-3 items-start">
      <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <AlertCircle className="h-4 w-4 text-amber-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-amber-900 text-sm">Complete your profile</p>
        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
          Hey! You haven't saved your name yet. Please update your details for a better experience.
        </p>
        <div className="flex gap-2 mt-3">
          <Button onClick={onUpdate} size="sm" className="bg-amber-600 hover:bg-amber-700 rounded-xl h-8 text-xs px-4">
            Update Now
          </Button>
          <Button onClick={onSkip} size="sm" variant="ghost" className="h-8 text-xs text-amber-600 hover:bg-amber-100 rounded-xl px-3">
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ icon: Icon, label, value, onEdit }: {
  icon: any; label: string; value: string; onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl">
      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{value || '—'}</p>
      </div>
      <button onClick={onEdit} className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
        <Edit3 className="h-3.5 w-3.5 text-gray-400" />
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, loading, updateUserProfile } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: '', email: '', phoneNumber: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login?redirect=/account/profile');
  }, [loading, isAuthenticated, router]);

  const fetchUserProfile = async () => {
    try {
      const userData = await fetchJson<UserProfile>('/api/user/profile');
      setUser(userData);
      setEditValues({ name: userData.name, email: userData.email, phoneNumber: userData.phoneNumber });
      // Show nudge for OTP users with default name
      if (!nudgeDismissed && (isOtpGeneratedName(userData.name) || isOtpGeneratedEmail(userData.email))) {
        setShowNudge(true);
      }
    } catch {
      toast.error('Failed to load profile data');
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchUserProfile();
  }, [isAuthenticated, authUser?.id]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    if (!file.type.startsWith('image/')) { toast.error("Please select an image file"); return; }

    setIsUpdating(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('profileImage', file);
      const result = await fetchJson<{ imageUrl: string }>('/api/user/upload-image', {
        method: 'POST',
        body: formDataObj,
      });
      setUser(prev => prev ? { ...prev, profileImage: result.imageUrl } : prev);
      await updateUserProfile({ profileImage: result.imageUrl });
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUpdating(false);
      event.target.value = '';
    }
  };

  const handleSaveField = async (field: string) => {
    const value = editValues[field as keyof typeof editValues]?.trim();
    if (!value) { toast.error(`${field} cannot be empty`); return; }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email"); return;
    }
    if (field === 'phoneNumber' && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number"); return;
    }

    setIsUpdating(true);
    try {
      const payload = { name: user?.name, email: user?.email, phoneNumber: user?.phoneNumber, [field]: value };
      const updated = await fetchJson<any>('/api/user/profile', {
        method: 'PATCH',
        body: payload,
      });
      setUser(prev => prev ? { ...prev, ...updated } : null);
      setEditValues(prev => ({ ...prev, ...updated }));
      await updateUserProfile(updated);
      setEditField(null);
      setShowNudge(false);
      toast.success("Updated successfully!");
    } catch {
      toast.error("Failed to update. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
    </div>
  );
  if (!isAuthenticated) return null;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'KT';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/60 via-white to-red-50/40">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personal Info</h1>
            <p className="text-sm text-gray-400">Manage your account details</p>
          </div>
        </div>

        {/* OTP Nudge */}
        {showNudge && !nudgeDismissed && (
          <OtpUserNudge
            onUpdate={() => { setShowNudge(false); setEditField('name'); }}
            onSkip={() => { setNudgeDismissed(true); setShowNudge(false); }}
          />
        )}

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-black/5 p-6 mb-5">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                <AvatarImage src={user.profileImage || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-red-400 to-orange-500 text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isUpdating && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-red-700 transition-colors">
                <Camera className="h-3.5 w-3.5 text-white" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUpdating} />
              </label>
            </div>
            <p className="text-xs text-gray-400">Tap camera to change photo</p>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <FieldRow icon={UserIcon} label="Full Name" value={user.name} onEdit={() => setEditField('name')} />
            <FieldRow icon={Phone} label="Phone Number" value={user.phoneNumber ? `+91 ${user.phoneNumber}` : ''} onEdit={() => setEditField('phoneNumber')} />
            <FieldRow icon={Mail} label="Email Address" value={user.email} onEdit={() => setEditField('email')} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { value: user.totalOrders, label: 'Orders', bg: 'bg-blue-50', text: 'text-blue-700' },
            { value: `₹${user.savedAmount}`, label: 'Saved', bg: 'bg-green-50', text: 'text-green-700' },
            { value: user.loyaltyPoints, label: 'Points', bg: 'bg-amber-50', text: 'text-amber-700' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            Member since {user.memberSince}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editField && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              Edit {editField === 'phoneNumber' ? 'Phone Number' : editField === 'email' ? 'Email Address' : 'Full Name'}
            </h3>
            {editField === 'email' && (
              <p className="text-xs text-gray-400 mb-4">You can skip this if you prefer not to add an email.</p>
            )}
            <Input
              value={editValues[editField as keyof typeof editValues] || ''}
              onChange={e => setEditValues(prev => ({ ...prev, [editField]: e.target.value }))}
              placeholder={editField === 'email' ? 'your@email.com (optional)' : editField === 'phoneNumber' ? '10-digit number' : 'Your full name'}
              type={editField === 'email' ? 'email' : editField === 'phoneNumber' ? 'tel' : 'text'}
              autoFocus
              className="rounded-xl h-12 text-base mb-4"
            />
            <div className="flex gap-3">
              <Button onClick={() => handleSaveField(editField)} disabled={isUpdating}
                className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-11">
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1.5" />Save</>}
              </Button>
              {editField === 'email' && (
                <Button variant="outline" onClick={() => setEditField(null)} disabled={isUpdating}
                  className="rounded-xl h-11 px-4 text-gray-500">
                  Skip
                </Button>
              )}
              <Button variant="outline" onClick={() => setEditField(null)} disabled={isUpdating}
                className="rounded-xl h-11 px-4">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
