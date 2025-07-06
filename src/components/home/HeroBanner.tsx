"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Italianno, Oswald } from 'next/font/google';
import { motion } from "framer-motion";
import gsap from 'gsap';
import localFont from 'next/font/local';

// Italianno font for SignatureCuts
const italianno = Italianno({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

// Bold, distinctive font for "Kadal Thunai."
const neurialBold = localFont({
  src: '../../../public/fonts/NeurialGrotesk-Bold.otf',
  display: 'swap',
});

// Alternative Google font option for "Kadal Thunai."
const oswald = Oswald({
  weight: '700',
  subsets: ['latin'],
  display: 'swap',
});

const HeroBanner = () => {
  // Refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null);
  const welcomeTextRef = useRef<HTMLHeadingElement>(null);
  const mainTitleRef = useRef<HTMLHeadingElement>(null);
  const signatureTextRef = useRef<HTMLSpanElement>(null);
  const signaturePathRef = useRef<SVGPathElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const promisePathRef = useRef<SVGPathElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  // Ensure we're on the client side to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle scroll events with throttling to prevent performance issues
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Additional useEffect to ensure animations always run on mount
  useEffect(() => {
    // Only run animations on client side to prevent hydration issues
    if (!isMounted) return;
    
    // Force animations to run after component mounts, regardless of image load state
    const forceAnimationTimer = setTimeout(() => {
      // Ensure refs are available
      if (!welcomeTextRef.current || !mainTitleRef.current || !signatureTextRef.current || 
          !descriptionRef.current || !buttonRef.current || !signaturePathRef.current || 
          !promisePathRef.current) {
        return;
      }

      // Check if elements are still at opacity 0 (not animated yet)
      const isNotAnimated = gsap.getProperty(signatureTextRef.current, "opacity") === 0;
      
      if (isNotAnimated) {
        console.log("Running forced animations for SignatureCuts");
           // Set initial properties to ensure consistency
      gsap.set(welcomeTextRef.current, { 
        opacity: 0,
        y: 0,
        scale: 1
      });
      
      gsap.set(mainTitleRef.current, { 
        opacity: 0,
        y: 0,
        scale: 1
      });
      
      gsap.set([signatureTextRef.current], { 
        opacity: 0,
        y: 20,
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)'
      });
      
      // Set button to be hidden initially
      gsap.set(buttonRef.current, { 
        opacity: 0,
        y: 20
      });
        
        // Set initial properties for description with clip-path
        gsap.set(descriptionRef.current, { 
          opacity: 0,
          y: 20,
          clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)'
        });
        
        gsap.set(signaturePathRef.current, {
          strokeDasharray: 500,
          strokeDashoffset: 500
        });
        
        gsap.set(promisePathRef.current, {
          strokeDasharray: 120,
          strokeDashoffset: 120
        });

        // Create simplified timeline for forced animation
        const forcedTl = gsap.timeline({
          defaults: { 
            ease: "power3.out",
          }
        });

        forcedTl
          .to(welcomeTextRef.current, { 
            opacity: 1,
            duration: 1.2,
            ease: "power2.out"
          }, 0.2)
          .to(mainTitleRef.current, { 
            opacity: 1,
            duration: 0.9,
            ease: "power2.out"
          }, 0.4)
          .to(signatureTextRef.current, { 
            opacity: 1, 
            y: 0, 
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            duration: 0.8,
            ease: "power3.out"
          }, 0.5)
          .to(signaturePathRef.current, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 0.7)
          .to(descriptionRef.current, { 
            opacity: 1, 
            y: 0,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            duration: 0.8,
            ease: "power3.out"
          }, 0.9)
          .to(promisePathRef.current, { strokeDashoffset: 0, duration: 1, ease: "power1.inOut" }, 1.1)
          .to(buttonRef.current, { 
            opacity: 1, 
            y: 0,
            duration: 0.6,
            ease: "power2.out"
          }, 1.8);
      }
    }, 500); // Wait 500ms to ensure DOM is ready

    return () => clearTimeout(forceAnimationTimer);
  }, [isMounted]); // Add isMounted dependency
  
  useEffect(() => {
    // Only run animations on client side to prevent hydration issues
    if (!isMounted) return;
    
    // Add a small delay to ensure DOM is ready, then run animations regardless of image load
    const initAnimations = () => {
      // Ensure refs are available
      if (!welcomeTextRef.current || !mainTitleRef.current || !signatureTextRef.current || 
          !descriptionRef.current || !buttonRef.current || !signaturePathRef.current || 
          !promisePathRef.current) {
        return;
      }

      // Set initial properties to ensure consistency
      gsap.set(welcomeTextRef.current, { 
        opacity: 0,
        y: 0,
        scale: 1
      });
      
      gsap.set(mainTitleRef.current, { 
        opacity: 0,
        y: 0,
        scale: 1
      });
      
      gsap.set(signatureTextRef.current, { 
        opacity: 0,
        y: 20,
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)'
      });
      
      // Set button to be hidden initially
      gsap.set(buttonRef.current, { 
        opacity: 0,
        y: 20
      });
      
      // Set initial properties for description with clip-path
      gsap.set(descriptionRef.current, { 
        opacity: 0,
        y: 20,
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)'
      });
      
      gsap.set(signaturePathRef.current, {
        strokeDasharray: 500,
        strokeDashoffset: 500
      });
      
      gsap.set(promisePathRef.current, {
        strokeDasharray: 120,
        strokeDashoffset: 120
      });

      // Create a master timeline for smooth sequenced animations
      const masterTl = gsap.timeline({
        defaults: { 
          ease: "power3.out",
        }
      });

      // Add subtle fade-in animation for welcome and main title texts
      const welcomeTl = gsap.timeline();
      welcomeTl.to(welcomeTextRef.current, { 
        opacity: 1,
        duration: 1.2,
        ease: "power2.out"
      });

      const titleTl = gsap.timeline();
      titleTl.to(mainTitleRef.current, { 
        opacity: 1,
        duration: 0.9,
        ease: "power2.out"
      });

      // Animate signature text using clip-path reveal effect
      const signatureTl = gsap.timeline();
      signatureTl.fromTo(
        signatureTextRef.current,
        { 
          opacity: 0,
          y: 20,
          clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' // hidden
        },
        { 
          opacity: 1,
          y: 0,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', // fully revealed
          duration: 0.8,
          ease: "power3.out"
        }
      )
      .fromTo(
        signaturePathRef.current,
        {
          strokeDashoffset: 500
        },
        {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power2.inOut"
        },
        "-=0.3"
      );

      // Animate description using clip-path reveal effect
      const descriptionTl = gsap.timeline();
      descriptionTl.fromTo(
        descriptionRef.current,
        { 
          opacity: 0, 
          y: 20,
          clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' // hidden
        },
        { 
          opacity: 1, 
          y: 0,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', // fully revealed
          duration: 0.8,
          ease: "power3.out"
        }
      );
      
      // Only animate the Promise text if the description element exists - using same style
      if (descriptionRef.current) {
        const promiseElement = descriptionRef.current.querySelector(".font-bold");
        if (promiseElement) {
          descriptionTl.fromTo(
            promiseElement,
            {
              opacity: 0,
              y: 15
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out"
            },
            "-=0.5"
          );
        }
      }
      
      // Animate the underline path for "Promise!!"
      descriptionTl.fromTo(
        promisePathRef.current,
        {
          strokeDashoffset: 120
        },
        {
          strokeDashoffset: 0,
          duration: 1,
          ease: "power1.inOut"
        },
        "-=0.4"
      );

      // Animate button with delay
      const buttonTl = gsap.timeline();
      buttonTl.to(buttonRef.current, { 
        opacity: 1, 
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      });

      // Add animations to the master timeline with custom staggered timing  
      masterTl
        .add(welcomeTl, 0.2) // Welcome To starts at 0.2s
        .add(titleTl, 0.4) // Kadal Thunai starts at 0.4s
        .add(signatureTl, 0.7) // SignatureCuts starts at 0.7s
        .add(descriptionTl, 1.1) // Description with clip-path reveal starts at 1.1s
        .add(buttonTl, 1.8); // Button appears at 1.8s

      console.log("GSAP Hero Banner animations started!"); // Debug log
    };

    // Always run animations after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initAnimations();
    }, 100);

    // Also run animations when image loads if it hasn't run yet
    if (imageLoaded) {
      clearTimeout(timer);
      initAnimations();
    }

    return () => clearTimeout(timer);
  }, [imageLoaded, isMounted]); // Add isMounted dependency

  // Calculate opacity based on scroll position, ensuring it never fully disappears
  const calculateOpacity = () => {
    if (!isMounted) return 1; // Default opacity on server
    // Ensure the banner stays at least 20% visible
    return Math.max(1 - (scrollY / 500), 0.2);
  };
  
  // Calculate image parallax effect - subtle movement as user scrolls
  const calculateImageY = () => {
    if (!isMounted) return 0; // No parallax on server
    return scrollY * 0.2; // Subtle parallax effect
  };

  return (
    <div className="relative w-full hero-banner-container" ref={containerRef}>
      <motion.div 
        className="relative w-full h-[600px] overflow-hidden"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background image with fixed position to ensure it doesn't disappear */}
        <div 
          style={{ 
            transform: `translateY(${calculateImageY()}px) scale(1.08)`,
            position: 'absolute', 
            width: '100%', 
            height: '100%' 
          }}
        >
          <Image
            src="/images/bg.jpg"
            alt="Kadal Thunai Fresh Seafood"
            fill
            className="object-cover object-center"
            priority
            onLoad={handleImageLoad}
            sizes="100vw"
          />
        </div>
        
        {/* Overlay with controlled opacity */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-40 flex items-start justify-start pt-20 lg:pt-28 hero-banner-text"
          style={{ 
            opacity: calculateOpacity(),
            // Important: make sure this element is always visible
            visibility: 'visible' 
          }}
        >
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl text-white text-left">
              <div className="mb-12">
                <h1 
                  ref={welcomeTextRef}
                  className="text-4xl lg:text-6xl font-extrabold leading-tight mb-3 opacity-0"
                >
                  Welcome To,
                </h1>
                <h1 
                  ref={mainTitleRef}
                  className={`${neurialBold.className} text-6xl lg:text-9xl font-extrabold leading-tight text-red-600 mb-3 opacity-0`}
                >
                  Kadal Thunai.
                </h1>
                <div className="relative inline-block mt-1">
                  <span 
                    ref={signatureTextRef}
                    className={`${italianno.className} relative z-10 text-6xl lg:text-8xl text-white opacity-0`}
                  >
                    SignatureCuts
                  </span>
                  <div className="relative w-full mt-0.5">
                    <svg 
                      className="w-full h-5" 
                      viewBox="0 0 300 25" 
                      preserveAspectRatio="none"
                    >
                      <path 
                        ref={signaturePathRef}
                        d="M0,18 C30,8 70,28 120,13 C170,-2 210,18 260,8 C310,-2 350,18 400,13" 
                        fill="none" 
                        className="text-red-600" 
                        stroke="currentColor" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>
                <p 
                  ref={descriptionRef}
                  className="text-xl mt-3 text-white font-medium leading-relaxed max-w-lg opacity-0"
                >
                  No matter what we always serves fresh. 
                  <span className="relative ml-1">
                    <span className="relative z-10 font-bold">Promise!!</span>
                    <svg 
                      className="absolute top-4 left-0 w-full h-5" 
                      viewBox="0 0 100 25" 
                      preserveAspectRatio="none"
                    >
                      <path 
                        ref={promisePathRef}
                        d="M0,12 C20,8 40,16 60,12 C80,8 100,12 100,12" 
                        fill="none" 
                        className="text-red-600" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </span>
                </p>
              </div>
              <div className="mt-12">
                <Button 
                  ref={buttonRef}
                  className="bg-red-600 hover:bg-red-700 text-base px-8 py-6 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl opacity-0"
                >
                  SHOP NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroBanner;
