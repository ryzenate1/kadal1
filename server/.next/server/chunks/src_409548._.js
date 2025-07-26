module.exports = {

"[project]/client/src/services/contentService.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

/**
 * Content service for fetching homepage components from admin API
 */ __turbopack_esm__({
    "fetchHomepageComponents": ()=>fetchHomepageComponents,
    "getActiveComponents": ()=>getActiveComponents,
    "getComponentById": ()=>getComponentById,
    "updateHomepageComponents": ()=>updateHomepageComponents
});
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5001/api';
// Mock data for fallback when admin API is not available
const MOCK_HOMEPAGE_COMPONENTS = {
    heroBanner: {
        id: 'hero-banner',
        name: 'Hero Banner',
        isActive: true,
        data: {
            title: 'Fresh Ocean Fish Delivered Daily',
            subtitle: 'Premium quality seafood from our trusted fishermen straight to your doorstep',
            ctaText: 'Shop Now',
            ctaLink: '/products',
            backgroundImage: '/images/hero-bg.jpg'
        }
    },
    trustBadges: {
        id: 'trust-badges',
        name: 'Trust Badges',
        isActive: true,
        data: {
            badges: [
                {
                    icon: '🚚',
                    title: 'Free Delivery',
                    description: 'On orders above ₹500'
                },
                {
                    icon: '❄️',
                    title: 'Fresh Guarantee',
                    description: 'Caught within 24 hours'
                },
                {
                    icon: '⭐',
                    title: 'Premium Quality',
                    description: 'Hand-picked by experts'
                },
                {
                    icon: '🔒',
                    title: 'Secure Payment',
                    description: '100% safe & secure'
                }
            ]
        }
    },
    categories: {
        id: 'categories',
        name: 'Categories',
        isActive: true,
        data: {
            title: 'Fresh Fish Categories',
            categories: [
                {
                    id: '1',
                    name: 'Sea Fish',
                    image: '/images/categories/sea-fish.jpg',
                    count: 25
                },
                {
                    id: '2',
                    name: 'River Fish',
                    image: '/images/categories/river-fish.jpg',
                    count: 18
                },
                {
                    id: '3',
                    name: 'Shell Fish',
                    image: '/images/categories/shell-fish.jpg',
                    count: 12
                },
                {
                    id: '4',
                    name: 'Dried Fish',
                    image: '/images/categories/dried-fish.jpg',
                    count: 8
                }
            ]
        }
    },
    featuredProducts: {
        id: 'featured-products',
        name: 'Featured Products',
        isActive: true,
        data: {
            title: 'Today\'s Fresh Catch',
            products: [
                {
                    id: '1',
                    name: 'Fresh Pomfret',
                    price: 450,
                    image: '/images/products/pomfret.jpg',
                    weight: '1kg'
                },
                {
                    id: '2',
                    name: 'King Fish',
                    price: 600,
                    image: '/images/products/kingfish.jpg',
                    weight: '1kg'
                },
                {
                    id: '3',
                    name: 'Tiger Prawns',
                    price: 800,
                    image: '/images/products/prawns.jpg',
                    weight: '500g'
                }
            ]
        }
    },
    freshDelivery: {
        id: 'fresh-delivery',
        name: 'Fresh Delivery',
        isActive: true,
        data: {
            title: 'Fresh Delivery, From Ocean to Table',
            subtitle: "We believe that the freshest seafood makes for the most delicious meals. That's why we've built a lightning-fast supply chain that brings seafood from the ocean to your table in record time.",
            features: [
                'Same-Day Delivery',
                'Temperature-Controlled Packaging',
                'Freshness Guarantee',
                'Express delivery available'
            ],
            image: '/images/fresh-delivery.jpg'
        }
    },
    sustainability: {
        id: 'sustainability',
        name: 'Sustainability',
        isActive: true,
        data: {
            title: 'Sustainable Fishing Practices',
            description: 'We work with local fishermen who follow sustainable fishing practices to preserve marine life.',
            points: [
                'Responsible fishing methods',
                'Support for local communities',
                'Marine conservation efforts',
                'Eco-friendly packaging'
            ],
            image: '/images/sustainability.jpg'
        }
    },
    blogPosts: {
        id: 'blog-posts',
        name: 'Blog Posts',
        isActive: true,
        data: {
            title: 'Fish Stories & Tips',
            posts: [
                {
                    id: '1',
                    title: 'How to Choose Fresh Fish',
                    excerpt: 'Learn the secrets of selecting the freshest fish for your meals.',
                    image: '/images/blog/fresh-fish-tips.jpg',
                    date: '2025-05-30'
                },
                {
                    id: '2',
                    title: 'Best Cooking Methods for Different Fish',
                    excerpt: 'Discover the perfect cooking techniques for various types of fish.',
                    image: '/images/blog/cooking-methods.jpg',
                    date: '2025-05-28'
                }
            ]
        }
    },
    about: {
        id: 'about',
        name: 'About Section',
        isActive: true,
        data: {
            title: 'About Kadal Thunai',
            description: 'We are passionate about bringing you the freshest seafood from the coast to your kitchen.',
            stats: [
                {
                    label: 'Happy Customers',
                    value: '10,000+'
                },
                {
                    label: 'Fresh Deliveries',
                    value: '50,000+'
                },
                {
                    label: 'Years of Experience',
                    value: '15+'
                },
                {
                    label: 'Fishing Partners',
                    value: '100+'
                }
            ]
        }
    },
    newsletter: {
        id: 'newsletter',
        name: 'Newsletter',
        isActive: true,
        data: {
            title: 'Stay Updated',
            subtitle: 'Get the latest updates on fresh catches and special offers',
            placeholder: 'Enter your email address',
            buttonText: 'Subscribe Now',
            features: [
                'Weekly fresh catch updates',
                'Exclusive member discounts',
                'Cooking tips and recipes'
            ]
        }
    },
    testimonials: {
        id: 'testimonials',
        name: 'Testimonials',
        isActive: true,
        data: {
            title: 'What Our Customers Say',
            testimonials: [
                {
                    id: '1',
                    name: 'Priya Sharma',
                    location: 'Chennai',
                    rating: 5,
                    text: 'The fish quality is exceptional and delivery is always on time. Highly recommended!'
                },
                {
                    id: '2',
                    name: 'Rajesh Kumar',
                    location: 'Bangalore',
                    rating: 5,
                    text: 'Fresh fish delivered right to my doorstep. The convenience and quality are unmatched.'
                }
            ]
        }
    }
};
async function fetchHomepageComponents() {
    try {
        console.log('[ContentService] Fetching from:', `${ADMIN_API_URL}/content/homepage-components`);
        const response = await fetch(`${ADMIN_API_URL}/content/homepage-components`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch components: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        console.log('[ContentService] Raw API response:', result);
        // Our new API returns the components directly, not wrapped in success/data
        console.log('[ContentService] Processing components data:', Object.keys(result));
        console.log('[ContentService] Featured products in response:', result.featuredProducts);
        // Transform the API response to our component format
        // The API returns components directly with id, name, isActive, and data properties
        const components = {
            heroBanner: result.heroBanner || MOCK_HOMEPAGE_COMPONENTS.heroBanner,
            trustBadges: result.trustBadges || MOCK_HOMEPAGE_COMPONENTS.trustBadges,
            categories: result.categories || MOCK_HOMEPAGE_COMPONENTS.categories,
            featuredProducts: result.featuredProducts || MOCK_HOMEPAGE_COMPONENTS.featuredProducts,
            freshDelivery: result.freshDelivery || MOCK_HOMEPAGE_COMPONENTS.freshDelivery,
            sustainability: result.sustainability || MOCK_HOMEPAGE_COMPONENTS.sustainability,
            newsletter: result.newsletter || MOCK_HOMEPAGE_COMPONENTS.newsletter,
            blogPosts: result.blogPosts || MOCK_HOMEPAGE_COMPONENTS.blogPosts,
            about: result.aboutSection || MOCK_HOMEPAGE_COMPONENTS.about,
            testimonials: result.testimonials || MOCK_HOMEPAGE_COMPONENTS.testimonials
        };
        console.log('[ContentService] Transformed components:', Object.keys(components));
        console.log('[ContentService] Transformed featured products:', components.featuredProducts);
        return components;
    } catch (error) {
        console.error('[ContentService] Error fetching components:', error);
        console.log('[ContentService] Falling back to mock data');
        return MOCK_HOMEPAGE_COMPONENTS;
    }
}
async function updateHomepageComponents(components) {
    try {
        const response = await fetch(`${ADMIN_API_URL}/content/homepage-components`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(components)
        });
        if (!response.ok) {
            throw new Error(`Failed to update components: ${response.status}`);
        }
        console.log('[ContentService] Successfully updated homepage components');
        return true;
    } catch (error) {
        console.error('[ContentService] Failed to update components:', error);
        return false;
    }
}
function getComponentById(components, id) {
    const componentKey = Object.keys(components).find((key)=>components[key].id === id);
    if (componentKey) {
        return components[componentKey];
    }
    return null;
}
function getActiveComponents(components) {
    const activeComponents = {};
    console.log('[ContentService] Filtering active components from:', Object.keys(components));
    Object.entries(components).forEach(([key, component])=>{
        console.log(`[ContentService] Component ${key}:`, {
            id: component.id,
            name: component.name,
            isActive: component.isActive
        });
        if (component.isActive) {
            activeComponents[key] = component;
            console.log(`[ContentService] Added ${key} to active components`);
        } else {
            console.log(`[ContentService] Skipped ${key} - not active`);
        }
    });
    console.log('[ContentService] Final active components:', Object.keys(activeComponents));
    return activeComponents;
}

})()),
"[project]/client/src/app/api/content/refresh/route.ts [app-route] (ecmascript)": (({ r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__ }) => (() => {
"use strict";

__turbopack_esm__({
    "GET": ()=>GET,
    "dynamic": ()=>dynamic
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$services$2f$contentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/client/src/services/contentService.ts [app-route] (ecmascript)");
"__TURBOPACK__ecmascript__hoisting__location__";
;
;
const dynamic = 'force-dynamic';
async function GET(request) {
    try {
        // Fetch the latest components from the admin API
        const components = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$services$2f$contentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchHomepageComponents"])();
        // Get only the active components for the frontend
        const activeComponents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$client$2f$src$2f$services$2f$contentService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveComponents"])(components);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            components,
            activeComponents,
            totalComponents: Object.keys(components).length,
            activeCount: Object.keys(activeComponents).length
        });
    } catch (error) {
        console.error('[API] Failed to fetch homepage components:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch components',
            components: {}
        }, {
            status: 500
        });
    }
}

})()),

};

//# sourceMappingURL=src_409548._.js.map