'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

interface Category {
  id: string | number;
  name: string;
  slug: string;
  image: string;
  type?: string;
}

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

// Fallback categories if API fails
const fallbackCategories: Category[] = [
  {
    id: 1,
    name: "Vangaram Fish",
    image: "/images/fish/vangaram.jpg",
    slug: "vangaram-fish",
    type: "Fish"
  },
  {
    id: 2,
    name: "Sliced Vangaram",
    image: "/images/fish/sliced-vangaram.jpg",
    slug: "sliced-vangaram",
    type: "Fish"
  },
  {
    id: 3,
    name: "Dried Vangaram",
    image: "/images/fish/dried-vangaram.webp",
    slug: "dried-vangaram",
    type: "Dried Fish"
  },
  {
    id: 4,
    name: "Big Prawns",
    image: "/images/fish/big-prawn.webp",
    slug: "big-prawns",
    type: "Prawns"
  },
  {
    id: 5,
    name: "Sea Prawns",
    image: "/images/fish/sea-prawn.webp",
    slug: "sea-prawns",
    type: "Prawns"
  },
  {
    id: 6,
    name: "Fresh Lobster",
    image: "/images/fish/lobster.jpg",
    slug: "fresh-lobster",
    type: "Shellfish"
  },
  {
    id: 7,
    name: "Blue Crabs",
    image: "/images/fish/blue-crabs.jpg",
    slug: "blue-crabs",
    type: "Crabs"
  },
  {
    id: 8,
    name: "Normal Crabs",
    image: "/images/fish/normal crabs.jpg",
    slug: "normal-crabs",
    type: "Crabs"
  },
  {
    id: 9,
    name: "Fresh Squid",
    image: "/images/fish/squid.jpg",
    slug: "fresh-squid",
    type: "Squid"
  },
  {
    id: 10,
    name: "Variety Fishes",
    image: "/images/fish/vareity-fishes.jpg",
    slug: "variety-fishes",
    type: "Fish Combo"
  }
];

const RoundedCategories = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState<boolean>(false); // Set default to false
  const [error, setError] = useState<string | null>(null);

  // Helper function to get image URL with fallback
  const getImageUrl = (item: Category): string => {
    if (!item) return "/images/fish/vangaram.jpg";

    if (item.image) {
      if (item.image.startsWith('http')) {
        return item.image;
      } else {
        const localImagePath = item.image.startsWith('/') ? item.image : `/${item.image}`;
        return localImagePath;
      }
    }

    return "/images/fish/vangaram.jpg";
  };

  // Fetch categories from API
  useEffect(() => {
    let isMounted = true;
    
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Using setTimeout to simulate API call but ensure we move past loading state
        setTimeout(() => {
          if (isMounted) {
            console.log("Using fallback categories data");
            setCategories(fallbackCategories);
            setLoading(false);
          }
        }, 500);
        
        try {
          const response = await fetch('/api/categories', {
            cache: 'no-store'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch categories (Status: ${response.status})`);
          }
          
          const data = await response.json();
          
          if (isMounted) {
            if (Array.isArray(data) && data.length > 0) {
              const activeCategories = data.filter((cat: any) => cat.isActive !== false) as Category[];
              setCategories(activeCategories);
            } else {
              console.warn("Empty or invalid data received, using fallback");
              setCategories(fallbackCategories);
            }
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          if (isMounted) {
            setError("Failed to load categories");
            // Fallback already set by setTimeout
          }
        }
      } catch (error) {
        console.error("Outer error in categories fetch:", error);
        if (isMounted) {
          setCategories(fallbackCategories);
          setLoading(false);
        }
      }
    };
    
    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-full aspect-square"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600">
            Browse our wide selection of fresh seafood
          </p>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          {categories.map((category) => (
            <motion.div 
              key={category.id} 
              variants={fadeInUp}
              className="group text-center"
            >
              <Link href={`/category/${category.slug || category.id}`} className="block">
                {/* Circular Image */}
                <div className="relative overflow-hidden rounded-full shadow-lg bg-white hover:shadow-xl transition-all duration-300 aspect-square border-4 border-white hover:border-blue-100 mb-2">
                  <Image 
                    src={getImageUrl(category)}
                    alt={category.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-110 transition-transform duration-300 rounded-full"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/fish/vangaram.jpg";
                    }}
                  />
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 transition-all duration-300 rounded-full"></div>
                </div>
                
                {/* Category Name Below Circle */}
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight px-1">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RoundedCategories;
