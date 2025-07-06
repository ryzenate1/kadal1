'use client';

import { useEffect, useRef, useState } from 'react';

export default function IsolatedMapTest() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Isolated Map Container Test</h1>
      <p>Testing without any global CSS interference</p>
      
      <div style={{
        width: '800px',
        height: '500px',
        margin: '20px 0',
        position: 'relative',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Map container */}
        <div 
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#e0e0e0',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Map Container</h3>
            <p>Width: {mapRef.current?.offsetWidth}px</p>
            <p>Height: {mapRef.current?.offsetHeight}px</p>
          </div>
        </div>

        {/* Loading overlay - should disappear after 3 seconds */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }}></div>
              <p>Loading...</p>
            </div>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p><strong>Loading State:</strong> {isLoading ? 'True' : 'False'}</p>
        <p><strong>Container Ready:</strong> {mapRef.current ? 'True' : 'False'}</p>
        <button 
          onClick={() => setIsLoading(!isLoading)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Toggle Loading
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
