"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Phone, Mail, MessageSquare, Clock, Truck, Shield,
  AlertCircle, ArrowLeft, X, Send, Check, ChevronDown,
  ChevronUp, Loader2, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const FAQS = [
  { q: "How do I track my order?", a: "Go to 'My Orders' and click 'Track Order' next to your order. You'll see real-time updates on your delivery." },
  { q: "What are your delivery timings?", a: "We deliver from 9 AM to 10 PM, 7 days a week. Same-day delivery is available for orders placed before 6 PM." },
  { q: "Can I modify my order after placing it?", a: "You can cancel or modify quantity within 30 minutes of placing the order. Go to My Orders and click Cancel." },
  { q: "What payment methods do you accept?", a: "Checkout uses the live Razorpay gateway for cards, UPI, net banking and supported wallets. Payment is verified on the server before your order is marked paid." },
  { q: "How do I apply a coupon code?", a: "During checkout, look for the 'Apply Coupon' section and enter your code there." },
  { q: "What if my order is delayed?", a: "If your order is delayed beyond the estimated time, please contact us via Live Chat or call our support number." },
];

const TICKET_CATEGORIES = [
  { value: 'order_issue', label: 'Order Issue' },
  { value: 'delivery', label: 'Delivery Problem' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'product_quality', label: 'Product Quality' },
  { value: 'refund', label: 'Refund / Cancellation' },
  { value: 'account', label: 'Account Help' },
  { value: 'general', label: 'General Enquiry' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors gap-3">
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

function LiveChatModal({ onClose, userId, userName, userEmail, userPhone }: {
  onClose: () => void;
  userId: string; userName: string; userEmail: string; userPhone: string;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async () => {
    if (!subject.trim()) { toast.error('Please enter a subject'); return; }
    if (!message.trim() || message.trim().length < 10) { toast.error('Please describe your issue in at least 10 characters'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-name': userName,
          'x-user-email': userEmail,
          'x-user-phone': userPhone,
        },
        body: JSON.stringify({ subject, category, message, priority: 'normal' }),
      });
      const data = await res.json();
      setTicketId(data.ticketNumber || data.id || 'TKT-' + Date.now().toString(36).toUpperCase());
      setSubmitted(true);
      toast.success('Support ticket created!');
    } catch {
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-white border-b border-gray-100 p-5 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg text-gray-900">Live Support</p>
              <p className="text-gray-500 text-xs mt-0.5">Our team will respond within 2 hours</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="h-4 w-4 text-gray-500" /></button>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Ticket Created!</h3>
            <p className="text-gray-500 text-sm mb-2">Your ticket ID is</p>
            <p className="font-mono font-bold text-red-600 text-lg bg-red-50 px-4 py-2 rounded-xl mb-4">{ticketId}</p>
            <p className="text-xs text-gray-400 mb-6">We'll reach out to you via phone or email within 2 hours.</p>
            <Button onClick={onClose} className="bg-red-600 hover:bg-red-700 rounded-xl w-full">Done</Button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
                {TICKET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
              <Input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-600">
                <strong>Your contact:</strong> {userPhone ? `+91 ${userPhone}` : 'Phone not set'}{userEmail ? ` · ${userEmail}` : ''}
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-11">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1.5" />Submit</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HelpPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetch('/api/user/support', {
        headers: {
          'x-user-id': user.id,
          'x-user-name': user.name || '',
          'x-user-email': user.email || '',
          'x-user-phone': user.phoneNumber || '',
        }
      }).then(r => r.ok ? r.json() : []).then(data => setMyTickets(Array.isArray(data) ? data : [])).catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
            <p className="text-sm text-gray-500">Support and ticket tracking</p>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a href="tel:+919876543210"
            className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs font-bold text-gray-900 text-center">Call Us</p>
            <p className="text-xs text-gray-400 text-center">9 AM–9 PM</p>
          </a>

          <a href="mailto:support@kadalthunai.com"
            className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs font-bold text-gray-900 text-center">Email</p>
            <p className="text-xs text-gray-400 text-center">24h reply</p>
          </a>

          <button onClick={() => setShowChat(true)}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-xs font-bold text-center text-gray-900">Live Chat</p>
            <p className="text-xs text-gray-500 text-center">Create ticket</p>
          </button>
        </div>

        {/* My Tickets */}
        {isAuthenticated && (
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700">My Support Tickets</p>
              <span className="text-xs text-gray-500">{myTickets.length} total</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {myTickets.map((t: any) => (
                <button
                  key={t.id || t.ticket_number}
                  onClick={() => setSelectedTicket(t)}
                  className="w-full text-left flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.subject || 'Support Request'}</p>
                    <p className="text-xs text-gray-500 font-mono">{t.ticket_number || t.id}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    t.status === 'open' ? 'bg-amber-100 text-amber-700' :
                    t.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{t.status}</span>
                </button>
              ))}
              {myTickets.length === 0 && (
                <p className="text-sm text-gray-500 py-4">No tickets yet. Create your first support ticket.</p>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-red-500" />
            <p className="font-bold text-gray-900">Frequently Asked Questions</p>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>

        {/* Info Links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Clock, label: 'Order & Delivery', desc: 'Timings, tracking, ETA', href: '#' },
            { icon: Truck, label: 'Shipping & Returns', desc: 'Policies & refunds', href: '#' },
            { icon: Shield, label: 'Privacy & Security', desc: 'How we protect you', href: '/privacy' },
            { icon: AlertCircle, label: 'Report an Issue', desc: 'Something went wrong?', action: () => setShowChat(true) },
          ].map(({ icon: Icon, label, desc, href, action }) => (
            <button key={label} onClick={action || (() => href && href !== '#' && router.push(href))}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3 text-left shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">support@kadalthunai.com · +91 98765 43210</p>
      </div>

      {showChat && (
        <LiveChatModal
          onClose={() => setShowChat(false)}
          userId={user?.id || ''}
          userName={user?.name || ''}
          userEmail={user?.email || ''}
          userPhone={user?.phoneNumber || ''}
        />
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="flex items-start justify-between p-4 border-b border-gray-100">
              <div>
                <p className="text-lg font-semibold text-gray-900">{selectedTicket.subject || "Support Request"}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{selectedTicket.ticket_number || selectedTicket.id}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close ticket details"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-gray-900">{selectedTicket.status}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-semibold text-gray-900">{selectedTicket.category || "general"}</span>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Issue</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedTicket.message || "-"}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Admin Response</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedTicket.admin_response || "No response yet."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
