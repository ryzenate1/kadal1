'use client';

import React from 'react';
import Link from 'next/link';
import { Fish, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <motion.div 
        className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Fish className="w-16 h-16 text-gray-400 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Fish Not Found</h1>
        
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the fish you were looking for. It might have swum away or doesn't exist in our collection.
        </p>
        
        <div className="space-y-4">
          <Link href="/categories">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Browse All Categories
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
