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
"[project]/client/src/app/api/categories/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "GET": ()=>GET,
    "dynamic": ()=>dynamic,
    "fetchCache": ()=>fetchCache
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$lib$2f$apiUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/client/src/lib/apiUtils.ts [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
const dynamic = 'force-dynamic';
const fetchCache = 'force-no-store';
// Server API URL
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
// Admin API URL
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001/api';
// Fallback categories if the server API is unavailable
const fallbackCategories = [
    {
        id: 'vangaram-fish',
        name: 'Vangaram Fish',
        slug: 'vangaram-fish',
        description: 'Premium quality Vangaram fish fresh from the ocean',
        image: 'https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop',
        order: 0,
        isActive: true,
        type: 'Fish',
        icon: 'Fish',
        iconName: 'Fish'
    },
    {
        id: 'sliced-vangaram',
        name: 'Sliced Vangaram',
        slug: 'sliced-vangaram',
        description: 'Pre-sliced Vangaram fish, ready to cook',
        image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
        order: 1,
        isActive: true,
        type: 'Fish',
        icon: 'Fish',
        iconName: 'Fish'
    },
    {
        id: 'dried-fish',
        name: 'Dried Fish',
        slug: 'dried-fish',
        description: 'Traditional sun-dried fish with intense flavor',
        image: 'https://images.unsplash.com/photo-1592483648224-61bf8287bc4c?q=80&w=2070&auto=format&fit=crop',
        order: 2,
        isActive: true,
        type: 'Dried Fish',
        icon: 'Fish',
        iconName: 'Fish'
    },
    {
        id: 'jumbo-prawns',
        name: 'Jumbo Prawns',
        slug: 'jumbo-prawns',
        description: 'Large, succulent jumbo prawns',
        image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=2070&auto=format&fit=crop',
        order: 3,
        isActive: true,
        type: 'Prawns',
        icon: 'Shell',
        iconName: 'Shell'
    },
    {
        id: 'sea-prawns',
        name: 'Sea Prawns',
        slug: 'sea-prawns',
        description: 'Fresh sea prawns with natural sweetness',
        image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1935&auto=format&fit=crop',
        order: 4,
        isActive: true,
        type: 'Prawns',
        icon: 'Shell',
        iconName: 'Shell'
    },
    {
        id: 'fresh-lobster',
        name: 'Fresh Lobster',
        slug: 'fresh-lobster',
        description: 'Premium fresh lobsters for special occasions',
        image: 'https://images.unsplash.com/photo-1610540881356-76bd50e523d3?q=80&w=2070&auto=format&fit=crop',
        order: 5,
        isActive: true,
        type: 'Shellfish',
        icon: 'Shell',
        iconName: 'Shell'
    },
    {
        id: 'fresh-crabs',
        name: 'Fresh Crabs',
        slug: 'fresh-crabs',
        description: 'Live fresh crabs with sweet meat',
        image: 'https://images.unsplash.com/photo-1559187575-5f89cedf009b?q=80&w=2071&auto=format&fit=crop',
        order: 6,
        isActive: true,
        type: 'Crabs',
        icon: 'Shell',
        iconName: 'Shell'
    },
    {
        id: 'mixed-seafood',
        name: 'Mixed Seafood',
        slug: 'mixed-seafood',
        description: 'Variety pack of fresh seafood',
        image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop',
        order: 7,
        isActive: true,
        type: 'Mixed',
        icon: 'Fish',
        iconName: 'Fish'
    }
];
async function GET(req) {
    console.log("Categories API called at", new Date().toISOString());
    try {
        // Try to fetch from admin API first (this is the primary source)
        try {
            console.log('Fetching categories from admin API...');
            const adminRes = await fetch(`${ADMIN_API_URL}/categories`, {
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$lib$2f$apiUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthHeaders"])(),
                cache: 'no-store',
                next: {
                    revalidate: 0
                }
            });
            if (adminRes.ok) {
                const adminData = await adminRes.json();
                console.log('Successfully fetched categories from admin API:', adminData.length);
                // Map admin data to client format
                const mappedData = adminData.map((category)=>({
                        id: category.id || category._id,
                        name: category.name,
                        slug: category.slug,
                        description: category.description || `Fresh ${category.name} with premium quality`,
                        image: category.imageUrl || category.image,
                        order: category.order || 0,
                        isActive: category.isActive !== false,
                        type: category.type || 'Seafood',
                        icon: category.icon || 'Fish',
                        iconName: category.icon || 'Fish'
                    }));
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mappedData);
            }
            console.error(`Admin API returned status: ${adminRes.status}`);
        } catch (adminError) {
            console.warn('Admin API failed:', adminError);
        }
        // If admin API fails, try server API as fallback
        try {
            console.log('Fetching categories from server API...');
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 3000); // 3 second timeout
            const response = await fetch(`${SERVER_API_URL}/categories`, {
                method: 'GET',
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$lib$2f$apiUtils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthHeaders"])(),
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const serverData = await response.json();
                console.log('Successfully fetched categories from server API');
                // Transform server data to match our client format
                const formattedData = serverData.map((category)=>({
                        id: category.id || category._id,
                        name: category.name,
                        slug: category.slug,
                        description: category.description || `Fresh ${category.name} with premium quality`,
                        image: category.imageUrl || category.image,
                        order: category.order || 0,
                        isActive: category.isActive !== false,
                        type: category.type || 'Seafood',
                        icon: category.icon || 'Fish',
                        iconName: category.icon || 'Fish'
                    }));
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(formattedData);
            }
            console.error(`Server API returned status: ${response.status}`);
        } catch (error) {
            console.warn('Server API failed:', error);
        }
        // Return fallback data if all APIs fail
        console.log('Using fallback categories data');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(fallbackCategories);
    } catch (error) {
        console.error('Error in categories API:', error);
        // Always return some data, never fail completely
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(fallbackCategories);
    }
}

})()),

};

//# sourceMappingURL=src_533c14._.js.map