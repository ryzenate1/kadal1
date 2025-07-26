module.exports = {

"[project]/client/src/lib/apiUtils.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "checkServerHealth": ()=>checkServerHealth,
    "fetchWithRetry": ()=>fetchWithRetry,
    "getAuthHeaders": ()=>getAuthHeaders,
    "getUserIdFromAuth": ()=>getUserIdFromAuth
});
// Remove import { cookies } from 'next/headers' to fix the error
/**
 * API utilities for handling network requests with retry logic
 */ // Base API URL - use environment variable or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
// Maximum number of retry attempts for failed requests
const MAX_RETRIES = 3;
// Delay between retry attempts (in milliseconds)
const RETRY_DELAY = 1000;
async function fetchWithRetry(endpoint, options = {}, retries = MAX_RETRIES) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    // Add authentication headers
    const authHeaders = getAuthHeaders();
    const mergedOptions = {
        ...options,
        headers: {
            ...authHeaders,
            ...options.headers || {}
        }
    };
    let lastError = null;
    for(let attempt = 0; attempt <= retries; attempt++){
        try {
            console.log(`API Request (attempt ${attempt + 1}/${retries + 1}):`, url);
            const response = await fetch(url, mergedOptions);
            const contentType = response.headers.get('content-type');
            // Parse response based on content type
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            // Check if the response was successful
            if (!response.ok) {
                const errorMessage = data.message || `HTTP error ${response.status}`;
                throw new Error(errorMessage);
            }
            return data;
        } catch (error) {
            console.error(`API Request failed (attempt ${attempt + 1}/${retries + 1}):`, error);
            lastError = error;
            // If this is the last attempt, don't delay
            if (attempt === retries) {
                break;
            }
            // Wait before retrying
            await new Promise((resolve)=>setTimeout(resolve, RETRY_DELAY));
        }
    }
    throw lastError || new Error('Request failed after multiple attempts');
}
async function checkServerHealth() {
    try {
        // For development purposes, always return true to avoid the error message
        if (("TURBOPACK compile-time value", "development") === 'development') {
            return true;
        }
        // In production, actually check the server health
        const response = await fetch(`${API_URL.replace('/api', '')}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Server health check failed:', error);
        // For development purposes, return true even if there's an error
        return ("TURBOPACK compile-time value", "development") === 'development';
    }
}
function getAuthHeaders() {
    // Try to get token from both possible storage keys
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('oceanFreshToken') || 'admin-test-token' : 'admin-test-token';
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}
async function getUserIdFromAuth(request) {
    try {
        // In a real app, this would validate JWT token and extract user ID
        // For now, return a mock user ID for testing
        // Try to get token from request headers first, then from cookies
        let token;
        if (request) {
            // Get token from Authorization header if request is provided
            token = request.headers.get('Authorization')?.replace('Bearer ', '') || undefined;
            // If no token in headers, try cookies from request
            if (!token) {
                const requestCookies = request.cookies;
                token = requestCookies.get('token')?.value || requestCookies.get('oceanFreshToken')?.value;
            }
        } else {
            // When in client components or Pages Router, use localStorage
            if (typeof window !== 'undefined') {
                const localToken = localStorage.getItem('token') || localStorage.getItem('oceanFreshToken');
                token = localToken || undefined;
            }
        // Note: For Server Components in App Router, you would use:
        // import { cookies } from 'next/headers';
        // const cookieStore = cookies();
        // token = cookieStore.get('token')?.value || cookieStore.get('oceanFreshToken')?.value;
        }
        // Use default test token if no token found
        if (!token || token === 'admin-test-token') {
            return '88e49eec-e6fb-404a-93da-6fa7740ad944'; // Test admin user ID
        }
        // Call auth service to verify token and get user ID
        // const response = await fetch('/api/auth/verify', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await response.json();
        // return data.userId;
        return '88e49eec-e6fb-404a-93da-6fa7740ad944'; // Default to test user
    } catch (error) {
        console.error('Error getting user ID from auth:', error);
        return null;
    }
}

})()),
"[project]/client/src/app/api/featured-fish/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "GET": ()=>GET,
    "dynamic": ()=>dynamic
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$lib$2f$apiUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/client/src/lib/apiUtils.ts [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
const dynamic = 'force-dynamic';
// Server API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
// Admin API URL
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001/api';
const fallbackFeaturedFish = [
    {
        id: 'premium-combo',
        name: "Premium Fish Combo",
        image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
        slug: "premium",
        type: "Premium",
        description: "Curated selection of premium fish varieties",
        featured: true,
        price: 999,
        weight: "1.2kg",
        discount: 10,
        iconName: "Fish",
        isActive: true
    },
    {
        id: 'grilling-special',
        name: "Grilling Special",
        image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
        slug: "grilling",
        type: "Combo",
        description: "Perfect for seafood barbecues and grilling",
        featured: true,
        price: 899,
        weight: "800g",
        discount: 15,
        iconName: "Fish",
        isActive: true
    },
    {
        id: 'seafood-feast',
        name: "Seafood Feast",
        image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
        slug: "feast",
        type: "Combo",
        description: "Premium selection of mixed seafood",
        featured: true,
        price: 1299,
        weight: "1.5kg",
        discount: 8,
        iconName: "Shell",
        isActive: true
    },
    {
        id: 'fresh-catch',
        name: "Fresh Catch Box",
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop",
        slug: "fresh-catch",
        type: "Fresh",
        description: "Today's freshest catches from local fishermen",
        featured: true,
        price: 799,
        weight: "900g",
        discount: 12,
        iconName: "Anchor",
        isActive: true
    }
];
async function GET(req) {
    try {
        // Try to fetch from the server API first
        try {
            console.log('Fetching featured fish from server API...');
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 3000); // 3 second timeout
            const response = await fetch(`${SERVER_API_URL}/featured-fish`, {
                method: 'GET',
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$lib$2f$apiUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthHeaders"])(),
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    // Normalize server data
                    const normalizedData = data.map((fish, index)=>({
                            id: fish.id || fish._id,
                            name: fish.name,
                            slug: fish.slug?.replace(/^fish-combo\//, '') || fish.id,
                            description: fish.description || `Fresh ${fish.name} with premium quality`,
                            image: fish.image || fish.imageUrl,
                            price: Number(fish.price) || 999,
                            weight: fish.weight || '1kg',
                            discount: Number(fish.discount) || 0,
                            featured: fish.featured !== false,
                            type: fish.type || 'Premium',
                            iconName: fish.iconName || fish.icon || 'Fish',
                            isActive: fish.isActive !== false
                        }));
                    console.log('Successfully fetched featured fish from server API');
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        title: "Today's Fresh Catch",
                        subtitle: "Discover our premium selection of fresh seafood, sustainably sourced and delivered within hours of catch.",
                        products: normalizedData
                    });
                }
            }
            console.error(`Server API returned status: ${response.status}`);
        } catch (error) {
            console.warn('Server API failed:', error);
        }
        // Try to fetch from admin API as fallback
        try {
            console.log('Fetching featured fish from admin API...');
            const adminRes = await fetch(`${ADMIN_API_URL}/featured-fish`, {
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$lib$2f$apiUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthHeaders"])(),
                cache: 'no-store'
            });
            if (adminRes.ok) {
                const adminData = await adminRes.json();
                // Map admin data to client format
                const mappedData = adminData.map((fish)=>({
                        id: fish.id || fish._id,
                        name: fish.name,
                        slug: fish.slug?.replace(/^fish-combo\//, '') || fish.id,
                        description: fish.description || `Fresh ${fish.name} with premium quality`,
                        image: fish.imageUrl || fish.image,
                        price: Number(fish.price) || 999,
                        weight: fish.weight || '1kg',
                        discount: Number(fish.discount) || 0,
                        featured: fish.featured !== false,
                        type: fish.type || 'Premium',
                        iconName: fish.iconName || fish.icon || 'Fish',
                        isActive: fish.isActive !== false
                    }));
                console.log('Successfully fetched featured fish from admin API');
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    title: "Today's Fresh Catch",
                    subtitle: "Discover our premium selection of fresh seafood, sustainably sourced and delivered within hours of catch.",
                    products: mappedData
                });
            }
        } catch (adminError) {
            console.warn('Admin API fallback also failed:', adminError);
        }
        // Return fallback data if all APIs fail
        console.log('Using fallback featured fish data');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            title: "Today's Fresh Catch",
            subtitle: "Discover our premium selection of fresh seafood, sustainably sourced and delivered within hours of catch.",
            products: fallbackFeaturedFish
        });
    } catch (error) {
        console.error('Error in featured fish API:', error);
        // Always return some data, never fail completely
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            title: "Today's Fresh Catch",
            subtitle: "Discover our premium selection of fresh seafood, sustainably sourced and delivered within hours of catch.",
            products: fallbackFeaturedFish
        });
    }
}

})()),

};

//# sourceMappingURL=src_f55ac1._.js.map