import React, { useEffect, useState } from 'react';
import { useToastState } from '../../contexts/ToastContext';
import { CheckCircleIcon } from '../../../constants';

const ExclamationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            const dismissTimer = setTimeout(onDismiss, 300); // Corresponds to animation duration
            return () => clearTimeout(dismissTimer);
        }, 2700);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleDismiss = () => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    };

    const config = {
        success: {
            icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
            bg: 'bg-green-50 dark:bg-green-900/50',
            border: 'border-green-300 dark:border-green-700',
        },
        error: {
            icon: <ExclamationCircleIcon className="w-6 h-6 text-red-500" />,
            bg: 'bg-red-50 dark:bg-red-900/50',
            border: 'border-red-300 dark:border-red-700',
        },
        info: {
            icon: <ExclamationCircleIcon className="w-6 h-6 text-sky-500" />,
            bg: 'bg-sky-50 dark:bg-sky-900/50',
            border: 'border-sky-300 dark:border-sky-700',
        },
    };

    const animationClasses = isExiting ? 'animate-toast-out' : 'animate-toast-in';

    return (
        <div 
            className={`flex items-center gap-4 w-full max-w-sm p-4 rounded-lg shadow-lg border ${config[type].bg} ${config[type].border} ${animationClasses}`}
            role="alert"
        >
            <div className="flex-shrink-0">{config[type].icon}</div>
            <div className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{message}</div>
            <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const toasts = useToastState();

    return (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
            <div className="space-y-3">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onDismiss={() => {}}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;