"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, AlertTriangle, ShoppingCart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Category interface
interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  image: string;
  type?: string;
  icon?: string;
  iconName?: string;
  isActive?: boolean;
  order?: number;
}

export default function CategoryListing() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        
        if (!res.ok) {
          throw new Error(`Failed to fetch categories (Status: ${res.status})`);
        }
        
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          // Filter out inactive categories
          const activeCategories = data.filter(cat => cat.isActive !== false);
          setCategories(activeCategories);
        } else {
          setError("No categories found");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Get icon component based on name
  const getIconComponent = (iconName: string | undefined) => {
    if (!iconName) return null;
    
    switch (iconName.toLowerCase()) {
      case 'fish':
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 3v18"></path><path d="M9 3.5 9 20.5"></path><path d="M15 3.5 15 20.5"></path><path d="M5.5 4 5.5 20"></path><path d="M18.5 4 18.5 20"></path><path d="M3.5 8H20.5"></path><path d="M3.5 16H20.5"></path></svg>;
      case 'shell':
        return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 11c.2 0 2-1 2-1"></path><path d="M7 11c1.3 0 2.5-.4 3-1"></path><path d="M22.2 8S21 7 19 7c-1.3 0-2.4.2-3.2.6A5 5 0 0 0 12 7a5 5 0 0 0-3.8.6C7.4 7.2 6.3 7 5 7c-2 0-3.2 1-3.2 1s-1 1.6-1 4.8c0 1.9 1 5.1 1.7 5.9.7.8 1.9 1.3 3.5 1.3 2.3 0 3.4-1.2 4.4-2.2.8-.7 1.2-1.1 1.6-1.1.4 0 .8.4 1.6 1.1 1 1 2.1 2.2 4.4 2.2 1.6 0 2.8-.5 3.5-1.3.7-.8 1.7-4 1.7-5.9 0-3.2-1-4.8-1-4.8"></path><path d="M12 18v4"></path><path d="M6 18v2"></path><path d="M18 18v2"></path><path d="M12 11v3"></path></svg>;
      default:
        return null;
    }
  };
  // No Categories View
  const NoProductsView = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 text-center my-8">
      <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
      <h3 className="text-lg font-medium text-gray-800 mb-1">
        No Categories Found
      </h3>
      <p className="text-gray-600 mb-4 max-w-md">
        We couldn't find any categories at the moment. Please check back later or visit our home page for featured products.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => window.location.reload()}
          className="bg-kadal-red text-white hover:bg-kadal-red/90"
        >
          Refresh Page
        </Button>
        <Button 
          onClick={() => router.push('/')}
          variant="outline"
          className="border-kadal-red text-kadal-red hover:bg-kadal-red/10"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
        <p className="text-gray-600">Browse our fresh seafood categories</p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      ) : error || categories.length === 0 ? (
        <NoProductsView />
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={fadeIn}>
              <Link href={`/category/${category.slug}`} className="block h-full">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full border border-gray-100">
                  <div className="relative h-48">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {category.iconName && (
                          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                            {getIconComponent(category.iconName)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">{category.name}</h3>
                          {category.type && (
                            <div className="text-sm text-white/80 line-clamp-1">{category.type}</div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/80" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
