"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Enhanced product data with more searchable fields
const allProducts = [
  {
    id: 1,
    name: "Chicken Curry Cut (Skin Off) - 1 Kg",
    image: "/images/products/chicken-curry-cut.jpeg",
    price: 309,
    category: "chicken",
    slug: "chicken-curry-cut-skin-off-1kg",
    regionalNames: ["கோழி குழம்பு வெட்டு", "kozhi curry cut"],
    tags: ["curry", "boneless", "skinless", "fresh"],
    searchKeywords: ["curry chicken", "curry cut", "skinless chicken", "fresh chicken"]
  },
  {
    id: 2,
    name: "Chicken Breast Boneless",
    image: "/images/products/chicken-breast-boneless.webp",
    price: 154,
    category: "chicken",
    slug: "chicken-breast-boneless",
    regionalNames: ["கோழி மார்பு", "kozhi maarbu"],
    tags: ["breast", "boneless", "protein", "lean"],
    searchKeywords: ["chicken breast", "boneless chicken", "protein", "lean meat"]
  },
  {
    id: 3,
    name: "Premium - Curry Cut (Skin Off) Without Liver",
    image: "/images/products/premium-curry-cut.webp",
    price: 158,
    category: "chicken",
    slug: "premium-curry-cut-skin-off-without-liver",
    regionalNames: ["பிரீமியம் கோழி குழம்பு வெட்டு", "premium kozhi curry cut"],
    tags: ["premium", "curry", "skinless", "no liver"],
    searchKeywords: ["premium chicken", "curry cut", "no liver", "skinless"]
  },
  {
    id: 4,
    name: "Premium - Curry Cut (Skin On) Without Liver",
    image: "/images/products/premium-curry-cut-skin.webp",
    price: 149,
    category: "chicken",
    slug: "premium-curry-cut-skin-on-without-liver",
    regionalNames: ["பிரீமியம் கோழி குழம்பு வெட்டு", "premium kozhi curry cut"],
    tags: ["premium", "curry", "skin on", "no liver"],
    searchKeywords: ["premium chicken", "curry cut", "skin on", "no liver"]
  },
  {
    id: 5,
    name: "Sardine - Mathi",
    image: "/images/products/sardine.webp",
    price: 129,
    category: "seafood",
    slug: "sardine-mathi",
    regionalNames: ["மத்தி", "mathi meen", "chala"],
    tags: ["fish", "small fish", "oily fish", "omega-3"],
    searchKeywords: ["sardine", "mathi", "small fish", "omega 3 fish"]
  },
  {
    id: 6,
    name: "Prawns Medium - Deshelled",
    image: "/images/products/prawns.webp",
    price: 215,
    category: "seafood",
    slug: "prawns-medium-deshelled",
    regionalNames: ["இறால்", "eral", "chemmeen"],
    tags: ["prawns", "shellfish", "deshelled", "seafood"],
    searchKeywords: ["prawns", "shrimp", "deshelled prawns", "seafood"]
  },
];

// Enhanced category data with more searchable fields
const categories = [
  { 
    id: 1, 
    name: "Chicken", 
    slug: "chicken",
    keywords: ["kozhi", "chicken", "poultry", "meat", "கோழி"]
  },
  { 
    id: 2, 
    name: "Mutton", 
    slug: "mutton",
    keywords: ["aadu", "goat", "lamb", "meat", "ஆடு"]
  },
  { 
    id: 3, 
    name: "Seafood", 
    slug: "seafood",
    keywords: ["meen", "fish", "sea food", "kadal unavu", "கடல் உணவு", "மீன்"]
  },
  { 
    id: 4, 
    name: "Ready to Cook", 
    slug: "ready-to-cook",
    keywords: ["ready made", "instant", "quick", "easy", "சமைக்க தயார்"]
  },
  { 
    id: 5, 
    name: "Biryani", 
    slug: "biryani",
    keywords: ["biriyani", "rice dish", "spicy rice", "பிரியாணி"]
  },
  { 
    id: 6, 
    name: "Snacks", 
    slug: "snacks",
    keywords: ["tiffin", "light food", "quick bites", "தின்பண்டங்கள்"]
  },
];

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchResults, setSearchResults] = useState<typeof allProducts>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    // Focus input when overlay opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

    // Prevent scrolling when overlay is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Calculate search score for relevance ranking
  const calculateSearchScore = (product: any, query: string): number => {
    if (!query) return 0;
    
    const normalizedQuery = query.toLowerCase().trim();
    let score = 0;
    
    // Exact name match gets highest score
    if (product.name.toLowerCase() === normalizedQuery) {
      score += 100;
    }
    // Name contains query
    else if (product.name.toLowerCase().includes(normalizedQuery)) {
      score += 50;
    }
    
    // Check regional names
    if (product.regionalNames) {
      for (const name of product.regionalNames) {
        if (name.toLowerCase() === normalizedQuery) {
          score += 70; // Exact match on regional name
          break;
        } else if (name.toLowerCase().includes(normalizedQuery)) {
          score += 40; // Partial match on regional name
          break;
        }
      }
    }
    
    // Check tags
    if (product.tags) {
      for (const tag of product.tags) {
        if (tag.toLowerCase() === normalizedQuery) {
          score += 30; // Exact match on tag
          break;
        } else if (tag.toLowerCase().includes(normalizedQuery)) {
          score += 20; // Partial match on tag
          break;
        }
      }
    }
    
    // Check search keywords
    if (product.searchKeywords) {
      for (const keyword of product.searchKeywords) {
        if (keyword.toLowerCase() === normalizedQuery) {
          score += 60; // Exact match on keyword
          break;
        } else if (keyword.toLowerCase().includes(normalizedQuery)) {
          score += 30; // Partial match on keyword
          break;
        }
      }
    }
    
    return score;
  };

  useEffect(() => {
    // Search function with debounce
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        setIsLoading(true);
        // Simulate API call delay
        setTimeout(() => {
          const normalizedQuery = searchTerm.toLowerCase().trim();
          
          // Filter products based on search term and active tab
          const filtered = allProducts.filter((product) => {
            // Filter by tab first
            if (activeTab !== "all" && product.category !== activeTab) {
              return false;
            }
            
            // Calculate search score
            const score = calculateSearchScore(product, normalizedQuery);
            return score > 0;
          });
          
          // Sort by search score (relevance)
          const sorted = [...filtered].sort((a, b) => {
            const scoreA = calculateSearchScore(a, normalizedQuery);
            const scoreB = calculateSearchScore(b, normalizedQuery);
            return scoreB - scoreA;
          });
          
          setSearchResults(sorted);
          setIsLoading(false);
        }, 500);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Add to recent searches
    const updatedSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    // Navigate to search results page (in a real app)
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    onClose();
  };

  const handleProductClick = (slug: string) => {
    router.push(`/product/${slug}`);
    onClose();
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/category/${slug}`);
    onClose();
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Function to find matching categories based on search term
  const findMatchingCategories = (query: string) => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return categories.filter(category => {
      // Check category name
      if (category.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Check keywords
      if (category.keywords && category.keywords.some(keyword => 
        keyword.toLowerCase().includes(normalizedQuery)
      )) {
        return true;
      }
      
      return false;
    });
  };

  // Get matching categories
  const matchingCategories = findMatchingCategories(searchTerm);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="bg-white w-full max-h-screen overflow-y-auto animate-in fade-in slide-in-from-top duration-300">
        <div className="container mx-auto px-4 py-4">
          {/* Search Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Search</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 pr-4 rounded-lg border-gray-300 w-full focus:border-tendercuts-red focus:ring-tendercuts-red"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
              >
                <X size={16} />
              </Button>
            )}
          </form>

          {/* Recent Searches */}
          {!searchTerm && recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-tendercuts-red hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRecentSearchClick(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Filter Tabs (only show when searching) */}
          {searchTerm && (
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="chicken">Chicken</TabsTrigger>
                <TabsTrigger value="seafood">Seafood</TabsTrigger>
                <TabsTrigger value="ready-to-cook">Ready to Cook</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-tendercuts-red" />
              <span className="ml-2">Searching...</span>
            </div>
          )}

          {/* Matching Categories */}
          {!isLoading && searchTerm && matchingCategories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {matchingCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <span className="font-medium">{category.name}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchTerm && searchResults.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProductClick(product.slug)}
                  >
                    <div className="relative h-40 bg-gray-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                      <p className="text-tendercuts-red font-bold mt-1 text-lg">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchTerm && searchResults.length === 0 && matchingCategories.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No results found for "{searchTerm}"</p>
              <p className="text-sm text-gray-400">Try checking the spelling or use different keywords</p>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-2">Popular Searches</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Chicken", "Fish", "Prawns", "Mutton", "Biryani"].map((term) => (
                    <Badge
                      key={term}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setSearchTerm(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Popular Categories (show when no search term) */}
          {!searchTerm && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Categories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <span className="font-medium">{category.name}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
