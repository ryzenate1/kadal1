import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

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

  const fetchTrackingData = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`);

      if (!response.ok) {
        throw new Error(`Failed to fetch tracking data: ${response.status}`);
      }

      const data = await response.json();
      setTrackingData(data);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError('Failed to load tracking information. Please try again later.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // Only fetch if we have an orderId
    if (!orderId) return;

    fetchTrackingData();

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const channel = supabase
        .channel(`order-tracking-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'order_events',
            filter: `order_id=eq.${orderId}`,
          },
          fetchTrackingData
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }

    // Fallback polling when realtime is not available.
    const intervalId = setInterval(fetchTrackingData, 30000);

    return () => clearInterval(intervalId);
  }, [orderId, fetchTrackingData]);

  return { trackingData, loading, error };
};
