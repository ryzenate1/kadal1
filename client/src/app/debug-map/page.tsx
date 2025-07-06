'use client';

import { useState } from 'react';
import GoogleMapPickerSimple from '@/components/maps/GoogleMapPickerSimple_fixed';

export default function DebugMapPage() {
  const [coordinates, setCoordinates] = useState({
    lat: 13.0827,
    lng: 80.2707
  });
  const [address, setAddress] = useState('Loading address...');

  const handleLocationChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    console.log('Location changed:', { lat, lng });
  };

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    console.log('Address changed:', newAddress);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: '16px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          Google Maps Debug Page
        </h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          overflow: 'hidden', 
          height: '500px' 
        }}>
          <GoogleMapPickerSimple
            lat={coordinates.lat}
            lng={coordinates.lng}
            onLocationChange={handleLocationChange}
            onAddressChange={handleAddressChange}
            className="no-tailwind-map-container"
          />
        </div>
      </div>
    </div>
  );
}
