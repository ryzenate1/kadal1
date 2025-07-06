"use client";

import { motion } from "framer-motion";
import { AlertCircle, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

// Coming soon component for YouTube videos section

const VideoSection = () => {
  return (
    <div className="my-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Recipe Videos</h2>

      <motion.div 
        className="rounded-xl overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
          <div className="bg-tendercuts-red/10 p-4 rounded-full mb-6">
            <Youtube size={48} className="text-tendercuts-red" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Stay Tuned!</h3>
          <p className="text-gray-600 mb-6">
            We're preparing delicious seafood recipe videos featuring our premium products. 
            Check back soon for cooking tips, preparation guides, and chef's specials!
          </p>
          
          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg text-sm mb-6">
            <AlertCircle size={16} />
            <span>Coming Soon</span>
          </div>
          
          <Button 
            className="bg-tendercuts-red hover:bg-tendercuts-red/90"
            onClick={() => window.open('https://www.youtube.com', '_blank')}
          >
            Visit Our YouTube Channel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoSection;
