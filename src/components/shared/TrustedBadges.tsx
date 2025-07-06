"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, BadgeCheck, Award, Star, Heart, Clock } from 'lucide-react';

interface TrustedBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  order: number;
  isActive: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  "Shield": Shield,
  "BadgeCheck": BadgeCheck,
  "Award": Award,
  "Star": Star,
  "Heart": Heart,
  "Clock": Clock,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
console.log("Using API URL:", API_URL); // Debug the API URL being used

export default function TrustedBadges() {
  const [badges, setBadges] = useState<TrustedBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching trusted badges from:", `${API_URL}/trusted-badges`);

      try {
        // Add a timeout to the fetch request
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out after 10s')), 10000);
        });

        const fetchPromise = fetch(`${API_URL}/trusted-badges`);
        
        // Race the fetch against a timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        console.log("Fetch response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch trusted badges - status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched badges data:", data);
        setBadges(data.filter((badge: TrustedBadge) => badge.isActive));
      } catch (err: any) {
        console.error('Error fetching trusted badges:', err.message || err);
        setError(`Could not load trust badges. Please try again later. (${err.message || 'Unknown error'})`);
        
        // Use default badges as fallback
        console.log("Using fallback badges due to fetch error");
        setBadges(defaultBadges);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (isLoading) {
    return <TrustedBadgesSkeleton />;
  }

  // Always use the badges we have, either from API or defaults
  const badgesToDisplay = badges.length > 0 ? badges : defaultBadges;

  // Modern UI with enhanced animations and styling
  return (
    <motion.div 
      className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-teal-50"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h3 
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why Choose Kadal Thunai
          </motion.h3>
          <motion.p 
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We're committed to delivering the freshest seafood with the highest quality standards.
          </motion.p>
          
          {error && (
            <motion.div 
              className="mt-4 p-2 bg-red-50 border border-red-100 rounded-md text-red-600 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {error}
            </motion.div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badgesToDisplay.map((badge, index) => (
            <motion.div 
              key={badge.id || `default-${index}`}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center shadow-sm">
                {renderBadgeIcon(badge.iconName, "w-6 h-6")}
              </div>
              <h4 className="font-semibold text-gray-800 text-lg mb-2 text-center">{badge.title}</h4>
              <p className="text-gray-600 text-sm text-center">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Helper function to render icon component with customizable size
function renderBadgeIcon(iconName: string, className: string = "w-12 h-12 text-blue-600") {
  const IconComponent = iconName && iconMap[iconName] ? iconMap[iconName] : Shield;
  return <IconComponent className={className} />;
}

// Default badges to show if API fails
const defaultBadges: TrustedBadge[] = [
  {
    id: 'default-1',
    title: 'Fresh Guarantee',
    description: 'All seafood is guaranteed fresh',
    iconName: 'Shield',
    order: 1,
    isActive: true,
  },
  {
    id: 'default-2',
    title: 'Fast Delivery',
    description: 'Same day delivery available',
    iconName: 'Clock',
    order: 2,
    isActive: true,
  },
  {
    id: 'default-3',
    title: 'Quality Assured',
    description: 'Premium quality seafood',
    iconName: 'BadgeCheck',
    order: 3,
    isActive: true,
  },
  {
    id: 'default-4',
    title: 'Sustainably Sourced',
    description: 'Environmentally responsible practices',
    iconName: 'Star',
    order: 4,
    isActive: true,
  }
];

function TrustedBadgesSkeleton() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="h-9 w-64 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-96 max-w-full bg-gray-200 rounded mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl mx-auto mb-5"></div>
              <div className="h-5 w-32 bg-gray-200 rounded mx-auto mb-3"></div>
              <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 