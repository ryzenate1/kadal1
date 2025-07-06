import React from 'react';
import Image from 'next/image';
import { Truck, Clock, Shield, CheckCircle } from 'lucide-react';

const SustainabilitySection = () => {
  return (
    <section className="py-6 sm:py-8 lg:py-12 bg-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-6 sm:mb-8">
            Fast & Reliable Delivery
          </h2>
          <p className="text-gray-700 mb-8 sm:mb-10 text-sm sm:text-base leading-relaxed">
            Fresh seafood delivered to your doorstep with our temperature-controlled delivery system, 
            ensuring maximum freshness and quality every time.
          </p>
          
          {/* Main Content: Image and Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Seafood Image */}
            <div className="relative">
              <div className="relative h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden shadow-2xl">
                <Image 
                  src="/images/image.png"
                  alt="Fresh seafood selection including fish, prawns, octopus, and shellfish"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
            
            {/* Delivery Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Free Delivery</h3>
                <p className="text-gray-600 text-sm">Free delivery on orders above ₹500</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Same Day Delivery</h3>
                <p className="text-gray-600 text-sm">Order before 2 PM for same-day delivery</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Temperature Controlled</h3>
                <p className="text-gray-600 text-sm">Maintained at optimal temperature during transit</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600 text-sm">100% freshness guarantee or money back</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
