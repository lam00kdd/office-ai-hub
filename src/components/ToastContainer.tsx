import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { toast, ToastItem, ToastType } from '../services/toast';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe((updated) => {
      setToasts(updated);
    });
  }, []);

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900 shadow-rose-500/10';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-900 shadow-amber-500/10';
      case 'info':
      default:
        return 'border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900 shadow-blue-500/10';
    }
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto border rounded-2xl p-4 shadow-xl flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 ${getBorderColor(
            t.type
          )}`}
        >
          {getIcon(t.type)}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
              {t.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
              {t.message}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors shrink-0"
            title="Đóng"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
