import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { prisma } from '../index';

const router = express.Router();

// Generate tracking number
const generateTrackingNumber = () => {
  return `TRK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

// User order routes (require authentication)
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match the expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      userId: order.userId,
      user: order.user,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.orderItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.imageUrl
      })),
      shippingAddress: order.address ? {
        name: order.address.name,
        phone: order.user.phoneNumber || '',
        address: order.address.address,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode
      } : null,
      trackingHistory: order.trackingHistory.map(history => ({
        status: history.status,
        timestamp: history.timestamp.toISOString(),
        description: history.description
      }))
    }));

    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order by ID (user must own the order)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const transformedOrder = {
      id: order.id,
      userId: order.userId,
      user: order.user,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.orderItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.imageUrl
      })),
      shippingAddress: order.address ? {
        name: order.address.name,
        phone: order.user.phoneNumber || '',
        address: order.address.address,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode
      } : null,
      trackingHistory: order.trackingHistory.map(history => ({
        status: history.status,
        timestamp: history.timestamp.toISOString(),
        description: history.description
      }))
    };

    res.status(200).json(transformedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order items' });
    }

    if (!shippingAddress || !totalAmount) {
      return res.status(400).json({ message: 'Missing required order information' });
    }

    // Generate tracking number
    const trackingNumber = generateTrackingNumber();

    // Create or find address
    let addressId = null;
    if (shippingAddress) {
      const address = await prisma.address.create({
        data: {
          userId,
          name: shippingAddress.name,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          isDefault: false
        }
      });
      addressId = address.id;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        status: 'pending',
        totalAmount: parseFloat(totalAmount.toString()),
        paymentStatus: 'paid',
        paymentMethod: paymentMethod || 'cash',
        trackingNumber,
        pointsEarned: Math.floor(totalAmount * 0.1) // 10% of order value as points
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        address: true
      }
    });

    // Create order items
    const orderItems = await Promise.all(
      items.map(async (item: any) => {
        return prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          },
          include: {
            product: true
          }
        });
      })
    );

    // Create initial tracking history
    await prisma.trackingHistory.create({
      data: {
        orderId: order.id,
        status: 'Order Placed',
        description: 'Your order has been successfully placed'
      }
    });

    // Get the complete order with all relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!completeOrder) {
      return res.status(500).json({ message: 'Failed to create order' });
    }

    const transformedOrder = {
      id: completeOrder.id,
      userId: completeOrder.userId,
      user: completeOrder.user,
      status: completeOrder.status,
      totalAmount: completeOrder.totalAmount,
      paymentStatus: completeOrder.paymentStatus,
      paymentMethod: completeOrder.paymentMethod,
      trackingNumber: completeOrder.trackingNumber,
      estimatedDelivery: completeOrder.estimatedDelivery,
      createdAt: completeOrder.createdAt.toISOString(),
      updatedAt: completeOrder.updatedAt.toISOString(),
      items: completeOrder.orderItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.imageUrl
      })),
      shippingAddress: completeOrder.address ? {
        name: completeOrder.address.name,
        phone: completeOrder.user.phoneNumber || '',
        address: completeOrder.address.address,
        city: completeOrder.address.city,
        state: completeOrder.address.state,
        pincode: completeOrder.address.pincode
      } : null,
      trackingHistory: completeOrder.trackingHistory.map(history => ({
        status: history.status,
        timestamp: history.timestamp.toISOString(),
        description: history.description
      }))
    };

    res.status(201).json(transformedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Track order by tracking number (public - no auth required)
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { trackingNumber },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const transformedOrder = {
      id: order.id,
      userId: order.userId,
      user: order.user,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.orderItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.imageUrl
      })),
      shippingAddress: order.address ? {
        name: order.address.name,
        phone: order.user.phoneNumber || '',
        address: order.address.address,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode
      } : null,
      trackingHistory: order.trackingHistory.map(history => ({
        status: history.status,
        timestamp: history.timestamp.toISOString(),
        description: history.description
      }))
    };

    res.status(200).json(transformedOrder);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ message: 'Failed to track order' });
  }
});

// Admin routes
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedOrders = orders.map(order => ({
      id: order.id,
      userId: order.userId,
      user: order.user,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.orderItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.imageUrl
      })),
      shippingAddress: order.address ? {
        name: order.address.name,
        phone: order.user.phoneNumber || '',
        address: order.address.address,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode
      } : null,
      trackingHistory: order.trackingHistory.map(history => ({
        status: history.status,
        timestamp: history.timestamp.toISOString(),
        description: history.description
      }))
    }));

    res.status(200).json(transformedOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Update order status (admin only)
router.put('/:id/status', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        trackingHistory: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    // Add tracking history entry if status changed
    const statusDescriptions: { [key: string]: string } = {
      'pending': 'Your order has been received and confirmed',
      'processing': 'Your order is being processed and packaged',
      'packed': 'Your order has been packed and ready for shipment',
      'shipped': 'Your order has been shipped and is on the way',
      'delivered': 'Your order has been delivered successfully',
      'cancelled': 'Your order has been cancelled'
    };

    if (oldStatus !== status) {
      await prisma.trackingHistory.create({
        data: {
          orderId: id,
          status: status.charAt(0).toUpperCase() + status.slice(1),
          description: statusDescriptions[status] || `Order status updated to ${status}`
        }
      });
    }

    // Get updated order with new tracking history
    const finalOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        trackingHistory: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!finalOrder) {
      return res.status(500).json({ message: 'Failed to update order' });
    }

    const transformedOrder = {
      id: finalOrder.id,
      userId: finalOrder.userId,
      user: finalOrder.user,
      status: finalOrder.status,
      totalAmount: finalOrder.totalAmount,
      paymentStatus: finalOrder.paymentStatus,
      paymentMethod: finalOrder.paymentMethod,
      trackingNumber: finalOrder.trackingNumber,
      estimatedDelivery: finalOrder.estimatedDelivery,
      createdAt: finalOrder.createdAt.toISOString(),
      updatedAt: finalOrder.updatedAt.toISOString(),
      items: finalOrder.orderItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.imageUrl
      })),
      shippingAddress: finalOrder.address ? {
        name: finalOrder.address.name,
        phone: finalOrder.user.phoneNumber || '',
        address: finalOrder.address.address,
        city: finalOrder.address.city,
        state: finalOrder.address.state,
        pincode: finalOrder.address.pincode
      } : null,
      trackingHistory: finalOrder.trackingHistory.map(history => ({
        status: history.status,
        timestamp: history.timestamp.toISOString(),
        description: history.description
      }))
    };    res.status(200).json(transformedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// DEMO ENDPOINTS - No authentication required

// POST create new order (demo - no auth)
router.post('/demo', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, deliverySlot } = req.body;
    
    // Validate required fields
    if (!items || !shippingAddress || !paymentMethod || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate unique order ID and tracking number
    const orderId = `ORD-${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    // Create order data for demo
    const orderData = {
      id: orderId,
      trackingNumber,
      status: 'confirmed',
      totalAmount: parseFloat(totalAmount),
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      shippingAddress,
      items,
      deliverySlot,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };
    
    res.status(201).json(orderData);
  } catch (error) {
    console.error('Error creating demo order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET order tracking by ID (demo - no auth)
router.get('/:id/tracking-demo', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For demo purposes, return mock tracking data
    const trackingData = {
      orderId: id,
      trackingNumber: `TRK${id.slice(-6)}${Math.floor(Math.random() * 1000)}`,
      status: 'in_transit',
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lastUpdate: new Date().toISOString(),
      trackingHistory: [
        {
          status: 'In Transit',
          timestamp: new Date().toISOString(),
          description: 'Your order is on the way',
          location: 'Chennai Distribution Center'
        },
        {
          status: 'Processing',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          description: 'Order is being prepared for shipment',
          location: 'Fulfillment Center'
        },
        {
          status: 'Order Placed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: 'Your order has been received',
          location: 'Online'
        }
      ],
      shippingAddress: {
        name: 'Demo Customer',
        phone: '9876543210',
        address: '123 Main Street, Apartment 4B',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001'
      },
      items: [
        {
          id: '1',
          name: 'Fresh Tuna Steak',
          quantity: 2,
          price: 299.50,
          image: '/images/products/tuna.jpg'
        }
      ],
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      totalAmount: 649.00,
      deliveryFee: 49.00,
      discount: 0
    };
    
    res.json(trackingData);
  } catch (error) {
    console.error('Error getting demo order tracking:', error);
    res.status(500).json({ error: 'Failed to get order tracking' });
  }
});

export default router;
