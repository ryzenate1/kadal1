/**
 * Content service for fetching homepage components from admin API
 */

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5001/api';

// Homepage component interfaces matching admin structure
export interface ComponentContent {
  id: string;
  name: string;
  isActive: boolean;
  data: any;
}

export interface HomepageComponents {
  heroBanner: ComponentContent;
  trustBadges: ComponentContent;
  categories: ComponentContent;
  featuredProducts: ComponentContent;
  freshDelivery: ComponentContent;
  sustainability: ComponentContent;
  newsletter: ComponentContent;
  blogPosts: ComponentContent;
  about: ComponentContent;
  testimonials: ComponentContent;
}

// Mock data for fallback when admin API is not available
const MOCK_HOMEPAGE_COMPONENTS: HomepageComponents = {
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
        { icon: '🚚', title: 'Free Delivery', description: 'On orders above ₹500' },
        { icon: '❄️', title: 'Fresh Guarantee', description: 'Caught within 24 hours' },
        { icon: '⭐', title: 'Premium Quality', description: 'Hand-picked by experts' },
        { icon: '🔒', title: 'Secure Payment', description: '100% safe & secure' }
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
        { id: '1', name: 'Sea Fish', image: '/images/categories/sea-fish.jpg', count: 25 },
        { id: '2', name: 'River Fish', image: '/images/categories/river-fish.jpg', count: 18 },
        { id: '3', name: 'Shell Fish', image: '/images/categories/shell-fish.jpg', count: 12 },
        { id: '4', name: 'Dried Fish', image: '/images/categories/dried-fish.jpg', count: 8 }
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
        { id: '1', name: 'Fresh Pomfret', price: 450, image: '/images/products/pomfret.jpg', weight: '1kg' },
        { id: '2', name: 'King Fish', price: 600, image: '/images/products/kingfish.jpg', weight: '1kg' },
        { id: '3', name: 'Tiger Prawns', price: 800, image: '/images/products/prawns.jpg', weight: '500g' }
      ]
    }
  },  freshDelivery: {
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
        { label: 'Happy Customers', value: '10,000+' },
        { label: 'Fresh Deliveries', value: '50,000+' },
        { label: 'Years of Experience', value: '15+' },
        { label: 'Fishing Partners', value: '100+' }
      ]
    }  },
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

/**
 * Fetch homepage components from admin API
 */
export async function fetchHomepageComponents(): Promise<HomepageComponents> {
  try {
    console.log('[ContentService] Fetching from:', `${ADMIN_API_URL}/content/homepage-components`);
    const response = await fetch(`${ADMIN_API_URL}/content/homepage-components`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
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
    const components: HomepageComponents = {
      heroBanner: result.heroBanner || MOCK_HOMEPAGE_COMPONENTS.heroBanner,
      trustBadges: result.trustBadges || MOCK_HOMEPAGE_COMPONENTS.trustBadges,
      categories: result.categories || MOCK_HOMEPAGE_COMPONENTS.categories,
      featuredProducts: result.featuredProducts || MOCK_HOMEPAGE_COMPONENTS.featuredProducts,
      freshDelivery: result.freshDelivery || MOCK_HOMEPAGE_COMPONENTS.freshDelivery,
      sustainability: result.sustainability || MOCK_HOMEPAGE_COMPONENTS.sustainability,
      newsletter: result.newsletter || MOCK_HOMEPAGE_COMPONENTS.newsletter,
      blogPosts: result.blogPosts || MOCK_HOMEPAGE_COMPONENTS.blogPosts,
      about: result.aboutSection || MOCK_HOMEPAGE_COMPONENTS.about,
      testimonials: result.testimonials || MOCK_HOMEPAGE_COMPONENTS.testimonials,
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

/**
 * Update homepage components in admin API
 */
export async function updateHomepageComponents(components: HomepageComponents): Promise<boolean> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/content/homepage-components`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

/**
 * Get a specific component by ID
 */
export function getComponentById(components: HomepageComponents, id: string): ComponentContent | null {
  const componentKey = Object.keys(components).find(key => 
    components[key as keyof HomepageComponents].id === id
  );
  
  if (componentKey) {
    return components[componentKey as keyof HomepageComponents];
  }
  
  return null;
}

/**
 * Get only active components
 */
export function getActiveComponents(components: HomepageComponents): Partial<HomepageComponents> {
  const activeComponents: Partial<HomepageComponents> = {};
  
  console.log('[ContentService] Filtering active components from:', Object.keys(components));
  
  Object.entries(components).forEach(([key, component]) => {
    console.log(`[ContentService] Component ${key}:`, {
      id: component.id,
      name: component.name,
      isActive: component.isActive
    });
    
    if (component.isActive) {
      activeComponents[key as keyof HomepageComponents] = component;
      console.log(`[ContentService] Added ${key} to active components`);
    } else {
      console.log(`[ContentService] Skipped ${key} - not active`);
    }
  });
  
  console.log('[ContentService] Final active components:', Object.keys(activeComponents));
  return activeComponents;
}
