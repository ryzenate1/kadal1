export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  loyaltyPointsEarned: number;
}

export const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${invoiceData.orderId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #dc2626; }
        .invoice-title { text-align: right; }
        .invoice-number { font-size: 18px; font-weight: bold; }
        .invoice-date { color: #666; }
        .customer-info, .order-details { margin-bottom: 30px; }
        .section-title { font-size: 16px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .totals { margin-left: auto; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #dc2626; padding-top: 12px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
        .loyalty-badge { background-color: #fee2e2; color: #dc2626; padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 10px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="logo">Kadal Thunai</div>
        <div class="invoice-title">
          <div class="invoice-number">Invoice #${invoiceData.orderId}</div>
          <div class="invoice-date">${new Date(invoiceData.orderDate).toLocaleDateString('en-IN')}</div>
        </div>
      </div>

      <div class="customer-info">
        <div class="section-title">Customer Information</div>
        <div class="info-grid">
          <div>
            <strong>Name:</strong> ${invoiceData.customerName}<br>
            <strong>Email:</strong> ${invoiceData.customerEmail}<br>
            <strong>Phone:</strong> ${invoiceData.customerPhone}
          </div>
          <div>
            <strong>Delivery Address:</strong><br>
            ${invoiceData.address.street}<br>
            ${invoiceData.address.city}, ${invoiceData.address.state}<br>
            ${invoiceData.address.pincode}
          </div>
        </div>
      </div>

      <div class="order-details">
        <div class="section-title">Order Details</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity} kg</td>
                <td>₹${item.price}</td>
                <td>₹${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${invoiceData.subtotal}</span>
        </div>
        <div class="total-row">
          <span>Tax (GST):</span>
          <span>₹${invoiceData.tax}</span>
        </div>
        <div class="total-row">
          <span>Delivery Fee:</span>
          <span>₹${invoiceData.deliveryFee}</span>
        </div>
        <div class="total-row final">
          <span>Total:</span>
          <span>₹${invoiceData.total}</span>
        </div>
      </div>

      ${invoiceData.loyaltyPointsEarned > 0 ? `
        <div class="loyalty-badge">
          🏆 Loyalty Points Earned: ${invoiceData.loyaltyPointsEarned}
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for choosing Kadal Thunai!</p>
        <p>Fresh seafood delivered to your doorstep</p>
        <p>Contact: support@kadalthunai.com | +91 98765 43210</p>
      </div>
    </body>
    </html>
  `;
};

export const downloadInvoice = (invoiceData: InvoiceData) => {
  const htmlContent = generateInvoiceHTML(invoiceData);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoiceData.orderId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printInvoice = (invoiceData: InvoiceData) => {
  const htmlContent = generateInvoiceHTML(invoiceData);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};
