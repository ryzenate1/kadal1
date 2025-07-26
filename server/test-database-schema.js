// Test script to validate Prisma database schema for real-time tracking
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabaseSchema() {
  console.log('=== Testing Database Schema for Real-time Tracking ===\n');
  
  try {
    // Step 1: Test creating a user
    console.log('1. Testing User creation...');
    const testUser = await prisma.user.upsert({
      where: { email: 'test-db@example.com' },
      update: {},
      create: {
        name: 'Test DB User',
        email: 'test-db@example.com',
        phoneNumber: '9876543210',
        password: 'hashedpassword',
        role: 'customer'
      }
    });
    console.log(`✓ User created/found: ${testUser.id}`);
    
    // Step 2: Test creating an address
    console.log('\n2. Testing Address creation...');
    const testAddress = await prisma.address.upsert({
      where: { id: 'test-address-db' },
      update: {},
      create: {
        id: 'test-address-db',
        userId: testUser.id,
        name: 'Test Address',
        address: '123 Test Street',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        isDefault: true
      }
    });
    console.log(`✓ Address created/found: ${testAddress.id}`);
    
    // Step 3: Test creating a product
    console.log('\n3. Testing Product creation...');
    const testProduct = await prisma.product.upsert({
      where: { slug: 'test-fish-db' },
      update: {},
      create: {
        name: 'Test Fish DB',
        slug: 'test-fish-db',
        description: 'A test fish for database testing',
        price: 299.5,
        originalPrice: 350.0,
        imageUrl: 'https://example.com/fish.jpg',
        weight: '500g',
        stock: 100,
        isActive: true
      }
    });
    console.log(`✓ Product created/found: ${testProduct.id}`);
    
    // Step 4: Test creating an order with tracking
    console.log('\n4. Testing Order creation with tracking...');
    const testOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        addressId: testAddress.id,
        status: 'pending',
        totalAmount: 599.0,
        paymentStatus: 'pending',
        paymentMethod: 'COD',
        trackingNumber: `DBTEST${Date.now()}`,
        eta: 45,
        deliveryAgent: 'Test Agent',
        deliveryPhone: '9876543211',
        orderItems: {
          create: [
            {
              productId: testProduct.id,
              quantity: 2,
              price: 299.5
            }
          ]
        },
        trackingHistory: {
          create: [
            {
              status: 'pending',
              description: 'Order received',
              metadata: JSON.stringify({ location: 'Order Processing Center' })
            }
          ]
        }
      }
    });
    console.log(`✓ Order created with tracking: ${testOrder.id}`);
    
    // Step 5: Test updating order status and adding tracking history
    console.log('\n5. Testing order status updates and tracking history...');
    
    // Update to processing
    const updatedOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: {
        status: 'processing',
        eta: 35,
        updatedAt: new Date()
      }
    });
    
    // Add tracking history entry
    const trackingEntry1 = await prisma.trackingHistory.create({
      data: {
        orderId: testOrder.id,
        status: 'processing',
        description: 'Fish being prepared',
        metadata: JSON.stringify({
          location: 'Preparation Area',
          completionPercentage: 25,
          staffMember: 'John Doe'
        })
      }
    });
    console.log(`✓ Order updated to processing with tracking entry: ${trackingEntry1.id}`);
    
    // Update to out_for_delivery
    await prisma.order.update({
      where: { id: testOrder.id },
      data: {
        status: 'out_for_delivery',
        eta: 15,
        deliveryAgent: 'Kumar',
        deliveryPhone: '9876543212',
        updatedAt: new Date()
      }
    });
    
    // Add tracking history with location data
    const trackingEntry2 = await prisma.trackingHistory.create({
      data: {
        orderId: testOrder.id,
        status: 'out_for_delivery',
        description: 'Order is out for delivery',
        metadata: JSON.stringify({
          location: 'En route',
          latitude: 13.0827,
          longitude: 80.2707,
          completionPercentage: 75,
          agentName: 'Kumar',
          agentPhone: '9876543212',
          estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        })
      }
    });
    console.log(`✓ Order updated to out_for_delivery with location tracking: ${trackingEntry2.id}`);
    
    // Step 6: Test querying full order tracking data
    console.log('\n6. Testing full order tracking query...');
    const fullOrderData = await prisma.order.findUnique({
      where: { id: testOrder.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true
          }
        },
        address: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
                weight: true
              }
            }
          }
        },
        trackingHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });
    
    console.log(`✓ Full order data retrieved with ${fullOrderData.trackingHistory.length} tracking entries`);
    
    // Step 7: Test real-time tracking data format
    console.log('\n7. Testing real-time tracking data format...');
    
    // Calculate progress percentage
    const statusProgress = {
      'pending': 0,
      'processing': 25,
      'ready_for_pickup': 50,
      'out_for_delivery': 75,
      'delivered': 100,
      'cancelled': 0
    };
    
    const progressPercentage = statusProgress[fullOrderData.status] || 0;
    const eta = fullOrderData.eta || 0;
    
    // Format tracking data for client
    const trackingData = {
      order: {
        id: fullOrderData.id,
        status: fullOrderData.status,
        user: fullOrderData.user,
        address: fullOrderData.address,
        orderItems: fullOrderData.orderItems,
        createdAt: fullOrderData.createdAt,
        estimatedDelivery: fullOrderData.estimatedDelivery,
        totalAmount: fullOrderData.totalAmount,
        paymentMethod: fullOrderData.paymentMethod,
        paymentStatus: fullOrderData.paymentStatus,
        deliveryAgent: fullOrderData.deliveryAgent,
        deliveryPhone: fullOrderData.deliveryPhone
      },
      tracking: {
        eta,
        progressPercentage,
        currentStatus: fullOrderData.status,
        locationUpdates: fullOrderData.trackingHistory.map(history => ({
          status: history.status,
          description: history.description,
          timestamp: history.timestamp,
          metadata: history.metadata ? JSON.parse(history.metadata) : {}
        }))
      }
    };
    
    console.log(`✓ Tracking data formatted for client:`);
    console.log(`   - Order ID: ${trackingData.order.id}`);
    console.log(`   - Status: ${trackingData.order.status}`);
    console.log(`   - ETA: ${trackingData.tracking.eta} minutes`);
    console.log(`   - Progress: ${trackingData.tracking.progressPercentage}%`);
    console.log(`   - Location Updates: ${trackingData.tracking.locationUpdates.length}`);
    console.log(`   - Delivery Agent: ${trackingData.order.deliveryAgent}`);
    
    // Step 8: Test admin analytics data
    console.log('\n8. Testing admin analytics queries...');
    
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: {
          in: ['delivered']
        }
      }
    });
    
    console.log(`✓ Admin analytics data:`);
    console.log(`   - Total Orders: ${totalOrders}`);
    console.log(`   - Total Revenue: $${totalRevenue._sum.totalAmount || 0}`);
    console.log(`   - Status Distribution:`, orderStats);
    
    console.log('\n=== Database Schema Test Results ===');
    console.log('✓ User management working');
    console.log('✓ Address management working');
    console.log('✓ Product management working');
    console.log('✓ Order creation with tracking working');
    console.log('✓ Order status updates working');
    console.log('✓ Tracking history with metadata working');
    console.log('✓ Full order tracking queries working');
    console.log('✓ Real-time tracking data format working');
    console.log('✓ Admin analytics queries working');
    console.log('✓ Delivery agent information working');
    console.log('✓ Location tracking with GPS coordinates working');
    
    console.log('\n🎉 All database schema tests passed!');
    console.log('The database is ready for real-time order tracking.');
    
    return {
      success: true,
      orderId: testOrder.id,
      trackingData
    };
    
  } catch (error) {
    console.error('Database test failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseSchema()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
