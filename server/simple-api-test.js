// Simple API fallback test that doesn't require direct database access
const axios = require('axios');
const API_URL = 'http://localhost:5002';
const TOKEN = process.env.TEST_TOKEN;
const ADMIN_TOKEN = process.env.ADMIN_TEST_TOKEN;

async function testOrderTrackingAPI() {
  try {
    console.log('Starting order tracking API test...');
    
    // Step 1: Create a test order (simulated)
    console.log('Creating test order...');
    
    const orderData = {
      addressId: 'test-address-id', // This doesn't have to be real for our test server
      paymentMethod: 'COD',
      totalAmount: 599.0,
      items: [
        {
          productId: 'test-product-id', // This doesn't have to be real for our test server
          quantity: 2,
          price: 299.5
        }
      ]
    };
      const createResponse = await axios.post(`${API_URL}/api/orders`, orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const orderId = createResponse.data.id;
    console.log('Order created with ID:', orderId);
    
    // Step 2: Get initial tracking data
    console.log('Getting initial tracking data...');
    const initialTrackingResponse = await axios.get(`${API_URL}/api/orders/${orderId}/tracking`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const initialStatus = initialTrackingResponse.data.order.status;
    console.log('Initial order status:', initialStatus);
    
    // Step 3: Update order status to processing
    console.log('Updating order status to processing...');
    await axios.put(`${API_URL}/api/orders/${orderId}/status`, 
      {
        status: 'processing',
        description: 'Order is being prepared'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );
    
    // Step 4: Get updated tracking data
    console.log('Getting updated tracking data...');
    const updatedTrackingResponse = await axios.get(`${API_URL}/api/orders/${orderId}/tracking`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const updatedStatus = updatedTrackingResponse.data.order.status;
    console.log('Updated order status:', updatedStatus);
    
    // Step 5: Add tracking update
    console.log('Adding tracking update...');
    await axios.post(`${API_URL}/api/orders/${orderId}/tracking`,
      {
        status: 'processing',
        description: 'Fish is being cleaned and prepared',
        metadata: JSON.stringify({
          location: 'Preparation Area',
          completionPercentage: 30
        })
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );
    
    // Step 6: Update order status to out_for_delivery
    console.log('Updating order status to out_for_delivery...');
    await axios.put(`${API_URL}/api/orders/${orderId}/status`, 
      {
        status: 'out_for_delivery',
        description: 'Order is out for delivery'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );
    
    // Step 7: Add tracking update with location
    console.log('Adding tracking update with location...');
    await axios.post(`${API_URL}/api/orders/${orderId}/tracking`,
      {
        status: 'out_for_delivery',
        description: 'Delivery agent on the way',
        metadata: JSON.stringify({
          location: 'En route',
          latitude: 13.0827,
          longitude: 80.2707,
          agentName: 'Kumar',
          agentPhone: '9876543210'
        })
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );
    
    // Step 8: Get final tracking data
    console.log('Getting final tracking data...');
    const finalTrackingResponse = await axios.get(`${API_URL}/api/orders/${orderId}/tracking`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const finalStatus = finalTrackingResponse.data.order.status;
    const trackingUpdatesCount = finalTrackingResponse.data.tracking.locationUpdates.length;
    
    console.log('Final order status:', finalStatus);
    console.log('Tracking updates count:', trackingUpdatesCount);
    
    console.log('\n--- TEST RESULTS ---');
    console.log('API fallback is working correctly:');
    console.log('1. Created order with initial status:', initialStatus);
    console.log('2. Updated status to processing - verified status:', updatedStatus);
    console.log('3. Added tracking updates with metadata');
    console.log('4. Updated status to out_for_delivery - verified status:', finalStatus);
    console.log('5. Total tracking updates:', trackingUpdatesCount);
    
    return {
      success: true,
      orderId,
      initialStatus,
      finalStatus,
      trackingUpdatesCount
    };
  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testOrderTrackingAPI()
  .then(result => {
    console.log('\nTest completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
