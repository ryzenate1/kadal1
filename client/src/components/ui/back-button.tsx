"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { motion } from "framer-motion";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="mb-4 text-gray-600 hover:text-tendercuts-red hover:bg-gray-100 transition-all duration-300 flex items-center px-3 py-2 rounded-full md:rounded-md"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </motion.div>
  );
}
