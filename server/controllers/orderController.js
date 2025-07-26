const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all orders with pagination and filtering
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate, 
      sortBy = 'createdAt', 
      order = 'desc',
      userId
    } = req.query;
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build where condition
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    // Build order by condition
    const orderBy = {};
    orderBy[sortBy] = order.toLowerCase();
    
    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true
            }
          },
          address: true,
          orderItems: {
            include: {
              product: true
            }
          },
          trackingHistory: {
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);
    
    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Failed to get orders', details: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        },
        address: true,
        orderItems: {
          include: {
            product: true
          }
        },
        trackingHistory: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Failed to get order', details: error.message });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus = 'pending',
      estimatedDelivery
    } = req.body;
    
    // Validate required fields
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }
    
    // Start a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          userId,
          addressId,
          totalAmount,
          paymentMethod,
          paymentStatus,
          estimatedDelivery,
          status: 'pending',
          trackingNumber: generateTrackingNumber(),
          // Create initial tracking history
          trackingHistory: {
            create: {
              status: 'order_placed',
              description: 'Order has been placed successfully'
            }
          }
        }
      });
      
      // Create order items
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        });
        
        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
      
      // Award loyalty points
      const pointsToAward = Math.floor(totalAmount / 100) * 5; // 5 points per Rs. 100
      
      if (pointsToAward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            loyaltyPoints: {
              increment: pointsToAward
            }
          }
        });
        
        await prisma.loyaltyActivity.create({
          data: {
            userId,
            points: pointsToAward,
            type: 'earned',
            description: `Earned ${pointsToAward} points from order #${newOrder.id.substring(0, 8)}`
          }
        });
        
        // Update order with points earned
        await prisma.order.update({
          where: { id: newOrder.id },
          data: {
            pointsEarned: pointsToAward
          }
        });
      }
      
      // Create a notification for the user
      await prisma.notification.create({
        data: {
          userId,
          title: 'Order Placed Successfully',
          message: `Your order #${newOrder.id.substring(0, 8)} has been placed successfully and is being processed.`,
          type: 'order',
          resourceType: 'order',
          resourceId: newOrder.id
        }
      });
      
      // Create activity log
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'ORDER_CREATED',
          description: `Created order #${newOrder.id.substring(0, 8)}`,
          resourceType: 'order',
          resourceId: newOrder.id,
          metadata: JSON.stringify({
            totalAmount,
            itemCount: items.length
          })
        }
      });
      
      // Return the created order with related data
      return prisma.order.findUnique({
        where: { id: newOrder.id },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          trackingHistory: true
        }
      });
    });
    
    // Send the created order as response
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Valid status values
    const validStatuses = [
      'pending', 
      'processing', 
      'ready_for_pickup', 
      'out_for_delivery', 
      'delivered', 
      'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Start a transaction
    const updatedOrder = await prisma.$transaction(async (prisma) => {
      // Update order status
      const order = await prisma.order.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date()
        }
      });
      
      // Add tracking history
      await prisma.trackingHistory.create({
        data: {
          orderId: id,
          status,
          description: description || getDefaultStatusDescription(status)
        }
      });
      
      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: existingOrder.userId,
          title: `Order ${getStatusDisplayName(status)}`,
          message: description || getDefaultStatusDescription(status),
          type: 'order',
          resourceType: 'order',
          resourceId: id
        }
      });
      
      // Create activity log
      await prisma.activityLog.create({
        data: {
          userId: req.user.id, // The admin/staff who updated the status
          action: 'ORDER_STATUS_UPDATED',
          description: `Updated order #${id.substring(0, 8)} status to ${status}`,
          resourceType: 'order',
          resourceId: id,
          metadata: JSON.stringify({
            previousStatus: existingOrder.status,
            newStatus: status
          })
        }
      });
      
      return order;
    });
    
    res.json({ 
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;
    
    // Validate required fields
    if (!paymentStatus) {
      return res.status(400).json({ error: 'Payment status is required' });
    }
    
    // Valid payment status values
    const validPaymentStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
    
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status value' });
    }
    
    // Get existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update payment status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus,
        paymentMethod: paymentMethod || existingOrder.paymentMethod,
        updatedAt: new Date()
      }
    });
    
    // Create notification for payment completed
    if (paymentStatus === 'completed') {
      await prisma.notification.create({
        data: {
          userId: existingOrder.userId,
          title: 'Payment Successful',
          message: `Payment for order #${id.substring(0, 8)} has been completed successfully.`,
          type: 'order',
          resourceType: 'order',
          resourceId: id
        }
      });
    }
    
    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: req.user.id, // The admin/staff who updated the status
        action: 'ORDER_PAYMENT_UPDATED',
        description: `Updated order #${id.substring(0, 8)} payment status to ${paymentStatus}`,
        resourceType: 'order',
        resourceId: id,
        metadata: JSON.stringify({
          previousPaymentStatus: existingOrder.paymentStatus,
          newPaymentStatus: paymentStatus
        })
      }
    });
    
    res.json({ 
      message: 'Order payment status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status', details: error.message });
  }
};

// Get order tracking history
exports.getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
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
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error getting order tracking:', error);
    res.status(500).json({ error: 'Failed to get order tracking', details: error.message });
  }
};

// Helper function to generate a tracking number
function generateTrackingNumber() {
  const prefix = 'KT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

// Helper function to get default status description
function getDefaultStatusDescription(status) {
  const descriptions = {
    'pending': 'Your order has been received and is pending processing.',
    'processing': 'Your order is being processed.',
    'ready_for_pickup': 'Your order is ready for pickup/delivery.',
    'out_for_delivery': 'Your order is out for delivery.',
    'delivered': 'Your order has been delivered successfully.',
    'cancelled': 'Your order has been cancelled.'
  };
  
  return descriptions[status] || `Order status changed to ${status}`;
}

// Helper function to get display name for status
function getStatusDisplayName(status) {
  const displayNames = {
    'pending': 'Pending',
    'processing': 'Processing',
    'ready_for_pickup': 'Ready for Pickup',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  
  return displayNames[status] || status;
}
