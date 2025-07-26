(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_695bcd._.js", {

"[project]/client/src/context/CartContext.tsx [app-client] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, k: __turbopack_refresh__ }) => (() => {
"use strict";

__turbopack_esm__({
    "CartProvider": ()=>CartProvider,
    "useCart": ()=>useCart
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$debounce$2f$dist$2f$index$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/use-debounce/dist/index.module.js [app-client] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
var _s = __turbopack_refresh__.signature(), _s1 = __turbopack_refresh__.signature();
'use client';
;
;
const CART_STORAGE_KEY = 'tendercutsCart';
const SAVED_ITEMS_KEY = 'tendercutsSavedItems';
const CART_EXPIRY_HOURS = 1;
const SHOP_LOCATION = {
    lat: 12.9716,
    lng: 80.0387
};
const BASE_DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 5;
const FEE_PER_KM = 10;
const MAX_DELIVERY_DISTANCE = 15;
// Utility functions
const getCartTotal = (items)=>{
    return items.reduce((total, item)=>total + item.price * item.quantity, 0);
};
const getItemCount = (items)=>{
    return items.reduce((count, item)=>count + item.quantity, 0);
};
const getCartSummary = (items)=>{
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
const calculateDistance = (lat1, lon1, lat2, lon2)=>{
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};
const calculateDeliveryFee = async (location)=>{
    if (!location.coordinates) {
        return BASE_DELIVERY_FEE; // Default fee if no coordinates
    }
    const distance = calculateDistance(SHOP_LOCATION.lat, SHOP_LOCATION.lng, location.coordinates.lat, location.coordinates.lng);
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
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const useCart = ()=>{
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
_s(useCart, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const CartProvider = ({ children })=>{
    _s1();
    const [cart, setCart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [savedForLater, setSavedForLater] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [cartExpiry, setCartExpiry] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [userLocation, setUserLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [userPreferences, setUserPreferences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deliveryFee, setDeliveryFee] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [appliedCoupon, setAppliedCoupon] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isExpired, setIsExpired] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deliverySlots, setDeliverySlots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const generateDeliverySlots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
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
        for(let day = 0; day < 2; day++){
            const date = new Date(now);
            date.setDate(now.getDate() + day);
            const startHour = day === 0 ? currentHour : 8; // Start from current hour for today, 8 AM for next days
            const endHour = 20; // End at 8 PM
            for(let hour = startHour; hour < endHour; hour++){
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
    const [selectedDeliverySlot, setSelectedDeliverySlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [debouncedCart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$debounce$2f$dist$2f$index$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebounce"])(cart, 1000);
    const clearCorruptedCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
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
    }, [
        setCart,
        setSavedForLater,
        setCartExpiry,
        setAppliedCoupon,
        setError
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        loadCartData();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
    }, [
        cart,
        savedForLater,
        cartExpiry,
        appliedCoupon
    ]);
    // Clear corrupted cart data on error
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (error) {
            console.log('Error detected, clearing cart data...');
            clearCorruptedCart();
        }
    }, [
        error,
        clearCorruptedCart
    ]);
    // Mock function to get item stock - replace with actual API call
    const getItemStock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId)=>{
        // In a real app, this would call your API to get current stock
        // For now, return -1 to indicate unlimited stock
        return -1;
    }, []);
    // Check if an item is low in stock
    const isItemLowStock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId)=>{
        const availableStock = getItemStock(itemId);
        return availableStock !== -1 && availableStock <= 5; // Consider low stock if 5 or fewer items
    }, [
        getItemStock
    ]);
    // Validate stock for a specific item and quantity
    const validateStock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId, quantity)=>{
        const availableStock = getItemStock(itemId);
        return availableStock === -1 || quantity <= availableStock;
    }, [
        getItemStock
    ]);
    // Get items that are low in stock
    const getLowStockItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        return cart.filter((item)=>isItemLowStock(item.id));
    }, [
        cart,
        isItemLowStock
    ]);
    const loadCartData = ()=>{
        if (typeof window === 'undefined') return;
        try {
            const parseJSON = (value, defaultValue = [])=>{
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
    const checkExpiry = (expiryDate)=>{
        const now = new Date();
        if (now > expiryDate) {
            setIsExpired(true);
            clearCart();
        } else {
            setIsExpired(false);
            // Set a timeout to clear the cart when it expires
            const timeout = expiryDate.getTime() - now.getTime();
            const timer = setTimeout(()=>{
                setIsExpired(true);
                clearCart();
            }, timeout);
            return ()=>clearTimeout(timer);
        }
    };
    const addToCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((item, quantity = 1)=>{
        setCart((prevCart)=>{
            // Generate a unique ID for the item if it doesn't have one
            // Use name and type as part of the ID to make it more consistent
            const itemId = `${item.name.replace(/\s+/g, '-').toLowerCase()}-${item.type.toLowerCase()}-${Date.now()}`;
            // Check if a similar item already exists in the cart (by name and type)
            const existingItemIndex = prevCart.findIndex((cartItem)=>cartItem.name === item.name && cartItem.type === item.type);
            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const updatedCart = [
                    ...prevCart
                ];
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
                const newItem = {
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
                return [
                    ...prevCart,
                    newItem
                ];
            }
        });
        // Clear error after 3 seconds
        setTimeout(()=>setError(null), 3000);
    }, [
        getItemStock
    ]);
    const removeFromCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId)=>{
        setCart((prevCart)=>prevCart.filter((item)=>item.id !== itemId));
    }, []);
    const updateQuantity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId, newQuantity)=>{
        if (newQuantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        // Check stock before updating
        const availableStock = getItemStock(itemId);
        if (availableStock !== -1 && newQuantity > availableStock) {
            setError(`Only ${availableStock} items available in stock`);
            setTimeout(()=>setError(null), 3000);
            return;
        }
        setCart((prevCart)=>prevCart.map((item)=>item.id === itemId ? {
                    ...item,
                    quantity: newQuantity
                } : item));
    }, [
        removeFromCart,
        getItemStock
    ]);
    const updateItemNote = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId, note)=>{
        setCart((prevCart)=>prevCart.map((item)=>item.id === itemId ? {
                    ...item,
                    note
                } : item));
    }, []);
    const clearCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setCart([]);
        setCartExpiry(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(CART_STORAGE_KEY);
            localStorage.removeItem('cartExpiry');
        }
    }, []);
    const saveForLater = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId)=>{
        setCart((prevCart)=>{
            const itemToSave = prevCart.find((item)=>item.id === itemId);
            if (!itemToSave) return prevCart;
            setSavedForLater((prevSaved)=>{
                const existingIndex = prevSaved.findIndex((item)=>item.id === itemId);
                if (existingIndex > -1) {
                    const updated = [
                        ...prevSaved
                    ];
                    updated[existingIndex].quantity += itemToSave.quantity;
                    return updated;
                }
                return [
                    ...prevSaved,
                    {
                        ...itemToSave
                    }
                ];
            });
            return prevCart.filter((item)=>item.id !== itemId);
        });
    }, []);
    const moveToCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId)=>{
        setSavedForLater((prevSaved)=>{
            const itemToMove = prevSaved.find((item)=>item.id === itemId);
            if (!itemToMove) return prevSaved;
            addToCart(itemToMove, itemToMove.quantity);
            return prevSaved.filter((item)=>item.id !== itemId);
        });
    }, [
        addToCart
    ]);
    const applyCoupon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(async (code)=>{
        // In a real app, this would call your API to validate the coupon
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve)=>setTimeout(resolve, 1000));
            // Mock validation - in a real app, this would come from your API
            const isValid = code.toUpperCase() === 'WELCOME10';
            if (!isValid) {
                setError('Invalid coupon code');
                setTimeout(()=>setError(null), 3000);
            }
            return isValid;
        } catch (err) {
            setError('Failed to apply coupon');
            setTimeout(()=>setError(null), 3000);
            return false;
        } finally{
            setIsLoading(false);
        }
    }, []);
    const bulkAddToCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((items)=>{
        // Validate stock for all items first
        const hasInsufficientStock = items.some((item)=>{
            const itemId = 'id' in item ? String(item.id) : String(Math.random());
            const availableStock = getItemStock(itemId);
            return availableStock !== -1 && (item.quantity || 0) > availableStock;
        });
        if (hasInsufficientStock) {
            setError('One or more items have insufficient stock');
            setTimeout(()=>setError(null), 3000);
            return;
        }
        // If all items have sufficient stock, add them to cart
        items.forEach((item)=>{
            addToCart(item, item.quantity || 1);
        });
    }, [
        addToCart,
        getItemStock
    ]);
    const getCartItemCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        return cart.reduce((sum, item)=>sum + item.quantity, 0);
    }, [
        cart
    ]);
    const getCartTotal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((items)=>{
        if (!items || items.length === 0) return 0;
        return items.reduce((total, item)=>total + item.price * item.quantity, 0);
    }, []);
    const getCartSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const subtotal = cart.reduce((sum, item)=>sum + item.price * item.quantity, 0);
        const itemCount = getCartItemCount();
        const tax = subtotal * 0.05; // 5% tax
        const shipping = subtotal > 0 ? deliveryFee > 0 ? deliveryFee : 0 : 0;
        const total = subtotal + tax + shipping - (appliedCoupon?.discount || 0);
        return {
            subtotal,
            itemCount,
            deliveryFee: shipping,
            tax,
            total,
            discount: appliedCoupon?.discount
        };
    }, [
        cart,
        deliveryFee,
        appliedCoupon,
        getCartItemCount
    ]);
    const shareCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
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
    }, [
        getCartSummary
    ]);
    const removeFromSaved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId)=>{
        setSavedForLater((prev)=>prev.filter((item)=>item.id !== itemId));
    }, []);
    const updateNote = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId, note)=>{
        setCart((prevCart)=>prevCart.map((item)=>item.id === itemId ? {
                    ...item,
                    note
                } : item));
    }, []);
    const toggleGiftWrap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((itemId, isGiftWrapped, giftMessage)=>{
        setCart((prevCart)=>prevCart.map((item)=>item.id === itemId ? {
                    ...item,
                    isGiftWrapped,
                    giftMessage: isGiftWrapped ? giftMessage : undefined
                } : item));
    }, []);
    // Initialize user preferences and location
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadUserData = async ()=>{
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
                        navigator.geolocation.getCurrentPosition(async (position)=>{
                            try {
                                const { latitude, longitude } = position.coords;
                                // In a real app, you would reverse geocoding these coordinates
                                const location = {
                                    address: 'Detected Location',
                                    coordinates: {
                                        lat: latitude,
                                        lng: longitude
                                    },
                                    pincode: '600001',
                                    deliveryAvailable: true,
                                    deliveryTime: '30-45 mins',
                                    deliveryFee: 40
                                };
                                setUserLocation(location);
                                await updateDeliverySlots();
                            } catch (positionError) {
                                console.error('Error processing position data:', positionError);
                                // Use default location instead of showing error
                                const defaultLocation = {
                                    address: 'Chennai, Tamil Nadu',
                                    coordinates: {
                                        lat: 13.0827,
                                        lng: 80.2707
                                    },
                                    pincode: '600001',
                                    deliveryAvailable: true,
                                    deliveryTime: '30-45 mins',
                                    deliveryFee: 40
                                };
                                setUserLocation(defaultLocation);
                            }
                        }, (geoError)=>{
                            console.error('Geolocation permission denied:', geoError.message);
                            // Use default location instead of showing error
                            const defaultLocation = {
                                address: 'Chennai, Tamil Nadu',
                                coordinates: {
                                    lat: 13.0827,
                                    lng: 80.2707
                                },
                                pincode: '600001',
                                deliveryAvailable: true,
                                deliveryTime: '30-45 mins',
                                deliveryFee: 40
                            };
                            setUserLocation(defaultLocation);
                        }, // Additional options for geolocation
                        {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        });
                    } catch (geolocationError) {
                        console.error('Geolocation API error:', geolocationError);
                        // Use default location instead of showing error
                        const defaultLocation = {
                            address: 'Chennai, Tamil Nadu',
                            coordinates: {
                                lat: 13.0827,
                                lng: 80.2707
                            },
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
            } finally{
                setIsLoading(false);
            }
        };
        loadUserData();
    }, []);
    // Update delivery slots based on current time and location
    const updateDeliverySlots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const now = new Date();
        const slots = [];
        let currentHour = now.getHours();
        // Generate slots for next 2 days
        for(let day = 0; day < 2; day++){
            const date = new Date(now);
            date.setDate(now.getDate() + day);
            const startHour = day === 0 ? currentHour < 22 ? currentHour + 1 : 0 : 8;
            const endHour = day === 0 ? 22 : 20; // Evening cutoff
            for(let hour = startHour; hour <= endHour; hour += 2){
                const slotTime = new Date(date);
                slotTime.setHours(hour, 0, 0, 0);
                slots.push({
                    id: `${day}-${hour}`,
                    display: `${hour}:00 - ${hour + 2}:00`,
                    available: true,
                    date: slotTime
                });
            }
        }
        setDeliverySlots(slots);
    }, []);
    // Update delivery fee based on location and cart total
    const updateDeliveryFee = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!userLocation) return;
        // In a real app, this would be calculated based on distance, cart value, etc.
        const subtotal = cart.reduce((sum, item)=>sum + item.price * item.quantity, 0);
        let fee = 40; // Base fee
        // Free delivery for orders above 500
        if (subtotal > 500) {
            fee = 0;
        }
        setDeliveryFee(fee);
        // Update user location with fee
        setUserLocation((prev)=>prev ? {
                ...prev,
                deliveryFee: fee
            } : null);
    }, [
        cart,
        userLocation
    ]);
    // Update delivery fee when cart or location changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Only update if cart has items and userLocation exists
        if (cart.length > 0 && userLocation) {
            updateDeliveryFee();
        }
    }, [
        cart.length,
        userLocation?.pincode
    ]);
    const checkout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(async (paymentMethod)=>{
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
            const outOfStockItems = cart.filter((item)=>!validateStock(item.id, item.quantity));
            if (outOfStockItems.length > 0) {
                const itemNames = outOfStockItems.map((item)=>item.name).join(', ');
                throw new Error(`Sorry, the following items are out of stock or quantity not available: ${itemNames}`);
            }
            // Prepare order data
            const order = {
                items: cart.map((item)=>({
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
                    items: cart.map((item)=>({
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            image: item.src || undefined
                        })),
                    totalAmount: cartSummary.total,
                    paymentStatus: 'paid',
                    paymentMethod: paymentMethod?.type || 'card',
                    shippingAddress: {
                        name: userLocation.name || 'Customer',
                        phone: userLocation.phone || '',
                        address: userLocation.address || '',
                        city: userLocation.city || '',
                        state: userLocation.state || '',
                        pincode: userLocation.pincode
                    },
                    deliverySlot: selectedDeliverySlot?.display || 'Not selected'
                };
                const response = await fetch('http://localhost:5001/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
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
        } finally{
            setIsLoading(false);
        }
    }, [
        cart,
        userLocation,
        selectedDeliverySlot,
        appliedCoupon,
        clearCart
    ]);
    // Add localStorage persistence
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [
        cart
    ]);
    const contextValue = {
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
        applyCoupon: (code)=>{
            const mockCoupons = [
                {
                    code: 'WELCOME10',
                    discount: 10,
                    minPurchase: 500
                },
                {
                    code: 'FREESHIP',
                    discount: 0,
                    freeShipping: true
                }
            ];
            const coupon = mockCoupons.find((c)=>c.code === code);
            if (coupon) {
                setAppliedCoupon(coupon);
                if (coupon.freeShipping) {
                    setDeliveryFee(0);
                }
                return true;
            }
            return false;
        },
        removeCoupon: ()=>{
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
        setUserLocation: async (location)=>{
            setUserLocation(location);
            // In a real app, you would validate the address and update delivery options
            await updateDeliverySlots();
            updateDeliveryFee();
        },
        updateUserPreferences: (updates)=>{
            const updatedPreferences = {
                ...userPreferences,
                ...updates,
                savedAddresses: updates.savedAddresses || userPreferences?.savedAddresses || []
            };
            setUserPreferences(updatedPreferences);
            // Save to localStorage
            localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CartContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/client/src/context/CartContext.tsx",
        lineNumber: 1087,
        columnNumber: 5
    }, this);
};
_s1(CartProvider, "tFqEpO9PbIFDahCidUZzKdhgBak=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$debounce$2f$dist$2f$index$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebounce"]
    ];
});
_c = CartProvider;
var _c;
__turbopack_refresh__.register(_c, "CartProvider");

})()),
"[project]/client/src/components/home/TrustBadgesNew.tsx [app-client] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, k: __turbopack_refresh__ }) => (() => {
"use strict";

__turbopack_esm__({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fish$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Fish$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/fish.js [app-client] (ecmascript) <export default as Fish>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$anchor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Anchor$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/anchor.js [app-client] (ecmascript) <export default as Anchor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/waves.js [app-client] (ecmascript) <export default as Waves>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/tag.js [app-client] (ecmascript) <export default as Tag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shuffle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shuffle$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/shuffle.js [app-client] (ecmascript) <export default as Shuffle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$context$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/client/src/context/CartContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
;
;
;
const TrustBadges = ({ fishCards: propsFishCards })=>{
    _s();
    const [currentIndex, setCurrentIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isRandomizing, setIsRandomizing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showLuckyFish, setShowLuckyFish] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [luckyFish, setLuckyFish] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [startX, setStartX] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [currentX, setCurrentX] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [dragOffset, setDragOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [randomPickCount, setRandomPickCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [lastPickTime, setLastPickTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isWishlisted, setIsWishlisted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { addToCart } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$context$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])();
    // Debug rendering
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log("TrustBadges component mounted", propsFishCards);
    }, [
        propsFishCards
    ]);
    // Enhanced fish cards data with proper images and nutrition info
    const defaultFishCards = [
        {
            id: 'seer',
            name: 'Seer Fish (Vanjaram)',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop',
            category: 'Premium Catch',
            price: 899,
            originalPrice: 999,
            weight: '500g',
            freshness: 'Fresh Today',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fish$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Fish$3e$__["Fish"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 63,
                columnNumber: 13
            }, this),
            color: 'bg-gradient-to-br from-red-500 to-red-600',
            rating: 4.8,
            description: 'Rich in omega-3, perfect for grilling & curry'
        },
        {
            id: 'prawns',
            name: 'Tiger Prawns',
            image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
            category: 'Fresh Shellfish',
            price: 599,
            originalPrice: 699,
            weight: '250g',
            freshness: 'Just Caught',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$anchor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Anchor$3e$__["Anchor"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 77,
                columnNumber: 13
            }, this),
            color: 'bg-gradient-to-br from-orange-500 to-red-500',
            rating: 4.6,
            description: 'Juicy and flavorful, perfect for curries & frying'
        },
        {
            id: 'salmon',
            name: 'Indian Salmon',
            image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop',
            category: 'Premium Catch',
            price: 1299,
            originalPrice: 1499,
            weight: '1kg',
            freshness: 'Ocean Fresh',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__["Waves"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 91,
                columnNumber: 13
            }, this),
            color: 'bg-gradient-to-br from-pink-500 to-red-500',
            rating: 4.9,
            description: 'High in protein & omega-3, ideal for steaks'
        },
        {
            id: 'pomfret',
            name: 'White Pomfret',
            image: 'https://images.unsplash.com/photo-1605651377861-348620a3faae?q=80&w=2070&auto=format&fit=crop',
            category: 'Premium Catch',
            price: 1099,
            originalPrice: 1299,
            weight: '700g',
            freshness: 'Fresh Today',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fish$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Fish$3e$__["Fish"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 105,
                columnNumber: 13
            }, this),
            color: 'bg-gradient-to-br from-blue-500 to-red-500',
            rating: 4.7,
            description: 'Delicate white flesh, perfect for whole fish frying'
        },
        {
            id: 'kingfish',
            name: 'King Fish (Surmai)',
            image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?q=80&w=2070&auto=format&fit=crop',
            category: 'Daily Fresh',
            price: 749,
            originalPrice: 849,
            weight: '500g',
            freshness: 'Morning Catch',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 119,
                columnNumber: 13
            }, this),
            color: 'bg-gradient-to-br from-purple-500 to-red-500',
            rating: 4.5,
            description: 'Firm texture, excellent for steaks & grilling'
        },
        {
            id: 'crab',
            name: 'Mud Crab',
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop',
            category: 'Live Shellfish',
            price: 1599,
            originalPrice: 1799,
            weight: '1kg',
            freshness: 'Live & Fresh',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 133,
                columnNumber: 13
            }, this),
            color: 'bg-gradient-to-br from-green-500 to-red-600',
            rating: 4.9,
            description: 'Sweet meat, perfect for crab curry & masala'
        }
    ];
    // Use the provided fishCards from props if available, otherwise use default
    const fishCards = propsFishCards && propsFishCards.length > 0 ? propsFishCards.map((card)=>({
            ...card,
            icon: getIconComponent(card.iconName || 'Fish')
        })) : defaultFishCards;
    const trustBadges = [
        {
            id: 'fssai',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                className: "w-4 h-4 text-green-600"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 151,
                columnNumber: 13
            }, this),
            title: 'FSSAI',
            description: 'Certified',
            color: 'bg-green-50 border-green-200'
        },
        {
            id: 'fresh',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                className: "w-4 h-4 text-blue-600"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 158,
                columnNumber: 13
            }, this),
            title: 'Same Day',
            description: 'Delivery',
            color: 'bg-blue-50 border-blue-200'
        },
        {
            id: 'price',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                className: "w-4 h-4 text-red-600"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 165,
                columnNumber: 13
            }, this),
            title: 'Best',
            description: 'Price',
            color: 'bg-red-50 border-red-200'
        },
        {
            id: 'quality',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                className: "w-4 h-4 text-yellow-600"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 172,
                columnNumber: 13
            }, this),
            title: 'Premium',
            description: 'Quality',
            color: 'bg-yellow-50 border-yellow-200'
        }
    ];
    // Helper function to get icon component from iconName
    function getIconComponent(iconName) {
        switch(iconName?.toLowerCase()){
            case 'fish':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fish$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Fish$3e$__["Fish"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 182,
                    columnNumber: 27
                }, this);
            case 'anchor':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$anchor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Anchor$3e$__["Anchor"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 183,
                    columnNumber: 29
                }, this);
            case 'waves':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__["Waves"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 184,
                    columnNumber: 28
                }, this);
            case 'shield':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 185,
                    columnNumber: 29
                }, this);
            case 'clock':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 186,
                    columnNumber: 28
                }, this);
            case 'tag':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tag$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tag$3e$__["Tag"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 187,
                    columnNumber: 26
                }, this);
            case 'star':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 188,
                    columnNumber: 27
                }, this);
            case 'heart':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 189,
                    columnNumber: 28
                }, this);
            case 'cart':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 190,
                    columnNumber: 27
                }, this);
            case 'sparkles':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 191,
                    columnNumber: 31
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$fish$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Fish$3e$__["Fish"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 192,
                    columnNumber: 23
                }, this);
        }
    }
    // Check if device is mobile
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const checkMobile = ()=>{
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return ()=>window.removeEventListener('resize', checkMobile);
    }, []);
    // Function to get a random fish with user preferences
    const getRandomFish = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        // Add some user preference logic - prioritize higher rated fish occasionally
        const shouldPrioritizeRating = Math.random() > 0.7; // 30% chance to prioritize rating
        if (shouldPrioritizeRating) {
            const highRatedFish = fishCards.filter((fish)=>fish.rating >= 4.7);
            if (highRatedFish.length > 0) {
                const randomIndex = Math.floor(Math.random() * highRatedFish.length);
                return highRatedFish[randomIndex];
            }
        }
        const randomIndex = Math.floor(Math.random() * fishCards.length);
        return fishCards[randomIndex];
    }, [
        fishCards
    ]);
    // Navigation functions
    const nextCard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setCurrentIndex((prev)=>prev === fishCards.length - 1 ? 0 : prev + 1);
    }, [
        fishCards.length
    ]);
    const prevCard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setCurrentIndex((prev)=>prev === 0 ? fishCards.length - 1 : prev - 1);
    }, [
        fishCards.length
    ]);
    // Enhanced lucky fish selection with user tracking
    const handleFeelingLucky = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setIsRandomizing(true);
        setShowLuckyFish(false);
        // Update user interaction tracking
        setRandomPickCount((prev)=>prev + 1);
        setLastPickTime(new Date());
        // Create a fun randomization effect with more fish variety
        const randomizationDuration = 2000; // 2 seconds
        const intervalDuration = 80; // Faster switching
        let randomizationCount = 0;
        const interval = setInterval(()=>{
            setLuckyFish(getRandomFish());
            randomizationCount++;
            // Slow down towards the end for better UX
            if (randomizationCount > 15) {
                clearInterval(interval);
                // Final selection with a slight delay for suspense
                setTimeout(()=>{
                    const finalFish = getRandomFish();
                    setLuckyFish(finalFish);
                    setShowLuckyFish(true);
                    setIsRandomizing(false);
                    // Find and set the index of the lucky fish
                    const luckyIndex = fishCards.findIndex((fish)=>fish.id === finalFish.id);
                    if (luckyIndex !== -1) {
                        setCurrentIndex(luckyIndex);
                    }
                    // Show success message
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`🎣 Lucky catch: ${finalFish.name}! Fresh and ready to order.`);
                }, 300);
            }
        }, intervalDuration);
    }, [
        fishCards,
        getRandomFish
    ]);
    // Add to cart functionality with proper Fish interface
    const handleAddToCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((fish)=>{
        try {
            const cartItem = {
                name: fish.name,
                src: fish.image,
                type: fish.category,
                price: fish.price,
                omega3: 2.5,
                protein: 18.5,
                calories: 150,
                benefits: [
                    'High Protein',
                    'Omega-3 Rich',
                    'Fresh Catch'
                ],
                bestFor: [
                    'Grilling',
                    'Curry',
                    'Frying'
                ],
                rating: fish.rating,
                description: fish.description,
                serves: '2-3 people',
                netWeight: fish.weight,
                grossWeight: fish.weight,
                originalPrice: fish.originalPrice,
                quantity: 1
            };
            addToCart(cartItem, 1);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`🛒 ${fish.name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Failed to add item to cart. Please try again.');
        }
    }, [
        addToCart
    ]);
    // Toggle wishlist functionality
    const toggleWishlist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((fishId)=>{
        setIsWishlisted((prev)=>({
                ...prev,
                [fishId]: !prev[fishId]
            }));
        const fish = fishCards.find((f)=>f.id === fishId);
        if (fish) {
            const isNowWishlisted = !isWishlisted[fishId];
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(isNowWishlisted ? `💝 ${fish.name} added to wishlist!` : `${fish.name} removed from wishlist`);
        }
    }, [
        isWishlisted,
        fishCards
    ]);
    // Improved touch event handlers for mobile swipe
    const handleTouchStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
        setCurrentX(e.touches[0].clientX);
        setDragOffset(0);
    }, []);
    const handleTouchMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (!isDragging) return;
        const newCurrentX = e.touches[0].clientX;
        const diff = newCurrentX - startX;
        // Add resistance at the edges
        const resistance = 0.5;
        const maxDrag = containerRef.current ? containerRef.current.offsetWidth * 0.8 : 300;
        let adjustedDiff = diff;
        if (Math.abs(diff) > maxDrag) {
            adjustedDiff = diff > 0 ? maxDrag + (diff - maxDrag) * resistance : -maxDrag + (diff + maxDrag) * resistance;
        }
        setCurrentX(newCurrentX);
        setDragOffset(adjustedDiff);
    }, [
        isDragging,
        startX
    ]);
    const handleTouchEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!isDragging) return;
        setIsDragging(false);
        // Determine if we should switch cards based on swipe distance and velocity
        const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.25 : 75;
        if (Math.abs(dragOffset) > threshold) {
            if (dragOffset > 0) {
                prevCard();
            } else {
                nextCard();
            }
        }
        setDragOffset(0);
    }, [
        isDragging,
        dragOffset,
        prevCard,
        nextCard
    ]);
    // Render star rating
    const renderStars = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])((rating)=>{
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center space-x-0.5",
            children: [
                [
                    1,
                    2,
                    3,
                    4,
                    5
                ].map((star)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                        className: `w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`
                    }, star, false, {
                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                        lineNumber: 373,
                        columnNumber: 11
                    }, this)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-gray-600 ml-1",
                    children: rating
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 382,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
            lineNumber: 371,
            columnNumber: 7
        }, this);
    }, []);
    // Mobile Layout with enhanced UX
    if (isMobile) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            id: "mobile-trust-badges",
            className: "py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-pink-50 overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center mb-6 sm:mb-8 lg:mb-10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4",
                            children: "🐟 Fresh Seafood Collection"
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 392,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 mb-4 sm:mb-5 lg:mb-6 text-sm sm:text-base",
                            children: "Swipe to discover your perfect catch! Or try your luck with our fish picker."
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 395,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleFeelingLucky,
                            disabled: isRandomizing,
                            className: `mb-4 sm:mb-5 lg:mb-6 px-6 sm:px-7 lg:px-8 py-3 sm:py-3.5 lg:py-4 rounded-full font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${isRandomizing ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'}`,
                            children: isRandomizing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                className: "opacity-25",
                                                cx: "12",
                                                cy: "12",
                                                r: "10",
                                                stroke: "currentColor",
                                                strokeWidth: "4"
                                            }, void 0, false, {
                                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                                lineNumber: 411,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                className: "opacity-75",
                                                fill: "currentColor",
                                                d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            }, void 0, false, {
                                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                                lineNumber: 412,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 410,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm sm:text-base",
                                        children: "Picking..."
                                    }, void 0, false, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 414,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 409,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shuffle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shuffle$3e$__["Shuffle"], {
                                        className: "w-4 h-4 sm:w-5 sm:h-5 mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 418,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm sm:text-base",
                                        children: "🎲 Feeling Lucky?"
                                    }, void 0, false, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 419,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 417,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 399,
                            columnNumber: 11
                        }, this),
                        randomPickCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                y: 10
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            className: "mt-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-red-100",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-medium text-red-700",
                                children: [
                                    "🎯 You've tried your luck ",
                                    randomPickCount,
                                    " time",
                                    randomPickCount > 1 ? 's' : '',
                                    "!"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 431,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 426,
                            columnNumber: 13
                        }, this),
                        showLuckyFish && luckyFish && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                scale: 0.8
                            },
                            animate: {
                                opacity: 1,
                                scale: 1
                            },
                            className: "mt-4 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl shadow-lg border border-green-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-bold text-green-800 mb-1",
                                    children: [
                                        "🎉 Lucky Catch: ",
                                        luckyFish.name,
                                        "!"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 444,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-green-600",
                                    children: "Perfect for your next meal - add to cart now!"
                                }, void 0, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 447,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 439,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 391,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative max-w-sm mx-auto h-[520px] touch-pan-y",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: containerRef,
                            className: `relative h-full transition-transform duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`,
                            style: {
                                transform: `translateX(${dragOffset}px)`
                            },
                            onTouchStart: handleTouchStart,
                            onTouchMove: handleTouchMove,
                            onTouchEnd: handleTouchEnd,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                mode: "sync",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        x: 50
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        x: -50
                                    },
                                    transition: {
                                        duration: isDragging ? 0 : 0.3
                                    },
                                    className: "absolute inset-0",
                                    children: renderFishCard(fishCards[currentIndex], true)
                                }, currentIndex, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 468,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 467,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 456,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: prevCard,
                            className: "absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-red-100 text-red-600 hover:text-red-700 hover:bg-white transition-all duration-200",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 488,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 484,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: nextCard,
                            className: "absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-red-100 text-red-600 hover:text-red-700 hover:bg-white transition-all duration-200",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 494,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 490,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 455,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center mt-6 space-x-2",
                    children: fishCards.map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setCurrentIndex(index),
                            className: `w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-red-500 w-6' : 'bg-red-200 hover:bg-red-300'}`
                        }, index, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 501,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 499,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-3 mt-8",
                    children: trustBadges.map((badge)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            whileHover: {
                                scale: 1.02
                            },
                            whileTap: {
                                scale: 0.98
                            },
                            className: `flex items-center p-3 rounded-xl border ${badge.color} shadow-sm`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mr-3",
                                    children: badge.icon
                                }, void 0, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 522,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-gray-800",
                                            children: badge.title
                                        }, void 0, false, {
                                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                            lineNumber: 526,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-600",
                                            children: badge.description
                                        }, void 0, false, {
                                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                            lineNumber: 527,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 525,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, badge.id, true, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 516,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 514,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
            lineNumber: 389,
            columnNumber: 7
        }, this);
    }
    // Desktop Layout remains similar but with enhanced styling
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "desktop-trust-badges",
        className: "py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-pink-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center mb-8 sm:mb-10 lg:mb-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-5",
                        children: "🐟 Fresh Seafood Collection"
                    }, void 0, false, {
                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                        lineNumber: 540,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed",
                        children: "Discover our premium selection of fresh seafood, sourced daily from trusted fishermen. Try your luck with our random fish picker or browse our curated collection."
                    }, void 0, false, {
                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                        lineNumber: 543,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleFeelingLucky,
                        disabled: isRandomizing,
                        className: `mb-6 sm:mb-8 lg:mb-10 px-6 sm:px-7 lg:px-8 py-3 sm:py-3.5 lg:py-4 rounded-full font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base lg:text-lg ${isRandomizing ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'}`,
                        children: isRandomizing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                            className: "opacity-25",
                                            cx: "12",
                                            cy: "12",
                                            r: "10",
                                            stroke: "currentColor",
                                            strokeWidth: "4"
                                        }, void 0, false, {
                                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                            lineNumber: 560,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            className: "opacity-75",
                                            fill: "currentColor",
                                            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        }, void 0, false, {
                                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                            lineNumber: 561,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 559,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Finding your perfect catch..."
                                }, void 0, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 563,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 558,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shuffle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shuffle$3e$__["Shuffle"], {
                                    className: "w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3"
                                }, void 0, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 567,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "🎲 Feeling Lucky? Pick My Fish!"
                                }, void 0, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 568,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 566,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                        lineNumber: 548,
                        columnNumber: 9
                    }, this),
                    "        ",
                    randomPickCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 10
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        className: "mb-6 sm:mb-8 lg:mb-10 inline-block px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-red-100",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs sm:text-sm lg:text-base font-medium text-red-700",
                            children: [
                                "🎯 Lucky picks: ",
                                randomPickCount,
                                " | ",
                                lastPickTime && `Last pick: ${lastPickTime.toLocaleTimeString()}`
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 578,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                        lineNumber: 573,
                        columnNumber: 11
                    }, this),
                    showLuckyFish && luckyFish && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            scale: 0.9
                        },
                        animate: {
                            opacity: 1,
                            scale: 1
                        },
                        className: "mb-8 sm:mb-10 lg:mb-12 max-w-md mx-auto px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl shadow-xl border border-green-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-base sm:text-lg lg:text-xl font-bold text-green-800 mb-2",
                                children: [
                                    "🎉 Your Lucky Catch: ",
                                    luckyFish.name,
                                    "!"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 591,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs sm:text-sm lg:text-base text-green-600 mb-3",
                                children: luckyFish.description
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 594,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleAddToCart(luckyFish),
                                className: "px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs sm:text-sm lg:text-base",
                                children: "Add Lucky Catch to Cart 🛒"
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 597,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                        lineNumber: 586,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 539,
                columnNumber: 7
            }, this),
            "      ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto",
                children: fishCards.slice(0, 6).map((fish, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: index * 0.1
                        },
                        whileHover: {
                            y: -5,
                            scale: 1.02
                        },
                        className: "group",
                        children: renderFishCard(fish, false)
                    }, fish.id, false, {
                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                        lineNumber: 608,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 606,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-8 sm:mt-10 lg:mt-12 max-w-4xl mx-auto",
                children: trustBadges.map((badge)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        whileHover: {
                            scale: 1.05
                        },
                        whileTap: {
                            scale: 0.95
                        },
                        className: `flex flex-col items-center p-4 sm:p-5 lg:p-6 rounded-xl border ${badge.color} shadow-lg`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-2 sm:mb-3",
                                children: badge.icon
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 630,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm sm:text-base lg:text-lg font-semibold text-gray-800",
                                        children: badge.title
                                    }, void 0, false, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 634,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs sm:text-sm text-gray-600",
                                        children: badge.description
                                    }, void 0, false, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 635,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 633,
                                columnNumber: 13
                            }, this)
                        ]
                    }, badge.id, true, {
                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                        lineNumber: 624,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                lineNumber: 622,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
        lineNumber: 537,
        columnNumber: 5
    }, this);
    // Render individual fish card
    function renderFishCard(fish, isMobileCard) {
        const cardClasses = isMobileCard ? "bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 h-full" : "bg-white rounded-xl shadow-lg overflow-hidden border border-red-100 h-full hover:shadow-xl transition-all duration-300";
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: cardClasses,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "aspect-w-16 aspect-h-10 bg-gray-100",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: fish.image,
                                alt: fish.name,
                                className: "w-full h-48 object-cover",
                                loading: "lazy"
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 654,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 653,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-3 left-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${fish.color} shadow-lg`,
                                children: fish.freshness
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 664,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 663,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>toggleWishlist(fish.id),
                            className: `absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 ${isWishlisted[fish.id] ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:text-red-500'}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                className: `w-4 h-4 ${isWishlisted[fish.id] ? 'fill-current' : ''}`
                            }, void 0, false, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 678,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 670,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-right",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-bold text-red-600",
                                        children: [
                                            "₹",
                                            fish.price
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 684,
                                        columnNumber: 15
                                    }, this),
                                    fish.originalPrice > fish.price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-500 line-through",
                                        children: [
                                            "₹",
                                            fish.originalPrice
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 686,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                lineNumber: 683,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 682,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 652,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 space-y-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-bold text-gray-900 text-lg leading-tight",
                                            children: fish.name
                                        }, void 0, false, {
                                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                            lineNumber: 696,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-red-600 font-medium",
                                            children: fish.category
                                        }, void 0, false, {
                                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                            lineNumber: 699,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 695,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "ml-2",
                                    children: fish.icon
                                }, void 0, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 701,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 694,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                renderStars(fish.rating),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full",
                                    children: fish.weight
                                }, void 0, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 709,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 707,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600 leading-relaxed",
                            children: fish.description
                        }, void 0, false, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 715,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex space-x-2 pt-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleAddToCart(fish),
                                    className: "flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 flex items-center justify-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                            className: "w-4 h-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                            lineNumber: 725,
                                            columnNumber: 15
                                        }, this),
                                        "Add to Cart"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 721,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200",
                                    onClick: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(`View details for ${fish.name}`),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                        lineNumber: 732,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                                    lineNumber: 728,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                            lineNumber: 720,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
                    lineNumber: 693,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/client/src/components/home/TrustBadgesNew.tsx",
            lineNumber: 650,
            columnNumber: 7
        }, this);
    }
};
_s(TrustBadges, "e9kCsAY89JRkpd5Nj4z3R+PDqS0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$context$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"]
    ];
});
_c = TrustBadges;
const __TURBOPACK__default__export__ = TrustBadges;
var _c;
__turbopack_refresh__.register(_c, "TrustBadges");

})()),
"[project]/client/src/components/home/TrustBadgesWrapper.tsx [app-client] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, k: __turbopack_refresh__ }) => (() => {
"use strict";

__turbopack_esm__({
    "default": ()=>TrustBadgesWrapper
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$components$2f$home$2f$TrustBadgesNew$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/client/src/components/home/TrustBadgesNew.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_import__("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
"__TURBOPACK__ecmascript__hoisting__location__";
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
;
// Simple loading component
const Loading = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-teal-50 text-center rounded-xl animate-pulse",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-4 sm:mb-5 lg:mb-6 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-500 animate-spin"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                    lineNumber: 27,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                lineNumber: 26,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-base sm:text-lg lg:text-xl font-medium text-blue-600",
                children: "Loading fresh seafood collection..."
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                lineNumber: 29,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
        lineNumber: 25,
        columnNumber: 3
    }, this);
_c = Loading;
// Simple error component
const ErrorDisplay = ({ message })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 to-pink-50 text-center rounded-xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-4 sm:mb-5 lg:mb-6 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                    className: "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-500"
                }, void 0, false, {
                    fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                    lineNumber: 37,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                lineNumber: 36,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-lg sm:text-xl lg:text-2xl font-bold text-red-600 mb-2 sm:mb-3 lg:mb-4",
                children: "Something went wrong"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                lineNumber: 39,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm sm:text-base lg:text-lg text-gray-700 mb-4 sm:mb-5 lg:mb-6",
                children: message
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                lineNumber: 40,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>window.location.reload(),
                className: "px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-red-600 text-white text-sm sm:text-base lg:text-lg rounded-lg hover:bg-red-700 transition-colors",
                children: "Try Again"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                lineNumber: 41,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
        lineNumber: 35,
        columnNumber: 3
    }, this);
_c1 = ErrorDisplay;
// Simple fallback component
const TrustBadgesSimple = ()=>{
    const defaultFishCards = [
        {
            id: 'seer',
            name: 'Seer Fish (Vanjaram)',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop',
            category: 'Premium',
            price: 899,
            originalPrice: 999,
            weight: '500g',
            freshness: 'Fresh',
            iconName: 'Fish',
            color: 'bg-blue-500',
            rating: 4.8,
            description: 'Rich in omega-3, perfect for grilling'
        },
        {
            id: 'prawns',
            name: 'Tiger Prawns',
            image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
            category: 'Shellfish',
            price: 599,
            originalPrice: 699,
            weight: '250g',
            freshness: 'Fresh',
            iconName: 'Anchor',
            color: 'bg-amber-500',
            rating: 4.6,
            description: 'Juicy and flavorful, great for curries'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$components$2f$home$2f$TrustBadgesNew$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        fishCards: defaultFishCards
    }, void 0, false, {
        fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
        lineNumber: 83,
        columnNumber: 10
    }, this);
};
_c2 = TrustBadgesSimple;
// Error boundary component
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Component {
    constructor(props){
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Error in TrustBadges component:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorDisplay, {
                message: this.state.error?.message || "An unexpected error occurred"
            }, void 0, false, {
                fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
                lineNumber: 106,
                columnNumber: 14
            }, this);
        }
        return this.props.children;
    }
}
function TrustBadgesWrapper() {
    _s();
    const [fishCards, setFishCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function fetchFishCards() {
            setIsLoading(true);
            setError(null);
            try {
                console.log('Fetching fish picks from API...');
                const res = await fetch('/api/fish-picks');
                if (!res.ok) {
                    throw new Error('Failed to fetch fish picks');
                }
                const data = await res.json();
                // Filter out inactive cards
                const activeCards = data.filter((card)=>card.isActive !== false);
                setFishCards(activeCards);
                console.log('Loaded fish picks:', activeCards.length, 'active cards');
            } catch (err) {
                console.error('Error loading fish picks:', err);
                setError(err.message || 'Failed to load fresh seafood collection');
            } finally{
                setIsLoading(false);
            }
        }
        fetchFishCards();
    }, []);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Loading, {}, void 0, false, {
            fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
            lineNumber: 146,
            columnNumber: 12
        }, this);
    }
    if (error || fishCards.length === 0) {
        console.warn('Error or no fish cards available, using fallback');
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TrustBadgesSimple, {}, void 0, false, {
            fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
            lineNumber: 151,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorBoundary, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$components$2f$home$2f$TrustBadgesNew$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            fishCards: fishCards
        }, void 0, false, {
            fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
            lineNumber: 156,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/client/src/components/home/TrustBadgesWrapper.tsx",
        lineNumber: 155,
        columnNumber: 5
    }, this);
}
_s(TrustBadgesWrapper, "9+Cd3sPAgg303Oei4+pglf9BUM0=");
_c3 = TrustBadgesWrapper;
var _c, _c1, _c2, _c3;
__turbopack_refresh__.register(_c, "Loading");
__turbopack_refresh__.register(_c1, "ErrorDisplay");
__turbopack_refresh__.register(_c2, "TrustBadgesSimple");
__turbopack_refresh__.register(_c3, "TrustBadgesWrapper");

})()),
}]);

//# sourceMappingURL=src_695bcd._.js.map