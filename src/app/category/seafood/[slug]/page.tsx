'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Heart, Plus, Minus, Star, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Product type definition
interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  tag: string;
  weight: string;
  originalPrice: number;
  description: string;
  longDescription: string;
  includes: string[];
  nutritionalInfo: {
    protein: string;
    omega3: string;
    calories: string;
    vitamins: string;
  };
  cookingTips: string;
}

// Fetch product data from API
async function getProductData(slug: string) {
  const res = await fetch(`/api/products/${slug}?tag=Seafood`); // Assuming seafood products are fetched by slug and tag
  if (!res.ok) {
    throw new Error('Failed to fetch seafood product data');
  }
  return res.json();
}

export default function SeafoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const data = await getProductData(slug);
        setProduct(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadProduct();
    }
  }, [slug]);
  
  if (loading) return <div className="container mx-auto px-4 py-16 text-center">Loading seafood product...</div>;
  if (error) return <div className="container mx-auto px-4 py-16 text-center text-red-500">Error: {error}</div>;
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8">Sorry, we couldn't find the seafood product you're looking for.</p>
        <Link href="/category/seafood">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Seafood
          </Button>
        </Link>
      </div>
    );
  }
  
  const increment = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };
  
  const decrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };
  
  const handleAddToCart = () => {
    addToCart({
      name: product.name,
      price: product.price,
      src: product.image, // Using src as per CartItem type
      type: product.tag,
      quantity: quantity,
      // Adding required properties from CartItem type
      omega3: 0,
      protein: 0,
      calories: 0,
      benefits: [],
      bestFor: [],
      rating: 4.5,
      description: product.description
    });
    
    toast.success(`${product.name} added to cart!`);
  };
  
  // Fallback for related products
  const seafoodProducts: Product[] = [];
  
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/category/seafood" className="hover:text-blue-600">Seafood</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-700">{product.name}</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 relative">
              <div className="aspect-square relative">
                <Image 
                  src={product.image} 
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.originalPrice > product.price && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {product.tag}
                </div>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < 4.5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">4.5 (120 reviews)</span>
              </div>
              
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-blue-600">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Weight:</span>
                  <span className="text-gray-700">{product.weight}</span>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={decrement}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button 
                    onClick={increment}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Button 
                  className="ml-4 flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                
                <Button 
                  variant="outline" 
                  className="ml-2 p-2"
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <span className="font-semibold">Free delivery:</span> Order before 6 PM for next-day delivery
                </p>
              </div>
            </div>
          </div>
          
          {/* Product Information Tabs */}
          <div className="p-6 border-t border-gray-200">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="includes">What's Included</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition & Cooking</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Product Description</h3>
                <p className="text-gray-700">{product.longDescription}</p>
              </TabsContent>
              
              <TabsContent value="includes" className="pt-4">
                <h3 className="text-lg font-semibold mb-2">What's Included</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {product.includes.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
              </TabsContent>
              
              <TabsContent value="nutrition" className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Nutritional Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-500">Protein</span>
                    <p className="font-medium">{product.nutritionalInfo.protein}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-500">Omega-3</span>
                    <p className="font-medium">{product.nutritionalInfo.omega3}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-500">Calories</span>
                    <p className="font-medium">{product.nutritionalInfo.calories}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-500">Vitamins & Minerals</span>
                    <p className="font-medium">{product.nutritionalInfo.vitamins}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">Cooking Tips</h3>
                <p className="text-gray-700">{product.cookingTips}</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {seafoodProducts.filter(p => p.id !== product.id).map(relatedProduct => (
              <motion.div 
                key={relatedProduct.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/category/seafood/${relatedProduct.slug}`}>
                  <div className="relative h-48">
                    <Image 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {relatedProduct.originalPrice > relatedProduct.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {Math.round(((relatedProduct.originalPrice - relatedProduct.price) / relatedProduct.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{relatedProduct.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{relatedProduct.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline">
                        <span className="text-xl font-bold text-blue-600">₹{relatedProduct.price}</span>
                        {relatedProduct.originalPrice > relatedProduct.price && (
                          <span className="text-xs text-gray-500 line-through ml-1">₹{relatedProduct.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{relatedProduct.tag}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
