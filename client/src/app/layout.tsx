import "@/app/globals.css";
import "@/styles/fixes.css"; 
import "@/styles/mobile-fixes.css";
import type { Metadata, Viewport } from "next";
import ClientBody from "./ClientBody";
import RootLayout from "@/components/location/layout/RootLayout";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider-new";
import ConditionalSmoothScrollProvider from "@/components/providers/ConditionalSmoothScrollProvider";
import { NetworkStatus } from "@/components/ui/network-status";
import { ToastProvider } from "@/components/ui/toast-notification";
import { UiProvider } from "@/context/UiContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#e53e3e" // Restored to red color
};

export const metadata: Metadata = {
  title: "Kadal Thunai - Fresh Seafood Online Delivery | Order Fish & Seafood",
  description: "Kadal Thunai - Order Fresh Fish, Prawns, Crabs & Ready to Cook seafood online. 100% Fresh, Sustainably Sourced Seafood delivered to your doorstep.",
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kadal Thunai",
  },
  keywords: "fresh fish, seafood delivery, online fish market, prawns, crabs, sustainable seafood",
  authors: [{ name: "Kadal Thunai Team" }],
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://kadalthunai.com",
    title: "Kadal Thunai - Fresh Seafood Online Delivery",
    description: "Order Fresh Fish & Seafood Online - 100% Fresh, Sustainably Sourced",
    siteName: "Kadal Thunai",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body>
        <ClientBody>
          <ConditionalSmoothScrollProvider>
            <ToastProvider>
              <AuthProvider>
                <CartProvider>
                  <LocationProvider>
                    <UiProvider>
                      <RootLayout>
                        {children}
                        <NetworkStatus />
                      </RootLayout>
                    </UiProvider>
                  </LocationProvider>
                </CartProvider>
              </AuthProvider>
            </ToastProvider>
          </ConditionalSmoothScrollProvider>
        </ClientBody>
      </body>
    </html>
  );
}
