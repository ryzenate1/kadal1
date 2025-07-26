import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory storage for components (in production, this would be a database)
let storedComponents: any = null;

// Helper function to get components (either stored or default)
function getComponents() {
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
    },    featuredProducts: {
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
        content: 'We work with local fishing communities to ensure sustainable practices that protect marine ecosystems.',
        features: ['Sustainable fishing methods', 'Support for local communities', 'Ocean conservation', 'Responsible sourcing'],
        image: '/images/sustainability.jpg',
        ctaText: 'Our Mission',
        ctaLink: '/sustainability'
      }
    },
    blogPosts: {
      id: 'blog-posts',
      name: 'Blog Posts Section',
      type: 'blog-section',
      isActive: true,
      order: 7,
      lastModified: new Date(),
      data: {
        title: 'From Our Blog',
        subtitle: 'Latest news and recipes',
        showMoreLink: '/blog',
        posts: []
      }
    },
    aboutSection: {
      id: 'about-section',
      name: 'About Section',
      type: 'about-section',
      isActive: true,
      order: 8,
      lastModified: new Date(),
      data: {
        title: 'About Kadal Thunai',
        subtitle: 'Your trusted seafood partner',
        content: 'Founded by passionate fishermen, we bring you the freshest seafood from Tamil Nadu\'s coastal waters.',
        image: '/images/about-us.jpg',
        ctaText: 'Our Story',
        ctaLink: '/about'
      }
    },
    testimonials: {
      id: 'testimonials',
      name: 'Testimonials Section',
      type: 'testimonials',
      isActive: true,
      order: 9,
      lastModified: new Date(),
      data: {
        title: 'What Our Customers Say',
        testimonials: [
          {
            name: 'Priya Sharma',
            location: 'Chennai',
            rating: 5,
            comment: 'Amazing freshness! The fish was caught the same day it was delivered.',
            image: '/images/testimonials/customer1.jpg'
          },
          {
            name: 'Rajesh Kumar',
            location: 'Bangalore', 
            rating: 5,
            comment: 'Best seafood delivery service. Always fresh and well-packaged.',
            image: '/images/testimonials/customer2.jpg'
          }
        ]
      }
    }
  };
    return storedComponents || defaultComponents;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function GET() {
  try {
    const components = getComponents();
    
    return NextResponse.json({
      success: true,
      data: components,
      totalComponents: Object.keys(components).length,
      activeComponents: Object.values(components).filter((comp: any) => comp.isActive).length
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*', // In production, restrict this to your client domain
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error fetching homepage components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage components' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const components = await req.json();
    
    // Store the components in memory (in production, this would save to a database)
    storedComponents = components;
    console.log('Homepage components updated:', Object.keys(components));
    console.log('Hero banner isActive:', components.heroBanner?.isActive);
      return NextResponse.json({
      success: true,
      message: 'Homepage components updated successfully',
      data: components
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*', // In production, restrict this to your client domain
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error updating homepage components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update homepage components' },
      { status: 500 }
    );
  }
}

// PATCH method to update individual component status
export async function PATCH(request: NextRequest) {
  try {
    const { componentId, isActive } = await request.json();
    
    if (!componentId) {
      return NextResponse.json(
        { success: false, error: 'Component ID is required' },
        { status: 400 }
      );
    }
    
    // Get current components
    const components = getComponents();
    
    // Check if component exists
    if (!components[componentId]) {
      return NextResponse.json(
        { success: false, error: `Component '${componentId}' not found` },
        { status: 404 }
      );
    }
    
    // Update the component status
    components[componentId].isActive = isActive;
    components[componentId].lastModified = new Date();
    
    // Store the updated components
    storedComponents = components;
      console.log(`Component '${componentId}' isActive set to:`, isActive);
    
    return NextResponse.json({
      success: true,
      message: `Component '${componentId}' updated successfully`,
      data: {
        componentId,
        isActive,
        lastModified: components[componentId].lastModified
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*', // In production, restrict this to your client domain
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error updating component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update component' },
      { status: 500 }
    );
  }
}
