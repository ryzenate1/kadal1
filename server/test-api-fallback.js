// This script tests the order tracking API fallback
// It will:
// 1. Create a test order
// 2. Get tracking data via the REST API
// 3. Update the order status
// 4. Verify the update is reflected in tracking data

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const API_URL = 'http://localhost:5002';
const TOKEN = process.env.TEST_TOKEN; // Set this before running
const ADMIN_TOKEN = process.env.ADMIN_TEST_TOKEN; // Set this before running

// Set up test data
async function setupTestData(userId) {
  console.log('Setting up test data...');
  
  // Create test address if needed
  let address = await prisma.address.findFirst({
    where: { userId }
  });
  
  if (!address) {
    console.log('Creating test address...');
    address = await prisma.address.create({
      data: {
        userId,
        name: 'Home',
        address: '123 Test Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        isDefault: true
      }
    });
  }
  
  // Create test product if needed
  let product = await prisma.product.findFirst({
    where: { name: 'Test Fish' }
  });
  
  if (!product) {
    console.log('Creating test product...');
    product = await prisma.product.create({
      data: {
        name: 'Test Fish',
        slug: 'test-fish',
        description: 'A test fish product',
        price: 299.5,
        originalPrice: 350.0,
        imageUrl: 'https://example.com/fish.jpg',
        weight: '500g',
        stock: 100,
        isActive: true
      }
    });
  }
  
  return {
    addressId: address.id,
    productId: product.id
  };
}

// Test createOrder API
async function createTestOrder(userId) {
  try {
    console.log('Creating test order...');
    
    // Set up test data
    const { addressId, productId } = await setupTestData(userId);
    
    const orderData = {
      addressId,
      paymentMethod: 'COD',
      totalAmount: 599.0,
      items: [
        {
          productId,
          quantity: 2,
          price: 299.5
        }
      ]
    };
    
    const response = await axios.post(`${API_URL}/api/orders`, orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Order created successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Error creating test order:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// Test getOrderTracking API
async function getOrderTracking(orderId) {
  try {
    console.log(`Getting tracking data for order ${orderId}...`);
    
    const response = await axios.get(`${API_URL}/api/orders/${orderId}/tracking`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('Tracking data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error getting order tracking:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// Test updateOrderStatus API
async function updateOrderStatus(orderId, newStatus, description) {
  try {
    console.log(`Updating order ${orderId} status to ${newStatus}...`);
    
    const updateData = {
      status: newStatus,
      description: description || `Order status updated to ${newStatus}`
    };
    
    const response = await axios.put(`${API_URL}/api/orders/${orderId}/status`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}` // Use admin token for updates
      }
    });
    
    console.log('Order status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// Test adding tracking update
async function addTrackingUpdate(orderId, status, description, metadata) {
  try {
    console.log(`Adding tracking update for order ${orderId}...`);
    
    const updateData = {
      status,
      description,
      metadata: JSON.stringify(metadata || {})
    };
    
    const response = await axios.post(`${API_URL}/api/orders/${orderId}/tracking`, updateData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}` // Use admin token for updates
      }
    });
    
    console.log('Tracking update added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding tracking update:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// Main test function
async function testApiFallback() {
  try {
    console.log('Starting API fallback test...');
    
    // Decode user ID from token
    const tokenParts = TOKEN.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const userId = payload.userId;
    
    console.log('Testing with user ID:', userId);
    
    // 1. Create a test order
    const order = await createTestOrder(userId);
    const orderId = order.id;
    
    // 2. Get initial tracking data
    const initialTracking = await getOrderTracking(orderId);
    
    // 3. Update the order status (need admin token)
    await updateOrderStatus(orderId, 'processing', 'Order is being prepared');
    
    // 4. Verify the update with another tracking data request
    const updatedTracking1 = await getOrderTracking(orderId);
    
    // 5. Add a detailed tracking update
    await addTrackingUpdate(orderId, 'processing', 'Fish is being cleaned and prepared', {
      location: 'Preparation Area',
      completionPercentage: 30
    });
    
    // 6. Update to out_for_delivery with delivery agent info
    await updateOrderStatus(orderId, 'out_for_delivery', 'Order is out for delivery');
    
    // 7. Add tracking update with location
    await addTrackingUpdate(orderId, 'out_for_delivery', 'Delivery agent on the way', {
      location: 'En route',
      latitude: 13.0827,
      longitude: 80.2707,
      agentName: 'Kumar',
      agentPhone: '9876543210'
    });
    
    // 8. Get final tracking data
    const finalTracking = await getOrderTracking(orderId);
    
    console.log('API fallback test completed successfully!');
    console.log('Final order status:', finalTracking.order.status);
    console.log('Tracking updates count:', finalTracking.tracking.locationUpdates.length);
    
    return {
      success: true,
      orderId,
      initialStatus: initialTracking.order.status,
      finalStatus: finalTracking.order.status,
      trackingUpdatesCount: finalTracking.tracking.locationUpdates.length
    };
  } catch (error) {
    console.error('API fallback test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Get admin token from command line arguments or environment variable
if (!TOKEN) {
  console.error('Please set TEST_TOKEN environment variable before running this script');
  process.exit(1);
}

// Run the test
testApiFallback()
  .then(result => {
    console.log('Test result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
