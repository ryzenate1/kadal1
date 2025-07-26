module.exports = {

"[project]/client/src/app/api/fish-picks/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "GET": ()=>GET
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api';
// Fallback fish picks data for when server is unavailable
const fallbackFishPicks = [
    {
        id: 'fp_fallback_1',
        name: 'Seer Fish (Vanjaram)',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop',
        category: 'Premium Catch',
        price: 899,
        originalPrice: 999,
        weight: '500g',
        freshness: 'Fresh Today',
        iconName: 'Fish',
        color: 'bg-gradient-to-br from-red-500 to-red-600',
        rating: 4.8,
        description: 'Rich in omega-3, perfect for grilling & curry',
        isActive: true
    },
    {
        id: 'fp_fallback_2',
        name: 'Tiger Prawns',
        image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
        category: 'Fresh Shellfish',
        price: 599,
        originalPrice: 699,
        weight: '250g',
        freshness: 'Just Caught',
        iconName: 'Anchor',
        color: 'bg-gradient-to-br from-orange-500 to-red-500',
        rating: 4.6,
        description: 'Juicy and flavorful, perfect for curries & frying',
        isActive: true
    },
    {
        id: 'fp_fallback_3',
        name: 'Indian Salmon',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop',
        category: 'Premium Catch',
        price: 1299,
        originalPrice: 1499,
        weight: '1kg',
        freshness: 'Ocean Fresh',
        iconName: 'Waves',
        color: 'bg-gradient-to-br from-pink-500 to-red-500',
        rating: 4.9,
        description: 'High in protein & omega-3, ideal for steaks',
        isActive: true
    },
    {
        id: 'fp_fallback_4',
        name: 'White Pomfret',
        image: 'https://images.unsplash.com/photo-1605651377861-348620a3faae?q=80&w=2070&auto=format&fit=crop',
        category: 'Premium Catch',
        price: 1099,
        originalPrice: 1299,
        weight: '700g',
        freshness: 'Fresh Today',
        iconName: 'Fish',
        color: 'bg-gradient-to-br from-blue-500 to-red-500',
        rating: 4.7,
        description: 'Delicate white flesh, perfect for whole fish frying',
        isActive: true
    },
    {
        id: 'fp_fallback_5',
        name: 'King Fish (Surmai)',
        image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?q=80&w=2070&auto=format&fit=crop',
        category: 'Daily Fresh',
        price: 749,
        originalPrice: 849,
        weight: '500g',
        freshness: 'Morning Catch',
        iconName: 'Star',
        color: 'bg-gradient-to-br from-purple-500 to-red-500',
        rating: 4.5,
        description: 'Firm texture, excellent for steaks & grilling',
        isActive: true
    },
    {
        id: 'fp_fallback_6',
        name: 'Mud Crab',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop',
        category: 'Live Shellfish',
        price: 1599,
        originalPrice: 1799,
        weight: '1kg',
        freshness: 'Live & Fresh',
        iconName: 'Sparkles',
        color: 'bg-gradient-to-br from-green-500 to-red-600',
        rating: 4.9,
        description: 'Sweet meat, perfect for crab curry & masala',
        isActive: true
    }
];
async function GET(req) {
    try {
        console.log('Client API: Fetching fish picks');
        // Enhanced fallback data with better error handling
        const enhancedFallbackData = fallbackFishPicks.map((pick, index)=>({
                ...pick,
                id: pick.id || `fp-client-${index}`,
                isActive: pick.isActive !== false,
                iconName: pick.iconName || 'Fish',
                image: pick.image || `https://images.unsplash.com/photo-153476655576${4 + index}?q=80&w=2070&auto=format&fit=crop`,
                price: pick.price || 999,
                originalPrice: pick.originalPrice || pick.price * 1.2,
                weight: pick.weight || '500g',
                freshness: pick.freshness || 'Fresh Today',
                color: pick.color || 'bg-gradient-to-br from-blue-500 to-red-500',
                rating: pick.rating || 4.5,
                description: pick.description || `Fresh ${pick.name} with premium quality`,
                category: pick.category || 'Premium'
            }));
        // Try to fetch from server API with timeout
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 3000); // 3 second timeout
            const response = await fetch(`${SERVER_API_URL}/fish-picks`, {
                signal: controller.signal,
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    // Normalize and enhance server data
                    const normalizedData = data.map((pick, index)=>({
                            ...pick,
                            id: pick.id || `fp-server-${index}`,
                            isActive: pick.isActive !== false,
                            iconName: pick.iconName || pick.icon || 'Fish',
                            image: pick.image || enhancedFallbackData[index % enhancedFallbackData.length]?.image,
                            price: Number(pick.price) || 999,
                            originalPrice: Number(pick.originalPrice) || Number(pick.price) * 1.2,
                            weight: pick.weight || '500g',
                            freshness: pick.freshness || 'Fresh Today',
                            color: pick.color || 'bg-gradient-to-br from-blue-500 to-red-500',
                            rating: Number(pick.rating) || 4.5,
                            description: pick.description || `Fresh ${pick.name} with premium quality`,
                            category: pick.category || 'Premium'
                        }));
                    console.log('Successfully fetched fish picks from server API');
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(normalizedData);
                }
            }
        } catch (serverError) {
            console.warn('Server API failed for fish picks, using fallback:', serverError);
        }
        // Return enhanced fallback data
        console.log('Using fallback fish picks data');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(enhancedFallbackData);
    } catch (error) {
        console.error('Error in fish picks API:', error);
        // Always return some data, never fail completely
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(fallbackFishPicks);
    }
}

})()),

};

//# sourceMappingURL=src_app_api_fish-picks_route_ts_d085a4._.js.map