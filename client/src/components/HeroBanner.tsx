import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HeroBanner = () => {
  const welcomeRef = useRef<HTMLSpanElement>(null);
  const kadalThunaiRef = useRef<HTMLSpanElement>(null);
  const signatureCutsRef = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const promiseRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Create array of all elements to animate
    const elementsToAnimate = [
      welcomeRef.current,
      kadalThunaiRef.current,
      signatureCutsRef.current,
      descriptionRef.current,
      promiseRef.current,
      buttonRef.current
    ].filter(Boolean);
    
    // Kill any existing animations
    gsap.killTweensOf(elementsToAnimate);
    
    // Set initial state for all elements
    gsap.set(elementsToAnimate, {
      opacity: 0,
      y: 20,
      force3D: true
    });
    
    // Animate all elements together with identical properties
    gsap.to(elementsToAnimate, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.3,
      stagger: 0 // No stagger - all elements animate together
    });
    
    return () => {
      gsap.killTweensOf(elementsToAnimate);
    };
  }, []);

  return (
    <div className="hero-banner relative w-full h-[500px] bg-cover bg-center" 
         style={{ backgroundImage: 'url(/public/images/hero-banner.jpg)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold">
            <span ref={welcomeRef} className="hero-text">Welcome</span>{' '}
            <span ref={kadalThunaiRef} className="hero-text">to Kadal Thunai</span>{' '}
            <span ref={signatureCutsRef} className="hero-text">& SignatureCuts</span>
          </h1>
          <p ref={descriptionRef} className="hero-text mt-4 text-lg md:text-xl">
            Fresh seafood delivered to your doorstep
          </p>
          <p ref={promiseRef} className="hero-text mt-2 text-lg md:text-xl">
            No matter what we always serve fresh
          </p>
          <button ref={buttonRef} className="hero-text mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
