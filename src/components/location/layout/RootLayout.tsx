"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import ModernFooter from "../../layout/ModernFooter";
import MobileNav from "./MobileNav";
import MobileTopNav from "./MobileTopNav";
import { Toaster } from "sonner";
import CartNotification from "@/components/cart/CartNotification";
import { useCart, CartContextType } from "@/context/CartContext";
import { useUi } from "@/context/UiContext";

// Extend Window interface to include CartContext
declare global {
  interface Window {
    CartContext?: CartContextType;
  }
}


interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  const [notification, setNotification] = useState({
    isOpen: false,
    fishName: ""
  });
  const { cart } = useCart();
  const prevCartLengthRef = useRef(0);
  
  // Listen for cart changes to show notification only when items are added
  useEffect(() => {
    const currentCount = cart.length;
    const prevCount = prevCartLengthRef.current;
    
    if (currentCount > prevCount && cart[cart.length - 1]) {
      const lastAddedItem = cart[cart.length - 1];
      setNotification({
        isOpen: true,
        fishName: lastAddedItem.name
      });
    }
    
    prevCartLengthRef.current = currentCount;
  }, [cart]);
  
  const closeNotification = () => {
    setNotification({
      isOpen: false,
      fishName: ""
    });
  };
  
  const { isNavVisible } = useUi();
  const pathname = usePathname();
  const isLocationPage = pathname === '/choose-location';
  const isHomePage = pathname === '/';
  
  return (
    <div className="flex flex-col min-h-screen">
      <Toaster
        position="top-right"
        richColors
        closeButton
        // Clear the sticky header (~64px mobile / ~80px desktop) plus breathing room
        offset={88}
        toastOptions={{
          style: { zIndex: 9999 },
        }}
        className="z-[9999]"
      />
      <CartNotification 
        fishName={notification.fishName}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
      {isNavVisible && !isLocationPage && (
        <>
          <div className="block md:hidden">
            <MobileTopNav />
          </div>
          <div className="hidden md:block">
            <Header />
          </div>
        </>
      )}
      <main className={`flex-1 ${isLocationPage ? 'pt-0' : ''}`}>
        {children}
      </main>
      {isNavVisible && isHomePage && (
        <ModernFooter />
      )}
      {isNavVisible && !isLocationPage && (
        <MobileNav />
      )}
    </div>
  );
};

export default RootLayout;
