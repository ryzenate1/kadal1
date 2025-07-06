'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, ChevronDown, ChevronUp } from 'lucide-react';

// Avatar Image component with improved fallback
interface AvatarImageProps {
  src: string;
  alt: string;
  className?: string;
}

const AvatarImage = ({ src, alt, className = "" }: AvatarImageProps) => {
  const [error, setError] = useState(false);
  
  // Generate a consistent color based on the name
  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
    ];
    
    // Simple hash function to pick a color based on name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Get initials from name (up to 2 characters)
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };
  
  const colorClass = getInitialsColor(alt);
  const initials = getInitials(alt);
  
  return (
    <div className={`w-12 h-12 rounded-full overflow-hidden ${className}`}>
      {!error ? (
        <Image 
          src={src} 
          alt={alt}
          width={56}
          height={56}
          className="object-cover h-full w-full"
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${colorClass}`}>
          <span className="text-lg font-medium">{initials}</span>
        </div>
      )}
    </div>
  );
};

// Testimonial Card component with consistent height and Read More functionality
interface TestimonialCardProps {
  testimonial: {
    id: number;
    name: string;
    role: string;
    quote: string;
    translation: string;
    avatar: string;
    rating: number;
  };
  className?: string;
}

const TestimonialCard = ({ testimonial, className = "" }: TestimonialCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Determine if truncation is needed - adjusted for better text display
  const needsTruncation = testimonial.translation.length > 120 || testimonial.quote.length > 140;
  
  // Always show meaningful content regardless of language
  const truncatedQuote = needsTruncation && !expanded
    ? `${testimonial.quote.substring(0, 140)}${testimonial.quote.length > 140 ? '...' : ''}`
    : testimonial.quote;
    
  const truncatedTranslation = needsTruncation && !expanded
    ? `${testimonial.translation.substring(0, 120)}${testimonial.translation.length > 120 ? '...' : ''}`
    : testimonial.translation;
  
  return (
    <div 
      className={`bg-white p-4 sm:p-5 max-w-sm w-full mx-auto rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full ${className}`}
    >
      {/* Card header with quote icon and rating */}
      <div className="flex justify-between items-start mb-3">
        <Quote className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i}
              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      
      {/* Content area with optimized Tamil and English text display */}
      <div className="flex-grow flex flex-col">
        {/* Tamil quote with better visibility and text size */}
        <div className="mb-2.5">
          <p className="text-gray-700 text-base sm:text-lg italic font-medium leading-snug" dir="auto">
            {expanded ? testimonial.quote : truncatedQuote}
          </p>
        </div>
        
        {/* English translation with improved readability */}
        <div className="text-gray-600 text-sm sm:text-base mb-3 leading-snug" dir="auto">
          <p>{expanded ? testimonial.translation : truncatedTranslation}</p>
        </div>
        
        {/* Read more button with better visibility and positioning */}
        {needsTruncation && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center mt-auto mb-1 transition-colors"
            aria-expanded={expanded}
            aria-controls={`testimonial-${testimonial.id}-content`}
          >
            {expanded ? 'Show less' : 'Read more'}
            {expanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
          </button>
        )}
      </div>
      
      {/* Footer with improved spacing and avatar display */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
        <div className="flex-shrink-0">
          <AvatarImage 
            src={testimonial.avatar} 
            alt={testimonial.name}
            className="border border-red-100"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 text-sm">{testimonial.name}</h3>
          <p className="text-xs text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isMounted, setIsMounted] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Updated testimonials with a variety of authentic images (people, nature, cats)
  const testimonials = [
    {
      id: 1,
      name: "Selvarani Murugan",
      role: "Home Cook",
      quote: "கடல் துணை மீன் தரம் மிக உயர்ந்தது. நான் எப்போதும் என் குடும்ப உணவுக்கு புதிதாக மீன் கிடைக்கும் என நம்பலாம். அவர்களின் வங்காரம் மீன் சுவையானது!",
      translation: "The fish quality from Kadal Thunai is exceptional. I can always trust that I'm getting fresh fish for my family meals. Their Vangaram fish is delicious!",
      avatar: "https://randomuser.me/api/portraits/women/62.jpg",
      rating: 5
    },
    {
      id: 2,
      name: "Muthukumar Senthilnathan",
      role: "Restaurant Owner",
      quote: "உணவகம் நடத்துபவராக, தரம் முக்கியம். கடல் துணை எப்போதும் தரமான மீன் வழங்குகிறது. அவர்களின் விநியோகம் எப்போதும் சரியான நேரத்தில் இருக்கும்.",
      translation: "As a restaurant owner, quality is essential. Kadal Thunai always delivers quality fish. Their delivery is always on time.",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      rating: 4
    },
    {
      id: 3,
      name: "Lakshmi Venkatesh",
      role: "Food Enthusiast",
      quote: "நான் பல மீன் விநியோக சேவைகளை முயற்சித்துள்ளேன், ஆனால் கடல் துணைக்கு இணையானது எதுவும் இல்லை. நான் அவர்களின் நெத்திலி மீன் மற்றும் கணவாய் ஐ விரும்புகிறேன்!",
      translation: "I've tried many fish delivery services, but none compare to Kadal Thunai. I love their Nethili fish and squid!",
      avatar: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 5
    },
    {
      id: 4,
      name: "Anbarasan Ramachandran",
      role: "Regular Customer",
      quote: "கடல் துணை என் குடும்பம் விரும்பும் சுவையான மீன் தருகிறது. 3 ஆண்டுகளுக்கும் மேலாக நான் அவர்களிடம் வாங்கி வருகிறேன். நான் அவர்களின் மத்தி மீன் மற்றும் வங்காரம் பற்றி மிகவும் விரும்புகிறேன்.",
      translation: "Kadal Thunai provides delicious fish that my family loves. I've been buying from them for over 3 years. I especially love their Mathi fish and Vangaram.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      id: 5,
      name: "Kalaiselvi Srinivasan",
      role: "Home Chef",
      quote: "கடல் துணை மூலம் நான் எனது கறி குழம்பு தயாரிப்பதற்கு மிகவும் தரமான மீன் பெறுகிறேன். அவர்களின் தரம் மற்றும் சுத்தம் மற்ற கடைகளை விட சிறந்தது.",
      translation: "I get the best quality fish for my curry preparations through Kadal Thunai. Their quality and cleanliness is better than other shops.",
      avatar: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 4
    },
    {
      id: 6,
      name: "Kannan Chandrasekaran",
      role: "Seafood Lover",
      quote: "கடல் துணையின் மீன் எப்போதும் மிகவும் புதிதாக இருக்கிறது. நான் அவர்களின் இறால் மற்றும் நண்டு பொருட்களை மிகவும் பரிந்துரைக்கிறேன்.",
      translation: "The fish from Kadal Thunai is always very fresh. I highly recommend their prawns and crab products.",
      avatar: "https://cataas.com/cat/cute?width=400&height=400",
      rating: 5
    }
  ];
  
  // Determine screen size and items per view
  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('xs');
      } else if (width < 768) {
        setScreenSize('sm');
      } else if (width < 1024) {
        setScreenSize('md');
      } else if (width < 1280) {
        setScreenSize('lg');
      } else {
        setScreenSize('xl');
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
    };
  }, []);

  // Responsive items per view
  const getItemsPerView = () => {
    switch (screenSize) {
      case 'xs': return 1;
      case 'sm': return 1;
      case 'md': return 2;
      case 'lg': return 3;
      case 'xl': return 3;
      default: return 1;
    }
  };

  const itemsPerView = getItemsPerView();

  // Define navigation functions before useEffect
  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonials.length - itemsPerView;
      return prev >= maxIndex ? 0 : prev + 1;
    });
  }, [testimonials.length, itemsPerView]);
  
  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => {
      const maxIndex = testimonials.length - itemsPerView;
      return prev <= 0 ? maxIndex : prev - 1;
    });
  }, [testimonials.length, itemsPerView]);

  // User interaction handlers
  const handleManualNavigation = useCallback(() => {
    setIsUserInteracting(true);
  }, []);

  // Setup auto-rotation with better pause/resume handling
  useEffect(() => {
    if (autoRotateTimerRef.current) {
      clearInterval(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }

    // Only start auto-rotation if not paused and user is not interacting
    if (!autoScrollPaused && !isUserInteracting) {
      autoRotateTimerRef.current = setInterval(() => {
        nextTestimonial();
      }, 6000);
    }

    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
    };
  }, [autoScrollPaused, isUserInteracting, nextTestimonial]);

  // Implement a more robust interaction handling
  useEffect(() => {
    let interactionTimer: NodeJS.Timeout | null = null;
    
    if (isUserInteracting) {
      // Clear any existing timer
      if (interactionTimer) clearTimeout(interactionTimer);
      
      // Set a new timer to reset the interaction flag after delay
      interactionTimer = setTimeout(() => {
        setIsUserInteracting(false);
      }, 5000); // Longer pause (5 seconds) after user interaction
    }
    
    return () => {
      if (interactionTimer) clearTimeout(interactionTimer);
    };
  }, [isUserInteracting]);
  
  // Get current testimonials to show based on screen size
  const getCurrentTestimonials = () => {
    if (!isMounted) return [];
    
    const result = [];
    const maxVisible = Math.min(itemsPerView, testimonials.length);
    
    for (let i = 0; i < maxVisible; i++) {
      const index = (currentIndex + i) % testimonials.length;
      result.push(testimonials[index]);
    }
    
    return result;
  };
  
  const currentTestimonials = getCurrentTestimonials();
  
  // Calculate total pages for indicators
  const totalPages = Math.ceil(testimonials.length / itemsPerView);
  const currentPage = Math.floor(currentIndex / itemsPerView);
  
  // Don't render until client side
  if (!isMounted) return null;

  return (
    <section ref={containerRef} className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white to-red-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-6 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2 sm:mb-3">
            Our Customer Voices
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Read what our valued customers from Tamil Nadu have to say about their Kadal Thunai seafood experiences.
          </p>
        </motion.div>
        
        <div className="relative mb-8">
          {/* Testimonials Slider with improved mobile handling */}
          <div 
            className="overflow-hidden pb-4" 
            ref={sliderRef}
            onMouseEnter={() => setAutoScrollPaused(true)}
            onMouseLeave={() => setAutoScrollPaused(false)}
            onTouchStart={() => {
              setIsUserInteracting(true);
              setAutoScrollPaused(true);
            }}
            onTouchEnd={() => {
              setTimeout(() => {
                setAutoScrollPaused(false);
                // Delayed reset of interaction flag
                setTimeout(() => setIsUserInteracting(false), 3000);
              }, 500);
            }}
          >
            {/* Mobile-optimized slider with better spacing and card dimensions */}
            <motion.div 
              className="flex gap-4 sm:gap-5 lg:gap-6 py-2 w-full"
              initial={{ x: 0 }}
              animate={{ 
                x: `calc(-${currentIndex * 100 / itemsPerView}%)`,
                transition: { 
                  type: 'tween', 
                  duration: 0.5, 
                  ease: 'easeInOut' 
                }
              }}
            >
              {testimonials.map((testimonial) => (
                <motion.div 
                  key={testimonial.id} 
                  className={`flex-shrink-0 ${
                    screenSize === 'xs' ? 'w-full' : 
                    screenSize === 'sm' ? 'w-full' : 
                    screenSize === 'md' ? 'w-[calc(50%-10px)]' : 
                    'w-[calc(33.333%-16px)]'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: testimonial.id * 0.1 }}
                >
                  <TestimonialCard testimonial={testimonial} className="w-full h-full" />
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Navigation Controls with improved user interaction handling */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  handleManualNavigation();
                  setAutoScrollPaused(true);
                  prevTestimonial();
                  // Resume auto scrolling after a delay
                  setTimeout(() => setAutoScrollPaused(false), 5000);
                }}
                className="p-2 sm:p-3 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 border border-gray-100"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-5 w-5 text-red-600" />
              </button>
              <button 
                onClick={() => {
                  handleManualNavigation();
                  setAutoScrollPaused(true);
                  nextTestimonial();
                  // Resume auto scrolling after a delay
                  setTimeout(() => setAutoScrollPaused(false), 5000);
                }}
                className="p-2 sm:p-3 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 border border-gray-100"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-5 w-5 text-red-600" />
              </button>
            </div>
            
            {/* Pagination Indicators with improved user interaction handling */}
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleManualNavigation();
                    setAutoScrollPaused(true);
                    setCurrentIndex(index * itemsPerView);
                    // Resume auto scrolling after a delay
                    setTimeout(() => setAutoScrollPaused(false), 5000);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentPage === index ? 'bg-red-600 w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial page ${index + 1}`}
                />
              ))}
            </div>
            
            <Link href="/reviews" className="hidden sm:block">
              <button 
                className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-all duration-200 shadow-md hover:shadow-lg group"
              >
                More Reviews
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
        
        {/* Mobile "Read More Reviews" Button */}
        <div className="text-center mt-8 sm:hidden">
          <Link href="/reviews">
            <button 
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              Read More Customer Reviews
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
