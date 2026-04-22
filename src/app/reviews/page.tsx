'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Define the testimonial interface
interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  translation: string;
  avatar: string;
  rating: number;
}

// Avatar Image component with fallback
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
      'bg-primary/10 text-primary',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
    ];
    
    const hash = name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };
  
  const colorClass = getInitialsColor(alt);
  const initials = getInitials(alt);
  
  return (
    <div className={`w-12 h-12 rounded-full overflow-hidden ${className}`}>
      {!error ? (
        <Image 
          src={src} 
          alt={alt}
          width={56}
          height={56}
          className="object-cover w-full h-full"
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${colorClass}`}>
          <span className="text-lg font-medium">{initials}</span>
        </div>
      )}
    </div>
  );
};

// Testimonial Card component
interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

const TestimonialCard = ({ testimonial, className = "" }: TestimonialCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Determine if truncation is needed with improved length settings
  const needsTruncation = testimonial.translation.length > 120 || testimonial.quote.length > 140;
  
  // Always show meaningful content regardless of language
  const truncatedQuote = needsTruncation && !expanded
    ? `${testimonial.quote.substring(0, 140)}${testimonial.quote.length > 140 ? '...' : ''}`
    : testimonial.quote;
    
  const truncatedTranslation = needsTruncation && !expanded
    ? `${testimonial.translation.substring(0, 120)}${testimonial.translation.length > 120 ? '...' : ''}`
    : testimonial.translation;
  
  return (
    <div className={`bg-white p-4 sm:p-5 max-w-sm w-full mx-auto rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <Quote className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i}
              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-200'}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
        {/* Tamil quote with enhanced visibility and font size */}
        <div className="mb-2.5">
          <p className="text-gray-700 text-base sm:text-lg italic font-medium leading-snug" dir="auto">
            {expanded ? testimonial.quote : truncatedQuote}
          </p>
        </div>
        
        {/* English translation with better readability */}
        <div className="text-gray-600 text-sm sm:text-base mb-3 leading-snug" dir="auto">
          <p>
            {expanded ? testimonial.translation : truncatedTranslation}
          </p>
        </div>
        
        {/* Read more button with improved styling */}
        {needsTruncation && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center mt-auto mb-1 transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? 'Show less' : 'Read more'}
            {expanded ? (
              <ChevronLeft className="ml-1 h-4 w-4 rotate-90" />
            ) : (
              <ChevronRight className="ml-1 h-4 w-4 rotate-90" />
            )}
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
        <div className="flex-shrink-0">
          <AvatarImage 
            src={testimonial.avatar} 
            alt={testimonial.name}
            className="border border-red-100"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 text-sm">{testimonial.name}</h3>
          <p className="text-xs text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
};

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const testimonialsPerPage = 9;
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Extended list of testimonials with varied images (randomuser.me, unsplash nature, and cats)
  const allTestimonials: Testimonial[] = [
    {
      id: 1,
      name: "Selvarani Murugan",
      role: "Home Cook",
      quote: "கடல் துணை மீன் தரம் மிக உயர்ந்தது. நான் எப்போதும் என் குடும்ப உணவுக்கு புதிதாக மீன் கிடைக்கும் என நம்பலாம். அவர்களின் வங்காரம் மீன் சுவையானது!",
      translation: "The fish quality from Kadal Thunai is exceptional. I can always trust that I'm getting fresh fish for my family meals. Their Vangaram fish is delicious!",
      avatar: "https://randomuser.me/api/portraits/women/62.jpg",
      rating: 5
    },
    {
      id: 2,
      name: "Muthukumar Senthilnathan",
      role: "Restaurant Owner",
      quote: "உணவகம் நடத்துபவராக, தரம் முக்கியம். கடல் துணை எப்போதும் தரமான மீன் வழங்குகிறது. அவர்களின் விநியோகம் எப்போதும் சரியான நேரத்தில் இருக்கும்.",
      translation: "As a restaurant owner, quality is essential. Kadal Thunai always delivers quality fish. Their delivery is always on time.",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      rating: 4
    },
    {
      id: 3,
      name: "Lakshmi Venkatesh",
      role: "Food Enthusiast",
      quote: "நான் பல மீன் விநியோக சேவைகளை முயற்சித்துள்ளேன், ஆனால் கடல் துணைக்கு இணையானது எதுவும் இல்லை. நான் அவர்களின் நெத்திலி மீன் மற்றும் கணவாய் ஐ விரும்புகிறேன்!",
      translation: "I've tried many fish delivery services, but none compare to Kadal Thunai. I love their Nethili fish and squid!",
      avatar: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 5
    },
    {
      id: 4,
      name: "Anbarasan Ramachandran",
      role: "Regular Customer",
      quote: "கடல் துணை என் குடும்பம் விரும்பும் சுவையான மீன் தருகிறது. 3 ஆண்டுகளுக்கும் மேலாக நான் அவர்களிடம் வாங்கி வருகிறேன். நான் அவர்களின் மத்தி மீன் மற்றும் வங்காரம் பற்றி மிகவும் விரும்புகிறேன்.",
      translation: "Kadal Thunai provides delicious fish that my family loves. I've been buying from them for over 3 years. I especially love their Mathi fish and Vangaram.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      id: 5,
      name: "Kalaiselvi Srinivasan",
      role: "Home Chef",
      quote: "கடல் துணை மூலம் நான் எனது கறி குழம்பு தயாரிப்பதற்கு மிகவும் தரமான மீன் பெறுகிறேன். அவர்களின் தரம் மற்றும் சுத்தம் மற்ற கடைகளை விட சிறந்தது.",
      translation: "I get the best quality fish for my curry preparations through Kadal Thunai. Their quality and cleanliness is better than other shops.",
      avatar: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 4
    },
    {
      id: 6,
      name: "Kannan Chandrasekaran",
      role: "Seafood Lover",
      quote: "கடல் துணையின் மீன் எப்போதும் மிகவும் புதிதாக இருக்கிறது. நான் அவர்களின் இறால் மற்றும் நண்டு பொருட்களை மிகவும் பரிந்துரைக்கிறேன்.",
      translation: "The fish from Kadal Thunai is always very fresh. I highly recommend their prawns and crab products.",
      avatar: "https://cataas.com/cat/cute?width=400&height=400",
      rating: 5
    },
    {
      id: 7,
      name: "Priya Ramamurthy",
      role: "Culinary Blogger",
      quote: "கடல் துணையின் புதிய மீன் என் சமையல் பதிவுகளுக்கு மிகவும் முக்கியமானது. அவர்களின் விலங்கு மீன் சுவையில் மிகவும் சிறந்தது.",
      translation: "Fresh fish from Kadal Thunai is essential for my culinary blog posts. Their Vilangai fish is excellent in taste.",
      avatar: "https://randomuser.me/api/portraits/women/43.jpg",
      rating: 5
    },
    {
      id: 8,
      name: "Rajesh Kumar",
      role: "Fitness Enthusiast",
      quote: "புரத சத்துக்காக மீன் சாப்பிடுவது என் உடற்பயிற்சி திட்டத்தின் ஒரு பகுதி. கடல் துணை எப்போதும் தரமான, புதிய மீன் வழங்குகிறது.",
      translation: "Eating fish for protein is part of my fitness regimen. Kadal Thunai always provides quality, fresh fish.",
      avatar: "https://images.unsplash.com/photo-1565118531796-763e5082d113?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 4
    },
    {
      id: 9,
      name: "Vijaya Lakshmi",
      role: "Grandmother",
      quote: "என் பேரக்குழந்தைகளுக்கு ஆரோக்கியமான உணவு கொடுப்பது முக்கியம். கடல் துணை மீன் தூய்மையாகவும் புதிதாகவும் வருவதால், நான் அதை அவர்களின் சத்தான உணவுக்கு பயன்படுத்துகிறேன்.",
      translation: "Providing healthy food for my grandchildren is important. Since Kadal Thunai fish comes clean and fresh, I use it for their nutritious meals.",
      avatar: "https://randomuser.me/api/portraits/women/78.jpg",
      rating: 5
    },
    {
      id: 10,
      name: "Manikandan Subramaniam",
      role: "Seafood Restaurant Chef",
      quote: "என் உணவகத்தில் சர்வ செய்யப்படும் அனைத்து மீன் உணவுகளுக்கும் கடல் துணை மீன்களை நான் நம்புகிறேன். அவர்கள் மிகவும் தரமான உயர் தர மீன்களை வழங்குகிறார்கள்.",
      translation: "I rely on Kadal Thunai fish for all seafood dishes served at my restaurant. They consistently deliver premium quality fish.",
      avatar: "https://cataas.com/cat/says/Fresh%20Fish?width=400&height=400",
      rating: 5
    },
    {
      id: 11,
      name: "Saranya Krishnan",
      role: "Food Blogger",
      quote: "கடல் துணையின் நண்டு மிகவும் புதிதாகவும் சுவையாகவும் இருக்கிறது. என் உணவு பதிவில் இதைப் பற்றி விரிவாக எழுதியுள்ளேன்.",
      translation: "The crabs from Kadal Thunai are very fresh and tasty. I've written extensively about them in my food blog.",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      rating: 5
    },
    {
      id: 12,
      name: "Venkatesh Ramanathan",
      role: "Family Man",
      quote: "வார இறுதியில் குடும்பத்துடன் மீன் சாப்பிடுவது எங்கள் வழக்கம். கடல் துணையின் தரம் எப்போதும் சிறப்பாக இருக்கிறது.",
      translation: "Eating fish with family on weekends is our tradition. Kadal Thunai's quality is always excellent.",
      avatar: "https://images.unsplash.com/photo-1584351583369-6baf886c488f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 4
    },
    {
      id: 13,
      name: "Nithya Sundaram",
      role: "Nutritionist",
      quote: "என் வாடிக்கையாளர்களுக்கு ஆரோக்கியமான உணவுக்காக கடல் துணை மீன் பரிந்துரைக்கிறேன். அவர்களின் சத்து மதிப்பு மற்றும் தரம் மிகவும் உயர்ந்தது.",
      translation: "I recommend Kadal Thunai fish to my clients for healthy eating. Their nutritional value and quality are very high.",
      avatar: "https://randomuser.me/api/portraits/women/37.jpg",
      rating: 5
    },
    {
      id: 14,
      name: "Senthil Kumar",
      role: "Tech Professional",
      quote: "பணிப்பளுவால் சமைக்க நேரம் இல்லாததால், கடல் துணையின் துரித விநியோகம் மிகவும் உதவுகிறது. எப்போதும் தரம் சிறப்பாக உள்ளது.",
      translation: "Kadal Thunai's quick delivery helps a lot as I don't have time to cook due to work pressure. The quality is always excellent.",
      avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      rating: 4
    },
    {
      id: 15,
      name: "Meenakshi Raman",
      role: "Housewife",
      quote: "கடல் துணையின் மீன் வெட்டப்பட்ட நிலையில் வருவதால், சமைப்பது மிகவும் எளிதாக உள்ளது. மீன் தரமும் புதிதாகவும் இருக்கிறது.",
      translation: "Since Kadal Thunai fish comes in cut form, cooking is very easy. The fish quality is fresh too.",
      avatar: "https://images.unsplash.com/photo-1582845512747-e42001c95638?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 5
    },
    {
      id: 16,
      name: "Arumugam Shankar",
      role: "Retired Teacher",
      quote: "கடல் துணை மீன் வயதானவர்களுக்கு ஏற்ற சிறந்த தேர்வாகும். அவர்களின் சேவை தனிப்பட்டது மற்றும் மீன் தரம் சிறந்தது.",
      translation: "Kadal Thunai fish is an excellent choice for the elderly. Their service is personalized and fish quality is superior.",
      avatar: "https://randomuser.me/api/portraits/men/53.jpg",
      rating: 5
    },
    {
      id: 17,
      name: "Sangeetha Prakash",
      role: "Teacher",
      quote: "என் குழந்தைகளுக்கு ஆரோக்கியமான உணவு கொடுப்பது மிகவும் முக்கியம். கடல் துணை மீன் புதிதாகவும் பாதுகாப்பானதாகவும் இருப்பதால், அது என் தேர்வாக உள்ளது.",
      translation: "Giving healthy food to my children is very important. Since Kadal Thunai fish is fresh and safe, it's my choice.",
      avatar: "https://cataas.com/cat/says/Yummy?width=400&height=400",
      rating: 4
    },
    {
      id: 18,
      name: "Balamurugan Natarajan",
      role: "Local Fisherman",
      quote: "நான் ஒரு மீனவராக, நல்ல தரமான மீன்களை அடையாளம் காண முடியும். கடல் துணை மிகச் சிறந்த மீன்களை மட்டுமே வழங்குகிறது.",
      translation: "As a fisherman, I can identify good quality fish. Kadal Thunai only supplies the best fish.",
      avatar: "https://randomuser.me/api/portraits/men/47.jpg",
      rating: 5
    },
    {
      id: 19,
      name: "Tamilselvi Perumal",
      role: "Caterer",
      quote: "என் உணவு வணிகத்திற்கு கடல் துணை மீன்கள் மிகவும் முக்கியமானவை. அவர்களின் விநியோகம் நம்பகமானது மற்றும் மீன் தரம் சிறந்தது.",
      translation: "Kadal Thunai fish is very important for my catering business. Their delivery is reliable and fish quality is excellent.",
      avatar: "https://randomuser.me/api/portraits/women/56.jpg",
      rating: 5
    },
    {
      id: 20,
      name: "Vinoth Ramesh",
      role: "Software Engineer",
      quote: "கடல் துணையின் ஆன்லைன் ஆர்டரிங் அமைப்பு மிகவும் எளிதானது. மீன் தரமும் சிறப்பாக உள்ளது.",
      translation: "Kadal Thunai's online ordering system is very easy. The fish quality is also excellent.",
      avatar: "https://images.unsplash.com/photo-1608506375591-b90e055d5cc1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 4
    },
    {
      id: 21,
      name: "Saraswathi Krishnamoorthy",
      role: "Traditional Cook",
      quote: "பாரம்பரிய மீன் குழம்புக்கு, கடல் துணையின் விலங்கு மீன் மிகவும் சிறந்தது. சுவை மற்றும் மணம் அற்புதமாக இருக்கிறது.",
      translation: "For traditional fish curry, Kadal Thunai's Vilangai fish is excellent. The taste and aroma are wonderful.",
      avatar: "https://randomuser.me/api/portraits/women/92.jpg",
      rating: 5
    },
    {
      id: 22,
      name: "Ramachandran Iyer",
      role: "Hotel Owner",
      quote: "எங்கள் ஹோட்டலில் உள்ள அனைத்து மீன் உணவுகளுக்கும் கடல் துணை மீன்களை பயன்படுத்துகிறோம். அவர்களின் தரம் மற்றும் விநியோகம் நம்பகமானது.",
      translation: "We use Kadal Thunai fish for all seafood dishes in our hotel. Their quality and delivery are reliable.",
      avatar: "https://cataas.com/cat/cute/says/Fish?width=400&height=400",
      rating: 5
    },
    {
      id: 23,
      name: "Suganya Veeraraghavan",
      role: "Health Conscious Customer",
      quote: "ஆரோக்கியத்திற்காக மீன் சாப்பிடுவது அவசியம். கடல் துணை எப்போதும் புதிய, ஆரோக்கியமான மீன்களை வழங்குகிறது.",
      translation: "Eating fish is essential for health. Kadal Thunai always provides fresh, healthy fish.",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      rating: 4
    },
    {
      id: 24,
      name: "Ganesan Subramanian",
      role: "Senior Citizen",
      quote: "என் வயதில், ஆரோக்கியமான உணவு மிக முக்கியம். கடல் துணை மீன் உயர் தரமானது மற்றும் சுலபமாக ஜீரணிக்கக்கூடியது.",
      translation: "At my age, healthy food is very important. Kadal Thunai fish is high quality and easily digestible.",
      avatar: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 5
    },
    {
      id: 25,
      name: "Kavitha Balachandran",
      role: "Working Mother",
      quote: "பணிக்கும் தாயாக, சமைக்க நேரம் குறைவு. கடல் துணையின் துரித விநியோகம் மற்றும் சுத்தமான மீன் என் வாழ்க்கையை எளிதாக்குகிறது.",
      translation: "As a working mother, I have less time to cook. Kadal Thunai's quick delivery and clean fish make my life easier.",
      avatar: "https://randomuser.me/api/portraits/women/35.jpg",
      rating: 5
    },
    {
      id: 26,
      name: "Saravanan Murugan",
      role: "Fish Curry Specialist",
      quote: "சிறந்த மீன் குழம்பு செய்ய சிறந்த மீன் தேவை. கடல் துணை எனக்கு மிகச் சிறந்த தரமான மீன்களை வழங்குகிறது.",
      translation: "To make the best fish curry, you need the best fish. Kadal Thunai provides me with the finest quality fish.",
      avatar: "https://randomuser.me/api/portraits/men/61.jpg",
      rating: 5
    },
    {
      id: 27,
      name: "Chitra Ramasamy",
      role: "Food Vlogger",
      quote: "என் உணவு வீடியோக்களுக்காக கடல் துணை மீன்களை பயன்படுத்துகிறேன். அவற்றின் நிறம் மற்றும் தரம் எப்போதும் என் பார்வையாளர்களால் பாராட்டப்படுகிறது.",
      translation: "I use Kadal Thunai fish for my food videos. Their color and quality are always appreciated by my viewers.",
      avatar: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      rating: 5
    },
    {
      id: 28,
      name: "Thiyagarajan Venkatachalam",
      role: "Seafood Enthusiast",
      quote: "கடல் உணவை மிகவும் விரும்பும் ஒருவராக, கடல் துணையின் மீன் மற்றும் நண்டு தரம் என்னை எப்போதும் மகிழ்ச்சியடையச் செய்கிறது.",
      translation: "As someone who loves seafood, the quality of Kadal Thunai's fish and crab always makes me happy.",
      avatar: "https://randomuser.me/api/portraits/men/38.jpg",
      rating: 4
    },
    {
      id: 29,
      name: "Usha Chandrasekaran",
      role: "Dietitian",
      quote: "என் நோயாளிகளுக்கு சத்தான உணவாக மீன் சாப்பிட பரிந்துரைக்கிறேன். கடல் துணை மீன் தரம் மற்றும் சுத்தம் மிகவும் நம்பகமானது.",
      translation: "I recommend eating fish as nutritious food for my patients. Kadal Thunai fish quality and cleanliness are very reliable.",
      avatar: "https://cataas.com/cat/says/Healthy?width=400&height=400",
      rating: 5
    },
    {
      id: 30,
      name: "Parthiban Vijayakumar",
      role: "Local Restaurant Owner",
      quote: "எங்கள் சிறிய உணவகத்தில், நாங்கள் கடல் துணை மீன்களை மட்டுமே பயன்படுத்துகிறோம். அவர்களின் தரம் மற்றும் விலை மதிப்பு சிறந்தது.",
      translation: "In our small restaurant, we only use Kadal Thunai fish. Their quality and value for money are excellent.",
      avatar: "https://randomuser.me/api/portraits/men/27.jpg",
      rating: 5
    }
  ];
  
  // Calculate pagination values
  const totalPages = Math.ceil(allTestimonials.length / testimonialsPerPage);
  const indexOfLastTestimonial = currentPage * testimonialsPerPage;
  const indexOfFirstTestimonial = indexOfLastTestimonial - testimonialsPerPage;
  const currentTestimonials = allTestimonials.slice(indexOfFirstTestimonial, indexOfLastTestimonial);
  
  // Pagination controls
  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    window.scrollTo(0, 0);
  };
  
  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    window.scrollTo(0, 0);
  };
  
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };
  
  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => goToPage(1)}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-red-50 text-sm"
          aria-label="Go to first page"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2">...</span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded text-sm ${
            currentPage === i 
              ? 'bg-red-600 text-white' 
              : 'border border-gray-300 hover:bg-red-50'
          }`}
          aria-label={`Go to page ${i}`}
          aria-current={currentPage === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2">...</span>
        );
      }
      
      buttons.push(
        <button
          key="last"
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 rounded border border-gray-300 hover:bg-red-50 text-sm"
          aria-label="Go to last page"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };
  
  if (!isMounted) return null;

  return (
    <div className="bg-gradient-to-b from-red-50 to-white py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Link href="/" className="flex items-center text-red-600 hover:text-red-700 transition-colors font-medium">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-red-600 mb-3 sm:mb-4">
            Customer Reviews
          </h1>
          <p className="text-gray-600">
            See what our customers have to say about the quality and service of Kadal Thunai's fresh seafood delivery.
          </p>
          <div className="mt-3 text-gray-500 text-sm">
            Showing {indexOfFirstTestimonial + 1}-{Math.min(indexOfLastTestimonial, allTestimonials.length)} of {allTestimonials.length} reviews
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-10 sm:mb-12">
          {currentTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        
        {/* Pagination Controls */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-1 rounded border ${
              currentPage === 1 
                ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 text-red-600 hover:bg-red-50'
            }`}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </button>
          
          <div className="flex items-center space-x-1">
            {getPaginationButtons()}
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-1 rounded border ${
              currentPage === totalPages 
                ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 text-red-600 hover:bg-red-50'
            }`}
            aria-label="Go to next page"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
