'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
  description?: string;
}

interface ShopByCategoryProps {
  className?: string;
}

const ShopByCategory = ({ className = "" }: ShopByCategoryProps) => {
  const categories: Category[] = [
    {
      id: 'vanjaram-fish',
      name: 'Vanjaram Fish',
      image: '/images/products/vangaram.jpg',
      href: '/categories/Vanjaram Fish',
      description: 'Fresh Vanjaram Fish'
    },
    {
      id: 'salmon',
      name: 'Salmon',
      image: '/images/fish/salmon.jpg',
      href: '/categories/Salmon',
      description: 'Rich in omega-3 fatty acids and protein'
    },
    {
      id: 'tuna',
      name: 'Tuna',
      image: '/images/fish/tuna-fish.jpg',
      href: '/categories/Tuna',
      description: 'Lean, protein-rich fish with a meaty texture'
    },
    {
      id: 'dried-fish',
      name: 'Dried Fish',
      image: '/images/fish/dried-vangaram.webp',
      href: '/categories/Dried Fish',
      description: 'Traditional dried fish'
    },
    {
      id: 'jumbo-prawns',
      name: 'Jumbo Prawns',
      image: '/images/fish/big-prawn.webp',
      href: '/categories/Jumbo Prawns',
      description: 'Large premium prawns'
    },
    {
      id: 'sea-bass',
      name: 'Sea Bass',
      image: '/images/fish/sea-bass.jpg',
      href: '/categories/Sea Bass',
      description: 'Mild, delicate flavor with a firm, moist texture'
    },
    {
      id: 'hilsa',
      name: 'Hilsa',
      image: '/images/fish/hilsa.jpg',
      href: '/categories/Hilsa',
      description: 'Rich, oily fish with distinctive flavor'
    },
    {
      id: 'fresh-lobsters',
      name: 'Fresh Lobsters',
      image: '/images/fish/lobster.jpg',
      href: '/categories/Fresh Lobsters',
      description: 'Live fresh lobsters'
    },
    {
      id: 'red-snapper',
      name: 'Red Snapper',
      image: '/images/fish/red-snapper.jpg',
      href: '/categories/Red Snapper',
      description: 'Sweet, nutty flavor with a firm texture'
    },
    {
      id: 'squid-octopus',
      name: 'Squid & Octopus',
      image: '/images/fish/squid.jpg',
      href: '/categories/Squid & Octopus',
      description: 'Fresh squid and octopus'
    },
    {
      id: 'cod',
      name: 'Cod',
      image: '/images/fish/cod.jpg',
      href: '/categories/Cod',
      description: 'Mild-flavored white fish with flaky texture'
    },
    {
      id: 'tilapia',
      name: 'Tilapia',
      image: '/images/fish/tilapia.jpg',
      href: '/categories/Tilapia',
      description: 'Mild, slightly sweet flavor with a firm texture'
    }
  ];

  return (
    <div className={`w-full py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600">
            Browse our fresh seafood by category
          </p>
        </div>        {/* Categories Grid - 3x4 Layout for 12 divisions */}
        <div className="grid grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">{categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group block h-full"
            >
              <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1 h-full">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-3xl">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500 rounded-3xl"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300 rounded-3xl"></div>
                  
                  {/* Category Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 rounded-b-3xl">
                    <h3 className="font-bold text-white text-sm md:text-base text-center drop-shadow-lg">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 transition-colors duration-300"
          >
            View All Categories
            <svg
              className="ml-2 -mr-1 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopByCategory;
