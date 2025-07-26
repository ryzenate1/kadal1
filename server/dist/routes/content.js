"use strict";
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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Helper function to get homepage components
function getHomepageComponents() {
    const defaultComponents = {
        heroBanner: {
            id: 'hero-banner',
            name: 'Hero Banner',
            type: 'hero',
            isActive: true,
            order: 1,
            lastModified: new Date(),
            data: {
                title: 'Fresh Seafood Delivered to Your Doorstep',
                subtitle: 'Premium quality fish and seafood from Tamil Nadu\'s coastal waters',
                description: 'Experience the finest selection of fresh fish, prawns, and seafood delivered within 24 hours of catch.',
                primaryButtonText: 'Shop Now',
                primaryButtonLink: '/shop',
                secondaryButtonText: 'Learn More',
                secondaryButtonLink: '/about',
                backgroundImage: '/images/hero-background.jpg',
                overlayOpacity: 0.6
            }
        },
        trustBadges: {
            id: 'trust-badges',
            name: 'Trust Badges Section',
            type: 'trust-badges',
            isActive: true,
            order: 2,
            lastModified: new Date(),
            data: {
                badges: [
                    { icon: 'clock', title: '24hr Fresh', description: 'Delivered within 24 hours' },
                    { icon: 'shield', title: 'Quality Assured', description: 'Premium quality guarantee' },
                    { icon: 'truck', title: 'Free Delivery', description: 'Free delivery on orders above ₹500' },
                    { icon: 'phone', title: '24/7 Support', description: 'Round the clock customer support' }
                ]
            }
        },
        categories: {
            id: 'categories',
            name: 'Categories Section',
            type: 'categories',
            isActive: true,
            order: 3,
            lastModified: new Date(),
            data: {
                title: 'Shop by Category',
                subtitle: 'Fresh catches from the sea',
                categories: [
                    { name: 'Fresh Fish', image: '/images/categories/fish.jpg', link: '/category/fish' },
                    { name: 'Prawns & Shrimp', image: '/images/categories/prawns.jpg', link: '/category/prawns' },
                    { name: 'Crab & Lobster', image: '/images/categories/crab.jpg', link: '/category/crab' },
                    { name: 'Dried Fish', image: '/images/categories/dried.jpg', link: '/category/dried' }
                ]
            }
        },
        featuredProducts: {
            id: 'featured-products',
            name: 'Featured Products',
            type: 'featured-products',
            isActive: true,
            order: 4,
            lastModified: new Date(),
            data: {
                title: 'Today\'s Fresh Catch',
                subtitle: 'Handpicked from our daily catch',
                showMoreLink: '/products',
                products: [
                    {
                        id: 'premium-combo',
                        name: 'Premium Fish Combo',
                        image: 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop',
                        slug: 'premium',
                        type: 'Premium',
                        description: 'Curated selection of premium fish varieties',
                        featured: true,
                        price: 999,
                        weight: '1.2kg',
                        discount: 10,
                        tag: 'Premium',
                        isActive: true
                    },
                    {
                        id: 'grilling-special',
                        name: 'Grilling Special',
                        image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop',
                        slug: 'grilling',
                        type: 'Combo',
                        description: 'Perfect for seafood barbecues and grilling',
                        featured: true,
                        price: 899,
                        weight: '800g',
                        discount: 15,
                        tag: 'BBQ Special',
                        isActive: true
                    },
                    {
                        id: 'seafood-feast',
                        name: 'Seafood Feast',
                        image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop',
                        slug: 'feast',
                        type: 'Combo',
                        description: 'Premium selection of mixed seafood',
                        featured: true,
                        price: 1299,
                        weight: '1.5kg',
                        discount: 8,
                        tag: 'Family Pack',
                        isActive: true
                    },
                    {
                        id: 'fresh-catch',
                        name: 'Fresh Catch Box',
                        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop',
                        slug: 'fresh-catch',
                        type: 'Fresh',
                        description: 'Today\'s freshest catches from local fishermen',
                        featured: true,
                        price: 799,
                        weight: '900g',
                        discount: 12,
                        tag: 'Fresh Daily',
                        isActive: true
                    }
                ]
            }
        },
        freshDelivery: {
            id: 'fresh-delivery',
            name: 'Fresh Delivery Section',
            type: 'info-section',
            isActive: true,
            order: 5,
            lastModified: new Date(),
            data: {
                title: 'Farm to Table Freshness',
                subtitle: 'How we ensure quality',
                content: 'Our seafood is caught fresh daily by local fishermen and delivered to your doorstep within 24 hours.',
                features: ['Direct from fishermen', 'Quality tested', 'Temperature controlled delivery', 'Eco-friendly packaging'],
                image: '/images/delivery-process.jpg',
                ctaText: 'Learn More',
                ctaLink: '/about'
            }
        },
        sustainability: {
            id: 'sustainability',
            name: 'Sustainability Section',
            type: 'info-section',
            isActive: true,
            order: 6,
            lastModified: new Date(),
            data: {
                title: 'Sustainable Fishing Practices',
                subtitle: 'Protecting our oceans for future generations',
                content: 'We work with local fishermen who follow sustainable fishing practices to preserve marine ecosystems.',
                features: ['Sustainable sourcing', 'Ocean conservation', 'Supporting local communities', 'Minimal environmental impact'],
                image: '/images/sustainability.jpg',
                ctaText: 'Our Mission',
                ctaLink: '/sustainability'
            }
        }, newsletter: {
            id: 'newsletter',
            name: 'Newsletter Section',
            type: 'newsletter',
            isActive: true,
            order: 7,
            lastModified: new Date(),
            data: {
                title: 'Stay Updated',
                subtitle: 'Get the freshest updates',
                description: 'Subscribe to our newsletter for the latest catches, seasonal offers, and seafood recipes.',
                placeholder: 'Enter your email address',
                buttonText: 'Subscribe Now',
                benefits: ['Weekly fresh catch updates', 'Exclusive member discounts', 'Seasonal recipe collections', 'Early access to new products']
            }
        },
        blogPosts: {
            id: 'blog-posts',
            name: 'Blog Posts',
            type: 'blog-posts',
            isActive: true,
            order: 8,
            lastModified: new Date(),
            data: {
                title: 'Latest News & Recipes',
                subtitle: 'Fresh content from our kitchen',
                posts: [
                    {
                        id: '1',
                        title: 'Best Ways to Cook Fresh Fish',
                        excerpt: 'Discover the secrets to cooking fish that preserves its natural flavors.',
                        image: '/images/blog/cooking-tips.jpg',
                        date: '2025-06-01',
                        readTime: '5 min read'
                    },
                    {
                        id: '2',
                        title: 'Sustainable Fishing Practices',
                        excerpt: 'Learn about our commitment to sustainable fishing and ocean conservation.',
                        image: '/images/blog/sustainability.jpg',
                        date: '2025-05-28',
                        readTime: '3 min read'
                    }
                ]
            }
        },
        aboutSection: {
            id: 'about',
            name: 'About Section',
            type: 'about',
            isActive: true,
            order: 9,
            lastModified: new Date(),
            data: {
                title: 'About Kadal Thunai',
                subtitle: 'Your trusted seafood partner',
                content: 'We are a family-owned business dedicated to bringing you the freshest seafood from Tamil Nadu\'s coastal waters. With over 20 years of experience, we work directly with local fishermen to ensure quality and sustainability.',
                features: [
                    'Direct from fishermen',
                    'Quality guaranteed',
                    'Sustainable practices',
                    'Fresh daily catches'
                ],
                image: '/images/about-us.jpg',
                ctaText: 'Learn More',
                ctaLink: '/about'
            }
        },
        testimonials: {
            id: 'testimonials',
            name: 'Testimonials',
            type: 'testimonials',
            isActive: true,
            order: 10,
            lastModified: new Date(),
            data: {
                title: 'What Our Customers Say',
                subtitle: 'Real reviews from satisfied customers',
                testimonials: [
                    {
                        id: '1',
                        name: 'Priya Sharma',
                        location: 'Chennai',
                        rating: 5,
                        text: 'The fish quality is exceptional and delivery is always on time. Highly recommended!',
                        image: '/images/testimonials/priya.jpg'
                    },
                    {
                        id: '2',
                        name: 'Rajesh Kumar',
                        location: 'Bangalore',
                        rating: 5,
                        text: 'Fresh fish delivered right to my doorstep. The convenience and quality are unmatched.',
                        image: '/images/testimonials/rajesh.jpg'
                    },
                    {
                        id: '3',
                        name: 'Meera Devi',
                        location: 'Coimbatore',
                        rating: 5,
                        text: 'Best seafood delivery service. The fish is always fresh and packaging is excellent.',
                        image: '/images/testimonials/meera.jpg'
                    }
                ]
            }
        }
    };
    return defaultComponents;
}
// GET /api/content/homepage-components
router.get('/homepage-components', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('📋 [SERVER] Homepage components endpoint called');
        const components = getHomepageComponents();
        const responseData = {
            success: true,
            data: components,
            totalComponents: Object.keys(components).length,
            activeComponents: Object.values(components).filter((comp) => comp.isActive).length
        };
        console.log('📋 [SERVER] Returning homepage components:', {
            totalComponents: responseData.totalComponents,
            activeComponents: responseData.activeComponents,
            featuredProductsActive: components.featuredProducts.isActive
        });
        res.json(responseData);
    }
    catch (error) {
        console.error('❌ [SERVER] Error fetching homepage components:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch homepage components'
        });
    }
}));
exports.default = router;
