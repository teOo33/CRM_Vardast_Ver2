import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, type = 'info', duration = 3000 }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, description, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (title, options) => addToast({ title, ...options, type: 'success' }),
    error: (title, options) => addToast({ title, ...options, type: 'error' }),
    info: (title, options) => addToast({ title, ...options, type: 'info' }),
    warning: (title, options) => addToast({ title, ...options, type: 'warning' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-top-2 fade-in
              flex items-start gap-3 p-4 rounded-xl shadow-lg border border-white/20 backdrop-blur-md
              ${t.type === 'success' ? 'bg-emerald-500 text-white' : 
                t.type === 'error' ? 'bg-red-500 text-white' : 
                t.type === 'warning' ? 'bg-amber-500 text-white' : 
                'bg-blue-600 text-white'}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 size={18} />}
              {t.type === 'error' && <AlertCircle size={18} />}
              {t.type === 'warning' && <AlertCircle size={18} />}
              {t.type === 'info' && <Info size={18} />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold">{t.title}</h4>
              {t.description && <p className="text-xs opacity-90 mt-1">{t.description}</p>}
            </div>
            <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
