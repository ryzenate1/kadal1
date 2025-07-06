"use client";

import { useState } from 'react';
import { ArrowLeft, Mic, Search, MapPin, Home, Building2, Users, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddNewAddressPage() {
  const [voiceDirections, setVoiceDirections] = useState('');
  const [houseDetails, setHouseDetails] = useState('');
  const [areaDetails, setAreaDetails] = useState('');
  const [selectedTag, setSelectedTag] = useState('Friends and Family');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="relative h-48 w-full bg-gray-200">
        <button className="absolute top-4 left-4 z-10">
          <ArrowLeft className="text-black" />
        </button>
        <div className="absolute bottom-0 left-0 w-full rounded-t-2xl bg-white p-4 shadow-md">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="text-orange-500" /> Adityaram Nagar
          </h2>
          <p className="text-sm text-gray-600">
            Adityaram Nagar, Panaiyur, Chennai, Tamil Nadu 600119, India
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 text-orange-700 text-xs p-3 font-medium border-b border-orange-200">
        A detailed address will help our Delivery Partner reach your doorstep easily
      </div>

      {/* Form */}
      <div className="flex-1 p-4 space-y-4">
        <Input
          placeholder="HOUSE / FLAT / BLOCK NO."
          value={houseDetails}
          onChange={(e) => setHouseDetails(e.target.value)}
        />

        <Input
          placeholder="APARTMENT / ROAD / AREA (RECOMMENDED)"
          value={areaDetails}
          onChange={(e) => setAreaDetails(e.target.value)}
        />

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">DIRECTIONS TO REACH (OPTIONAL)</p>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <div className="text-[10px] font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded mr-2">
              NEW
            </div>
            <Mic className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-600">Tap to record voice directions</span>
          </div>
          <textarea
            rows={3}
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. Ring the bell on the red gate"
            value={voiceDirections}
            onChange={(e) => setVoiceDirections(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">SAVE AS</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Home', icon: <Home className="w-4 h-4" /> },
              { label: 'Work', icon: <Building2 className="w-4 h-4" /> },
              { label: 'Friends and Family', icon: <Users className="w-4 h-4" /> },
              { label: 'Other', icon: <Landmark className="w-4 h-4" /> },
            ].map(({ label, icon }) => (
              <Button
                key={label}
                variant={selectedTag === label ? 'default' : 'outline'}
                className="text-xs justify-start gap-2"
                onClick={() => setSelectedTag(label)}
              >
                {icon} {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 border-t">
        <Button className="w-full text-sm py-3 rounded-xl bg-orange-500 hover:bg-orange-600">
          ENTER HOUSE / FLAT / BLOCK NO.
        </Button>
      </div>
    </div>
  );
}
