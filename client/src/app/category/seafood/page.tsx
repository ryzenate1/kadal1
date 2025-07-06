'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterIcon, ChevronDown, ChevronUp, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

// Seafood products data
const seafoodProducts = [
  {
    id: 1,
    name: 'Seer Fish (Vanjaram) Steaks',
    price: 899,
    originalPrice: 999,
    image: '/images/fish/vanjaram.jpg',
    weight: '500g',
    description: 'Premium Seer Fish steaks, perfect for grilling or curry',
    slug: 'seer-fish-steaks',
    tag: 'Premium'
  },
  {
    id: 2,
    name: 'Tiger Prawns (Large)',
    price: 599,
    originalPrice: 699,
    image: '/images/fish/sea-prawn.webp',
    weight: '250g',
    description: 'Large Tiger Prawns, deveined and ready to cook',
    slug: 'tiger-prawns-large',
    tag: 'Shellfish'
  },
  {
    id: 3,
    name: 'Blue Crab (Cleaned)',
    price: 499,
    originalPrice: 599,
    image: '/images/fish/blue-crabs.jpg',
    weight: '300g',
    description: 'Fresh Blue Crabs, cleaned and ready for your favorite recipes',
    slug: 'blue-crab-cleaned',
    tag: 'Shellfish'
  },
  {
    id: 4,
    name: 'Red Snapper Fillets',
    price: 749,
    originalPrice: 849,
    image: '/images/fish/red-snapper.jpg',
    weight: '400g',
    description: 'Boneless Red Snapper fillets, perfect for pan-frying',
    slug: 'red-snapper-fillets',
    tag: 'Premium'
  },
  {
    id: 5,
    name: 'Mackerel (Ayala)',
    price: 399,
    originalPrice: 449,
    image: '/images/fish/mackerel.jpg',
    weight: '500g',
    description: 'Fresh Mackerel, perfect for traditional fish curry',
    slug: 'mackerel-ayala',
    tag: 'Popular'
  },
  {
    id: 6,
    name: 'Squid Rings',
    price: 349,
    originalPrice: 399,
    image: '/images/fish/squid.jpg',
    weight: '250g',
    description: 'Cleaned squid rings, ready for frying or curry',
    slug: 'squid-rings',
    tag: 'Shellfish'
  },
  {
    id: 7,
    name: 'Pomfret (White)',
    price: 799,
    originalPrice: 899,
    image: '/images/fish/pomfret.jpg',
    weight: '500g',
    description: 'White Pomfret, cleaned and ready to cook',
    slug: 'pomfret-white',
    tag: 'Premium'
  },
  {
    id: 8,
    name: 'Sardines (Mathi)',
    price: 299,
    originalPrice: 349,
    image: '/images/fish/sardines.jpg',
    weight: '500g',
    description: 'Fresh Sardines, perfect for frying or curry',
    slug: 'sardines-mathi',
    tag: 'Popular'
  }
];

export default function SeafoodPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState("recommended");
  const [selectedTag, setSelectedTag] = useState("all");

  // Filter products
  let displayProducts = [...seafoodProducts];

  // Apply tag filter
  if (selectedTag !== "all") {
    displayProducts = displayProducts.filter(product => product.tag.toLowerCase() === selectedTag.toLowerCase());
  }

  // Apply price filter
  displayProducts = displayProducts.filter(
    (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  // Apply sorting
  if (sortOption === "price-low-high") {
    displayProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === "price-high-low") {
    displayProducts.sort((a, b) => b.price - a.price);
  }
  // For "recommended", we keep the original order

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Seafood</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seafood</h1>
          <p className="text-gray-600">
            Premium seafood sourced directly from the coast. Cleaned and prepared for your convenience.
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-between"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <div className="flex items-center">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filter & Sort
            </div>
            {filterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Mobile Collapsible, Desktop Always Visible */}
          <div className={`${filterOpen ? 'block' : 'hidden'} md:block md:w-1/4 lg:w-1/5`}>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-4">Filter by Type</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="all" 
                    name="tag" 
                    className="w-4 h-4 text-blue-600"
                    checked={selectedTag === "all"}
                    onChange={() => setSelectedTag("all")}
                  />
                  <label htmlFor="all" className="ml-2 text-gray-700">All Seafood</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="premium" 
                    name="tag" 
                    className="w-4 h-4 text-blue-600"
                    checked={selectedTag === "premium"}
                    onChange={() => setSelectedTag("premium")}
                  />
                  <label htmlFor="premium" className="ml-2 text-gray-700">Premium</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="shellfish" 
                    name="tag" 
                    className="w-4 h-4 text-blue-600"
                    checked={selectedTag === "shellfish"}
                    onChange={() => setSelectedTag("shellfish")}
                  />
                  <label htmlFor="shellfish" className="ml-2 text-gray-700">Shellfish</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="popular" 
                    name="tag" 
                    className="w-4 h-4 text-blue-600"
                    checked={selectedTag === "popular"}
                    onChange={() => setSelectedTag("popular")}
                  />
                  <label htmlFor="popular" className="ml-2 text-gray-700">Popular</label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-4">Price Range</h3>
              <Slider
                defaultValue={[0, 1000]}
                max={1500}
                step={50}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-6"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="md:w-3/4 lg:w-4/5">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">{displayProducts.length} products</p>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2 hidden md:inline">Sort by:</span>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                    <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/category/seafood/${product.slug}`} className="block">
                    <div className="relative h-48">
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {product.originalPrice > product.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {product.tag}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">4.0</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <div className="text-xs text-gray-500 mb-1">{product.weight}</div>
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-blue-600 text-lg">₹{product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 text-xs">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {displayProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No products match your filters</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPriceRange([0, 1000]);
                    setSelectedTag("all");
                    setSortOption("recommended");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
