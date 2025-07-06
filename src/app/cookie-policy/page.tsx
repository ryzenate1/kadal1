"use client";

import { ArrowLeft, Cookie } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

export default function CookiePolicyPage() {
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
          <Cookie className="h-8 w-8 text-[var(--primary-accent)] mr-3" />
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
        </div>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            This Cookie Policy explains how Kadal Thunai uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">What are cookies?</h2>
          <p className="mb-6">
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Why do we use cookies?</h2>
          <p>We use cookies for several reasons:</p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Essential cookies:</strong> Some cookies are essential for the operation of our website</li>
            <li><strong>Performance cookies:</strong> These help us understand how visitors interact with our website</li>
            <li><strong>Functionality cookies:</strong> These enable us to provide enhanced functionality and personalisation</li>
            <li><strong>Targeting cookies:</strong> These may be set to deliver targeted advertising</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Types of cookies we use</h2>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Essential Cookies</h3>
          <p className="mb-4">
            These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Performance and Analytics Cookies</h3>
          <p className="mb-4">
            These cookies collect information about how you use our website, such as which pages you visit most often. This data helps us optimize our website's performance and user experience.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Functionality Cookies</h3>
          <p className="mb-4">
            These cookies allow our website to remember choices you make (such as your location, language preference) and provide enhanced, more personal features.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Advertising and Marketing Cookies</h3>
          <p className="mb-6">
            These cookies track your browsing habits to enable us to show advertising which is more likely to be of interest to you. These cookies may also be used to limit the number of times you see an advertisement.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Third-party cookies</h2>
          <p className="mb-6">
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service, deliver advertisements on and through the service, and so on. These include cookies from:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Google Analytics (for website analytics)</li>
            <li>Payment processors (for secure transactions)</li>
            <li>Social media platforms (for social sharing features)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">How can you control cookies?</h2>
          <p className="mb-4">
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager or by modifying your browser settings.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Browser Controls</h3>
          <p className="mb-4">
            Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.
          </p>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Cookie Preference Center</h3>
          <p className="mb-6">
            You can manage your cookie preferences at any time by clicking on the "Cookie Preferences" link in our website footer.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Updates to this Cookie Policy</h2>
          <p className="mb-6">
            We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p className="mb-6">
            If you have any questions about our use of cookies or other technologies, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> privacy@kadalthunai.com</p>
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
