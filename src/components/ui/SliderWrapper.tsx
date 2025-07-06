import React, { ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface SliderWrapperProps {
  children: ReactNode[];
  slidesPerView?: number | 'auto';
  spaceBetween?: number;
  autoplay?: boolean | { delay: number; disableOnInteraction: boolean };
  navigation?: boolean;
  pagination?: boolean;
  loop?: boolean;
  centeredSlides?: boolean;
  effect?: 'slide' | 'fade' | 'coverflow' | 'flip';
  className?: string;
  breakpoints?: {
    [key: number]: {
      slidesPerView: number | 'auto';
      spaceBetween?: number;
    };
  };
  onSlideChange?: (index: number) => void;
}

const SliderWrapper: React.FC<SliderWrapperProps> = ({
  children,
  slidesPerView = 1,
  spaceBetween = 20,
  autoplay = false,
  navigation = true,
  pagination = true,
  loop = true,
  centeredSlides = false,
  effect = 'slide',
  className = '',
  breakpoints,
  onSlideChange
}) => {
  const defaultBreakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 10
    },
    640: {
      slidesPerView: slidesPerView === 'auto' ? 'auto' as const : Math.min(2, slidesPerView as number),
      spaceBetween: 15
    },
    768: {
      slidesPerView: slidesPerView === 'auto' ? 'auto' as const : Math.min(3, slidesPerView as number),
      spaceBetween: 20
    },
    1024: {
      slidesPerView,
      spaceBetween
    }
  };

  const swiperModules = [Navigation, Pagination];
  
  if (autoplay) {
    swiperModules.push(Autoplay);
  }
  
  if (effect === 'coverflow') {
    swiperModules.push(EffectCoverflow);
  }

  return (
    <motion.div 
      className={`slider-wrapper relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Swiper
        modules={swiperModules}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        navigation={navigation ? {
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        } : false}
        pagination={pagination ? {
          clickable: true,
          dynamicBullets: true,
        } : false}
        autoplay={autoplay === true ? {
          delay: 3000,
          disableOnInteraction: false,
        } : autoplay}
        loop={loop && children.length > 1}
        centeredSlides={centeredSlides}
        effect={effect}
        breakpoints={breakpoints || defaultBreakpoints}
        onSlideChange={(swiper) => onSlideChange?.(swiper.activeIndex)}
        className="kadal-swiper"
        {...(effect === 'coverflow' && {
          coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }
        })}
      >
        {children.map((child, index) => (
          <SwiperSlide key={index} className="swiper-slide-custom">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {child}
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {navigation && (
        <>
          <button
            className="swiper-button-prev-custom absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            className="swiper-button-next-custom absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}
    </motion.div>
  );
};

export default SliderWrapper;
