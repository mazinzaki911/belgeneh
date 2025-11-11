import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthContextProvider } from './contexts/AuthContext';
import { DataContextProvider } from './contexts/DataContext';
import { UIContextProvider } from './contexts/UIContext';
import { ToastContextProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppSettingsContextProvider } from './contexts/AppSettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';

// First log - verify JavaScript is running
console.log('🚀 [APP] Application starting...');
console.log('🚀 [APP] Build timestamp:', new Date().toISOString());
console.log('🚀 [APP] Environment:', import.meta.env.MODE);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <AppSettingsContextProvider>
        <ToastContextProvider>
          <NotificationProvider>
            <AuthContextProvider>
              <DataContextProvider>
                <UIContextProvider>
                  <App />
                </UIContextProvider>
              </DataContextProvider>
            </AuthContextProvider>
          </NotificationProvider>
        </ToastContextProvider>
      </AppSettingsContextProvider>
    </LanguageProvider>
  </React.StrictMode>
);