module.exports = {

"[project]/client/src/app/api/trusted-badges/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "GET": ()=>GET
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
// Sample data as fallback if API call fails
const fallbackData = [
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
        description: 'Rich in omega-3, perfect for grilling',
        isActive: true
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
        description: 'Juicy and flavorful, great for curries',
        isActive: true
    },
    {
        id: 'salmon',
        name: 'Indian Salmon',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop',
        category: 'Premium',
        price: 1299,
        originalPrice: 1499,
        weight: '1kg',
        freshness: 'Fresh',
        iconName: 'Waves',
        color: 'bg-pink-500',
        rating: 4.9,
        description: 'Rich in omega-3, perfect for grilling',
        isActive: true
    },
    {
        id: 'pomfret',
        name: 'White Pomfret',
        image: 'https://images.unsplash.com/photo-1605651377861-348620a3faae?q=80&w=2070&auto=format&fit=crop',
        category: 'Premium',
        price: 1099,
        originalPrice: 1299,
        weight: '700g',
        freshness: 'Fresh',
        iconName: 'Fish',
        color: 'bg-blue-500',
        rating: 4.7,
        description: 'Delicate white flesh, great for frying',
        isActive: true
    }
];
// Define the base URL for the admin API
const ADMIN_API_BASE_URL = process.env.ADMIN_API_URL || 'http://localhost:3001';
async function GET(request) {
    try {
        // Try to fetch from the admin API
        const response = await fetch(`${ADMIN_API_BASE_URL}/api/trusted-badges`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            // Use a short timeout for better UX if admin server is down
            signal: AbortSignal.timeout(3000)
        }).catch(()=>null); // Catch network errors
        // If the response was successful and returned data
        if (response && response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
            }
        }
        // Fall back to local data if admin API fails or returns empty data
        console.warn('Using fallback data for trusted badges');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(fallbackData);
    } catch (error) {
        console.error('Error fetching trusted badges:', error);
        // Always fallback to sample data for a graceful user experience
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(fallbackData);
    }
}

})()),

};

//# sourceMappingURL=src_app_api_trusted-badges_route_ts_7ed2fa._.js.map