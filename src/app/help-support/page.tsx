import { HelpCircle, Phone, Mail, MessageSquare, Clock, Truck, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HelpSupportPage() {
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
      answer: "We use the live Razorpay checkout gateway for major credit and debit cards, UPI, net banking, wallets, and other methods Razorpay makes available."
    },
    {
      question: "How do I apply a coupon code?",
      answer: "You can apply a coupon code during checkout by entering it in the 'Apply Coupon' field."
    },
    {
      question: "How fresh is your seafood?",
      answer: "All our seafood is sourced daily from local fishermen and delivered to you within hours of catch. We guarantee freshness with our Ocean-to-Table promise."
    },
    {
      question: "Do you offer subscription plans?",
      answer: "Yes! We offer weekly and monthly subscription plans for regular customers with exclusive discounts and priority delivery."
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">We're here to help you with any questions or issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Call Us</h3>
          <p className="text-sm text-gray-600 mb-3">Speak with our customer support team</p>
          <a href="tel:+919876543210" className="text-red-600 font-medium text-sm">
            +91 98765 43210
          </a>
          <p className="text-xs text-gray-500 mt-1">Available 9 AM - 9 PM, 7 days a week</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Email Us</h3>
          <p className="text-sm text-gray-600 mb-3">We'll respond within 24 hours</p>
          <a href="mailto:support@kadalthunai.com" className="text-red-600 font-medium text-sm">
            support@kadalthunai.com
          </a>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-3">Chat with our support team</p>
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            Start Chat
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 pb-5 last:border-none last:pb-0">
              <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-red-600 mr-3" />
            <h3 className="font-semibold text-lg">Order & Delivery</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Information about order status, delivery times, and tracking your seafood from ocean to table.
          </p>
          <Link href="/help-support/order-delivery" className="text-red-600 text-sm font-medium hover:underline">
            Learn more →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Truck className="h-5 w-5 text-red-600 mr-3" />
            <h3 className="font-semibold text-lg">Shipping & Returns</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Our shipping, return, and refund policies for all seafood products.
          </p>
          <Link href="/help-support/shipping-returns" className="text-red-600 text-sm font-medium hover:underline">
            Learn more →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-red-600 mr-3" />
            <h3 className="font-semibold text-lg">Privacy & Security</h3>
          </div>
          <p className="text-gray-700 mb-4">
            How we protect your personal information and secure your transactions.
          </p>
          <Link href="/privacy" className="text-red-600 text-sm font-medium hover:underline">
            Learn more →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <h3 className="font-semibold text-lg">Report an Issue</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Experiencing issues with your order or our website? Let us know and we'll help resolve them quickly.
          </p>
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            Report Issue
          </Button>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl p-8 text-center">
        <HelpCircle className="h-10 w-10 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Still Need Help?</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Our customer support team is available to assist you with any questions or concerns you might have about our products or services.
        </p>
        <div className="flex justify-center space-x-4">
          <Button className="bg-red-600 hover:bg-red-700 text-white">Contact Support</Button>
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            Visit Help Center
          </Button>
        </div>
      </div>
    </div>
  );
}
