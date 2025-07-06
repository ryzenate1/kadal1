'use client';

import { useState, useEffect } from 'react';
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Categories from "@/components/home/Categories";
import BlogPosts from "@/components/home/BlogPosts";
import SustainabilitySection from "@/components/home/SustainabilitySection";
import AboutSection from "@/components/home/AboutSection";
import FreshDeliverySection from "@/components/home/FreshDeliverySection";
import FixedFreshDeliverySection from "@/components/home/FixedFreshDeliverySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TrustBadgesSection from "@/components/home/TrustBadgesSection";
import { HomepageComponents } from "@/services/contentService";

interface DynamicHomepageProps {
  initialComponents: Partial<HomepageComponents>;
}

export default function DynamicHomepage({ initialComponents }: DynamicHomepageProps) {
  const [components, setComponents] = useState<Partial<HomepageComponents>>(initialComponents);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch latest components from admin API
  const refreshComponents = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/content/refresh');
      if (response.ok) {
        const data = await response.json();
        setComponents(data.components);
        console.log('[DynamicHomepage] Components refreshed successfully');
      }
    } catch (error) {
      console.error('[DynamicHomepage] Failed to refresh components:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 10 seconds for demo purposes
  useEffect(() => {
    const interval = setInterval(refreshComponents, 10000);
    return () => clearInterval(interval);
  }, []);  // Calculate active components - ensure we include the full component data
  const activeComponents = Object.fromEntries(
    Object.entries(components).filter(([_, component]) => component?.isActive === true)
  ) as Partial<HomepageComponents>;

  const totalComponents = Object.keys(components).length;
  const activeCount = Object.keys(activeComponents).length;
  const isAdminControlled = totalComponents > 0;
  // Debug logging for featured products
  useEffect(() => {
    console.log('[DynamicHomepage] Components updated:', components);
    console.log('[DynamicHomepage] Active components:', activeComponents);
    console.log('[DynamicHomepage] Featured Products component:', components.featuredProducts);
    console.log('[DynamicHomepage] Featured Products isActive:', components.featuredProducts?.isActive);
    console.log('[DynamicHomepage] Featured Products in activeComponents:', activeComponents.featuredProducts);
    console.log('[DynamicHomepage] Featured Products data:', activeComponents.featuredProducts?.data);
    console.log('[DynamicHomepage] Testimonials component:', components.testimonials);
    console.log('[DynamicHomepage] Testimonials isActive:', components.testimonials?.isActive);
    console.log('[DynamicHomepage] Testimonials in activeComponents:', activeComponents.testimonials);
    console.log('[DynamicHomepage] freshDelivery in activeComponents:', activeComponents.freshDelivery);
    console.log('[DynamicHomepage] sustainability in activeComponents:', activeComponents.sustainability);
    console.log('[DynamicHomepage] blogPosts in activeComponents:', activeComponents.blogPosts);
    console.log('[DynamicHomepage] about in activeComponents:', activeComponents.about);
  }, [components, activeComponents]);

  return (
    <div className="bg-gradient-to-b from-red-50 to-white min-h-screen">
      {/* Admin Control Status Banner */}
      {isAdminControlled && (
        <div className="bg-blue-600 text-white text-center py-2 px-4 text-sm relative">
          🎛️ Content managed by Admin Dashboard | Active Components: {activeCount}/{totalComponents} | 
          <span className="font-semibold ml-2">Live Preview Mode</span>
          {isRefreshing && (
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
              🔄 Refreshing...
            </span>
          )}
          <button 
            onClick={refreshComponents}
            className="ml-4 px-2 py-1 bg-blue-500 hover:bg-blue-400 rounded text-xs"
            disabled={isRefreshing}
          >
            Refresh Now
          </button>
        </div>
      )}
      
      {/* Hero Section */}
      {activeComponents.heroBanner && (
        <HeroBanner />
      )}
      
      {/* Main Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Section */}
        {activeComponents.trustBadges && (
          <section 
            id="trust-badges-section" 
            className="pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-8 lg:pb-12"
          >
            <TrustBadgesSection />
          </section>
        )}        {/* Categories Section */}
        {activeComponents.categories && (
          <section 
            id="categories-section" 
            className="py-6 sm:py-8 lg:py-12"
          >
            <Categories adminData={activeComponents.categories.data} />
          </section>
        )}        {/* Featured Products Section */}
        {activeComponents.featuredProducts && (          <section 
            id="featured-products-section" 
            className="py-8 sm:py-12 lg:py-16"
          >
            <FeaturedProducts adminData={activeComponents.featuredProducts?.data} />
          </section>
        )}        {/* Fresh Delivery Section */}
        {activeComponents.freshDelivery && (
          <section id="fresh-delivery-section" className="py-6 sm:py-8 lg:py-12">            <FreshDeliverySection adminData={activeComponents.freshDelivery.data} />
            {/* Hidden fallback that will be shown if main component is invisible */}
            <div className="hidden invisible-fallback">
              <FixedFreshDeliverySection adminData={activeComponents.freshDelivery.data} />
            </div>
            {/* Script to detect if main component is invisible and show fallback */}
            <script dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Wait for the DOM to be fully loaded
                  setTimeout(function() {
                    var mainSection = document.querySelector('#fresh-delivery-section > section:first-child');
                    var fallback = document.querySelector('.invisible-fallback');
                    
                    // If main section is not visible (computed style)
                    if (mainSection && fallback) {
                      var style = window.getComputedStyle(mainSection);
                      if (style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none') {
                        fallback.classList.remove('hidden');
                      }
                    }
                  }, 1000); // Wait 1 second for animations to complete
                })();
              `
            }} />
          </section>
        )}
        
        {/* Sustainability Section */}
        {activeComponents.sustainability && (
          <SustainabilitySection />
        )}
        
        {/* Blog Posts Section */}
        {activeComponents.blogPosts && (
          <section 
            id="blog-posts-section" 
            className="py-8 sm:py-12 lg:py-16"
          >
            <BlogPosts />
          </section>
        )}
        
        {/* About Section */}
        {activeComponents.about && (
          <AboutSection />
        )}
        
        {/* Testimonials Section */}
        {activeComponents.testimonials && (
          <section 
            id="testimonials-section" 
            className="py-8 sm:py-12 lg:py-16"
          >
            <TestimonialsSection />
          </section>
        )}
      </div>
    </div>
  );
}
