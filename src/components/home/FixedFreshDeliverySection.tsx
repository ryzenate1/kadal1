'use client';

import React from 'react';
import Image from 'next/image';

interface FixedFreshDeliveryProps {
  adminData?: {
    title?: string;
    subtitle?: string;
    features?: string[];
    image?: string;
  };
}

/**
 * A fixed version of the Fresh Delivery Section that doesn't rely on 
 * external animation libraries or complex logic.
 * This serves as a fallback if the main component has visibility issues.
 */
const FixedFreshDeliverySection: React.FC<FixedFreshDeliveryProps> = ({ adminData }) => {
  // Default data
  const defaultData = {
    title: 'Fresh Delivery, From Ocean to Table',
    subtitle: "We believe that the freshest seafood makes for the most delicious meals. That's why we've built a lightning-fast supply chain that brings seafood from the ocean to your table in record time.",
    features: [
      'Same-Day Delivery',
      'Temperature-Controlled Packaging',
      'Freshness Guarantee'
    ],
    image: '/images/fresh-delivery.jpg'
  };

  // Use admin data if available, otherwise use defaults
  const { 
    title = defaultData.title, 
    subtitle = defaultData.subtitle, 
    features = defaultData.features,
    image = defaultData.image
  } = adminData || defaultData;

  return (
    <section className="py-6 sm:py-8 lg:py-12 fresh-delivery-section" style={{ opacity: 1, visibility: 'visible' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
          <div className="lg:w-1/2 relative h-64 sm:h-80 lg:h-96 w-full">
            <div className="bg-gray-200 absolute inset-0 rounded-lg flex items-center justify-center">
              {image ? (
                <Image 
                  src={image} 
                  alt="Fresh seafood delivery" 
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-400 text-sm sm:text-base">Delivery Image</span>
              )}
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-tendercuts-red mb-4 sm:mb-6">{title}</h2>
            <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
            
            <div className="space-y-4 sm:space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-tendercuts-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1">{feature}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {index === 0 && "Order before 2 PM for same-day delivery in select areas."}
                      {index === 1 && "Our specialized packaging keeps seafood at the optimal temperature."}
                      {index === 2 && "If you're not 100% satisfied with the freshness, we'll refund you."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
                        <button className="mt-6 sm:mt-8 bg-tendercuts-red hover:bg-tendercuts-red-dark text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 text-sm sm:text-base">
              Check Delivery in Your Area
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FixedFreshDeliverySection;