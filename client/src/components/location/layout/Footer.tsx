'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Clock, ChevronDown, ChevronUp, Heart } from 'lucide-react';

// Enhanced collapsible section with smooth animations
const CollapsibleSection = ({ 
  title, 
  children, 
  isOpen, 
  toggle 
}: { 
  title: string; 
  children: React.ReactNode; 
  isOpen: boolean; 
  toggle: () => void 
}) => (
  <div className="border-b border-gray-200 sm:border-none pb-4 sm:pb-0">
    <motion.button 
      onClick={toggle}
      className="w-full flex justify-between items-center text-left focus:outline-none group"
      aria-expanded={isOpen}
      whileTap={{ scale: 0.98 }}
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-[var(--primary-accent)] transition-colors duration-200">
        {title}
      </h3>
      <motion.span 
        className="sm:hidden text-gray-500 group-hover:text-[var(--primary-accent)] transition-colors duration-200"
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5" />
      </motion.span>
    </motion.button>
    <AnimatePresence>
      {(isOpen || window?.innerWidth >= 640) && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="mt-3 sm:mt-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const [customerServiceOpen, setCustomerServiceOpen] = useState(false);
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  
  // Auto-close on larger screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setQuickLinksOpen(true);
        setCustomerServiceOpen(true);
        setContactInfoOpen(true);
      } else {
        setQuickLinksOpen(false);
        setCustomerServiceOpen(false);
        setContactInfoOpen(false);
      }
    };
    
    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.footer 
      className="bg-[var(--primary-bg)] text-gray-600 pt-8 pb-6 sm:pt-12 sm:pb-8 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[var(--primary-accent)] to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-blue-500 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Logo and Tagline */}
        <motion.div 
          className="text-center mb-8 sm:mb-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold text-[var(--primary-accent)] mb-1 sm:mb-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Kadal Thunai
          </motion.h2>
          <p className="text-base sm:text-lg text-gray-700 font-medium">Fresh Seafood, Delivered Fresh</p>
          <motion.div 
            className="flex items-center justify-center mt-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mx-1"
              >
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              </motion.div>
              <span>for seafood lovers</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-0 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <div className="space-y-4 bg-white/50 p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="w-1 h-6 bg-blue-500 rounded-full mr-2"></span>
              About Kadal Thunai
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              We are committed to bringing you the freshest seafood from the coast to your table. 
              Quality, freshness, and customer satisfaction are our top priorities.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors hover:scale-110 transform" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors hover:scale-110 transform" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors hover:scale-110 transform" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors hover:scale-110 transform" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-4">
            <CollapsibleSection 
              title="Quick Links" 
              isOpen={quickLinksOpen} 
              toggle={() => setQuickLinksOpen(!quickLinksOpen)}
            >
              <ul className="space-y-2.5">
                {[
                  { href: "/", label: "Home" },
                  { href: "/categories", label: "Categories" },
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/faq", label: "FAQ" }
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      className="text-sm text-gray-600 hover:text-blue-500 transition-colors flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-200 rounded-full mr-2 group-hover:bg-blue-500 transition-colors"></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>

          {/* Customer Service */}
          <div className="lg:pl-4">
            <CollapsibleSection 
              title="Customer Service" 
              isOpen={customerServiceOpen} 
              toggle={() => setCustomerServiceOpen(!customerServiceOpen)}
            >
              <ul className="space-y-2.5">
                {[
                  { href: "/orders", label: "Track Your Order" },
                  { href: "/returns", label: "Returns & Refunds" },
                  { href: "/shipping", label: "Shipping Info" },
                  { href: "/support", label: "Customer Support" },
                  { href: "/privacy", label: "Privacy Policy" }
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      className="text-sm text-gray-600 hover:text-blue-500 transition-colors flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-200 rounded-full mr-2 group-hover:bg-blue-500 transition-colors"></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>

          {/* Contact Info */}
          <div className="lg:pl-4">
            <CollapsibleSection 
              title="Contact Info" 
              isOpen={contactInfoOpen} 
              toggle={() => setContactInfoOpen(!contactInfoOpen)}
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-3 group">
                  <div className="p-1.5 bg-white rounded-full shadow-sm group-hover:bg-blue-100 transition-colors">
                    <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Call us</p>
                    <a href="tel:+919876543210" className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 group">
                  <div className="p-1.5 bg-white rounded-full shadow-sm group-hover:bg-blue-100 transition-colors">
                    <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email us</p>
                    <a href="mailto:hello@kadalthunai.com" className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors">
                      hello@kadalthunai.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 group">
                  <div className="p-1.5 bg-white rounded-full shadow-sm group-hover:bg-blue-100 transition-colors">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-800">
                      Chennai, Tamil Nadu, India
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 group">
                  <div className="p-1.5 bg-white rounded-full shadow-sm group-hover:bg-blue-100 transition-colors">
                    <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Working Hours</p>
                    <p className="text-sm font-medium text-gray-800">
                      Mon-Sun: 6 AM - 10 PM
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              {currentYear} Kadal Thunai. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              {[
                { href: "/terms-of-service", label: "Terms of Service" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/cookie-policy", label: "Cookie Policy" }
              ].map((item, index) => (
                <React.Fragment key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-xs sm:text-sm text-gray-500 hover:text-blue-500 transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                  {index < 2 && (
                    <span className="text-gray-300 hidden sm:inline">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 mb-3">We accept</p>
            <div className="flex justify-center space-x-4">
              {['Visa', 'Mastercard', 'Rupay', 'UPI', 'Net Banking'].map((method) => (
                <div key={method} className="bg-white p-1.5 rounded shadow-sm border border-gray-100">
                  <span className="text-xs font-medium text-gray-600">{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
