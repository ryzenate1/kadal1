'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SafeHtmlButton } from '@/components/ui/safe-html-button';

const ModernFooter = () => {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  // Toggle section for mobile - auto-close others
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      // Close all other sections and toggle the current one
      const newState: {[key: string]: boolean} = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[section] = !prev[section];
      return newState;
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const hoverEffect = {
    scale: 1.05,
    transition: { duration: 0.2 }
  };

  // Footer sections data
  const footerSections = [
    {
      id: 'company',
      title: 'Company',
      links: [
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/categories' },
        { name: 'Blog', href: '/blog' },
        { name: 'Offers', href: '/offers' },
        { name: 'Reviews', href: '/reviews' }
      ]
    },
    {
      id: 'customer-service',
      title: 'Customer Service',
      links: [
        { name: 'Help Center', href: '/help-support' },
        { name: 'Track Order', href: '/track-order' },
        { name: 'My Orders', href: '/orders' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms-of-service' }
      ]
    }
  ];

  // Payment methods
  const paymentMethods = [
    {
      name: 'Google Pay',
      icon: '/icons/google-pay.svg',
      fallback: '🟢 GPay'
    },
    {
      name: 'Visa',
      icon: '/icons/visa.svg',
      fallback: '💳 Visa'
    },
    {
      name: 'Mastercard',
      icon: '/icons/mastercard.svg',
      fallback: '💳 MC'
    },
    {
      name: 'PayPal',
      icon: '/icons/paypal.svg',
      fallback: '💙 PayPal'
    },
    {
      name: 'UPI',
      icon: '/icons/upi.svg',
      fallback: '📱 UPI'
    }
  ];

  return (
    <motion.footer
      className="bg-[var(--primary-bg)] relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-200 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-red-100 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Main footer content */}
        <div className="py-8">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-6">
              {/* Brand section */}
              <motion.div 
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <Link href="/" className="inline-block mb-4">
                  <Image
                    src="/images/logo.png"
                    alt="Kadal Thunai"
                    width={240}
                    height={96}
                    className="h-20 w-auto"
                  />
                </Link>
                <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                  At Kadal Thunai, we're revolutionizing the fish industry to serve fresh, always! 
                  From ocean depths to your dining table, we bring you premium seafood with 
                  unmatched quality, sustainability, and the promise of ocean-fresh taste in every bite.
                </p>
                
                {/* Social media links */}
                <div className="flex space-x-4 mb-6">
                  {[
                    { icon: Facebook, href: 'https://facebook.com/kadalthunai', label: 'Facebook' },
                    { icon: Twitter, href: 'https://twitter.com/kadalthunai', label: 'Twitter' },
                    { icon: Instagram, href: 'https://instagram.com/kadalthunai', label: 'Instagram' },
                    { icon: Linkedin, href: 'https://linkedin.com/company/kadalthunai', label: 'LinkedIn' }
                  ].map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[#b20000] transition-all duration-300 shadow-sm hover:shadow-md"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>

                {/* Contact info (mobile dropdown) */}
                <div className="lg:hidden">
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <SafeHtmlButton
                      onClick={() => toggleSection('contact')}
                      className="flex items-center justify-between w-full py-2 text-left font-semibold text-[var(--text-primary)] hover:text-[#b20000] transition-colors"
                    >
                      Contact Info
                      <motion.div
                        animate={{ rotate: expandedSections.contact ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </SafeHtmlButton>
                  </motion.div>
                  
                  <AnimatePresence>
                    {expandedSections.contact && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <ContactInfo />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Footer sections */}
              {footerSections.map((section, index) => (
                <motion.div 
                  key={section.id}
                  className="lg:col-span-1"
                  variants={itemVariants}
                >
                  {/* Desktop title */}
                  <h3 className="hidden lg:block font-bold text-[var(--text-primary)] mb-4">
                    {section.title}
                  </h3>
                  
                  {/* Mobile collapsible title */}
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <SafeHtmlButton
                      onClick={() => toggleSection(section.id)}
                      className="lg:hidden flex items-center justify-between w-full py-2 text-left font-semibold text-[var(--text-primary)] hover:text-[#b20000] transition-colors border-b border-gray-200"
                    >
                      {section.title}
                      <motion.div
                        animate={{ rotate: expandedSections[section.id] ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </SafeHtmlButton>
                  </motion.div>

                  {/* Links */}
                  <div className="hidden lg:block">
                    <LinksList links={section.links} />
                  </div>

                  {/* Mobile collapsible links */}
                  <AnimatePresence>
                    {(expandedSections[section.id] || false) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden overflow-hidden"
                      >
                        <LinksList links={section.links} isMobile />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Contact info (desktop) */}
              <motion.div 
                className="hidden lg:block lg:col-span-1"
                variants={itemVariants}
              >
                <h3 className="font-bold text-[var(--text-primary)] mb-4">Contact Info</h3>
                <ContactInfo />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Payment methods and bottom section */}
        <motion.div 
          className="border-t border-gray-200 py-8"
          variants={itemVariants}
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Payment methods */}
            <div className="mb-4">
              <h4 className="font-semibold text-[var(--text-primary)] mb-2 text-center lg:text-left text-sm">
                Accepted Payment Methods
              </h4>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={index}
                    className="relative w-10 h-6 bg-white rounded border border-gray-200 flex items-center justify-center hover:shadow-sm transition-shadow overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={method.icon}
                      alt={method.name}
                      width={30}
                      height={18}
                      className="object-contain"
                      onError={(e) => {
                        // Fallback to emoji/text if image fails
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xs">${method.fallback}</span>`;
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col lg:flex-row justify-between items-center pt-6 border-t border-gray-200">
              <motion.p 
                className="text-[var(--text-muted)] text-sm mb-4 lg:mb-0"
                variants={itemVariants}
              >
                © {new Date().getFullYear()} Kadal Thunai. All rights reserved.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-6 text-sm"
                variants={itemVariants}
              >
                <Link 
                  href="/privacy" 
                  className="text-[var(--text-muted)] hover:text-[#b20000] transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms-of-service" 
                  className="text-[var(--text-muted)] hover:text-[#b20000] transition-colors duration-200"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/cookie-policy" 
                  className="text-[var(--text-muted)] hover:text-[#b20000] transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

  // Links list component
const LinksList = ({ links, isMobile = false }: { links: any[], isMobile?: boolean }) => (
  <ul className={`space-y-0.5 ${isMobile ? 'py-1' : ''}`}>
    {links.map((link, index) => (
      <motion.li 
        key={index}
        whileHover={{ x: 5 }}
        transition={{ duration: 0.2 }}
      >
        <Link 
          href={link.href} 
          className="text-[var(--text-secondary)] hover:text-[#b20000] transition-colors duration-200 text-sm block py-0.5"
        >
          {link.name}
        </Link>
      </motion.li>
    ))}
  </ul>
);

// Contact info component
const ContactInfo = () => (
  <div className="space-y-1.5">
    <motion.div 
      className="flex items-start space-x-2"
      whileHover={{ x: 5 }}
    >
      <Phone className="w-3.5 h-3.5 text-[var(--primary-accent)] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-[var(--text-primary)]">Call us</p>
        <a 
          href="tel:+919876543210" 
          className="text-xs text-[var(--text-secondary)] hover:text-[#b20000] transition-colors"
        >
          +91 98765 43210
        </a>
      </div>
    </motion.div>

    <motion.div 
      className="flex items-start space-x-2"
      whileHover={{ x: 5 }}
    >
      <Mail className="w-3.5 h-3.5 text-[var(--primary-accent)] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-[var(--text-primary)]">Email us</p>
        <a 
          href="mailto:hello@kadalthunai.com" 
          className="text-xs text-[var(--text-secondary)] hover:text-[#b20000] transition-colors"
        >
          hello@kadalthunai.com
        </a>
      </div>
    </motion.div>

    <motion.div 
      className="flex items-start space-x-2"
      whileHover={{ x: 5 }}
    >
      <MapPin className="w-3.5 h-3.5 text-[var(--primary-accent)] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-[var(--text-primary)]">Location</p>
        <p className="text-xs text-[var(--text-secondary)]">Chennai, Tamil Nadu, India</p>
      </div>
    </motion.div>

    <motion.div 
      className="flex items-start space-x-2"
      whileHover={{ x: 5 }}
    >
      <Clock className="w-3.5 h-3.5 text-[var(--primary-accent)] mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-[var(--text-primary)]">Working Hours</p>
        <p className="text-xs text-[var(--text-secondary)]">Mon-Sun: 6 AM - 10 PM</p>
      </div>
    </motion.div>
  </div>
);

export default ModernFooter;
