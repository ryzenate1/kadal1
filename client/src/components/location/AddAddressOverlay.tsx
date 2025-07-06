'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Mic, Home, Briefcase, Users, MapPin as PinIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type TagType = 'home' | 'work' | 'family' | 'other';

interface AddAddressOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: {
    houseNo: string;
    area: string;
    directions: string;
    tag: TagType;
  }) => void;
  currentLocation: {
    name: string;
    fullAddress: string;
    lat: number;
    lng: number;
  };
}

const AddAddressOverlay = ({ isOpen, onClose, onSave, currentLocation }: AddAddressOverlayProps) => {
  const [houseNo, setHouseNo] = useState('');
  const [area, setArea] = useState('');
  const [directions, setDirections] = useState('');
  const [selectedTag, setSelectedTag] = useState<TagType>('home');
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (houseNo.trim().length >= 3) {
      onSave({
        houseNo: houseNo.trim(),
        area: area.trim(),
        directions: directions.trim(),
        tag: selectedTag,
      });
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Prevent background scrolling when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isFormValid = houseNo.trim().length >= 3;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleOverlayClick}
          />
          
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >
            {/* Handle bar */}
            <div className="py-3 flex justify-center">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-4 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              {/* Location Header */}
              <div className="px-6 pt-2 pb-4 border-b">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 rounded-full">
                    <PinIcon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentLocation.name}</h3>
                    <p className="text-sm text-gray-500">{currentLocation.fullAddress}</p>
                  </div>
                </div>

                {/* Tip Box */}
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-900">
                    A detailed address will help our Delivery Partner reach your doorstep easily
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                {/* House/Flat/Block No. */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    HOUSE / FLAT / BLOCK NO.
                  </label>
                  <Input
                    placeholder="Enter flat, villa, etc."
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Apartment/Road/Area */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    APARTMENT / ROAD / AREA (RECOMMENDED)
                  </label>
                  <Input
                    placeholder="Enter area, road, etc."
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Directions */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    DIRECTIONS TO REACH (OPTIONAL)
                  </label>
                  
                  {/* Voice Bar */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-orange-500 text-white px-2 py-0.5 rounded">
                        NEW
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        Tap to record voice directions
                      </span>
                    </div>
                    <Mic className="w-5 h-5 text-orange-500" />
                  </div>

                  <div className="relative">
                    <Textarea
                      placeholder="e.g. Ring the bell on the red gate"
                      value={directions}
                      onChange={(e) => setDirections(e.target.value)}
                      className="w-full min-h-[100px]"
                      maxLength={200}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {directions.length}/200
                    </div>
                  </div>
                </div>

                {/* Save As Tags */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    SAVE AS
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
                      { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" /> },
                      { id: 'family', label: 'Friends and Family', icon: <Users className="w-4 h-4" /> },
                      { id: 'other', label: 'Other', icon: <PinIcon className="w-4 h-4" /> },
                    ].map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setSelectedTag(tag.id as TagType)}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2 border ${
                          selectedTag === tag.id
                            ? 'bg-gray-900 text-white border-transparent'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        {tag.icon}
                        <span className="text-sm whitespace-nowrap">{tag.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spacer for bottom button */}
              <div className="h-24" />
            </div>

            {/* Fixed bottom button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
              <Button
                onClick={handleSave}
                disabled={!isFormValid}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  isFormValid
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-orange-100 text-orange-500 cursor-not-allowed'
                }`}
              >
                {isFormValid ? 'SAVE ADDRESS' : 'ENTER HOUSE / FLAT / BLOCK NO.'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddAddressOverlay;
