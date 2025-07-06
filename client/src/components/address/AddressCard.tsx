'use client';

import { MapPin, Home, Briefcase, MapPinIcon, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type?: 'home' | 'work' | 'other';
  isDefault: boolean;
  phoneNumber?: string;
}

export interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

const getAddressTypeIcon = (type: string) => {
  switch (type) {
    case 'home':
      return <Home className="h-4 w-4 mr-1" />;
    case 'work':
      return <Briefcase className="h-4 w-4 mr-1" />;
    default:
      return <MapPinIcon className="h-4 w-4 mr-1" />;
  }
};

export const AddressCard = ({ address, isSelected, onSelect, onEdit, onDelete, onSetDefault }: AddressCardProps) => {
  return (
    <div 
      className={`border rounded-lg p-4 transition-colors cursor-pointer ${isSelected ? 'border-tendercuts-red bg-red-50/50' : 'border-gray-200 hover:border-tendercuts-red/50'}`}
      onClick={onSelect}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <span className="font-medium text-gray-800 capitalize">
                {getAddressTypeIcon(address.type || 'home')}
                {address.type || 'Home'}
              </span>
              {address.isDefault && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => onEdit(address.id)}
                className="p-1.5 text-gray-500 hover:text-tendercuts-red rounded-full hover:bg-gray-100"
                aria-label="Edit address"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete && onDelete(address.id)}
                className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50"
                aria-label="Delete address"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            <p className="font-medium">{address.name}</p>
            <p>{address.address}</p>
            <p>
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
          
          {!address.isDefault && (
            <div className="mt-3">
              <button
                onClick={() => onSetDefault && onSetDefault(address.id)}
                className="inline-flex items-center text-xs text-tendercuts-red hover:underline"
              >
                <Star className="h-3 w-3 mr-1 fill-current" />
                Set as default
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
