import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const OrderService = {
  // Get all orders
  getAllOrders: async () => {
    return prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            loyaltyPoints: true,
            loyaltyTier: true
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  // Get orders by user ID
  getOrdersByUserId: async (userId: string) => {
    return prisma.order.findMany({
      where: {
        userId
      },
      include: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            loyaltyPoints: true,
            loyaltyTier: true
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
  },
  // Update order status
  updateOrderStatus: async (id: string, status: string, description: string) => {
    // Start a transaction
    return prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { 
          status,
          updatedAt: new Date()
        },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });
      
      // Create tracking history entry
      const trackingEntry = await tx.trackingHistory.create({
        data: {
          orderId: id,
          status,
          description,
          timestamp: new Date()
        }
      });
      
      // Get all tracking history for this order
      const trackingHistory = await tx.trackingHistory.findMany({
        where: { orderId: id },
        orderBy: { timestamp: 'desc' }
      });
      
      // If order is delivered, award loyalty points
      if (status === 'delivered' && updatedOrder.pointsEarned === 0) {
        const pointsToAward = Math.floor(updatedOrder.totalAmount * 0.05); // 5% of order value
        
        // Update order with points earned
        await tx.order.update({
          where: { id },
          data: { pointsEarned: pointsToAward }
        });
        
        // Add points to user
        await tx.user.update({
          where: { id: updatedOrder.userId },
          data: { 
            loyaltyPoints: { increment: pointsToAward }
          }
        });
        
        // Create loyalty activity entry
        await tx.loyaltyActivity.create({
          data: {
            userId: updatedOrder.userId,
            points: pointsToAward,
            type: 'earned',
            description: `Earned points for order #${id.slice(-6)}`
          }
        });
        
        // Check and update loyalty tier
        const user = await tx.user.findUnique({
          where: { id: updatedOrder.userId },
          select: { loyaltyPoints: true }
        });
        
        if (user) {
          let newTier = 'Bronze';
          if (user.loyaltyPoints >= 5000) {
            newTier = 'Platinum';
          } else if (user.loyaltyPoints >= 2000) {
            newTier = 'Gold';
          } else if (user.loyaltyPoints >= 500) {
            newTier = 'Silver';
          }
          
          await tx.user.update({
            where: { id: updatedOrder.userId },
            data: { loyaltyTier: newTier }
          });        }
      }
      
      return {
        ...updatedOrder,
        trackingHistory
      };
    });
  },

  // Create a new order
  createOrder: async (orderData: any) => {
    return prisma.order.create({
      data: {
        userId: orderData.userId,
        addressId: orderData.addressId,
        status: 'pending',
        totalAmount: orderData.totalAmount,
        paymentStatus: orderData.paymentStatus,
        paymentMethod: orderData.paymentMethod,
        orderItems: {
          create: orderData.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        },
        trackingHistory: {
          create: {
            status: 'pending',
            description: 'Order received'
          }
        }
      },
      include: {
        orderItems: true,
        trackingHistory: true
      }
    });
  },

  // Cancel an order
  cancelOrder: async (id: string, reason: string) => {
    return prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { 
          status: 'cancelled',
          updatedAt: new Date()
        }
      });
      
      // Create tracking history entry
      await tx.trackingHistory.create({
        data: {
          orderId: id,
          status: 'cancelled',
          description: reason || 'Order cancelled by customer'
        }
      });
      
      return updatedOrder;
    });
  }
};
