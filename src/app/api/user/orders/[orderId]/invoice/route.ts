import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: { params: Promise<{ orderId: string }> }) {
  try {
    const params = await context.params;
    const { orderId } = params;
    
    // TODO: Replace with real database query based on authenticated user and orderId
    // const userId = await getUserIdFromAuth(request);
    // const order = await db.order.findUnique({
    //   where: { id: orderId, userId },
    //   include: { items: true, user: true, address: true }
    // });
    
    // Mock order data
    const order = {
      id: orderId,
      orderNumber: `KT${Date.now().toString().slice(-6)}`,
      createdAt: "2024-06-10T10:30:00Z",
      status: "delivered",
      total: 450.00,
      subtotal: 400.00,
      tax: 30.00,
      deliveryCharge: 20.00,
      discount: 0.00,
      paymentMethod: "Card",
      user: {
        name: "Test User",
        email: "testuser@kadalthunai.com",
        phoneNumber: "9876543210"
      },
      address: {
        title: "Home",
        addressLine1: "123 Main Street",
        addressLine2: "Near City Mall",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001"
      },
      items: [
        {
          id: "item_001",
          name: "Fresh Fish Curry Cut",
          quantity: 1,
          price: 400.00,
          weight: "500g",
          image: "/images/fish-curry-cut.jpg"
        }
      ]
    };
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Generate invoice HTML
    const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice - ${order.orderNumber}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                color: #333; 
                line-height: 1.6;
            }
            .invoice-container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                border: 1px solid #ddd;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
                background: #dc2626; 
                color: white; 
                padding: 20px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
            }
            .header p { 
                margin: 5px 0 0 0; 
                opacity: 0.9; 
            }
            .invoice-details { 
                padding: 20px; 
                border-bottom: 1px solid #eee; 
            }
            .invoice-details h2 { 
                color: #dc2626; 
                margin-top: 0; 
            }
            .details-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
                margin-top: 15px; 
            }
            .detail-section h3 { 
                color: #666; 
                font-size: 14px; 
                text-transform: uppercase; 
                margin-bottom: 8px; 
                border-bottom: 1px solid #eee; 
                padding-bottom: 4px; 
            }
            .detail-section p { 
                margin: 4px 0; 
                font-size: 14px; 
            }
            .items-section { 
                padding: 20px; 
            }
            .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px; 
            }
            .items-table th { 
                background: #f8f9fa; 
                padding: 12px; 
                text-align: left; 
                border-bottom: 2px solid #dee2e6; 
                font-weight: bold; 
                color: #495057; 
            }
            .items-table td { 
                padding: 12px; 
                border-bottom: 1px solid #dee2e6; 
            }
            .total-section { 
                padding: 20px; 
                background: #f8f9fa; 
                border-top: 2px solid #dee2e6; 
            }
            .total-row { 
                display: flex; 
                justify-content: space-between; 
                margin: 8px 0; 
                padding: 4px 0; 
            }
            .total-row.final { 
                font-weight: bold; 
                font-size: 18px; 
                color: #dc2626; 
                border-top: 2px solid #dc2626; 
                padding-top: 12px; 
                margin-top: 12px; 
            }
            .footer { 
                padding: 20px; 
                text-align: center; 
                color: #666; 
                font-size: 12px; 
                border-top: 1px solid #eee; 
            }
            .status-badge { 
                display: inline-block; 
                padding: 4px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: bold; 
                text-transform: uppercase; 
            }
            .status-delivered { 
                background: #d4edda; 
                color: #155724; 
            }
            .status-pending { 
                background: #fff3cd; 
                color: #856404; 
            }
            .status-processing { 
                background: #cce7ff; 
                color: #004085; 
            }
            @media print { 
                body { margin: 0; padding: 0; }
                .invoice-container { box-shadow: none; border: none; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <h1>INVOICE</h1>
                <p>Kadal Thunai - Fresh Seafood Delivery</p>
            </div>

            <div class="invoice-details">
                <h2>Invoice #${order.orderNumber}</h2>
                <div class="details-grid">
                    <div class="detail-section">
                        <h3>Order Information</h3>
                        <p><strong>Order ID:</strong> ${order.id}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.user.name}</p>
                        <p><strong>Email:</strong> ${order.user.email}</p>
                        <p><strong>Phone:</strong> +91 ${order.user.phoneNumber}</p>
                    </div>
                </div>
                
                <div class="detail-section" style="margin-top: 20px;">
                    <h3>Delivery Address</h3>
                    <p><strong>${order.address.title}</strong></p>
                    <p>${order.address.addressLine1}</p>
                    ${order.address.addressLine2 ? `<p>${order.address.addressLine2}</p>` : ''}
                    <p>${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
                </div>
            </div>

            <div class="items-section">
                <h3>Order Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Weight/Qty</th>
                            <th>Unit Price</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>
                                    <strong>${item.name}</strong>
                                </td>
                                <td>${item.weight || item.quantity}</td>
                                <td>₹${item.price.toFixed(2)}</td>
                                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₹${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Tax (GST):</span>
                    <span>₹${order.tax.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Delivery Charge:</span>
                    <span>₹${order.deliveryCharge.toFixed(2)}</span>
                </div>
                ${order.discount > 0 ? `
                <div class="total-row">
                    <span>Discount:</span>
                    <span>-₹${order.discount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="total-row final">
                    <span>Total Amount:</span>
                    <span>₹${order.total.toFixed(2)}</span>
                </div>
            </div>

            <div class="footer">
                <p><strong>Thank you for choosing Kadal Thunai!</strong></p>
                <p>For any queries, contact us at support@kadalthunai.com or +91 98765 43210</p>
                <p>Visit us at www.kadalthunai.com</p>
                <p class="no-print">This is a computer-generated invoice. No signature is required.</p>
            </div>
        </div>

        <script>
            // Auto-trigger print dialog after a short delay
            window.onload = function() {
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        </script>
    </body>
    </html>
    `;
    
    return new NextResponse(invoiceHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${order.orderNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
