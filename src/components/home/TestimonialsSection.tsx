/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
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
      className="testimonial-card"
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Quote icon */}
      <div className="flex justify-center mb-4">
        <Quote className="w-8 h-8 text-primary-accent" fill="currentColor" />
      </div>
      
      {/* Testimonial content */}
      <div className="testimonial-content">
        <p className="text-lg leading-relaxed mb-4">
          {showTranslation ? testimonial.translation : testimonial.quote}
        </p>
        
        {/* Language toggle button */}
        <SafeHtmlButton
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-sm text-primary-accent hover:text-primary-hover transition-colors mb-4"
        >
          {showTranslation ? 'Show Original' : 'Show Translation'}
        </SafeHtmlButton>
      </div>
      
      {/* Rating stars */}
      <div className="flex justify-center gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
        ))}
      </div>
      
      {/* Author info */}
      <div className="testimonial-author">
        <AvatarImage 
          src={testimonial.avatar}
          alt={testimonial.name}
        />
        <div>
          <div className="testimonial-name">{testimonial.name}</div>
          <div className="testimonial-role">{testimonial.role}</div>
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
