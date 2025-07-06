"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Apply antialiased class to body on client side
  useEffect(() => {
    document.body.className = "antialiased";
  }, []);

  // Return children directly without extra div
  return <>{children}</>;
}
