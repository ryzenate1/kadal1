"use client";

import Image from "next/image";

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="bg-white rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-row md:flex-col items-center text-left md:text-center" data-component-name="FeatureCard">
    <div className="w-12 h-12 md:w-16 md:h-16 md:mb-3 flex-shrink-0 flex items-center justify-center mr-3 md:mr-0">
      <Image
        src={icon}
        alt={title}
        width={64}
        height={64}
        className="w-full h-full object-contain"
      />
    </div>
    <div className="flex-1 md:flex-none">
      <h3 className="font-medium text-gray-900 mb-0.5 text-sm md:text-base">{title}</h3>
      <p className="text-xs md:text-sm text-gray-600 line-clamp-2 md:line-clamp-none">{description}</p>
    </div>
  </div>
);

const EliteBanner = () => {
  const features = [
    {
      icon: "/images/fssi.png",
      title: "FSSAI Certified",
      description: "100% quality certified products"
    },
    {
      icon: "https://img.icons8.com/color/96/000000/free-shipping.png",
      title: "Free Delivery",
      description: "On orders above ₹499 within 5km radius"
    },
    {
      icon: "https://img.icons8.com/color/96/000000/price-tag.png",
      title: "Lowest Price",
      description: "Best price guaranteed"
    }
  ];

  return (
    <div className="my-6 md:my-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 px-3 md:px-0">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default EliteBanner;
