"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ─── Individual Toast ─────────────────────────────────────────────────────────

const ToastItem: React.FC<ToastProps & { id: string }> = ({
  message,
  type = 'success',
  duration = 5000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-500',
    error:   'bg-red-50   border-red-500',
    info:    'bg-blue-50  border-blue-500',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error:   'text-red-800',
    info:    'text-blue-800',
  }[type];

  const icon = {
    success: (
      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
    ),
  }[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0,  scale: 1    }}
          exit={{   opacity: 0, x: 40,  scale: 0.95 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`flex items-center gap-3 p-4 rounded-xl shadow-xl border-l-4 max-w-sm w-full ${bgColor}`}
          role="alert"
        >
          <div className="flex-shrink-0">{icon}</div>
          <p className={`text-sm font-medium flex-1 ${textColor}`}>{message}</p>
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => {
              setVisible(false);
              if (onClose) setTimeout(onClose, 300);
            }}
            className={`flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors ${textColor}`}
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Portal-style container: always above navbar (z-[9999]), below any modal */}
      <div
        className="fixed right-4 flex flex-col gap-2 pointer-events-none"
        style={{ top: '80px', zIndex: 9999 }}
      >
        <div className="flex flex-col gap-2 pointer-events-auto">
          {toasts.map((t) => (
            <ToastItem
              key={t.id}
              id={t.id}
              message={t.message}
              type={t.type}
              duration={t.duration}
              onClose={() => removeToast(t.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

// ─── Legacy named exports (kept for backward compatibility) ───────────────────

/** @deprecated Use ToastProvider + useToast instead */
export const Toast = ToastItem;

/** @deprecated Toasts are now rendered inside ToastProvider */
export const ToastContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-2">{children}</div>
);
