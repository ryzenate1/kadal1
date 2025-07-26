module.exports = {

"[project]/client/src/app/api/user/profile/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "GET": ()=>GET,
    "PATCH": ()=>PATCH
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
// Mock user data - in a real app, this would come from a database
let mockUsers = {
    'testuser@kadalthunai.com': {
        id: 'user_123',
        name: 'Test User',
        email: 'testuser@kadalthunai.com',
        phoneNumber: '9876543210',
        profileImage: null,
        memberSince: new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        }),
        totalOrders: 5,
        savedAmount: 250,
        loyaltyPoints: 150,
        notificationsEnabled: true,
        isActive: true
    }
};
async function GET(request) {
    try {
        // In a real app, you'd get the user from the session/token
        const userEmail = 'testuser@kadalthunai.com'; // Mock authentication
        const user = mockUsers[userEmail];
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function PATCH(request) {
    try {
        const body = await request.json();
        const { name, email, phoneNumber } = body;
        // Validate input
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Name is required'
            }, {
                status: 400
            });
        }
        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Valid email is required'
            }, {
                status: 400
            });
        }
        if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Valid 10-digit phone number is required'
            }, {
                status: 400
            });
        }
        // In a real app, you'd get the user from the session/token
        const userEmail = 'testuser@kadalthunai.com'; // Mock authentication
        const user = mockUsers[userEmail];
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User not found'
            }, {
                status: 404
            });
        }
        // Update the user data
        mockUsers = {
            ...mockUsers,
            [userEmail]: {
                ...user,
                name: name.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.replace(/\D/g, '')
            }
        };
        // Simulate some processing time
        await new Promise((resolve)=>setTimeout(resolve, 500));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(mockUsers[userEmail]);
    } catch (error) {
        console.error('Error updating user profile:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}

})()),

};

//# sourceMappingURL=src_app_api_user_profile_route_ts_65460b._.js.map