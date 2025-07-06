'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from './animation-variants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FreshDeliveryProps {
  adminData?: {
    title?: string;
    subtitle?: string;
    features?: string[];
    image?: string;
    deliverablePincodes?: string[];
    serviceable_pincodes?: string[];
  };
}

const FreshDeliverySection: React.FC<FreshDeliveryProps> = ({ adminData }) => {
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  
  // Default data with comprehensive Tamil Nadu pincodes
  const defaultData = {
    title: 'Fresh Delivery, From Ocean to Table',
    subtitle: "We believe that the freshest seafood makes for the most delicious meals. That's why we've built a lightning-fast supply chain that brings seafood from the ocean to your table in record time.",
    features: [
      'Same-Day Delivery',
      'Temperature-Controlled Packaging',
      'Freshness Guarantee'
    ],
    image: '/images/premium-fresh-seafood-delivery.jpg',
    // Comprehensive pincodes for Chennai, Kancheepuram, and Chengalpattu districts
    deliverablePincodes: [
      // Chennai District
      '600001', '600002', '600003', '600004', '600005', '600006', '600007', '600008', '600009', '600010',
      '600011', '600012', '600013', '600014', '600015', '600016', '600017', '600018', '600019', '600020',
      '600021', '600022', '600023', '600024', '600025', '600026', '600027', '600028', '600029', '600030',
      '600031', '600032', '600033', '600034', '600035', '600036', '600037', '600038', '600039', '600040',
      '600041', '600042', '600043', '600044', '600045', '600046', '600047', '600048', '600049', '600050',
      '600051', '600052', '600053', '600054', '600055', '600056', '600057', '600058', '600059', '600060',
      '600061', '600062', '600063', '600064', '600065', '600066', '600067', '600068', '600069', '600070',
      '600071', '600072', '600073', '600074', '600075', '600076', '600077', '600078', '600079', '600080',
      '600081', '600082', '600083', '600084', '600085', '600086', '600087', '600088', '600089', '600090',
      '600091', '600092', '600093', '600094', '600095', '600096', '600097', '600098', '600099', '600100',
      '600101', '600102', '600103', '600104', '600105', '600106', '600107', '600108', '600109', '600110',
      '600111', '600112', '600113', '600114', '600115', '600116', '600117', '600118', '600119', '600120',
      '600121', '600122', '600123', '600124', '600125', '600126', '600127', '600128', '600129', '600130',
      // Kancheepuram District
      '631501', '631502', '631503', '631551', '631552', '631553', '631554', '631555', '631556', '631557',
      '631558', '631559', '631560', '631561', '631562', '631563', '631564', '631565', '631566', '631567',
      '631601', '631602', '631603', '631604', '631605', '631606', '631607', '631608', '631609', '631610',
      // Chengalpattu District
      '603001', '603002', '603003', '603004', '603005', '603101', '603102', '603103', '603104', '603105',
      '603106', '603107', '603108', '603109', '603110', '603111', '603112', '603113', '603114', '603115',
      '603201', '603202', '603203', '603204', '603205', '603301', '603302', '603303', '603401', '603402',
      '603403', '603404', '603405'
    ]
  };

  // Get values from admin data or use defaults
  const title = adminData?.title || defaultData.title;
  const subtitle = adminData?.subtitle || defaultData.subtitle;
  const features = adminData?.features || defaultData.features;
  
  // Always use the default image for now to ensure it works
  const image = '/images/fresh-seafood-collection.jpg';
  
  // Use serviceable_pincodes from admin panel if available, fallback to deliverablePincodes, then to defaults
  const deliverablePincodes = adminData?.serviceable_pincodes || adminData?.deliverablePincodes || defaultData.deliverablePincodes;
  
  // Check delivery availability
  const checkDeliveryAvailability = () => {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    
    setDeliveryStatus('checking');
    
    // Simulate API check with timeout
    setTimeout(() => {
      if (deliverablePincodes.includes(pincode)) {
        setDeliveryStatus('available');
        toast.success("Great news! We deliver to your area.");
      } else {
        setDeliveryStatus('unavailable');
        toast.error("Sorry, we don't deliver to your area yet.");
      }
    }, 1000);
  };

  return (
    <section className="py-8 sm:py-10 lg:py-14 fresh-delivery-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex flex-col lg:flex-row items-start gap-8 sm:gap-10 lg:gap-12"
          initial="visible" 
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div 
            className="lg:w-1/2 w-full mb-6 lg:mb-0 max-w-full"
            variants={fadeInUp}
          >
            {/* Enhanced rectangular image container with better shadow and border */}
            <div className="w-full overflow-hidden rounded-lg shadow-xl border border-gray-100 image-container">
              {/* Wider rectangular aspect ratio container (more wide than tall) */}
              <div className="relative" style={{ paddingTop: "56.25%" }}> {/* 16:9 aspect ratio for wide rectangular look */}
                {/* Background container with seafood image */}
                <div 
                  className="absolute top-0 left-0 w-full h-full bg-cover bg-center background-image" 
                  style={{ 
                    backgroundImage: "url('/images/fresh-seafood-collection.jpg')" 
                  }}
                >
                  {/* Gradient overlay for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* Premium badge */}
                  <div className="absolute top-4 right-4 bg-white px-4 py-1.5 text-sm font-bold text-blue-600 rounded-full shadow-md">
                    PREMIUM SEAFOOD
                  </div>
                  
                  {/* Bottom text overlay - enhanced for better visibility */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <div className="text-lg font-bold mb-1 tracking-wide">FROM OCEAN TO TABLE</div>
                    <div className="text-sm opacity-90 font-medium">Same-day delivery guaranteed</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            variants={fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--primary-dark)] mb-4 sm:mb-6">Fresh Delivery, From Ocean to Table</h2>
            <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
            
            <motion.div 
              className="space-y-4 sm:space-y-6"
              variants={staggerContainer}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center"
                  variants={fadeInUp}
                >
                  <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-[#e57373]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="mt-8 sm:mt-10 bg-gray-50 p-6 rounded-lg"
              variants={fadeInUp}
            >
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-4">Check Delivery in Your Area</h3>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter pincode (e.g., 600034)"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-base font-medium border-gray-300 focus:border-red-400 focus:ring-red-200"
                      maxLength={6}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          checkDeliveryAvailability();
                        }
                      }}
                    />
                  </div>
                  
                  <Button
                    onClick={checkDeliveryAvailability}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 whitespace-nowrap"
                    disabled={deliveryStatus === 'checking' || pincode.length !== 6}
                  >
                    {deliveryStatus === 'checking' ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Checking...
                      </span>
                    ) : (
                      'Check Availability'
                    )}
                  </Button>
                </div>
                
                {deliveryStatus === 'available' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-800">Great! We deliver to your area 🎉</p>
                        <p className="text-sm text-green-700 mt-1">
                          Fresh seafood delivery available in your location. Order now for same-day delivery!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {deliveryStatus === 'unavailable' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">Currently not delivering to your location</p>
                        <p className="text-sm text-red-700 mt-1">
                          We're expanding our delivery network. Please check back later or contact us for updates.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>Currently serving: Chennai, Kancheepuram, and Chengalpattu districts</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FreshDeliverySection;
