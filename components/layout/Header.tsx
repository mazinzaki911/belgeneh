

import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for constants and icons.
import { MenuIcon, BellIcon, UserCircleIcon, UserIcon, Cog6ToothIcon, ArrowLeftStartOnRectangleIcon, ArrowLeftIcon, SunIcon, MoonIcon } from '../../constants';
import { useAuth } from '../../src/contexts/AuthContext';
import { useUI } from '../../src/contexts/UIContext';
import { CalculatorType } from '../../types';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import { useAppSettings } from '../../src/contexts/AppSettingsContext';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { t, isRtl, theme, toggleTheme } = useTranslation();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { activeCalculator, setActiveCalculator, fullUnitCurrentStep, setFullUnitCurrentStep } = useUI();
  const { currentUser, logout } = useAuth();
  const { getUnreadCount, markAllAsRead } = useNotification();
  const { isMaintenanceMode } = useAppSettings();
  
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(prev => !prev);
    if (!isNotificationsOpen && currentUser) {
      // Mark as read when opening the panel
      markAllAsRead(currentUser.id);
    }
  };

  const handleBackClick = () => {
    if (activeCalculator === CalculatorType.FullUnit && fullUnitCurrentStep > 1) {
        setFullUnitCurrentStep(fullUnitCurrentStep - 1);
    } else {
        setActiveCalculator(CalculatorType.Introduction);
    }
  };
  
  return (
    <header className="bg-white dark:bg-neutral-900 shadow-sm dark:shadow-none dark:border-b dark:border-neutral-700 p-4 sticky top-0 z-20 flex items-center gap-4">
      <button 
        onClick={onMenuClick} 
        className="p-1 text-neutral-600 dark:text-neutral-300 md:hidden"
        aria-label={t('header.openMenu')}
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      <button 
        onClick={handleBackClick}
        className="p-1 text-neutral-600 dark:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label={t('header.back')}
        title={t('header.back')}
      >
        <ArrowLeftIcon className={`w-6 h-6 ${isRtl ? 'transform scale-x-[-1]' : ''}`} />
      </button>

      <h1 key={title} className="flex-1 text-center sm:text-start text-xl sm:text-2xl font-bold text-primary dark:text-primary-dark truncate animate-fade-in-down">{title}</h1>

      {currentUser?.role === 'admin' && isMaintenanceMode && (
          <div className="hidden sm:flex items-center gap-2 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              <Cog6ToothIcon className="w-4 h-4" />
              <span>{t('adminDashboard.settings.maintenanceModeTitle')}</span>
          </div>
      )}

      {/* Left side actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
            onClick={toggleTheme}
            className="p-2 text-neutral-600 dark:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label={theme === 'light' ? t('header.switchToDark') : t('header.switchToLight')}
            title={theme === 'light' ? t('header.switchToDark') : t('header.switchToLight')}
        >
            {theme === 'light' ? (
                <MoonIcon className="w-6 h-6" />
            ) : (
                <SunIcon className="w-6 h-6" />
            )}
        </button>

        <div className="relative" ref={notificationsRef}>
            <button 
                onClick={handleNotificationsToggle}
                className="relative p-2 text-neutral-600 dark:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" 
                aria-label={t('header.notifications')}
            >
                <BellIcon className="w-6 h-6"/>
                {unreadCount > 0 && (
                    <span className="absolute top-2 end-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-900"></span>
                )}
            </button>
            {isNotificationsOpen && <NotificationsPanel onClose={() => setIsNotificationsOpen(false)} />}
        </div>


        <div className="relative" ref={userDropdownRef}>
            <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2"
            >
                <span className="hidden sm:inline font-semibold text-neutral-700 dark:text-neutral-200">{currentUser?.name || t('header.user')}</span>
                {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover"/>
                ) : (
                    <UserCircleIcon className="w-8 h-8 text-neutral-500 dark:text-neutral-400"/>
                )}
            </button>

            {isUserDropdownOpen && (
                <div className={`absolute mt-2 w-56 bg-white dark:bg-neutral-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-30 animate-fade-in-dropdown end-0`}>
                    <div className="p-2">
                        <div className="px-3 py-2">
                            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{currentUser?.name || t('header.user')}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{currentUser?.email || 'user@example.com'}</p>
                        </div>
                        <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-600"></div>
                        <button onClick={() => { setActiveCalculator(CalculatorType.Profile); setIsUserDropdownOpen(false); }} className="w-full text-start flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-600">
                            <UserIcon className="w-5 h-5"/>
                            <span>{t('header.profile')}</span>
                        </button>
                        <button onClick={() => { setActiveCalculator(CalculatorType.Settings); setIsUserDropdownOpen(false); }} className="w-full text-start flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-600">
                            <Cog6ToothIcon className="w-5 h-5"/>
                            <span>{t('header.settings')}</span>
                        </button>
                         <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-600"></div>
                         <button 
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                            <ArrowLeftStartOnRectangleIcon className="w-5 h-5"/>
                            <span>{t('header.logout')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
