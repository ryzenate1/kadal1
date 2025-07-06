import { NextRequest, NextResponse } from 'next/server';

// Mock database of product stock
let stockDatabase: Record<string, { 
  available: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}> = {
  // Mock data for some products
  '1': { available: 20, status: 'in-stock' },
  '2': { available: 5, status: 'low-stock' },
  '3': { available: 0, status: 'out-of-stock' },
  '4': { available: 15, status: 'in-stock' },
  '5': { available: 3, status: 'low-stock' },
  '6': { available: 10, status: 'in-stock' },
  '7': { available: 7, status: 'in-stock' },
  '8': { available: 4, status: 'low-stock' },
  '9': { available: 0, status: 'out-of-stock' },
  '10': { available: 25, status: 'in-stock' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  
  // Return stock for a specific product
  if (productId) {
    const stock = stockDatabase[productId] || { available: 10, status: 'in-stock' }; // Default values for unknown products
    return NextResponse.json(stock);
  }
  
  // Return all stock data
  return NextResponse.json(stockDatabase);
}

// For updating stock (not actually functional in this example but included for completeness)
export async function POST(req: NextRequest) {
  try {
    const { productId, quantity } = await req.json();
    
    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    const currentStock = stockDatabase[productId] || { available: 10, status: 'in-stock' };
    const newAvailable = Math.max(0, currentStock.available - quantity);
    
    let status: 'in-stock' | 'low-stock' | 'out-of-stock';
    if (newAvailable === 0) {
      status = 'out-of-stock';
    } else if (newAvailable <= 5) {
      status = 'low-stock';
    } else {
      status = 'in-stock';
    }
    
    stockDatabase[productId] = {
      available: newAvailable,
      status
    };
    
    return NextResponse.json({ 
      success: true, 
      productId, 
      newStock: stockDatabase[productId] 
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
} 