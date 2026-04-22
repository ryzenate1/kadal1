/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import SliderWrapper from '../ui/SliderWrapper';
import { fadeIn, staggerContainer, staggerItem } from '@/utils/motionUtils';
import { SafeHtmlButton } from '@/components/ui/safe-html-button';

// Enhanced testimonial data
const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Home Chef",
    location: "Chennai",
    quote: "காடல் துணை மூலம் மிகவும் புதிய மற்றும் தரமான மீன் கிடைக்கிறது. என் குடும்பம் மிகவும் மகிழ்ச்சியாக இருக்கிறது.",
    translation: "Through Kadal Thunai, I get the freshest and highest quality fish. My family is extremely happy.",
    avatar: "/testimonials/priya.jpg",
    rating: 5
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Restaurant Owner",
    location: "Coimbatore", 
    quote: "எங்கள் உணவகத்திற்கு தினமும் புதிய மீன் தேவை. காடல் துணை எப்போதும் நேரத்தில் வந்து சேர்க்கிறது.",
    translation: "Our restaurant needs fresh fish daily. Kadal Thunai always delivers on time with exceptional quality.",
    avatar: "/testimonials/rajesh.jpg",
    rating: 5
  },
  {
    id: 3,
    name: "Meera Devi",
    role: "Homemaker",
    location: "Madurai",
    quote: "மீன் வாங்க சந்தைக்கு போக வேண்டாம். வீட்டிலே இருந்து ஆர்டர் செய்தால் புதிய மீன் வீட்டுக்கே வந்து விடுகிறது.",
    translation: "No need to go to the market to buy fish. Just order from home and fresh fish comes right to your door.",
    avatar: "/testimonials/meera.jpg",
    rating: 5
  },
  {
    id: 4,
    name: "Arjun Patel",
    role: "Food Blogger",
    location: "Bangalore",
    quote: "The variety and quality of seafood from Kadal Thunai is outstanding. Perfect for my food photography and cooking videos.",
    translation: "காடல் துணையின் கடல் உணவு வகைகள் மற்றும் தரம் அற்புதம். என் சமையல் வீடியோக்களுக்கு ஏற்றது.",
    avatar: "/testimonials/arjun.jpg",
    rating: 5
  },
  {
    id: 5,
    name: "Lakshmi Narayanan",
    role: "Nutritionist",
    location: "Trichy",
    quote: "என் நோயாளிகளுக்கு புரதம் நிறைந்த மீன் பரிந்துரைக்கிறேன். காடல் துணையின் மீன் எப்போதும் புதிதாக இருக்கிறது.",
    translation: "I recommend protein-rich fish to my patients. Kadal Thunai's fish is always fresh and nutritious.",
    avatar: "/testimonials/lakshmi.jpg",
    rating: 5
  }
];

// Avatar component with fallback
interface AvatarImageProps {
  src: string;
  alt: string;
  className?: string;
}

const AvatarImage = ({ src, alt, className = "" }: AvatarImageProps) => {
  const [error, setError] = useState(false);
  
  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600', 
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  const colorClass = getInitialsColor(alt);
  const initials = getInitials(alt);
  
  return (
    <div className={`testimonial-avatar ${className}`}>
      {!error ? (
        <Image 
          src={src} 
          alt={alt}
          width={48}
          height={48}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${colorClass} font-semibold`}>
          {initials}
        </div>
      )}
    </div>
  );
};

// Individual testimonial card
const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => {
  const [showTranslation, setShowTranslation] = useState(false);
  
  return (
    <motion.div 
      className="bg-white p-4 sm:p-5 max-w-sm w-full mx-auto rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full"
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quote icon */}
      <div className="flex justify-between items-start mb-3">
        <Quote className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Testimonial content */}
      <div className="flex-grow flex flex-col">
        <p className="text-gray-700 text-base sm:text-lg italic font-medium leading-snug mb-3" dir="auto">
          {showTranslation ? testimonial.translation : testimonial.quote}
        </p>
        
        {/* Language toggle button */}
        <SafeHtmlButton
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-red-500 hover:text-red-700 text-sm font-medium mt-auto transition-colors"
        >
          {showTranslation ? 'Show Original' : 'Show Translation'}
        </SafeHtmlButton>
      </div>

      {/* Author info */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-4">
        <AvatarImage 
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full overflow-hidden border border-red-100"
        />
        <div>
          <div className="font-semibold text-gray-700 text-sm">{testimonial.name}</div>
          <div className="text-xs text-gray-400">{testimonial.role}</div>
          <div className="text-xs text-gray-500">{testimonial.location}</div>
        </div>
      </div>
    </motion.div>
  );
};

// Main testimonials section
const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-primary-bg">
      <motion.div 
        className="container-xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section header */}
        <motion.div className="text-center mb-12" variants={staggerItem}>
          <h2 className="text-heading mb-4">
            What Our Customers Say
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Real experiences from customers who trust Kadal Thunai for their fresh seafood needs
          </p>
        </motion.div>
        
        {/* Testimonials slider */}
        <motion.div variants={staggerItem}>
          <SliderWrapper
            slidesPerView={1}
            spaceBetween={30}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={true}
            pagination={true}
            loop={true}
            centeredSlides={true}
            className="testimonials-slider"
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 40
              }
            }}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </SliderWrapper>
        </motion.div>
        
        {/* Call to action */}
        <motion.div className="text-center mt-12" variants={staggerItem}>
          <p className="text-body mb-6">
            Join thousands of satisfied customers who choose Kadal Thunai
          </p>
          <a 
            href="/categories"
            className="btn-base btn-primary"
          >
            Start Shopping Now
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;
