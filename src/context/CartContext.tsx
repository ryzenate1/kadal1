'use client';

import React, { 
  createContext, 
  useContext, 
  useState, 
  ReactNode, 
  useEffect, 
  useMemo, 
  useCallback 
} from 'react';
import { useDebounce } from 'use-debounce';

// Define the Fish interface (consistent with other pages)
export interface Fish {
  id: string;
  name: string;
  src: string;
  type: string;
  price: number;
  omega3: number;
  protein: number;
  calories: number;
  benefits: string[];
  bestFor: string[];
  rating: number;
  description?: string;
  isPopular?: boolean;
  serves?: string;
  netWeight?: string;
  grossWeight?: string;
  originalPrice?: number;
}

export interface CartItem extends Omit<Fish, 'id'> {
  id: string;
  quantity: number;
  addedAt: Date;
  note?: string;
  isGiftWrapped?: boolean;
  giftMessage?: string;
  image?: string;
  display?: string;
}

export interface UserLocation {
  name?: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  pincode: string;
  city?: string;
  state?: string;
  country?: string;
  deliveryAvailable?: boolean;
  deliveryTime?: string;
  deliveryFee?: number;
  phone?: string;
}

export interface UserPreferences {
  preferredDeliveryTime?: string;
  contactNumber?: string;
  email?: string;
  savedAddresses?: UserLocation[];
  recentSearches?: string[];
  interests?: string[];
  dietaryPreferences?: string[];
  savedPaymentMethods?: Array<{
    id: string;
    type: 'card' | 'upi' | 'netbanking' | 'wallet';
    last4?: string;
    upiId?: string;
    bankName?: string;
    isDefault: boolean;
  }>;
}

// Coupon type
type Coupon = {
  code: string;
  discount: number;
  minPurchase?: number;
  freeShipping?: boolean;
  validUntil?: Date;
};

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
  userPreferences: UserPreferences | null;
  deliveryFee: number;
  isExpired: boolean;
  isAuthenticated: boolean;
  deliverySlots: Array<{
    id: string;
    display: string;
    available: boolean;
    date: Date;
  }>;
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
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
}

const CART_STORAGE_KEY = 'tendercutsCart';
const SAVED_ITEMS_KEY = 'tendercutsSavedItems';
const CART_EXPIRY_HOURS = 1;

const SHOP_LOCATION = {
  lat: 12.9716,  // Example: Chennai coordinates
  lng: 80.0387
};

const BASE_DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 5;
const FEE_PER_KM = 10;
const MAX_DELIVERY_DISTANCE = 15;

// Utility functions
const getCartTotal = (items: CartItem[] = []) => {
  return items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
};

const getItemCount = (items: CartItem[]) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const getCartSummary = (items: CartItem[]) => {
  const subtotal = getCartTotal(items);
  const itemCount = getItemCount(items);
  const deliveryFee = 0; // This should be calculated based on location
  const total = subtotal + deliveryFee;

  return {
    subtotal,
    itemCount,
    deliveryFee,
    total
  };
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos((lat1 * Math.PI) / 180) * 
    Math.cos((lat2 * Math.PI) / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

const calculateDeliveryFee = async (location: UserLocation): Promise<number> => {
  if (!location.coordinates) {
    return BASE_DELIVERY_FEE; // Default fee if no coordinates
  }

  const distance = calculateDistance(
    SHOP_LOCATION.lat,
    SHOP_LOCATION.lng,
    location.coordinates.lat,
    location.coordinates.lng
  );

  // If beyond maximum delivery distance
  if (distance > MAX_DELIVERY_DISTANCE) {
    return -1; // Indicates delivery not available
  }

  // Free delivery within threshold
  if (distance <= FREE_DELIVERY_THRESHOLD) {
    return 0;
  }

  // Calculate fee based on distance beyond free threshold
  const distanceBeyondThreshold = distance - FREE_DELIVERY_THRESHOLD;
  return Math.ceil(distanceBeyondThreshold * FEE_PER_KM);
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [cartExpiry, setCartExpiry] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deliverySlots, setDeliverySlots] = useState<Array<{
    id: string;
    display: string;
    available: boolean;
    date: Date;
  }>>([]);

  const generateDeliverySlots = useCallback(() => {
    const slots = [];
    const now = new Date();
    let currentHour = now.getHours();
    
    // If it's after 8 PM, start from next day
    if (currentHour >= 20) {
      now.setDate(now.getDate() + 1);
      currentHour = 8; // Start from 8 AM next day
    } else if (currentHour < 8) {
      currentHour = 8; // Start from 8 AM if before 8 AM
    }
    
    // Round up to next hour
    if (now.getMinutes() > 0) {
      currentHour += 1;
      now.setHours(currentHour, 0, 0, 0);
    }
    
    // Generate slots for next 2 days
    for (let day = 0; day < 2; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() + day);
      
      const startHour = day === 0 ? currentHour : 8; // Start from current hour for today, 8 AM for next days
      const endHour = 20; // End at 8 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        const slotDate = new Date(date);
        slotDate.setHours(hour, 0, 0, 0);
        
        slots.push({
          id: `slot-${day}-${hour}`,
          display: `${hour}:00 - ${hour + 1}:00`,
          available: true,
          date: slotDate
        });
      }
    }
    
    return slots;
  }, []);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string | null>(null);
  const [debouncedCart] = useDebounce(cart, 1000);
  
  const clearCorruptedCart = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Clear all cart-related data from localStorage
      localStorage.removeItem('cart');
      localStorage.removeItem('savedForLater');
      localStorage.removeItem('cartExpiry');
      localStorage.removeItem('appliedCoupon');
      
      // Reset state to initial values
      setCart([]);
      setSavedForLater([]);
      setCartExpiry(null);
      setAppliedCoupon(null);
      setError(null);
      
      console.log('Cleared corrupted cart data');
    } catch (error) {
      console.error('Error clearing cart data:', error);
    }
  }, [setCart, setSavedForLater, setCartExpiry, setAppliedCoupon, setError]);

  useEffect(() => {
    loadCartData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('savedForLater', JSON.stringify(savedForLater));
      if (cartExpiry) {
        localStorage.setItem('cartExpiry', cartExpiry.toISOString());
      }
      if (appliedCoupon) {
        localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      }
    }
  }, [cart, savedForLater, cartExpiry, appliedCoupon]);

  // Clear corrupted cart data on error
  useEffect(() => {
    if (error) {
      console.log('Error detected, clearing cart data...');
      clearCorruptedCart();
    }
  }, [error, clearCorruptedCart]);

  // Mock function to get item stock - replace with actual API call
  const getItemStock = useCallback((itemId: string): number => {
    // In a real app, this would call your API to get current stock
    // For now, return -1 to indicate unlimited stock
    return -1;
  }, []);

  // Check if an item is low in stock
  const isItemLowStock = useCallback((itemId: string): boolean => {
    const availableStock = getItemStock(itemId);
    return availableStock !== -1 && availableStock <= 5; // Consider low stock if 5 or fewer items
  }, [getItemStock]);

  // Validate stock for a specific item and quantity
  const validateStock = useCallback((itemId: string, quantity: number): boolean => {
    const availableStock = getItemStock(itemId);
    return availableStock === -1 || quantity <= availableStock;
  }, [getItemStock]);

  // Get items that are low in stock
  const getLowStockItems = useCallback((): CartItem[] => {
    return cart.filter(item => isItemLowStock(item.id));
  }, [cart, isItemLowStock]);

  const loadCartData = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const parseJSON = (value: string | null, defaultValue: any = []) => {
        if (!value) return defaultValue;
        try {
          return JSON.parse(value);
        } catch (error) {
          console.error('Error parsing JSON from localStorage:', error);
          return defaultValue;
        }
      };

      const savedCart = localStorage.getItem('cart');
      const savedItems = localStorage.getItem('savedForLater');
      const expiry = localStorage.getItem('cartExpiry');
      const coupon = localStorage.getItem('appliedCoupon');
      const location = localStorage.getItem('userLocation');

      // Parse cart data with error handling
      try {
        setCart(parseJSON(savedCart, []));
      } catch (error) {
        console.error('Error parsing cart data, clearing...', error);
        clearCorruptedCart();
        return;
      }
      
      // Parse saved items with error handling
      try {
        setSavedForLater(parseJSON(savedItems, []));
      } catch (error) {
        console.error('Error parsing saved items, clearing...', error);
        clearCorruptedCart();
        return;
      }
      
      // Handle expiry date
      if (expiry) {
        try {
          const expiryDate = new Date(expiry);
          if (!isNaN(expiryDate.getTime())) {
            setCartExpiry(expiryDate);
            checkExpiry(expiryDate);
          } else {
            console.error('Invalid expiry date format in localStorage');
            setCartExpiry(null);
          }
        } catch (error) {
          console.error('Error parsing expiry date:', error);
          setCartExpiry(null);
        }
      }
      
      // Parse coupon with error handling
      if (coupon) {
        try {
          setAppliedCoupon(JSON.parse(coupon));
        } catch (error) {
          console.error('Error parsing coupon, clearing...', error);
          localStorage.removeItem('appliedCoupon');
          setAppliedCoupon(null);
        }
      }
      
      // Parse user location with error handling
      if (location) {
        try {
          setUserLocation(JSON.parse(location));
        } catch (error) {
          console.error('Error parsing user location, clearing...', error);
          localStorage.removeItem('userLocation');
          // Don't clear the entire cart for location parsing errors
        }
      }
    } catch (error) {
      console.error('Failed to load cart data:', error);
      setError('Failed to load cart data');
    }
  };

  const checkExpiry = (expiryDate: Date) => {
    const now = new Date();
    if (now > expiryDate) {
      setIsExpired(true);
      clearCart();
    } else {
      setIsExpired(false);
      // Set a timeout to clear the cart when it expires
      const timeout = expiryDate.getTime() - now.getTime();
      const timer = setTimeout(() => {
        setIsExpired(true);
        clearCart();
      }, timeout);
      
      return () => clearTimeout(timer);
    }
  };



  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'addedAt'>, quantity: number = 1) => {
    setCart(prevCart => {
      // Generate a unique ID for the item if it doesn't have one
      // Use name and type as part of the ID to make it more consistent
      const itemId = `${item.name.replace(/\s+/g, '-').toLowerCase()}-${item.type.toLowerCase()}-${Date.now()}`;
      
      // Check if a similar item already exists in the cart (by name and type)
      const existingItemIndex = prevCart.findIndex(cartItem => 
        cartItem.name === item.name && cartItem.type === item.type
      );
      
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedCart = [...prevCart];
        const newQuantity = updatedCart[existingItemIndex].quantity + quantity;
        
        // Check stock before updating
        const availableStock = getItemStock(updatedCart[existingItemIndex].id);
        if (availableStock !== -1 && newQuantity > availableStock) {
          setError(`Only ${availableStock} items available in stock`);
          return prevCart; // Don't update if not enough stock
        }
        
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: newQuantity
        };
        setError(null);
        return updatedCart;
      } else {
        // New item, add to cart
        // Make sure the item has all required properties
        const newItem: CartItem = {
          ...item,
          id: itemId,
          quantity,
          addedAt: new Date(),
          isGiftWrapped: false,
          // Ensure required properties are present
          src: item.src || '/images/placeholder.jpg',
          price: item.price || 0,
          omega3: item.omega3 || 0,
          protein: item.protein || 0,
          calories: item.calories || 0,
          benefits: item.benefits || [],
          bestFor: item.bestFor || [],
          rating: item.rating || 4.5
        };
        
        console.log('Adding new item to cart:', newItem);
        setError(null);
        return [...prevCart, newItem];
      }
    });
    // Clear error after 3 seconds
    setTimeout(() => setError(null), 3000);
  }, [getItemStock]);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    // Check stock before updating
    const availableStock = getItemStock(itemId);
    if (availableStock !== -1 && newQuantity > availableStock) {
      setError(`Only ${availableStock} items available in stock`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart, getItemStock]);

  const updateItemNote = useCallback((itemId: string, note: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, note } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartExpiry(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem('cartExpiry');
    }
  }, []);

  const saveForLater = useCallback((itemId: string) => {
    setCart(prevCart => {
      const itemToSave = prevCart.find(item => item.id === itemId);
      if (!itemToSave) return prevCart;
      
      setSavedForLater(prevSaved => {
        const existingIndex = prevSaved.findIndex(item => item.id === itemId);
        if (existingIndex > -1) {
          const updated = [...prevSaved];
          updated[existingIndex].quantity += itemToSave.quantity;
          return updated;
        }
        return [...prevSaved, { ...itemToSave }];
      });
      
      return prevCart.filter(item => item.id !== itemId);
    });
  }, []);

  const moveToCart = useCallback((itemId: string) => {
    setSavedForLater(prevSaved => {
      const itemToMove = prevSaved.find(item => item.id === itemId);
      if (!itemToMove) return prevSaved;
      
      addToCart(itemToMove, itemToMove.quantity);
      return prevSaved.filter(item => item.id !== itemId);
    });
  }, [addToCart]);

  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    // In a real app, this would call your API to validate the coupon
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - in a real app, this would come from your API
      const isValid = code.toUpperCase() === 'WELCOME10';
      if (!isValid) {
        setError('Invalid coupon code');
        setTimeout(() => setError(null), 3000);
      }
      return isValid;
    } catch (err) {
      setError('Failed to apply coupon');
      setTimeout(() => setError(null), 3000);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);



  const bulkAddToCart = useCallback((items: Omit<CartItem, 'id' | 'addedAt'>[]) => {
    // Validate stock for all items first
    const hasInsufficientStock = items.some(
      (item) => {
        const itemId = 'id' in item ? String(item.id) : String(Math.random());
        const availableStock = getItemStock(itemId);
        return availableStock !== -1 && (item.quantity || 0) > availableStock;
      }
    );
    
    if (hasInsufficientStock) {
      setError('One or more items have insufficient stock');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // If all items have sufficient stock, add them to cart
    items.forEach(item => {
      addToCart(item, item.quantity || 1);
    });
  }, [addToCart, getItemStock]);



  const getCartItemCount = useCallback((): number => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const getCartTotal = useCallback((items: CartItem[] | undefined): number => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, []);

  const getCartSummary = useCallback((): CartSummary => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = getCartItemCount();
    const tax = subtotal * 0.05; // 5% tax
    const shipping = subtotal > 0 ? (deliveryFee > 0 ? deliveryFee : 0) : 0;
    const total = subtotal + tax + shipping - (appliedCoupon?.discount || 0);
    
    return {
      subtotal,
      itemCount,
      deliveryFee: shipping,
      tax,
      total,
      discount: appliedCoupon?.discount,
    };
  }, [cart, deliveryFee, appliedCoupon, getCartItemCount]);

  const shareCart = useCallback(async (): Promise<boolean> => {
    try {
      const cartSummary = getCartSummary();
      const text = `My cart (${cartSummary.itemCount} items): ₹${cartSummary.total} - View my cart`;
      if (navigator.share) {
        await navigator.share({
          title: 'My Cart',
          text,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(text);
      }
      return true;
    } catch (error) {
      console.error('Error sharing cart:', error);
      return false;
    }
  }, [getCartSummary]);


  const removeFromSaved = useCallback((itemId: string) => {
    setSavedForLater(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateNote = useCallback((itemId: string, note: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, note } : item
      )
    );
  }, []);

  const toggleGiftWrap = useCallback((itemId: string, isGiftWrapped: boolean, giftMessage?: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId 
          ? { ...item, isGiftWrapped, giftMessage: isGiftWrapped ? giftMessage : undefined }
          : item
      )
    );
  }, []);



  // Initialize user preferences and location
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would come from your auth context or API
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
          setUserPreferences(JSON.parse(savedPreferences));
        }
        
        // Try to get user's current location
        if (navigator.geolocation) {
          try {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                try {
                  const { latitude, longitude } = position.coords;
                  // In a real app, you would reverse geocoding these coordinates
                  const location: UserLocation = {
                    address: 'Detected Location', // Placeholder until reverse geocoding
                    coordinates: { lat: latitude, lng: longitude },
                    pincode: '600001', // Default pincode for Chennai
                    deliveryAvailable: true,
                    deliveryTime: '30-45 mins',
                    deliveryFee: 40
                  };
                  setUserLocation(location);
                  await updateDeliverySlots();
                } catch (positionError) {
                  console.error('Error processing position data:', positionError);
                  // Use default location instead of showing error
                  const defaultLocation: UserLocation = {
                    address: 'Chennai, Tamil Nadu',
                    coordinates: { lat: 13.0827, lng: 80.2707 }, // Chennai coordinates
                    pincode: '600001',
                    deliveryAvailable: true,
                    deliveryTime: '30-45 mins',
                    deliveryFee: 40
                  };
                  setUserLocation(defaultLocation);
                }
              },
              (geoError) => {
                console.error('Geolocation permission denied:', geoError.message);
                // Use default location instead of showing error
                const defaultLocation: UserLocation = {
                  address: 'Chennai, Tamil Nadu',
                  coordinates: { lat: 13.0827, lng: 80.2707 }, // Chennai coordinates
                  pincode: '600001',
                  deliveryAvailable: true,
                  deliveryTime: '30-45 mins',
                  deliveryFee: 40
                };
                setUserLocation(defaultLocation);
              },
              // Additional options for geolocation
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
              }
            );
          } catch (geolocationError) {
            console.error('Geolocation API error:', geolocationError);
            // Use default location instead of showing error
            const defaultLocation: UserLocation = {
              address: 'Chennai, Tamil Nadu',
              coordinates: { lat: 13.0827, lng: 80.2707 }, // Chennai coordinates
              pincode: '600001',
              deliveryAvailable: true,
              deliveryTime: '30-45 mins',
              deliveryFee: 40
            };
            setUserLocation(defaultLocation);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Update delivery slots based on current time and location
  const updateDeliverySlots = useCallback(async () => {
    const now = new Date();
    const slots = [];
    let currentHour = now.getHours();
    
    // Generate slots for next 2 days
    for (let day = 0; day < 2; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() + day);
      
      const startHour = day === 0 ? (currentHour < 22 ? currentHour + 1 : 0) : 8;
      const endHour = day === 0 ? 22 : 20; // Evening cutoff
      
      for (let hour = startHour; hour <= endHour; hour += 2) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);
        
        slots.push({
          id: `${day}-${hour}`,
          display: `${hour}:00 - ${hour + 2}:00`,
          available: true, // In a real app, check against available slots
          date: slotTime
        });
      }
    }
    
    setDeliverySlots(slots);
  }, []);

  // Update delivery fee based on location and cart total
  const updateDeliveryFee = useCallback(() => {
    if (!userLocation) return;
    
    // In a real app, this would be calculated based on distance, cart value, etc.
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let fee = 40; // Base fee
    
    // Free delivery for orders above 500
    if (subtotal > 500) {
      fee = 0;
    }
    
    setDeliveryFee(fee);
    
    // Update user location with fee
    setUserLocation(prev => prev ? { ...prev, deliveryFee: fee } : null);
  }, [cart, userLocation]);

  // Update delivery fee when cart or location changes
  useEffect(() => {
    // Only update if cart has items and userLocation exists
    if (cart.length > 0 && userLocation) {
      updateDeliveryFee();
    }
  }, [cart.length, userLocation?.pincode]);

  const checkout = useCallback(async (paymentMethod: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate cart is not empty
      if (cart.length === 0) {
        throw new Error('Your cart is empty. Please add items before checking out.');
      }
      
      // Validate delivery address
      if (!userLocation?.pincode) {
        throw new Error('Please enter a delivery address');
      }
      
      // Validate delivery slot
      if (!selectedDeliverySlot) {
        throw new Error('Please select a delivery slot');
      }
      
      // Validate minimum order amount (e.g., ₹100)
      const cartSummary = getCartSummary();
      if (cartSummary.subtotal < 100) {
        throw new Error('Minimum order amount is ₹100');
      }
      
      // Check stock availability for all items
      const outOfStockItems = cart.filter(item => !validateStock(item.id, item.quantity));
      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map(item => item.name).join(', ');
        throw new Error(`Sorry, the following items are out of stock or quantity not available: ${itemNames}`);
      }
      
      // Prepare order data
      const order = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          note: item.note,
          isGiftWrapped: item.isGiftWrapped,
          giftMessage: item.giftMessage
        })),
        deliveryAddress: userLocation,
        deliverySlot: selectedDeliverySlot,
        paymentMethod: {
          ...paymentMethod,
          // Mask sensitive data in logs
          cardNumber: paymentMethod?.cardNumber ? `•••• •••• •••• ${paymentMethod.cardNumber.slice(-4)}` : undefined
        },
        subtotal: cartSummary.subtotal,
        deliveryFee: cartSummary.deliveryFee,
        discount: cartSummary.discount || 0,
        tax: cartSummary.tax || 0,
        total: cartSummary.total,
        appliedCoupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discount: appliedCoupon.discount,
          freeShipping: appliedCoupon.freeShipping
        } : null,
        timestamp: new Date().toISOString()
      };
      
      console.log('Processing order:', order);
      
      try {
        // Create order via real API
        const orderData = {
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image || undefined
          })),
          totalAmount: cartSummary.total,
          paymentStatus: 'paid', // Assuming payment is successful
          paymentMethod: paymentMethod?.type || 'card',
          shippingAddress: {
            name: userLocation.name || 'Customer',
            phone: userLocation.phone || '',
            address: userLocation.address || '',
            city: userLocation.city || '',
            state: userLocation.state || '',
            pincode: userLocation.pincode
          },
          deliverySlot: (selectedDeliverySlot as any)?.display || selectedDeliverySlot || ''
        };

        const response = await fetch('http://localhost:5001/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Note: In a real app, you'd include auth token here
            // 'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          throw new Error('Failed to create order');
        }

        const createdOrder = await response.json();
        
        // Clear cart on successful checkout
        clearCart();
        
        return { 
          success: true, 
          orderId: createdOrder.id,
          trackingNumber: createdOrder.trackingNumber
        };
      } catch (apiError) {
        console.error('API Error during checkout:', apiError);
        throw new Error(apiError instanceof Error ? apiError.message : 'Failed to process payment');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order';
      setError(errorMessage);
      // Re-throw the error so the component can handle it if needed
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cart, userLocation, selectedDeliverySlot, appliedCoupon, clearCart]);

  // Add localStorage persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const contextValue: CartContextType = {
    cart,
    savedForLater,
    cartExpiry,
    isLoading,
    error,
    userLocation,
    userPreferences: userPreferences || {
      savedAddresses: [],
      recentSearches: [],
      interests: [],
      dietaryPreferences: []
    },
    deliveryFee,
    isExpired: isExpired || false,
    isAuthenticated: !!user,
    deliverySlots: generateDeliverySlots(),
    selectedDeliverySlot,
    addToCart,
    removeFromCart,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeFromSaved,
    applyCoupon: (code: string) => {
      const mockCoupons = [
        { code: 'WELCOME10', discount: 10, minPurchase: 500 },
        { code: 'FREESHIP', discount: 0, freeShipping: true },
      ];
      
      const coupon = mockCoupons.find(c => c.code === code);
      if (coupon) {
        setAppliedCoupon(coupon);
        if (coupon.freeShipping) {
          setDeliveryFee(0);
        }
        return true;
      }
      return false;
    },
    removeCoupon: () => {
      setAppliedCoupon(null);
      // Recalculate delivery fee when coupon is removed
      updateDeliveryFee();
      return true;
    },
    clearCart,
    getCartSummary,
    getCartItemCount,
    getCartTotal,
    addBulkToCart: bulkAddToCart,
    shareCart,
    updateNote,
    toggleGiftWrap,
    validateStock,
    getLowStockItems,
    checkout,
    setSelectedDeliverySlot,
    setUserLocation: async (location: UserLocation) => {
      setUserLocation(location);
      // In a real app, you would validate the address and update delivery options
      await updateDeliverySlots();
      updateDeliveryFee();
    },
    updateUserPreferences: (updates: Partial<UserPreferences>) => {
      const updatedPreferences = {
        ...userPreferences,
        ...updates,
        savedAddresses: updates.savedAddresses || userPreferences?.savedAddresses || [],
      };
      setUserPreferences(updatedPreferences);
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    }
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
