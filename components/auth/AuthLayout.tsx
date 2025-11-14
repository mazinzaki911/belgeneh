import React from 'react';
import { AppLogoIcon } from '../../constants';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex justify-center items-start sm:items-center min-h-screen bg-neutral-100 dark:bg-neutral-950 p-4 py-12 sm:py-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="text-center">
            <AppLogoIcon className="w-full h-auto max-w-[240px] mx-auto" />
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mt-4">
              {title}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
