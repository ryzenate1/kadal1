'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { clientStorage } from '@/lib/clientStorage';

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  src: string;
  image?: string;
  type: string;
  price: number;
  quantity: number;
  addedAt: Date;
  omega3?: number;
  protein?: number;
  calories?: number;
  benefits?: string[];
  bestFor?: string[];
  rating?: number;
  netWeight?: string;
  grossWeight?: string;
  originalPrice?: number;
  note?: string;
  isGiftWrapped?: boolean;
  giftMessage?: string;
  display?: string;
}

export interface UserLocation {
  name?: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  pincode: string;
  city?: string;
  state?: string;
  country?: string;
  deliveryAvailable?: boolean;
  deliveryTime?: string;
  deliveryFee?: number;
  phone?: string;
}

export interface CartSummary {
  subtotal: number;
  itemCount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  discount?: number;
}

export interface CartContextType {
  cart: CartItem[];
  savedForLater: CartItem[];
  cartExpiry: Date | null;
  isLoading: boolean;
  error: string | null;
  userLocation: UserLocation | null;
  deliveryFee: number;
  isExpired: boolean;
  isAuthenticated: boolean;
  deliverySlots: Array<{ id: string; display: string; available: boolean; date: Date }>;
  selectedDeliverySlot: string | null;
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  saveForLater: (itemId: string) => void;
  moveToCart: (itemId: string) => void;
  removeFromSaved: (itemId: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => void;
  getCartSummary: () => CartSummary;
  getCartItemCount: () => number;
  getCartTotal: (items: CartItem[]) => number;
  addBulkToCart: (items: Omit<CartItem, 'id' | 'addedAt'>[]) => void;
  shareCart: () => Promise<boolean>;
  updateNote: (itemId: string, note: string) => void;
  toggleGiftWrap: (itemId: string, isGiftWrapped: boolean, giftMessage?: string) => void;
  validateStock: (itemId: string, quantity: number) => boolean;
  getLowStockItems: () => CartItem[];
  checkout: (paymentMethod: any) => Promise<{ success: boolean; orderId: string }>;
  setSelectedDeliverySlot: (slotId: string | null) => void;
  setUserLocation: (location: UserLocation) => Promise<void>;
  userPreferences: any;
  updateUserPreferences: (updates: any) => void;
}

// Per-user cart key so each account gets its own cart
function getCartKey(userId?: string | null): string {
  if (userId) return `kadal:cart:user:${userId}`;
  return 'kadal:cart:guest';
}

const SAVED_ITEMS_KEY = 'kadal:saved-items';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Determine current user id synchronously for initial key
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return clientStorage.user.get()?.id || null;
  });

  const cartKey = useMemo(() => getCartKey(userId), [userId]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [cartExpiry] = useState<Date | null>(null);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(null);
  const [deliveryFee] = useState<number>(0);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Load cart from localStorage when cartKey changes (login/logout/user switch)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(cartKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCart([]);
    }
  }, [cartKey]);

  // Listen for auth changes (login/logout) to switch cart key
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'kadal:user' || e.key === 'kadal:auth') {
        const newUserId = clientStorage.user.get()?.id || null;
        setUserId(newUserId);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Persist cart whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch { /* quota exceeded — ignore */ }
  }, [cart, cartKey]);

  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'addedAt'>, quantity = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        c => c.name === item.name && c.type === item.type
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      }
      const newItem: CartItem = {
        ...item,
        id: `${item.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
        src: item.src || item.image || '/images/fish/mackerel.jpg',
        image: item.image || item.src || '/images/fish/mackerel.jpg',
        quantity,
        addedAt: new Date(),
        omega3: item.omega3 ?? 0,
        protein: item.protein ?? 0,
        calories: item.calories ?? 0,
        benefits: item.benefits ?? [],
        bestFor: item.bestFor ?? [],
        rating: item.rating ?? 4.5,
      };
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(itemId); return; }
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cartKey);
    }
  }, [cartKey]);

  const saveForLater = useCallback((itemId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;
      setSavedForLater(s => {
        const exists = s.findIndex(i => i.id === itemId);
        if (exists > -1) {
          const u = [...s]; u[exists].quantity += item.quantity; return u;
        }
        return [...s, { ...item }];
      });
      return prev.filter(i => i.id !== itemId);
    });
  }, []);

  const moveToCart = useCallback((itemId: string) => {
    setSavedForLater(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;
      addToCart(item, item.quantity);
      return prev.filter(i => i.id !== itemId);
    });
  }, [addToCart]);

  const removeFromSaved = useCallback((itemId: string) => {
    setSavedForLater(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const getCartItemCount = useCallback(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const getCartTotal = useCallback((items: CartItem[]) =>
    items.reduce((s, i) => s + i.price * i.quantity, 0), []);

  const getCartSummary = useCallback((): CartSummary => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = appliedCoupon?.discount ?? 0;
    const total = Math.max(0, subtotal - discount);
    return { subtotal, itemCount: getCartItemCount(), deliveryFee: 0, tax: 0, total, discount };
  }, [cart, appliedCoupon, getCartItemCount]);

  const applyCoupon = useCallback((code: string): boolean => {
    if (code.toUpperCase() === 'WELCOME10') {
      setAppliedCoupon({ code, discount: 10 });
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  const updateNote = useCallback((itemId: string, note: string) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, note } : i));
  }, []);

  const toggleGiftWrap = useCallback((itemId: string, isGiftWrapped: boolean, giftMessage?: string) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, isGiftWrapped, giftMessage } : i));
  }, []);

  const validateStock = useCallback(() => true, []);
  const getLowStockItems = useCallback(() => [], []);

  const shareCart = useCallback(async () => {
    try {
      const text = `My cart: ${cart.map(i => `${i.name} x${i.quantity}`).join(', ')}`;
      if (navigator.share) await navigator.share({ title: 'My Cart', text });
      else await navigator.clipboard.writeText(text);
      return true;
    } catch { return false; }
  }, [cart]);

  const addBulkToCart = useCallback((items: Omit<CartItem, 'id' | 'addedAt'>[]) => {
    items.forEach(i => addToCart(i, i.quantity || 1));
  }, [addToCart]);

  const checkout = useCallback(async () => {
    throw new Error('Use CheckoutPage for checkout');
  }, []);

  const deliverySlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    for (let day = 0; day < 2; day++) {
      const base = new Date(now);
      base.setDate(now.getDate() + day);
      const start = day === 0 ? now.getHours() + 1 : 8;
      for (let h = start; h < 20; h += 2) {
        const d = new Date(base);
        d.setHours(h, 0, 0, 0);
        slots.push({ id: `${day}-${h}`, display: `${h}:00 - ${h + 2}:00`, available: true, date: d });
      }
    }
    return slots;
  }, []);

  const isSignedIn = typeof window !== 'undefined' ? !!clientStorage.auth.getToken() : false;

  const value: CartContextType = {
    cart,
    savedForLater,
    cartExpiry,
    isLoading,
    error,
    userLocation,
    deliveryFee,
    isExpired: false,
    isAuthenticated: isSignedIn,
    deliverySlots,
    selectedDeliverySlot,
    addToCart,
    removeFromCart,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeFromSaved,
    applyCoupon,
    removeCoupon,
    clearCart,
    getCartSummary,
    getCartItemCount,
    getCartTotal,
    addBulkToCart,
    shareCart,
    updateNote,
    toggleGiftWrap,
    validateStock,
    getLowStockItems,
    checkout,
    setSelectedDeliverySlot,
    setUserLocation: async (loc) => { setUserLocationState(loc); },
    userPreferences: {},
    updateUserPreferences: () => {},
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Keep Fish type export for compatibility
export interface Fish {
  id: string; name: string; src: string; type: string; price: number;
  omega3: number; protein: number; calories: number;
  benefits: string[]; bestFor: string[]; rating: number;
  description?: string; isPopular?: boolean; serves?: string;
  netWeight?: string; grossWeight?: string; originalPrice?: number;
}
