"use client";

import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

export default function PrivacyPolicyPage() {
  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BackButton href="/account" label="Back to Account" />
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-tendercuts-red mr-3" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            At Kadal Thunai, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p>We collect information that you provide directly to us when you:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Create an account</li>
            <li>Place an order</li>
            <li>Subscribe to our newsletter</li>
            <li>Contact our customer service</li>
            <li>Participate in surveys or promotions</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p>We may use the information we collect from you to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations and updates</li>
            <li>Provide customer support</li>
            <li>Send marketing communications</li>
            <li>Improve our website and services</li>
            <li>Personalize your experience</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Sharing Your Information</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Service providers who help us operate our business</li>
            <li>Delivery partners to fulfill your orders</li>
            <li>Marketing partners (with your consent)</li>
            <li>Legal authorities when required by law</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Your Choices</h2>
          <p>You can:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Update your account information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request deletion of your personal data</li>
            <li>Set your browser to refuse cookies</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="font-medium">support@kadalthunai.com</p>
          <p className="mt-6 text-sm text-gray-500">Last Updated: May 25, 2025</p>
        </div>
      </div>
    </motion.div>
  );
}
