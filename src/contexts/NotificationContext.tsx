import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Notification, NotificationContextType, NotificationType } from '../../types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        try {
            const item = window.localStorage.getItem('app_notifications');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Failed to parse notifications from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('app_notifications', JSON.stringify(notifications));
        } catch (error) {
            console.error("Failed to save notifications to localStorage", error);
        }
    }, [notifications]);

    const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            ...notificationData,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const markAllAsRead = useCallback((userId: string) => {
        setNotifications(prev =>
            prev.map(n => 
                (n.userId === userId || n.userId === null) && !n.isRead 
                ? { ...n, isRead: true } 
                : n
            )
        );
    }, []);

    const getUnreadCount = useCallback((userId: string): number => {
        return notifications.filter(n => (n.userId === userId || n.userId === null) && !n.isRead).length;
    }, [notifications]);

    const value: NotificationContextType = {
        notifications,
        addNotification,
        markAllAsRead,
        getUnreadCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
