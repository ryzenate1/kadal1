"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-notification";
import { Plus, Minus, ShoppingCart, Info, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStock } from "@/hooks/useStock";
import AddToCartLoginRequired from "@/components/AddToCartLoginRequired";
import WishlistLoginRequired from "@/components/WishlistLoginRequired";
import { getFallbackFishImage, getSafeFishImage } from "@/lib/fishImage";

interface ProductCardProps {
  id: number | string;
  name: string;
  image: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity: string;
  pieces?: string;
  weight?: string;
  slug: string;
  type: string;
  fishType?: string;
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock";
  stockQuantity?: number;
  netWeight?: string;
  omega3?: number;
  protein?: number;
  calories?: number;
  benefits?: string[];
  bestFor?: string[];
  rating?: number;
}

const ProductCard = ({
  id,
  name,
  image,
  description,
  price,
  originalPrice,
  quantity,
  pieces,
  weight,
  slug,
  type,
  fishType,
  stockStatus: initialStockStatus = "in-stock",
  stockQuantity: initialStockQuantity = 10,
  netWeight = "500g",
  omega3 = 0,
  protein = 0,
  calories = 0,
  benefits = [],
  bestFor = [],
  rating = 4,
}: ProductCardProps) => {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(getSafeFishImage(image, name));
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  // Use our custom hook for stock management
  const { 
    stock, 
    isLoading: isStockLoading,
    updateStockAfterAddToCart 
  } = useStock(id);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      // First check and update stock
      const stockUpdated = await updateStockAfterAddToCart(selectedQuantity);
      
      if (!stockUpdated) {
        showToast({
          message: "Not enough stock available",
          type: "error"
        });
        setIsAddingToCart(false);
        return;
      }
      
      // Then add to cart
      addToCart({
        productId: String(id),
        name,
        src: image,
        image,
        type,
        price,
        quantity: selectedQuantity,
        omega3,
        protein,
        calories,
        benefits,
        bestFor,
        rating,
        netWeight,
        originalPrice
      }, selectedQuantity);
      
      showToast({
        message: `${name} added to cart`,
        type: "success"
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast({
        message: "Failed to add item to cart",
        type: "error"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    setImageLoaded(false);
    setImageSrc(getSafeFishImage(image, name));
  }, [image, name]);

  const incrementQuantity = () => {
    if (stock.status !== "out-of-stock" && selectedQuantity < stock.available) {
      setSelectedQuantity(prev => prev + 1);
    } else {
      showToast({
        message: "Maximum available quantity reached",
        type: "error"
      });
    }
  };

  const decrementQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity(prev => prev - 1);
    }
  };

  const getStockStatusDisplay = () => {
    if (isStockLoading) {
      return <span className="text-gray-600 text-xs font-medium">Checking stock...</span>;
    }
    
    switch (stock.status) {
      case "in-stock":
        return <span className="text-green-600 text-xs font-medium">In Stock</span>;
      case "low-stock":
        return <span className="text-amber-600 text-xs font-medium">Low Stock ({stock.available} left)</span>;
      case "out-of-stock":
        return <span className="text-red-600 text-xs font-medium">Out of Stock</span>;
      default:
        return <span className="text-green-600 text-xs font-medium">In Stock</span>;
    }
  };

  const formatInr = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="ecom-product-card p-3.5 relative">
      <Link href={`/product/${slug}`}>
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3.5">
          {/* Add image loading skeleton */}
          <div className="relative aspect-square overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            )}
            <Image
              src={imageSrc}
              alt={name}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(true);
                const fallback = getFallbackFishImage(name);
                setImageSrc((currentSrc) =>
                  currentSrc === fallback ? '/images/fish/mackerel.jpg' : fallback
                );
              }}
            />
            {/* Replace wishlist button with WishlistLoginRequired component */}
            <WishlistLoginRequired productId={String(id)} productName={name} />
          </div>
        </div>
      </Link>

      <div className="space-y-2.5">
        <Link href={`/product/${slug}`}>
          <h3 className="text-subheading hover:text-primary-accent transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            {fishType && (
              <div className="text-xs text-gray-600 mb-1">{fishType}</div>
            )}
            
            {netWeight && (
              <div className="flex items-center text-xs text-gray-600">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3V21M9 3.5L9 20.5M15 3.5L15 20.5M5.5 4L5.5 20M18.5 4L18.5 20M3.5 8H20.5M3.5 16H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {netWeight}
              </div>
            )}

            {pieces && (
              <div className="text-xs text-gray-600">{pieces}</div>
            )}

            <div className="mt-1">
              {getStockStatusDisplay()}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              setShowInfo(!showInfo);
            }}
          >
            <Info className="h-4 w-4 text-primary" />
            <span className="sr-only">Fish Info</span>
          </Button>
        </div>
        
        {showInfo && (
          <div className="text-xs text-gray-600 space-y-1 bg-slate-50 p-2 rounded-md border border-slate-200">
            {type && <div>Type: {type}</div>}
            {calories > 0 && <div>Calories: {calories} per 100g</div>}
            {protein > 0 && <div>Protein: {protein}g per 100g</div>}
            {omega3 > 0 && <div>Omega-3: {omega3}g per 100g</div>}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-success">{formatInr(price)}</span>
          {originalPrice && (
            <span className="text-muted text-sm line-through">{formatInr(originalPrice)}</span>
          )}
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={decrementQuantity}
              disabled={selectedQuantity === 1 || isAddingToCart}
              className="px-2 py-1.5 bg-gray-50 text-gray-600 disabled:text-gray-300"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="px-3 text-sm font-medium bg-white">{selectedQuantity} kg</span>
            <button
              onClick={incrementQuantity}
              disabled={stock.status === "out-of-stock" || selectedQuantity >= stock.available || isAddingToCart}
              className="px-2 py-1.5 bg-gray-50 text-gray-600 disabled:text-gray-300"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Replace the standard button with the AddToCartLoginRequired component */}
          <AddToCartLoginRequired 
            productId={String(id)} 
            productName={name}
            productImage={image}
            productPrice={price}
            productType={type}
            netWeight={netWeight}
            quantity={selectedQuantity}
            onAddToCart={handleAddToCart}
            disabled={stock.status === "out-of-stock" || isAddingToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
