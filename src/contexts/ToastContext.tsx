import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

type ToastContextType = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastContextType | undefined>(undefined);
const ToastStateContext = createContext<ToastMessage[]>([]);

export const ToastContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <ToastStateContext.Provider value={toasts}>
        {children}
      </ToastStateContext.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastContextProvider');
  }
  return context;
};

export const useToastState = () => {
    return useContext(ToastStateContext);
}
