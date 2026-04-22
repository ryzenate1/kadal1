"use client";

import { useState, useEffect } from "react";
import { Star, Clock, Percent, Gift, ArrowLeft, Tag, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  code?: string;
  minOrder?: number;
  type: 'percentage' | 'flat' | 'bogo' | 'free_delivery';
  active: boolean;
}

const TYPE_ICON: Record<string, any> = {
  percentage: Percent,
  flat: Tag,
  bogo: Gift,
  free_delivery: Star,
};

const TYPE_COLORS: Record<string, string> = {
  percentage: 'bg-red-100 text-red-600',
  flat: 'bg-orange-100 text-orange-600',
  bogo: 'bg-purple-100 text-purple-600',
  free_delivery: 'bg-green-100 text-green-600',
};

function OfferCard({ offer }: { offer: Offer }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const copy = () => {
    if (!offer.code) return;
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    toast.success(`Code ${offer.code} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const daysLeft = Math.ceil((new Date(offer.validUntil).getTime() - Date.now()) / (1000 * 86400));
  const expiringSoon = daysLeft <= 3;

  const Icon = TYPE_ICON[offer.type] || Gift;
  const colorClass = TYPE_COLORS[offer.type] || 'bg-gray-100 text-gray-500';

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-black/5 overflow-hidden relative">
      {expiringSoon && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
      )}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">{offer.title}</h3>
            <p className="text-2xl font-black text-red-600">{offer.discount}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">{offer.description}</p>

        <div className="space-y-1.5 mb-4 text-xs text-gray-400">
          {offer.minOrder && (
            <div className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />Min order: ₹{offer.minOrder}</div>
          )}
          <div className={`flex items-center gap-1.5 ${expiringSoon ? 'text-red-500 font-semibold' : ''}`}>
            <Clock className="h-3.5 w-3.5" />
            {expiringSoon ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!` : `Valid until ${new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </div>
        </div>

        {offer.code && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Coupon code</p>
              <p className="font-mono font-bold text-gray-900 tracking-widest">{offer.code}</p>
            </div>
            <button onClick={copy} className={`p-2 rounded-xl transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}

        <Button onClick={() => { toast.success('Happy shopping!'); router.push('/'); }}
          className="w-full bg-red-600 hover:bg-red-700 rounded-2xl h-10">
          Shop Now
        </Button>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      const r = await fetch('/api/offers', { cache: 'no-store' });
      const data = r.ok ? await r.json() : [];
      setOffers(Array.isArray(data) ? data : []);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOffers();

    const refreshId = setInterval(() => {
      void fetchOffers();
    }, 20000);

    return () => clearInterval(refreshId);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/60 via-white to-orange-50/40">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Current Offers</h1>
            <p className="text-sm text-gray-400">Save more on every order</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl" />)}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No active offers</h3>
            <p className="text-sm text-gray-400">Check back soon for exciting deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {offers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-5">
          <h3 className="font-bold text-gray-900 mb-3">Terms & Conditions</h3>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li>• Offers are valid for registered users only</li>
            <li>• Offers cannot be combined with other promotions</li>
            <li>• Minimum order values are before taxes and delivery charges</li>
            <li>• Kadal Thunai reserves the right to modify or cancel offers without prior notice</li>
            <li>• Offers are applicable on selected products only</li>
            <li>• Free delivery offers are valid within the standard delivery area</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
