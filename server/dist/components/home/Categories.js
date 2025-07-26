"use strict";
"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const framer_motion_1 = require("framer-motion");
const navigation_1 = require("next/navigation");
const CartContext_1 = require("@/context/CartContext");
const sonner_1 = require("sonner");
const animation_variants_1 = require("./animation-variants");
// Custom intersection observer hook for animation
const useIntersectionObserver = (options = {}) => {
    const { threshold = 0, triggerOnce = false, root = null, rootMargin = '0px' } = options;
    const ref = (0, react_1.useRef)(null);
    const [isIntersecting, setIsIntersecting] = (0, react_1.useState)(true); // Start visible
    (0, react_1.useEffect)(() => {
        console.log("[useIntersectionObserver] Observer initialized with options:", { root, rootMargin, threshold });
        const observer = new IntersectionObserver(([entry]) => {
            console.log("[useIntersectionObserver] Entry observed:", entry);
            setIsIntersecting(entry.isIntersecting || true); // Always visible fallback
            if (entry.isIntersecting && triggerOnce && ref.current) {
                console.log("[useIntersectionObserver] Triggering once and unobserving:", ref.current);
                observer.unobserve(ref.current);
            }
        }, { root, rootMargin, threshold });
        if (ref.current) {
            console.log("[useIntersectionObserver] Observing element:", ref.current);
            observer.observe(ref.current);
        }
        return () => {
            if (ref.current) {
                console.log("[useIntersectionObserver] Unobserving element:", ref.current);
                observer.unobserve(ref.current);
            }
        };
    }, [root, rootMargin, threshold, triggerOnce]);
    return [ref, isIntersecting];
};
// Custom hook for media query
const useMediaQuery = (query) => {
    const [matches, setMatches] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (typeof window !== 'undefined') {
            const media = window.matchMedia(query);
            setMatches(media.matches);
            const listener = () => setMatches(media.matches);
            media.addEventListener('change', listener);
            return () => media.removeEventListener('change', listener);
        }
        return undefined;
    }, [query]);
    return matches;
};
// Fallback featured fish products
const fallbackFeaturedFish = [
    {
        id: 101,
        name: "Premium Fish Combo",
        image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
        slug: "premium",
        type: "Premium",
        description: "Curated selection of premium fish varieties",
        featured: true,
        price: 999,
        weight: "1.2kg",
        discount: 10,
        icon: <lucide_react_1.Fish className="w-4 h-4"/>,
        isActive: true
    },
    {
        id: 102,
        name: "Grilling Special",
        image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
        slug: "grilling",
        type: "Combo",
        description: "Perfect for seafood barbecues and grilling",
        featured: true,
        price: 899,
        weight: "800g",
        discount: 15,
        icon: <lucide_react_1.Fish className="w-4 h-4"/>,
        isActive: true
    },
    {
        id: 103,
        name: "Seafood Feast",
        image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
        slug: "feast",
        type: "Combo",
        description: "Premium selection of mixed seafood",
        featured: true,
        price: 1299,
        weight: "1.5kg",
        discount: 8,
        icon: <lucide_react_1.Shell className="w-4 h-4"/>,
        isActive: true
    },
    {
        id: 104,
        name: "Fresh Catch Box",
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop",
        slug: "fresh-catch",
        type: "Fresh",
        description: "Today's freshest catches from local fishermen",
        featured: true,
        price: 799,
        weight: "900g",
        discount: 12,
        icon: <lucide_react_1.Anchor className="w-4 h-4"/>,
        isActive: true
    }
];
// Fallback categories
const fallbackCategories = [
    {
        id: 1,
        name: "Vangaram Fish",
        image: "https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop",
        slug: "vangaram-fish",
        type: "Fish",
        icon: "Fish",
        isActive: true
    },
    {
        id: 2,
        name: "Sliced Vangaram",
        image: "https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop",
        slug: "sliced-vangaram",
        type: "Fish",
        icon: "Fish",
        isActive: true
    },
    {
        id: 3,
        name: "Dried Fish",
        image: "https://images.unsplash.com/photo-1592483648224-61bf8287bc4c?q=80&w=2070&auto=format&fit=crop",
        slug: "dried-fish",
        type: "Dried Fish",
        icon: "Fish",
        isActive: true
    },
    {
        id: 4,
        name: "Jumbo Prawns",
        image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=2070&auto=format&fit=crop",
        slug: "jumbo-prawns",
        type: "Prawns",
        icon: "Shell",
        isActive: true
    },
    {
        id: 5,
        name: "Sea Prawns",
        image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1935&auto=format&fit=crop",
        slug: "sea-prawns",
        type: "Prawns",
        icon: "Shell",
        isActive: true
    },
    {
        id: 6,
        name: "Fresh Lobster",
        image: "https://images.unsplash.com/photo-1610540881356-76bd50e523d3?q=80&w=2070&auto=format&fit=crop",
        slug: "fresh-lobster",
        type: "Shellfish",
        icon: "Shell",
        isActive: true
    }
];
const Categories = ({ adminData }) => {
    const router = (0, navigation_1.useRouter)();
    const { addToCart } = (0, CartContext_1.useCart)();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [categoriesRef, isCategoriesVisible] = useIntersectionObserver({
        threshold: 0.1,
        triggerOnce: true
    });
    // Categories display settings
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [featuredFish, setFeaturedFish] = (0, react_1.useState)([]);
    const [visibleCategories, setVisibleCategories] = (0, react_1.useState)(6);
    const [showAll, setShowAll] = (0, react_1.useState)(false);
    // Scroll positions for mobile
    const categoriesSliderRef = (0, react_1.useRef)(null);
    const featuredSliderRef = (0, react_1.useRef)(null);
    // Helper function to get image URL with fallback
    const getImageUrl = (item) => {
        if (!item)
            return "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop";
        if (item.image) {
            if (item.image.startsWith('http')) {
                return item.image;
            }
            else {
                const localImagePath = item.image.startsWith('/') ? item.image : `/${item.image}`;
                if (localImagePath.includes('/images/categories/')) {
                    return getFallbackImageByType(item.type || '');
                }
                return localImagePath;
            }
        }
        return getFallbackImageByType(item.type || '');
    };
    // Get fallback image based on type
    const getFallbackImageByType = (type) => {
        const typeKey = type.toLowerCase();
        if (typeKey.includes('fish') || typeKey.includes('vangaram')) {
            return "https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop";
        }
        else if (typeKey.includes('prawn') || typeKey.includes('shrimp')) {
            return "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=2070&auto=format&fit=crop";
        }
        else if (typeKey.includes('crab')) {
            return "https://images.unsplash.com/photo-1559187575-5f89cedf009b?q=80&w=2071&auto=format&fit=crop";
        }
        else if (typeKey.includes('shell') || typeKey.includes('lobster')) {
            return "https://images.unsplash.com/photo-1610540881356-76bd50e523d3?q=80&w=2070&auto=format&fit=crop";
        }
        else if (typeKey.includes('combo') || typeKey.includes('premium')) {
            return "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop";
        }
        else {
            return "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop";
        }
    };
    (0, react_1.useEffect)(() => {
        const initializeCategories = () => __awaiter(void 0, void 0, void 0, function* () {
            setLoading(true);
            setError(null);
            try {
                console.log("[Categories] Initializing categories...");
                if (adminData && adminData.categories && Array.isArray(adminData.categories)) {
                    console.log("[Categories] Using admin data:", adminData.categories);
                    const adminCategories = adminData.categories.map((cat, index) => {
                        var _a;
                        return ({
                            id: index + 1,
                            name: cat.name,
                            image: cat.image,
                            slug: ((_a = cat.link) === null || _a === void 0 ? void 0 : _a.replace('/category/', '')) || cat.name.toLowerCase().replace(/\s+/g, '-'),
                            type: cat.name,
                            isActive: true
                        });
                    });
                    setCategories(adminCategories);
                    console.log("[Categories] Admin categories set:", adminCategories.length, adminCategories);
                    setLoading(false);
                    return;
                }
                console.log("[Categories] No admin data provided, fetching from API...");
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const res = yield fetch('/api/categories', {
                    signal: controller.signal,
                    cache: 'no-store'
                });
                clearTimeout(timeoutId);
                if (!res.ok) {
                    console.warn(`[Categories] API returned status: ${res.status}`);
                    throw new Error(`Failed to fetch categories (Status: ${res.status})`);
                }
                const data = yield res.json();
                console.log("[Categories] Raw API response:", data);
                if (Array.isArray(data) && data.length > 0) {
                    const activeCategories = data.filter(cat => cat.isActive !== false);
                    setCategories(activeCategories);
                    console.log("[Categories] Active categories set:", activeCategories.length, activeCategories);
                }
                else {
                    console.warn("[Categories] Empty or invalid data received, using fallback");
                    setCategories(fallbackCategories);
                }
            }
            catch (err) {
                console.error("Error loading categories:", err);
                if (err instanceof Error && err.name === 'AbortError') {
                    setError('Categories loading timed out, using fallback data');
                }
                else {
                    setError('Could not load categories from API, using fallback data');
                }
                setCategories(fallbackCategories);
            }
            finally {
                setLoading(false);
            }
        });
        initializeCategories();
    }, [adminData]);
    (0, react_1.useEffect)(() => {
        const fetchFeaturedProducts = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log("Fetching featured fish from API...");
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const res = yield fetch('/api/featured-fish', {
                    signal: controller.signal,
                    cache: 'no-store'
                });
                clearTimeout(timeoutId);
                if (!res.ok) {
                    console.warn(`Featured fish API returned status: ${res.status}`);
                    throw new Error(`Failed to fetch featured fish (Status: ${res.status})`);
                }
                const data = yield res.json();
                console.log("Featured fish received:", data);
                if (Array.isArray(data) && data.length > 0) {
                    const activeFeaturedFish = data.filter(fish => fish.isActive !== false);
                    setFeaturedFish(activeFeaturedFish);
                    console.log("Active featured fish set:", activeFeaturedFish.length);
                }
                else {
                    console.warn("Empty or invalid featured fish data, using fallback");
                    setFeaturedFish(fallbackFeaturedFish);
                }
            }
            catch (err) {
                console.error("Error loading featured fish:", err);
                if (err instanceof Error && err.name === 'AbortError') {
                    console.warn('Featured fish loading timed out, using fallback');
                }
                else {
                    console.warn('Featured fish API failed, using fallback');
                }
                setFeaturedFish(fallbackFeaturedFish);
            }
        });
        fetchFeaturedProducts();
    }, []);
    const toggleShowAll = () => {
        setShowAll(!showAll);
        if (!showAll) {
            setVisibleCategories(categories.length);
        }
        else {
            setVisibleCategories(6);
        }
    };
    const getIconComponent = (iconName) => {
        if (!iconName)
            return <lucide_react_1.Fish className="w-4 h-4"/>;
        switch (iconName.toLowerCase()) {
            case 'fish':
                return <lucide_react_1.Fish className="w-4 h-4"/>;
            case 'anchor':
                return <lucide_react_1.Anchor className="w-4 h-4"/>;
            case 'shell':
                return <lucide_react_1.Shell className="w-4 h-4"/>;
            default:
                if (iconName.toLowerCase().includes('crab') || iconName.toLowerCase().includes('prawn')) {
                    return <lucide_react_1.Shell className="w-4 h-4"/>;
                }
                return <lucide_react_1.Fish className="w-4 h-4"/>;
        }
    };
    // Scroll functions for mobile with improved behavior
    const scrollLeft = (ref) => {
        if (ref && ref.current) {
            const scrollAmount = ref.current.clientWidth * 0.8;
            ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };
    const scrollRight = (ref) => {
        if (ref && ref.current) {
            const scrollAmount = ref.current.clientWidth * 0.8;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    // Add to cart functionality for featured fish
    const handleAddToCart = (fish, event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            const cartItem = {
                id: fish.id.toString(),
                name: fish.name,
                src: getImageUrl(fish),
                type: fish.type,
                price: fish.price,
                omega3: 0,
                protein: 0,
                calories: 0,
                benefits: ['Fresh', 'Premium Quality'],
                bestFor: ['Cooking', 'Grilling'],
                rating: 4.5,
                description: fish.description,
                quantity: 1,
                addedAt: new Date(),
                netWeight: fish.weight,
                grossWeight: fish.weight
            };
            addToCart(cartItem);
            sonner_1.toast.success(`${fish.name} added to cart!`, {
                description: `₹${fish.price} • ${fish.weight}`,
                duration: 2000,
            });
        }
        catch (error) {
            console.error('Error adding to cart:', error);
            sonner_1.toast.error('Failed to add item to cart');
        }
    };
    console.log("[Categories] Render - categories length:", categories.length);
    console.log("[Categories] Render - loading:", loading);
    console.log("[Categories] Render - error:", error);
    console.log("[Categories] Render - visible categories:", visibleCategories);
    return (<section className="py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-10 force-visible" ref={categoriesRef}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {error && (<div className="flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 sm:mb-6 rounded-lg">
            <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0"/>
            <p className="text-sm text-yellow-700">{error}</p>
          </div>)}
        
        {/* Featured Fish Collection */}
        <framer_motion_1.motion.div initial="visible" animate="visible" variants={animation_variants_1.fadeInUp} className="mb-6 sm:mb-8 lg:mb-10 force-visible">
          <div className="flex flex-col space-y-2 mb-4 sm:mb-6 lg:mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Featured Seafood</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto sm:mx-0">
              Discover our premium selection of fresh seafood, sourced sustainably and delivered to your doorstep within hours of catch.
            </p>
          </div>
          
          {/* Mobile Navigation Controls for Featured Fish */}
          {isMobile && featuredFish.length > 2 && (<div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
              <button onClick={() => scrollLeft(featuredSliderRef)} className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Scroll left">
                <lucide_react_1.ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5"/>
              </button>
              <span className="text-sm text-gray-500">Swipe to explore</span>
              <button onClick={() => scrollRight(featuredSliderRef)} className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Scroll right">
                <lucide_react_1.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5"/>
              </button>
            </div>)}
          
          {/* Featured Fish Mobile Slider */}
          {isMobile ? (<div ref={featuredSliderRef} className="flex overflow-x-auto pb-4 sm:pb-6 hide-scrollbar snap-x snap-mandatory gap-3 sm:gap-4 px-1" style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory'
            }}>
              {featuredFish.slice(0, 6).map((fish) => (<framer_motion_1.motion.div key={fish.id} className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start" variants={animation_variants_1.fadeInUp} style={{ scrollSnapAlign: 'start' }}>
                  <link_1.default href={`/fish/${fish.slug || fish.id}`} className="block">
                    <div className="overflow-hidden rounded-xl shadow-md h-full bg-white hover:shadow-lg transition-all duration-300">
                      <div className="relative h-36 sm:h-40">
                        <image_1.default src={getImageUrl(fish)} alt={fish.name} fill style={{ objectFit: 'cover' }} className="transition-transform hover:scale-105 duration-300"/>
                        {fish.discount > 0 && (<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            {fish.discount}% OFF
                          </div>)}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">{fish.name}</h3>
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-xs">
                            {getIconComponent(fish.iconName || fish.type)}
                            <span className="hidden sm:inline">{fish.type}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                          {fish.description || `Fresh ${fish.name} with premium quality`}
                        </p>
                        
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-blue-600 text-sm">₹{fish.price}</span>
                            {fish.discount > 0 && (<span className="text-xs text-gray-500 line-through">
                                ₹{Math.round(fish.price / (1 - fish.discount / 100))}
                              </span>)}
                          </div>
                          <span className="text-xs text-gray-500">{fish.weight}</span>
                        </div>
                        
                        <button_1.Button onClick={(e) => handleAddToCart(fish, e)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5" size="sm">
                          <lucide_react_1.ShoppingCart className="w-3 h-3 mr-1"/>
                          Add to Cart
                        </button_1.Button>
                      </div>
                    </div>
                  </link_1.default>
                </framer_motion_1.motion.div>))}
            </div>) : (<framer_motion_1.motion.div variants={animation_variants_1.staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredFish.slice(0, 4).map((fish) => (<framer_motion_1.motion.div key={fish.id} variants={animation_variants_1.fadeInUp} className="group">
                  <link_1.default href={`/fish/${fish.slug || fish.id}`} className="block">
                    <div className="overflow-hidden rounded-xl shadow-md h-full bg-white hover:shadow-lg transition-all duration-300">
                      <div className="relative h-44 sm:h-48 md:h-52">
                        <image_1.default src={getImageUrl(fish)} alt={fish.name} fill style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-300"/>
                        {fish.discount > 0 && (<div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            {fish.discount}% OFF
                          </div>)}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base">{fish.name}</h3>
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            {getIconComponent(fish.iconName || fish.type)}
                            <span>{fish.type}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
                          {fish.description || `Fresh ${fish.name} with premium quality`}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-blue-600 text-sm sm:text-base">₹{fish.price}</span>
                            {fish.discount > 0 && (<span className="text-xs text-gray-500 line-through">
                                ₹{Math.round(fish.price / (1 - fish.discount / 100))}
                              </span>)}
                          </div>
                          <span className="text-xs text-gray-500">{fish.weight}</span>
                        </div>
                        
                        <button_1.Button onClick={(e) => handleAddToCart(fish, e)} className="w-full mt-2 sm:mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm" size="sm">
                          <lucide_react_1.ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/>
                          Add to Cart
                        </button_1.Button>
                      </div>
                    </div>
                  </link_1.default>
                </framer_motion_1.motion.div>))}
            </framer_motion_1.motion.div>)}
        </framer_motion_1.motion.div>
        
        {/* Shop by Category */}
        <framer_motion_1.motion.div initial="visible" animate="visible" variants={animation_variants_1.fadeInUp} className="pt-4 sm:pt-6 lg:pt-8 force-visible">
          <div className="flex flex-col space-y-2 mb-4 sm:mb-6 lg:mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {(adminData === null || adminData === void 0 ? void 0 : adminData.title) || "Shop by Category"}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto sm:mx-0">
              {(adminData === null || adminData === void 0 ? void 0 : adminData.subtitle) || "Fresh catches from the sea"}
            </p>
          </div>
          
          {/* Mobile Navigation Controls for Categories */}
          {isMobile && categories.length > 2 && (<div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
              <button onClick={() => scrollLeft(categoriesSliderRef)} className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Scroll left">
                <lucide_react_1.ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5"/>
              </button>
              <span className="text-sm text-gray-500">Swipe to explore</span>
              <button onClick={() => scrollRight(categoriesSliderRef)} className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Scroll right">
                <lucide_react_1.ChevronRight className="w-4 h-4 sm:w-5 sm:h-5"/>
              </button>
            </div>)}
          
          {loading ? (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl h-36 sm:h-40 lg:h-48"></div>
                </div>))}
            </div>) : categories.length === 0 ? (<div className="p-8 text-center">
              <h3 className="text-xl font-bold text-gray-800">No categories available</h3>
              <p className="text-gray-600">Please check back later</p>
            </div>) : (<>
              {/* Mobile category cards with improved scrolling */}
              {isMobile ? (<div ref={categoriesSliderRef} className="flex overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory gap-4 px-1" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                }}>
                  {categories.map((category) => (<framer_motion_1.motion.div key={category.id} className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start" variants={animation_variants_1.fadeInUp} initial="hidden" animate="visible" style={{ scrollSnapAlign: 'start' }}>
                      <link_1.default href={`/category/${category.slug || category.id}`} className="block h-full">
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full border border-gray-100">
                          <div className="relative h-40 sm:h-44 w-full bg-gray-50">
                            <image_1.default src={getImageUrl(category)} alt={category.name} fill className="object-cover transition-transform duration-300 hover:scale-105" sizes="(max-width: 768px) 240px, 260px"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                              {category.type || 'Fresh'}
                            </div>
                          </div>
                          <div className="p-4 flex flex-col justify-between flex-grow">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{category.name}</h3>
                              <p className="text-gray-600 text-xs line-clamp-2 mb-3">
                                {category.description || `Fresh ${category.name} delivered daily`}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-red-50 rounded-full">
                                  {getIconComponent(category.iconName || category.type)}
                                </div>
                                <span className="text-xs text-red-600 font-medium">Shop Now</span>
                              </div>
                              <lucide_react_1.ChevronRight className="w-4 h-4 text-red-600"/>
                            </div>
                          </div>
                        </div>
                      </link_1.default>
                    </framer_motion_1.motion.div>))}
                </div>) : (<framer_motion_1.motion.div variants={animation_variants_1.staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {categories.slice(0, visibleCategories).map((category) => (<framer_motion_1.motion.div key={category.id} variants={animation_variants_1.fadeInUp} className="group">
                      <link_1.default href={`/category/${category.slug || category.id}`} className="block h-full">
                        <div className="relative overflow-hidden rounded-xl shadow-md bg-white hover:shadow-xl transition-all duration-300 h-full">
                          <div className="relative h-44 sm:h-48 lg:h-56">
                            <image_1.default src={getImageUrl(category)} alt={category.name} fill style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md opacity-90">
                              {category.type || 'Fresh'}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                                  {getIconComponent(category.iconName || category.type)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{category.name}</h3>
                                  <div className="text-sm text-white/80 line-clamp-1">{category.type || 'Fresh Seafood'}</div>
                                </div>
                              </div>
                              <lucide_react_1.ChevronRight className="w-5 h-5 text-white/80 group-hover:text-white transition-colors"/>
                            </div>
                          </div>
                        </div>
                      </link_1.default>
                    </framer_motion_1.motion.div>))}
                </framer_motion_1.motion.div>)}
              
              {categories.length > 6 && !isMobile && (<div className="text-center mt-6 sm:mt-8 lg:mt-10">
                  <button_1.Button onClick={toggleShowAll} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 px-4 sm:px-6 py-2 sm:py-3">
                    {showAll ? "Show Less" : "Show All Categories"}
                  </button_1.Button>
                </div>)}
            </>)}
        </framer_motion_1.motion.div>
      </div>
    </section>);
};
exports.default = Categories;
