import React, { useState, useEffect, useRef } from 'react';
import { MenuIcon, BellIcon, UserCircleIcon, UserIcon, Cog6ToothIcon, ArrowLeftStartOnRectangleIcon } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';
import { CalculatorType } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationsPanel from './NotificationsPanel';
import { useAppSettings } from '../../contexts/AppSettingsContext';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { t, isRtl } = useTranslation();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { setActiveCalculator } = useUI();
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
  
  return (
    <header className="bg-white dark:bg-neutral-900 shadow-sm dark:shadow-none dark:border-b dark:border-neutral-700 p-4 sticky top-0 z-20 flex items-center gap-4">
      <button 
        onClick={onMenuClick} 
        className="p-1 text-neutral-600 dark:text-neutral-300 md:hidden"
        aria-label={t('header.openMenu')}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      <h1 className="flex-1 text-center sm:text-start text-xl sm:text-2xl font-bold text-primary dark:text-primary-dark">{title}</h1>

      {currentUser?.role === 'admin' && isMaintenanceMode && (
          <div className="hidden sm:flex items-center gap-2 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold animate-pulse