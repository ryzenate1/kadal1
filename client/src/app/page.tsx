import HeroBanner from "@/components/home/HeroBanner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BlogSection from "@/components/home/BlogSection";
import FreshDeliverySection from "@/components/home/FreshDeliverySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import SimpleTrustBadges from "@/components/home/SimpleTrustBadges";
import ImageCarousel from "@/components/shared/ImageCarousel";
import RoundedCategories from "@/components/home/RoundedCategories";
import CategorySlider from "@/components/home/CategorySlider";
import ShopByCategory from "@/components/shared/ShopByCategory";

export default function Home() {
  return (
    <div className="bg-[var(--primary-bg)] min-h-screen">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <HeroBanner />
        <div className="mb-2 sm:mb-3"></div>
        
        {/* Simple Trust Badges - FSSAI, Same Day Delivery, Best Price, Premium Quality */}
        <SimpleTrustBadges />
        <div className="mb-4 sm:mb-6"></div>
        
        {/* Featured Image Carousel - Fresh Catch Gallery */}
        <ImageCarousel />
        <div className="mb-6 sm:mb-8"></div>
        
        {/* Shop by Categories with rounded cards */}
        {/* <RoundedCategories /> */}
        <ShopByCategory />
        <div className="mb-6 sm:mb-8"></div>
        
        {/* Horizontal category slider */}
        <CategorySlider />
        <div className="mb-6 sm:mb-8"></div>
        

        {/* Fresh Delivery Section */}
        <FreshDeliverySection />
        <div className="mb-6 sm:mb-8"></div>
        
        <BlogSection />
        <div className="mb-2 sm:mb-3"></div>
        <TestimonialsSection />
        
        {/* Visual separator between testimonials and footer */}
        <div className="mt-8 mb-0">
          <hr className="border-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>
      </div>
    </div>
  );
}