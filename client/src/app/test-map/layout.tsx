import { ReactNode } from 'react';
import "@/app/globals.css"; // Only include globals for Tailwind

export default function TestMapLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          /* Reset everything to prevent interference */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            overflow: hidden;
            background: white;
          }
          
          /* Disable all focus styles */
          *:focus, *:focus-visible, *:active {
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
