'use client';

import React from 'react';
import { Shield, Clock, Tag, Star } from 'lucide-react';

const SimpleTrustBadges = () => {  const trustBadges = [
    {
      id: 'fssai',
      icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />,
      title: 'FSSAI',
      description: 'Certified',
      color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200',
      textColor: 'text-green-800'
    },
    {
      id: 'fresh',
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />,
      title: 'Same Day',
      description: 'Delivery',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200',
      textColor: 'text-blue-800'
    },
    {
      id: 'price',
      icon: <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />,
      title: 'Best',
      description: 'Price',
      color: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200',
      textColor: 'text-red-800'
    },
    {
      id: 'quality',
      icon: <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />,
      title: 'Premium',
      description: 'Quality',
      color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200',
      textColor: 'text-yellow-800'
    }
  ];  return (
    <div className="py-3 sm:py-4 px-2 sm:px-4">
      <div className="max-w-xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">          {trustBadges.map((badge, index) => (
            <div 
              key={badge.id}
              className={`${badge.color} border rounded-lg p-2 sm:p-3 text-center transition-all duration-300 transform`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex justify-center mb-1 sm:mb-2">
                <div className="p-1 sm:p-1.5 bg-white/80 rounded-full shadow-sm">
                  {badge.icon}
                </div>
              </div>
              <div className={`text-xs sm:text-sm font-bold ${badge.textColor} leading-tight`}>
                {badge.title}
              </div>
              <div className={`text-xs ${badge.textColor} opacity-80`}>
                {badge.description}
              </div>
            </div>
          ))}
        </div>
        
        {/* Optional decorative element */}
        <div className="hidden sm:flex justify-center mt-3">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTrustBadges;
