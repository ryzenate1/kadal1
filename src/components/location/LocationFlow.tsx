'use client';

import { useMemo, useState } from 'react';
import { Crosshair, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation, type Address } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import MapLibreMap from '@/components/maps/MapLibreMap';
import LocationSearchInput, { type GeoResult } from '@/components/maps/LocationSearchInput';
import { toast } from 'sonner';

type LocationFlowProps = {
  onClose: () => void;
  onLocationSelect: (location: Address) => void;
  apiKey?: string;
};

type DraftLocation = {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const CHENNAI = { lat: 13.0827, lng: 80.2707 };
const RECENTS_KEY = 'recentLocations_v1';
const RECENTS_LIMIT = 6;

type RecentLocation = {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
};

type ResolvedLocation = {
  address: string;
  city: string;
  state: string;
  pincode: string;
};

function loadRecents(): RecentLocation[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r) => r && typeof r.address === 'string' && typeof r.lat === 'number' && typeof r.lng === 'number')
      .slice(0, RECENTS_LIMIT);
  } catch {
    return [];
  }
}

function saveRecents(items: RecentLocation[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(items.slice(0, RECENTS_LIMIT)));
  } catch {
    // ignore
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) {
      throw new Error('Reverse geocode failed');
    }

    const data = (await res.json()) as { display_name?: string };
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

function parseAddressParts(address: string): Pick<ResolvedLocation, 'city' | 'state' | 'pincode'> {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  const pincodeMatch = address.match(/\b\d{6}\b/);
  const pincode = pincodeMatch?.[0] || '';

  let state = '';
  let city = '';

  if (parts.length >= 2) {
    state = parts[parts.length - 2] || '';
    city = parts[parts.length - 3] || parts[parts.length - 2] || '';
  }

  if (!state && address.toLowerCase().includes('tamil nadu')) {
    state = 'Tamil Nadu';
  }

  return { city, state, pincode };
}

function buildResolvedLocation(address: string, partial?: Partial<ResolvedLocation>): ResolvedLocation {
  const parsed = parseAddressParts(address);
  return {
    address,
    city: partial?.city || parsed.city || 'Chennai',
    state: partial?.state || parsed.state || 'Tamil Nadu',
    pincode: partial?.pincode || parsed.pincode || '',
  };
}

export function LocationFlow({ onClose, onLocationSelect }: LocationFlowProps) {
  const { isAuthenticated } = useAuth();
  const { currentAddress, addresses, saveAddress, setLocation, isLoading } = useLocation();

  const initialCenter = useMemo(
    () =>
      currentAddress
        ? { lat: currentAddress.lat, lng: currentAddress.lng }
        : CHENNAI,
    [currentAddress]
  );

  const [draft, setDraft] = useState<DraftLocation>({
    lat: initialCenter.lat,
    lng: initialCenter.lng,
    address: currentAddress?.address_string || 'Select a location on map',
    city: '',
    state: '',
    pincode: '',
  });

  const [name, setName] = useState(currentAddress?.name || '');
  const [phone, setPhone] = useState(currentAddress?.phone || '');
  const [doorNo, setDoorNo] = useState(currentAddress?.door_no || '');
  const [building, setBuilding] = useState(currentAddress?.building || '');
  const [landmark, setLandmark] = useState(currentAddress?.landmark || '');
  const [tag, setTag] = useState<Address['tag']>(currentAddress?.tag || 'home');
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [view, setView] = useState<'browse' | 'confirm' | 'map'>('browse');
  const [recents, setRecents] = useState<RecentLocation[]>(() => loadRecents());

  const applyDraft = (
    lat: number,
    lng: number,
    address: string,
    partial?: Partial<ResolvedLocation>
  ) => {
    const resolved = buildResolvedLocation(address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`, partial);
    setDraft({
      lat,
      lng,
      address: resolved.address,
      city: resolved.city,
      state: resolved.state,
      pincode: resolved.pincode,
    });
  };

  const pushRecent = (item: RecentLocation) => {
    const normalized = item.address.trim();
    if (!normalized) return;
    const next = [{ ...item, address: normalized }, ...recents.filter((r) => r.address !== normalized)].slice(
      0,
      RECENTS_LIMIT
    );
    setRecents(next);
    saveRecents(next);
  };

  const handleSearchSelect = (result: GeoResult) => {
    applyDraft(result.lat, result.lng, result.address, {
      city: result.city || '',
      state: result.state || '',
    });
    pushRecent({ lat: result.lat, lng: result.lng, address: result.address, city: result.city, state: result.state });
    setView('confirm');
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.');
      return;
    }

    setDetecting(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const address = await reverseGeocode(lat, lng);
      applyDraft(lat, lng, address);
      const parsed = parseAddressParts(address);
      pushRecent({ lat, lng, address, ...parsed });
      toast.success('Current location detected.');
      setView('confirm');
    } catch {
      toast.error('Unable to detect current location.');
    } finally {
      setDetecting(false);
    }
  };

  // "Deliver here" — sets the active delivery location for this session.
  // Does NOT require a pincode; always succeeds as long as address + name are provided.
  // If authenticated and pincode is available, also persists to the address book.
  const handleDeliverHere = async () => {
    if (!draft.address) {
      toast.error('Please select a valid location.');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter a name for this delivery location.');
      return;
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }

    setSaving(true);
    try {
      const id = `loc-${Date.now()}`;
      const location: Address = {
        id,
        user_id: currentAddress?.user_id || 'current-user',
        lat: draft.lat,
        lng: draft.lng,
        address_string: draft.address,
        door_no: doorNo,
        building,
        landmark,
        tag,
        name: name.trim(),
        phone: phone.trim(),
        created_at: new Date().toISOString(),
      };

      // Always set the current delivery location immediately (no DB required)
      setLocation(location);
      onLocationSelect(location);

      // If authenticated and has pincode, also persist to address book in background
      if (isAuthenticated && draft.pincode) {
        try {
          await saveAddress({
            lat: draft.lat,
            lng: draft.lng,
            address_string: draft.address,
            door_no: doorNo,
            building,
            landmark,
            tag,
            name: name.trim(),
            phone: phone.trim(),
            city: draft.city,
            state: draft.state,
            pincode: draft.pincode,
          });
          toast.success('Delivery location saved and selected.');
        } catch {
          // Delivery location was set; only the address book save failed
          toast.success('Delivery location set.');
        }
      } else {
        toast.success('Delivery location updated.');
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  // "Save address" — requires pincode to persist to the DB address book
  const handleSaveAddress = async () => {
    if (!draft.address) {
      toast.error('Please select a valid location.');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter a name for this address.');
      return;
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!draft.pincode) {
      toast.error('Please choose a location with a valid pincode to save to address book.');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please log in to save addresses to your account.');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveAddress({
        lat: draft.lat,
        lng: draft.lng,
        address_string: draft.address,
        door_no: doorNo,
        building,
        landmark,
        tag,
        name: name.trim(),
        phone: phone.trim(),
        city: draft.city,
        state: draft.state,
        pincode: draft.pincode,
      });

      setLocation(saved);
      onLocationSelect(saved);
      toast.success('Address saved to your account.');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save location.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-h-[85vh] flex-col bg-white sm:max-h-[80vh]">
      <div className="border-b px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">Choose delivery location</h3>
        <p className="text-xs text-gray-500">Search first • map optional</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Search */}
        <LocationSearchInput
          onSelect={handleSearchSelect}
          placeholder="Search area, street, landmark"
          autoFocus
        />

        {/* Quick actions */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={detecting}>
            <Crosshair className="mr-2 h-4 w-4" />
            {detecting ? 'Detecting...' : 'Use current'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setView('map')}>
            <MapPin className="mr-2 h-4 w-4" />
            Choose on map
          </Button>
        </div>

        {/* Saved addresses */}
        {addresses.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Saved addresses</div>
            <div className="space-y-2">
              {addresses.slice(0, 6).map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    setLocation(addr);
                    onLocationSelect(addr);
                    toast.success('Delivery location updated.');
                    onClose();
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{addr.tag.toUpperCase()}</span>
                        {currentAddress?.id === addr.id && (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-gray-600">{addr.address_string}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        {recents.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent</div>
            <div className="space-y-2">
              {recents.map((r) => (
                <button
                  key={`${r.lat}-${r.lng}-${r.address}`}
                  type="button"
                  onClick={() => {
                    applyDraft(r.lat, r.lng, r.address, {
                      city: r.city,
                      state: r.state,
                      pincode: r.pincode,
                    });
                    setView('confirm');
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900">{r.address.split(',')[0]}</div>
                      <div className="mt-0.5 truncate text-xs text-gray-600">
                        {r.address.split(',').slice(1, 3).join(',').trim()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Map view */}
        {view === 'map' && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
            <div className="h-72">
              <MapLibreMap
                center={{ lat: draft.lat, lng: draft.lng }}
                zoom={16}
                draggable
                onPositionChange={(lat, lng, address) => applyDraft(lat, lng, address || draft.address)}
              />
            </div>
            <div className="space-y-3 border-t bg-white p-4">
              <div className="text-xs text-gray-600 line-clamp-2">{draft.address}</div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={() => setView('browse')}>
                  Back
                </Button>
                <Button type="button" onClick={() => setView('confirm')}>
                  Use this location
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm */}
        {view === 'confirm' && (
          <div className="mt-5">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-red-500" />
                Confirm delivery location
              </div>
              <p className="text-xs text-gray-700 line-clamp-2">{draft.address}</p>
              {!draft.pincode && (
                <p className="mt-1 text-xs text-amber-600">
                  No pincode detected — location will be set for this session only
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input
                placeholder="Phone"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
              <Input placeholder="Door No" value={doorNo} onChange={(e) => setDoorNo(e.target.value)} />
              <Input placeholder="Building" value={building} onChange={(e) => setBuilding(e.target.value)} />
            </div>

            <div className="mt-2">
              <Input placeholder="Landmark (optional)" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
            </div>

            <div className="mt-3 flex gap-2">
              {(['home', 'work', 'other'] as const).map((nextTag) => (
                <button
                  key={nextTag}
                  type="button"
                  onClick={() => setTag(nextTag)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    tag === nextTag
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {nextTag.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button type="button" onClick={handleDeliverHere} disabled={saving || isLoading}>
                {saving || isLoading ? 'Saving...' : 'Deliver here'}
              </Button>
              {isAuthenticated && draft.pincode && (
                <Button type="button" variant="outline" onClick={handleSaveAddress} disabled={saving || isLoading}>
                  {saving || isLoading ? 'Saving...' : 'Save to address book'}
                </Button>
              )}
            </div>

            <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => setView('browse')}>
              Choose a different location
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationFlow;
