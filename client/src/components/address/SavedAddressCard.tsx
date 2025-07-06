'use client';

import React from 'react';
import { Home, Briefcase, MapPinned, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Address = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  address_string: string;
  door_no: string;
  building: string;
  landmark: string;
  tag: "Home" | "Work" | "Other";
  created_at: string;
};

interface SavedAddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect: () => void;
}

export function SavedAddressCard({ address, isSelected = false, onSelect }: SavedAddressCardProps) {
  const getIcon = () => {
    switch (address.tag) {
      case 'Home':
        return <Home className="h-5 w-5 text-red-600" />;
      case 'Work':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'Other':
        return <MapPinned className="h-5 w-5 text-purple-600" />;
      default:
        return <Home className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-red-500 bg-red-50 ring-2 ring-red-100 shadow-sm' 
          : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full mr-3 ${
          address.tag === 'Home' ? 'bg-red-100' : 
          address.tag === 'Work' ? 'bg-blue-100' : 'bg-purple-100'
        }`}>
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{address.tag}</h3>
            {isSelected && (
              <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-700 mt-1 font-medium">
            {address.door_no}
            {address.building ? `, ${address.building}` : ''}
          </p>
          
          {address.landmark && (
            <p className="text-xs text-gray-500 mt-1">
              Near {address.landmark}
            </p>
          )}
          
          <p className="text-xs text-gray-500 mt-2 truncate max-w-[230px]">
            {address.address_string}
          </p>
          
          <Button
            variant={isSelected ? "ghost" : "outline"}
            size="sm"
            className={`mt-3 ${
              isSelected 
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            {isSelected ? 'Currently Selected' : 'Deliver Here'}
          </Button>
        </div>
      </div>
    </div>
  );
}
