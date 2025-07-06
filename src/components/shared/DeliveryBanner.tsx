"use client";

import Image from "next/image";

const DeliveryBanner = () => {
  return (
    <div className="bg-white shadow-sm p-4 rounded-lg flex items-center justify-center mb-6">
      <div className="flex items-center">
        <div className="flex items-center justify-center bg-tendercuts-red rounded-full p-2 w-10 h-10">
          <Image
            src="/images/delivery-icon.png"
            alt="Delivery Icon"
            width={20}
            height={20}
          />
        </div>
        <div className="ml-2">
          <p className="text-sm text-gray-600">Delivery in</p>
          <p className="font-semibold text-lg">90 Minutes</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBanner;
