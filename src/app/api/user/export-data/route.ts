import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with real database query based on authenticated user
    // const userId = await getUserIdFromAuth(request);
    // const userData = await db.user.findUnique({
    //   where: { id: userId },
    //   include: {
    //     orders: true,
    //     addresses: true,
    //     paymentMethods: true,
    //     loyaltyData: true,
    //     settings: true
    //   }
    // });
    
    // Mock user data export
    const userData = {
      user: {
        id: "user_123",
        name: "Test User",
        email: "testuser@kadalthunai.com",
        phoneNumber: "9876543210",
        memberSince: "2024-01-15",
        profileImage: null,
        isActive: true
      },
      orders: [
        {
          id: "order_001",
          total: 450.00,
          status: "delivered",
          createdAt: "2024-06-10",
          items: [
            { name: "Fresh Fish Curry Cut", quantity: 1, price: 450.00 }
          ]
        }
      ],
      addresses: [
        {
          id: "addr_001",
          title: "Home",
          addressLine1: "123 Main Street",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600001",
          isDefault: true
        }
      ],
      paymentMethods: [
        {
          id: "pm_001",
          type: "card",
          cardNumber: "****4567",
          nickname: "Primary Card",
          isDefault: true
        }
      ],
      loyaltyData: {
        currentPoints: 150,
        totalEarned: 300,
        totalRedeemed: 150,
        currentTier: "Bronze"
      },
      settings: {
        theme: "system",
        language: "en",
        currency: "INR",
        notifications: {
          push: true,
          email: true,
          sms: false,
          marketing: false
        }
      },
      exportedAt: new Date().toISOString()
    };
    
    // Generate PDF-style content (using HTML that can be converted to PDF by browser)
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Account Data Export - Kadal Thunai</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; page-break-inside: avoid; }
            .section h2 { color: #dc2626; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            .table th { background-color: #f9fafb; font-weight: bold; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .label { font-weight: bold; }
            @media print { .no-print { display: none; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Account Data Export</h1>
            <p><strong>Kadal Thunai</strong></p>
            <p>Exported on: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
        </div>

        <div class="section">
            <h2>Personal Information</h2>
            <div class="info-row">
                <span class="label">Name:</span>
                <span>${userData.user.name}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span>${userData.user.email}</span>
            </div>
            <div class="info-row">
                <span class="label">Phone:</span>
                <span>+91 ${userData.user.phoneNumber}</span>
            </div>
            <div class="info-row">
                <span class="label">Member Since:</span>
                <span>${userData.user.memberSince}</span>
            </div>
            <div class="info-row">
                <span class="label">Account Status:</span>
                <span>${userData.user.isActive ? 'Active' : 'Inactive'}</span>
            </div>
        </div>

        <div class="section">
            <h2>Order History</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
                    ${userData.orders.map(order => `
                        <tr>
                            <td>${order.id}</td>
                            <td>${order.createdAt}</td>
                            <td>${order.status}</td>
                            <td>₹${order.total}</td>
                            <td>${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Saved Addresses</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Pincode</th>
                        <th>Default</th>
                    </tr>
                </thead>
                <tbody>
                    ${userData.addresses.map(address => `
                        <tr>
                            <td>${address.title}</td>
                            <td>${address.addressLine1}</td>
                            <td>${address.city}</td>
                            <td>${address.state}</td>
                            <td>${address.pincode}</td>
                            <td>${address.isDefault ? 'Yes' : 'No'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Payment Methods</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Details</th>
                        <th>Nickname</th>
                        <th>Default</th>
                    </tr>
                </thead>
                <tbody>
                    ${userData.paymentMethods.map(method => `
                        <tr>
                            <td>${method.type}</td>
                            <td>${method.cardNumber ? `****${method.cardNumber}` : 'N/A'}</td>
                            <td>${method.nickname}</td>
                            <td>${method.isDefault ? 'Yes' : 'No'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Loyalty Information</h2>
            <div class="info-row">
                <span class="label">Current Points:</span>
                <span>${userData.loyaltyData.currentPoints}</span>
            </div>
            <div class="info-row">
                <span class="label">Total Earned:</span>
                <span>${userData.loyaltyData.totalEarned}</span>
            </div>
            <div class="info-row">
                <span class="label">Total Redeemed:</span>
                <span>${userData.loyaltyData.totalRedeemed}</span>
            </div>
            <div class="info-row">
                <span class="label">Current Tier:</span>
                <span>${userData.loyaltyData.currentTier}</span>
            </div>
        </div>

        <div class="section">
            <h2>App Settings</h2>
            <div class="info-row">
                <span class="label">Theme:</span>
                <span>${userData.settings.theme}</span>
            </div>
            <div class="info-row">
                <span class="label">Language:</span>
                <span>${userData.settings.language}</span>
            </div>
            <div class="info-row">
                <span class="label">Currency:</span>
                <span>${userData.settings.currency}</span>
            </div>
        </div>

        <div class="section no-print">
            <p><em>This document contains all your personal data stored in Kadal Thunai. Print this page or save as PDF for your records.</em></p>
        </div>

        <script>
            // Auto-trigger print dialog
            window.onload = function() {
                setTimeout(() => {
                    window.print();
                }, 1000);
            }
        </script>
    </body>
    </html>
    `;
    
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'inline; filename="kadal-thunai-account-data.html"',
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
