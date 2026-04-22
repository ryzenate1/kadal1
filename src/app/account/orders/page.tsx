"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchJson } from "@/lib/apiClient";
import {
  Package, Clock, CheckCircle, XCircle, Truck, ArrowLeft,
  Download, RotateCcw, Search, X, ChevronDown, ChevronUp,
  MapPin, Phone, Play, FileText, Eye, AlertCircle, Star,
  Receipt, Info, Plus, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* ── Types ── */
interface OrderItem {
  id: string; productId: string; productName: string;
  productImage: string; quantity: number; price: number; weight?: string;
}

interface Order {
  id: string; orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number; paymentStatus: string; paymentMethod: string;
  trackingNumber?: string; estimatedDelivery?: string;
  createdAt: string; updatedAt: string;
  items: OrderItem[];
  address: { name: string; address: string; city: string; state: string; pincode: string; phone?: string };
  pointsEarned: number;
  processingVideoUrl?: string;
  deliveryPersonPhone?: string;
  deliveryPersonName?: string;
  isDeliveryReached?: boolean;
}

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-400',  icon: Clock },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-400',   icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-400', icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-400', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700',    dot: 'bg-green-400',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700',        dot: 'bg-red-400',    icon: XCircle },
};

const FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const PROGRESS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];
function OrderProgress({ status }: { status: Order['status'] }) {
  if (status === 'cancelled') return null;
  // Normalize backend/admin variants so progress always advances correctly.
  const statusKey = String(status);
  const normalizedStatus =
    statusKey === 'pending'
      ? 'confirmed'
      : statusKey === 'in_progress'
        ? 'processing'
        : statusKey;
  const idx = PROGRESS_STEPS.indexOf(normalizedStatus as (typeof PROGRESS_STEPS)[number]);
  const STEP_LABELS: Record<string, string> = {
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
  };
  return (
    <div className="my-3">
      <div className="flex items-center gap-1">
        {PROGRESS_STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all ${i <= idx ? 'bg-red-500 text-white shadow-sm shadow-red-200' : 'bg-gray-100 text-gray-300'}`}>
              {i <= idx ? '✓' : i + 1}
            </div>
            {i < PROGRESS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-0.5 rounded`} style={{ backgroundColor: i < idx ? '#f87171' : '#f3f4f6' }} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-4 gap-1">
        {PROGRESS_STEPS.map((s, i) => (
          <p
            key={`${s}-label`}
            className={`text-[10px] text-center font-medium ${i <= idx ? 'text-red-600' : 'text-gray-400'}`}
          >
            {STEP_LABELS[s]}
          </p>
        ))}
      </div>
    </div>
  );
}

function isImageMedia(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}

function MediaModal({ url, onClose }: { url: string; onClose: () => void }) {
  const imageFile = isImageMedia(url);
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-3 bg-black/50">
          <span className="text-white font-medium text-sm">Order Processing Media</span>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X className="h-5 w-5" /></button>
        </div>
        {imageFile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Order processing media" className="w-full object-contain" style={{ maxHeight: '60vh' }} />
        ) : (
          <video src={url} controls autoPlay className="w-full" style={{ maxHeight: '60vh' }}>
            Your browser does not support video.
          </video>
        )}
      </div>
    </div>
  );
}

/* ── Details Modal ── */
function DetailsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = order.totalAmount - subtotal > 0 ? order.totalAmount - subtotal : 0;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Order Details</p>
              <p className="font-bold text-xl mt-0.5 text-gray-900">#{order.orderNumber}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-600" /></button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[order.status]?.color}`}>
              {STATUS_CONFIG[order.status]?.label}
            </span>
            <span className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Progress */}
          <OrderProgress status={order.status} />

          {/* Items */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                  {item.productImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.weight} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm flex-shrink-0">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            {delivery > 0 && <div className="flex justify-between text-gray-500"><span>Delivery</span><span>₹{delivery.toFixed(0)}</span></div>}
            {order.pointsEarned > 0 && <div className="flex justify-between text-green-600 text-xs"><span>Points Earned</span><span>+{order.pointsEarned} pts</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
              <span>Total</span><span>₹{order.totalAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</p>
            <div className="flex gap-2 bg-gray-50 rounded-xl p-3">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{order.address.name}</p>
                <p className="text-gray-500">{order.address.address}</p>
                <p className="text-gray-500">{order.address.city}, {order.address.state} – {order.address.pincode}</p>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-sm">
              <p className="text-xs text-gray-400 mb-0.5">Payment Method</p>
              <p className="font-semibold text-gray-900 capitalize">{order.paymentMethod}</p>
              <p className={`text-xs capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.paymentStatus}</p>
            </div>
            {order.trackingNumber && (
              <div className="flex-1 bg-gray-50 rounded-xl p-3 text-sm">
                <p className="text-xs text-gray-400 mb-0.5">Tracking ID</p>
                <p className="font-semibold text-gray-900 font-mono text-xs">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Cancel Dialog ── */
const CANCEL_REASONS = [
  { id: 'accidentally_ordered', label: 'Accidentally ordered' },
  { id: 'wrong_quantity', label: 'Want to change quantity' },
  { id: 'change_item', label: 'Want to order something else' },
  { id: 'late_delivery', label: 'Delivery time too long' },
  { id: 'found_cheaper', label: 'Found a better price elsewhere' },
  { id: 'other', label: 'Other reason' },
];

function CancelDialog({ order, onConfirm, onClose }: {
  order: Order;
  onConfirm: (reason: string, newQuantities?: Record<string, number>) => void;
  onClose: () => void;
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [showQuantity, setShowQuantity] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(order.items.map(i => [i.id, i.quantity]))
  );

  const hasQuantityChange = Object.entries(quantities).some(
    ([id, qty]) => qty !== order.items.find(i => i.id === id)?.quantity
  );

  const extraTotal = order.items.reduce((sum, item) => {
    const extra = (quantities[item.id] || item.quantity) - item.quantity;
    return sum + (extra > 0 ? extra * item.price : 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-red-50 border-b border-red-100 p-5">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg">Cancel Order?</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-red-100"><X className="h-5 w-5 text-gray-500" /></button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Hint box */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
            <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">If you want to change quantity, you can increase it and pay only the difference. No need to cancel!</p>
          </div>

          {/* Reasons */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Why are you cancelling?</p>
            <div className="space-y-2">
              {CANCEL_REASONS.map(r => (
                <label key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedReason === r.id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="cancel_reason" value={r.id} checked={selectedReason === r.id}
                    onChange={() => {
                      setSelectedReason(r.id);
                      if (r.id === 'wrong_quantity') setShowQuantity(true);
                      else setShowQuantity(false);
                    }}
                    className="text-red-600" />
                  <span className="text-sm text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity increase section */}
          {showQuantity && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-800">Adjust Quantity Instead</p>
              <p className="text-xs text-blue-600">Increase quantity and pay only the extra amount — no need to cancel!</p>
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.weight} × ₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQuantities(q => ({ ...q, [item.id]: Math.max(item.quantity, (q[item.id] || item.quantity) - 1) }))}
                      className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{quantities[item.id] || item.quantity}</span>
                    <button onClick={() => setQuantities(q => ({ ...q, [item.id]: (q[item.id] || item.quantity) + 1 }))}
                      className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              {extraTotal > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-sm font-semibold text-blue-800">Extra to pay</span>
                  <span className="font-bold text-blue-900">₹{extraTotal.toFixed(0)}</span>
                </div>
              )}
              {hasQuantityChange && (
                <Button onClick={() => onConfirm('wrong_quantity', quantities)}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-10 text-sm">
                  Update Quantity & Pay ₹{extraTotal.toFixed(0)}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">
            Keep Order
          </Button>
          <Button disabled={!selectedReason}
            onClick={() => selectedReason && onConfirm(selectedReason)}
            className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-11 disabled:opacity-50">
            Cancel Order
          </Button>
        </div>
        <p className="text-center text-xs text-gray-400 pb-4 px-5">You can also <button onClick={onClose} className="text-blue-500 underline">skip</button> and contact support instead.</p>
      </div>
    </div>
  );
}

/* ── PDF Invoice ── */
function generateInvoicePDF(order: Order) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = order.totalAmount - subtotal > 0 ? order.totalAmount - subtotal : 0;
  const date = new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a2e; }
  .page { max-width: 600px; margin: 0 auto; padding: 0; }
  .header { background: #f9fafb; color: #111827; padding: 28px 32px; border-bottom: 1px solid #e5e7eb; }
  .brand { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
  .brand-sub { font-size: 13px; color: #6b7280; margin-top: 2px; }
  .invoice-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-top: 20px; }
  .invoice-num { font-size: 22px; font-weight: 700; margin-top: 2px; }
  .invoice-date { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .body { padding: 28px 32px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 600; margin-bottom: 10px; }
  .address-box { background: #f9fafb; border-radius: 12px; padding: 14px; border: 1px solid #f3f4f6; }
  .address-name { font-weight: 700; font-size: 15px; }
  .address-detail { color: #6b7280; font-size: 13px; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; text-align: left; padding: 8px 0; border-bottom: 2px solid #f3f4f6; font-weight: 600; }
  thead th:last-child { text-align: right; }
  tbody tr { border-bottom: 1px solid #f9fafb; }
  tbody td { padding: 10px 0; font-size: 13px; color: #374151; }
  tbody td:last-child { text-align: right; font-weight: 600; }
  .item-weight { font-size: 11px; color: #9ca3af; }
  .totals { background: #f9fafb; border-radius: 12px; padding: 16px; }
  .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #6b7280; }
  .total-final { display: flex; justify-content: space-between; padding: 12px 0 4px; border-top: 2px solid #e5e7eb; margin-top: 8px; font-size: 18px; font-weight: 900; color: #111827; }
  .payment-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: #f0fdf4; border-radius: 10px; border: 1px solid #dcfce7; }
  .payment-method { font-size: 13px; font-weight: 600; text-transform: capitalize; }
  .payment-status { font-size: 12px; font-weight: 700; color: #16a34a; text-transform: capitalize; padding: 3px 10px; background: #dcfce7; border-radius: 20px; }
  .footer { background: #f9fafb; padding: 20px 32px; border-top: 1px solid #f3f4f6; text-align: center; }
  .footer-text { font-size: 12px; color: #9ca3af; }
  .footer-brand { font-size: 13px; font-weight: 700; color: #dc2626; margin-bottom: 4px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-paid { background: #dcfce7; color: #16a34a; }
  .badge-pending { background: #fef3c7; color: #d97706; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">Kadal Thunai</div>
    <div class="brand-sub">Fresh Seafood, Delivered Fresh</div>
    <div class="invoice-label">Invoice</div>
    <div class="invoice-num">#${order.orderNumber}</div>
    <div class="invoice-date">${date}</div>
  </div>
  <div class="body">
    <div class="section">
      <div class="section-title">Billed To</div>
      <div class="address-box">
        <div class="address-name">${order.address.name}</div>
        <div class="address-detail">${order.address.address}</div>
        <div class="address-detail">${order.address.city}, ${order.address.state} – ${order.address.pincode}</div>
        ${order.address.phone ? `<div class="address-detail">${order.address.phone}</div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Items Ordered</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
          <tr>
            <td>
              <div style="font-weight:600">${item.productName}</div>
              <div class="item-weight">${item.weight || ''}</div>
            </td>
            <td style="text-align:center">×${item.quantity}</td>
            <td>₹${(item.price * item.quantity).toFixed(0)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="totals">
        <div class="total-row"><span>Subtotal</span><span>₹${subtotal.toFixed(0)}</span></div>
        ${delivery > 0 ? `<div class="total-row"><span>Delivery Charges</span><span>₹${delivery.toFixed(0)}</span></div>` : ''}
        <div class="total-row"><span>Discount</span><span style="color:#16a34a">₹0</span></div>
        <div class="total-final"><span>Total Paid</span><span>₹${order.totalAmount.toFixed(0)}</span></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Payment Details</div>
      <div class="payment-row">
        <div>
          <div class="payment-method">${order.paymentMethod}</div>
          <div style="font-size:12px;color:#9ca3af;margin-top:2px">Payment Method</div>
        </div>
        <span class="badge ${order.paymentStatus === 'paid' ? 'badge-paid' : 'badge-pending'}">${order.paymentStatus.toUpperCase()}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">Kadal Thunai</div>
    <div class="footer-text">Thank you for your order! For support: support@kadalthunai.com | +91 98765 43210</div>
    <div class="footer-text" style="margin-top:6px">This is a computer-generated invoice. No signature required.</div>
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      setTimeout(() => {
        win.print();
        URL.revokeObjectURL(url);
      }, 500);
    };
  }
  toast.success('Invoice opened — use Print > Save as PDF');
}

/* ── Invoice modal ── */
function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = order.totalAmount - subtotal > 0 ? order.totalAmount - subtotal : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Invoice</p>
              <p className="font-bold text-xl mt-0.5 text-gray-900">#{order.orderNumber}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-600" /></button>
          </div>
          <p className="text-gray-500 text-xs mt-3">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Deliver To</p>
            <p className="font-semibold text-gray-900 text-sm">{order.address.name}</p>
            <p className="text-xs text-gray-500">{order.address.address}, {order.address.city}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-400">{item.weight} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">₹{(item.price * item.quantity).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
            {delivery > 0 && <div className="flex justify-between text-gray-500"><span>Delivery</span><span>₹{delivery.toFixed(0)}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
              <span>Total</span><span>₹{order.totalAmount.toFixed(0)}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Payment: <strong className="text-gray-700 capitalize">{order.paymentMethod}</strong></span>
            <span className={`font-semibold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.paymentStatus}</span>
          </div>
          <Button onClick={() => generateInvoicePDF(order)} className="w-full bg-red-600 hover:bg-red-700 rounded-xl h-11">
            <Download className="h-4 w-4 mr-2" />Download PDF Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Order card ── */
function OrderCard({ order, onReorder, onCancelRequest }: {
  order: Order; onReorder: () => void; onCancelRequest: () => void;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-lg shadow-black/5 overflow-hidden">
        <div className="p-4 pb-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="font-bold text-gray-900 text-base">#{order.orderNumber}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} at {formatTime(order.createdAt)}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(0)}</span>
            </div>
          </div>

          <OrderProgress status={order.status} />

          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {order.items.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-shrink-0">
                {item.productImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.productImage} alt={item.productName} className="w-8 h-8 rounded-lg object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div>
                  <p className="text-xs font-medium text-gray-800 max-w-[100px] truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">×{item.quantity} {item.weight || ''}</p>
                </div>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="flex items-center justify-center bg-gray-50 rounded-xl px-3 py-2 flex-shrink-0">
                <span className="text-xs text-gray-500 font-medium">+{order.items.length - 3} more</span>
              </div>
            )}
          </div>

          {order.processingVideoUrl && (
            <button onClick={() => setShowVideo(true)}
              className="w-full flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 mb-3 hover:bg-violet-100 transition-colors">
              <div className="p-2 bg-violet-600 rounded-xl"><Play className="h-4 w-4 text-white" /></div>
              <div className="text-left">
                <p className="font-semibold text-violet-800 text-sm">View Processing Media</p>
                <p className="text-xs text-violet-500">Uploaded by Kadal team</p>
              </div>
            </button>
          )}
          {order.status === 'processing' && !order.processingVideoUrl && (
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 mb-3">
              <div className="p-2 bg-violet-200 rounded-xl"><Package className="h-4 w-4 text-violet-500" /></div>
              <div>
                <p className="font-semibold text-violet-800 text-sm">Being Processed</p>
                <p className="text-xs text-violet-400">Video will be available soon</p>
              </div>
            </div>
          )}

          {(order.status === 'shipped' || order.deliveryPersonName || order.deliveryPersonPhone) && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 mb-3">
              <p className="font-semibold text-orange-800 text-sm mb-1">
                <Truck className="h-3.5 w-3.5 inline mr-1" />Out for Delivery
              </p>
              {order.deliveryPersonName && (
                <p className="text-xs text-orange-700 mb-1">Partner: {order.deliveryPersonName}</p>
              )}
              {order.deliveryPersonPhone ? (
                <a href={`tel:${order.deliveryPersonPhone}`}
                  className="inline-flex items-center gap-2 bg-orange-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-orange-700 transition-colors mt-1">
                  <Phone className="h-3.5 w-3.5" />Call {order.deliveryPersonName || 'Delivery Person'}
                </a>
              ) : <p className="text-xs text-orange-500">Delivery contact not assigned yet</p>}
              {order.isDeliveryReached && (
                <p className="text-xs text-green-700 mt-2 font-medium">Delivery partner has reached your location.</p>
              )}
            </div>
          )}

          {order.estimatedDelivery && !['delivered', 'cancelled'].includes(order.status) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Clock className="h-3.5 w-3.5" />
              <span>Expected by <strong className="text-gray-700">{new Date(order.estimatedDelivery).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</strong></span>
            </div>
          )}
        </div>

        {/* ── Action bar ── */}
        <div className="px-4 py-3 flex flex-wrap gap-2 border-t border-gray-50">
          <Button variant="outline" size="sm" onClick={() => setShowInvoice(true)}
            className="rounded-xl text-xs h-8 gap-1.5 border-gray-200">
            <Receipt className="h-3.5 w-3.5" />Invoice
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}
            className="rounded-xl text-xs h-8 gap-1.5 border-gray-200 text-blue-600 border-blue-200 hover:bg-blue-50">
            <Info className="h-3.5 w-3.5" />Details
          </Button>

          {order.status === 'delivered' && (
            <Button variant="outline" size="sm" onClick={onReorder}
              className="rounded-xl text-xs h-8 gap-1.5 border-gray-200">
              <RotateCcw className="h-3.5 w-3.5" />Reorder
            </Button>
          )}

          {['pending', 'confirmed'].includes(order.status) && (
            <Button variant="outline" size="sm" onClick={onCancelRequest}
              className="rounded-xl text-xs h-8 gap-1.5 border-red-200 text-red-600 hover:bg-red-50">
              <XCircle className="h-3.5 w-3.5" />Cancel
            </Button>
          )}
        </div>
      </div>

      {showVideo && order.processingVideoUrl && <MediaModal url={order.processingVideoUrl} onClose={() => setShowVideo(false)} />}
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
      {showDetails && <DetailsModal order={order} onClose={() => setShowDetails(false)} />}
    </>
  );
}

/* ── Main page ── */
export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login?redirect=/account/orders');
  }, [loading, isAuthenticated, router]);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setPageLoading(true);
    try {
      const data = await fetchJson<Order[]>('/api/user/orders', {
        cache: 'no-store',
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load orders'); }
    finally { setPageLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) fetchOrders(); }, [isAuthenticated, user?.id]);

  // Keep customer orders in sync with admin updates (status, delivery, video, etc.)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = window.setInterval(() => {
      // Avoid unnecessary calls when the tab is in background.
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    }, 15000);

    const onFocus = () => fetchOrders();
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, user?.id]);

  const handleReorder = async (order: Order) => {
    try {
      await fetchJson('/api/user/reorder', {
        method: 'POST',
        body: { orderId: order.id },
      });
      toast.success('Items added to cart!');
      router.push('/cart');
    } catch { toast.error('Failed to reorder'); }
  };

  const handleCancelConfirm = async (orderId: string, reason: string, newQuantities?: Record<string, number>) => {
    try {
      if (reason === 'wrong_quantity' && newQuantities) {
        const updateRes = await fetch(`/api/user/orders/${orderId}/update-quantities`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '', 'x-user-name': user?.name || '', 'x-user-email': user?.email || '', 'x-user-phone': user?.phoneNumber || '' },
          body: JSON.stringify({ quantities: newQuantities }),
        });
        const updatePayload = await updateRes.json().catch(() => ({}));
        if (!updateRes.ok) {
          throw new Error(updatePayload?.error || 'Failed to update quantity');
        }
        toast.success(`Quantity updated. Extra charge: ₹${Number(updatePayload.additionalAmount || 0).toFixed(0)}`);
        setCancelTarget(null);
        await fetchOrders();
        return;
      }

      const res = await fetch(`/api/user/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '', 'x-user-name': user?.name || '', 'x-user-email': user?.email || '', 'x-user-phone': user?.phoneNumber || '' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Order cancelled successfully');
      setCancelTarget(null);
      await fetchOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel order';
      toast.error(message);
    }
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search.trim() || o.orderNumber.toLowerCase().includes(search.toLowerCase())
      || o.items.some(i => i.productName.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  if (loading || pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-500 border-t-transparent" />
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/60 via-white to-orange-50/40">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="p-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">{orders.length} total orders</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID or product…"
            className="pl-10 rounded-2xl bg-white/80 backdrop-blur-xl border-white/60 shadow-sm h-11" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-red-600 text-white shadow-sm' : 'bg-white/80 text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
              {f === 'all' ? `All (${orders.length})` : `${STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label || f} (${orders.filter(o => o.status === f).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-10 text-center shadow-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No orders found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || filter !== 'all' ? 'Try adjusting your search or filter' : "You haven't placed any orders yet"}
            </p>
            <Button onClick={() => router.push('/')} className="bg-red-600 hover:bg-red-700 rounded-2xl">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order}
                onReorder={() => handleReorder(order)}
                onCancelRequest={() => setCancelTarget(order)} />
            ))}
          </div>
        )}
      </div>

      {cancelTarget && (
        <CancelDialog
          order={cancelTarget}
          onConfirm={(reason, newQuantities) => handleCancelConfirm(cancelTarget.id, reason, newQuantities)}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
