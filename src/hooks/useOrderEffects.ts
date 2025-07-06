import { useState, useEffect } from 'react';

// Custom hook for playing sound effects
export const useSound = (soundUrl: string) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Only create the audio element on the client side
    if (typeof window !== 'undefined') {
      const audioElement = new Audio(soundUrl);
      setAudio(audioElement);

      // Event listeners
      const handleEnded = () => setIsPlaying(false);
      audioElement.addEventListener('ended', handleEnded);

      return () => {
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.pause();
      };
    }
  }, [soundUrl]);

  const play = () => {
    if (audio && !isPlaying) {
      // Reset to beginning if it was played before
      audio.currentTime = 0;
      
      // Play the audio
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Error playing sound:', error);
          setIsPlaying(false);
        });
    }
  };

  const stop = () => {
    if (audio && isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return { play, stop, isPlaying };
};

// Custom hook for order tracking
export const useOrderTracking = (orderId: string | null) => {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have an orderId
    if (!orderId) return;

    const fetchTrackingData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to use the new demo endpoint first
        const response = await fetch(`/api/orders/${orderId}/tracking-demo`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tracking data: ${response.status}`);
        }
        
        const data = await response.json();
        setTrackingData(data);
      } catch (err) {
        console.error('Error fetching tracking data:', err);
        setError('Failed to load tracking information. Please try again later.');
        
        // For demo purposes, set mock tracking data if API fails
        setTrackingData({
          orderId,
          trackingNumber: `TRK${Math.floor(Math.random() * 100000)}`,
          status: 'processing',
          estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString(),
          lastUpdate: new Date().toISOString(),
          trackingHistory: [
            {
              status: 'Order Placed',
              timestamp: new Date().toISOString(),
              description: 'Your order has been received',
              location: 'Online'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();

    // Set up polling for real-time updates every 30 seconds
    const intervalId = setInterval(fetchTrackingData, 30000);
    
    return () => clearInterval(intervalId);
  }, [orderId]);

  return { trackingData, loading, error };
};
