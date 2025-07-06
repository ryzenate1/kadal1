"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

export default function TermsOfServicePage() {
  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BackButton href="/" label="Back to Home" />
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center mb-6">
          <FileText className="h-8 w-8 text-[var(--primary-accent)] mr-3" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            Welcome to Kadal Thunai. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing and using Kadal Thunai's website and services, you accept and agree to be bound by the terms and provision of this agreement. These Terms apply to all visitors, users, and others who access or use our service.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Use of Our Service</h2>
          <p>You may use our service only for lawful purposes. You agree not to use the service:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>In any way that violates any applicable federal, state, local, or international law</li>
            <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Account Registration</h2>
          <p className="mb-6">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for maintaining the confidentiality of your account.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Orders and Payment</h2>
          <p className="mb-6">
            All orders placed through our website are subject to our acceptance. We reserve the right to refuse or cancel any order for any reason at our sole discretion. Payment must be made at the time of purchase using one of our accepted payment methods.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Product Information</h2>
          <p className="mb-6">
            We strive to display accurate product information, including descriptions, pricing, and availability. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Delivery and Returns</h2>
          <p className="mb-6">
            Delivery times are estimates only and may vary. Our return and refund policy is outlined in our separate Returns Policy, which forms part of these Terms of Service.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
          <p className="mb-6">
            In no event shall Kadal Thunai, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Changes to Terms</h2>
          <p className="mb-6">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Contact Information</h2>
          <p className="mb-6">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> legal@kadalthunai.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Address:</strong> Chennai, Tamil Nadu, India</p>
          </div>
          
          <p className="text-sm text-gray-500 mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
