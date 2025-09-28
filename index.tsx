import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { AuthContextProvider } from './src/contexts/AuthContext';
import { DataContextProvider } from './src/contexts/DataContext';
import { UIContextProvider } from './src/contexts/UIContext';
import { ToastContextProvider } from './src/contexts/ToastContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AppSettingsContextProvider } from './src/contexts/AppSettingsContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

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
