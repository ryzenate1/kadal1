import { HelpCircle, Phone, Mail, MessageSquare, Clock, Truck, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by going to 'My Orders' and clicking on the 'Track Order' button next to your order."
    },
    {
      question: "What are your delivery timings?",
      answer: "We deliver from 9:00 AM to 10:00 PM, 7 days a week. Same-day delivery is available for orders placed before 6:00 PM."
    },
    {
      question: "Can I modify my order after placing it?",
      answer: "You can modify your order within 30 minutes of placing it by calling our customer support."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI, Net Banking, and cash on delivery."
    },
    {
      question: "How do I apply a coupon code?",
      answer: "You can apply a coupon code during checkout by entering it in the 'Apply Coupon' field."
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-gray-500">We're here to help you with any questions or issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-medium mb-2">Call Us</h3>
          <p className="text-sm text-gray-600 mb-3">Speak with our customer support team</p>
          <a href="tel:+919876543210" className="text-red-600 font-medium text-sm">
            +91 98765 43210
          </a>
          <p className="text-xs text-gray-500 mt-1">Available 9 AM - 9 PM, 7 days a week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-medium mb-2">Email Us</h3>
          <p className="text-sm text-gray-600 mb-3">We'll respond within 24 hours</p>
          <a href="mailto:support@kadalthunai.com" className="text-red-600 font-medium text-sm">
            support@kadalthunai.com
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-medium mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-3">Chat with our support team</p>
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            Start Chat
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 pb-4">
              <h3 className="font-medium mb-1">{faq.question}</h3>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-medium">Order & Delivery</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Information about order status, delivery times, and tracking.
          </p>
          <Link href="/help/order-delivery" className="text-red-600 text-sm font-medium">
            Learn more →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Truck className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-medium">Shipping & Returns</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Our shipping, return, and refund policies.
          </p>
          <Link href="/help/shipping-returns" className="text-red-600 text-sm font-medium">
            Learn more →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-medium">Privacy & Security</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            How we protect your personal information.
          </p>
          <Link href="/privacy" className="text-red-600 text-sm font-medium">
            Learn more →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-medium">Report an Issue</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Experiencing issues? Let us know and we'll help resolve them.
          </p>
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            Report Issue
          </Button>
        </div>
      </div>
    </div>
  );
}
