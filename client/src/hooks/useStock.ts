import { useState, useEffect, useCallback } from 'react';

interface Stock {
  available: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export function useStock(productId: string | number) {
  const [stock, setStock] = useState<Stock>({ available: 10, status: 'in-stock' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock data
  useEffect(() => {
    const fetchStock = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // API call to get stock information
        const response = await fetch(`/api/products/stock?productId=${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        
        const stockData = await response.json();
        setStock(stockData);
      } catch (err) {
        console.error('Error fetching stock:', err);
        setError('Failed to load stock information');
        // Fallback to default values
        setStock({ available: 10, status: 'in-stock' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStock();
  }, [productId]);
  
  // Function to check if a quantity is available
  const isQuantityAvailable = useCallback((quantity: number): boolean => {
    return stock.status !== 'out-of-stock' && stock.available >= quantity;
  }, [stock]);
  
  // Function to update stock after adding to cart
  const updateStockAfterAddToCart = useCallback(async (quantity: number): Promise<boolean> => {
    try {
      // Check if the requested quantity is available
      if (!isQuantityAvailable(quantity)) {
        return false;
      }
      
      // In a production app, we would call the API to update stock
      // For demo purposes, we'll just update the local state
      
      const newAvailable = Math.max(0, stock.available - quantity);
      let newStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
      
      if (newAvailable === 0) {
        newStatus = 'out-of-stock';
      } else if (newAvailable <= 5) {
        newStatus = 'low-stock';
      } else {
        newStatus = 'in-stock';
      }
      
      setStock({
        available: newAvailable,
        status: newStatus
      });
      
      return true;
    } catch (err) {
      console.error('Error updating stock:', err);
      return false;
    }
  }, [stock, isQuantityAvailable]);
  
  return {
    stock,
    isLoading,
    error,
    isQuantityAvailable,
    updateStockAfterAddToCart
  };
} 