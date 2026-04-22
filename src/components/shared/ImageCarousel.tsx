'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { SafeHtmlButton } from '@/components/ui/safe-html-button';

interface ImageCarouselProps {
  images?: string[];
  autoplayDelay?: number;
  className?: string;
}

const ImageCarousel = ({ 
  images = [],
  autoplayDelay = 4000,
  className = ""
}: ImageCarouselProps) => {  // Fresh seafood images from local public/fish directory
  const defaultImages = [
    '/images/fish/vangaram.jpg',
    '/images/fish/squid.jpg',
    '/images/fish/sliced-vangaram.jpg',
    '/images/fish/sea-prawn.webp',
    '/images/fish/blue-crabs.jpg',
    '/images/fish/lobster.jpg',
    '/images/fish/big-prawn.webp'
  ];const carouselImages = images.length > 0 ? images : defaultImages;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
        );
      }, autoplayDelay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, autoplayDelay, carouselImages.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? carouselImages.length - 1 : currentIndex - 1);
  };
  const goToNext = () => {
    setCurrentIndex(currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1);
  };

  // Touch/Swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Fresh Catch Gallery
          </h2>
          <p className="text-gray-600">
            Discover our premium selection of fresh seafood
          </p>
        </div>        {/* Main Carousel Container */}
        <div 
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >          {/* Images Container */}
          <div className="relative w-full aspect-[16/7] md:aspect-[21/8] lg:aspect-[21/7] overflow-hidden touch-pan-y">
            <div 
              className="flex transition-transform duration-500 ease-in-out h-full will-change-transform"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >              {carouselImages.map((image, index) => {
                // Extract fish name from image path for better alt text
                const fishNames = ['Vangaram Fish', 'Fresh Squid', 'Sliced Vangaram', 'Sea Prawn', 'Blue Crab', 'Fresh Lobster', 'Big Prawns'];
                const altText = images.length > 0 ? `Fresh seafood ${index + 1}` : fishNames[index] || `Fresh seafood ${index + 1}`;
                
                return (
                  <div key={index} className="w-full h-full flex-shrink-0 relative">
                    <Image
                      src={image}
                      alt={altText}
                      fill
                      className="object-cover select-none pointer-events-none"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                      priority={index < 2}
                      draggable={false}
                      quality={85}
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {carouselImages.map((_, index) => (
              <SafeHtmlButton
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 h-3 bg-white rounded-full' 
                    : 'w-3 h-3 bg-white/60 rounded-full hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </SafeHtmlButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
