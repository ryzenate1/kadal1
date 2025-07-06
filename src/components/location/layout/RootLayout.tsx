"use client";

import { ReactNode, useState, useEffect } from "react";
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
  
  // Listen for cart changes to show notification
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tendercutsCart') {
        const oldCart = e.oldValue ? JSON.parse(e.oldValue) : [];
        const newCart = e.newValue ? JSON.parse(e.newValue) : [];
        
        if (newCart.length > oldCart.length) {
          // Item added
          const newItem = newCart[newCart.length - 1];
          setNotification({
            isOpen: true,
            fishName: newItem.name
          });
        } else if (newCart.length === oldCart.length) {
          // Check if quantity increased
          for (let i = 0; i < newCart.length; i++) {
            const oldItem = oldCart.find((item: any) => item.id === newCart[i].id);
            if (oldItem && newCart[i].quantity > oldItem.quantity) {
              setNotification({
                isOpen: true,
                fishName: newCart[i].name
              });
              break;
            }
          }
        }
      }
    };
    
    // For cart updates, use the useCart hook directly
    // We'll use a simpler approach to catch cart updates
    const cartItemCount = cart.length;
    
    // Listen for cart updates
    if (cartItemCount > 0 && cart[cartItemCount - 1]) {
      const lastAddedItem = cart[cartItemCount - 1];
      setNotification({
        isOpen: true,
        fishName: lastAddedItem.name
      });
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);
  
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
      <Toaster position="top-center" richColors closeButton />
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
      {isNavVisible && !isLocationPage && isHomePage && (
        <>
          <ModernFooter />
          <MobileNav />
        </>
      )}
    </div>
  );
};

export default RootLayout;
