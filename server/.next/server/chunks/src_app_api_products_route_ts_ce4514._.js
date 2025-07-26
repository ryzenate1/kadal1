module.exports = {

"[project]/client/src/app/api/products/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "GET": ()=>GET,
    "dynamic": ()=>dynamic
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
const dynamic = 'force-dynamic';
async function GET(req) {
    const { searchParams } = new URL(req.url);
    // Extract all query parameters
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const tag = searchParams.get('tag');
    const limit = searchParams.get('limit');
    // Build the query string for the server API
    const queryParts = [];
    if (categoryId) queryParts.push(`categoryId=${categoryId}`);
    if (featured) queryParts.push(`featured=${featured}`);
    if (tag) queryParts.push(`tag=${tag}`);
    if (limit) queryParts.push(`limit=${limit}`);
    let url = 'http://localhost:5001/api/products';
    if (queryParts.length > 0) {
        url += `?${queryParts.join('&')}`;
    }
    try {
        const res = await fetch(url, {
            next: {
                revalidate: 0
            }
        });
        if (!res.ok) {
            console.error(`Server API returned status: ${res.status}`);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to fetch products'
            }, {
                status: res.status
            });
        }
        const data = await res.json();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        console.error('Error fetching products:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}

})()),

};

//# sourceMappingURL=src_app_api_products_route_ts_ce4514._.js.map