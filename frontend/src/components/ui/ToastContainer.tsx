import React from 'react';
import { useApp } from '@/context/AppContext';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-1.5 pointer-events-none">
      {toasts.map((toast) => {
        const error = toast.type === 'error' || toast.type === 'warning';
        return (
          <button
            key={toast.id}
            type="button"
            title={toast.message}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto w-8 h-8 rounded-full shadow-md border flex items-center justify-center cursor-pointer ${
              error
                ? 'bg-white dark:bg-zinc-950 border-rose-500/30 text-rose-500'
                : 'bg-white dark:bg-zinc-950 border-emerald-500/30 text-emerald-500'
            }`}
          >
            {toast.type === 'error' ? (
              <X className="w-3.5 h-3.5" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : toast.type === 'info' ? (
              <Info className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
