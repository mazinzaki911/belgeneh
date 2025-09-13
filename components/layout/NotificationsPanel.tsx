import React from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import { useUI } from '../../src/contexts/UIContext';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { NotificationType, CalculatorType } from '../../types';
import { useRelativeTime } from '../../src/hooks/useRelativeTime';
import { BookmarkIcon } from '../../constants';
import { useData } from '../../src/contexts/DataContext';

const MegaphoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);


interface NotificationsPanelProps {
    onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
    const { t, isRtl } = useTranslation();
    const { currentUser } = useAuth();
    const { notifications } = useNotification();
    const { setActiveCalculator, setFullUnitCalcInitialStep } = useUI();
    const { setLoadedUnitId } = useData();
    const getRelativeTime = useRelativeTime();

    if (!currentUser) return null;

    const userNotifications = notifications
        .filter(n => n.userId === currentUser.id || n.userId === null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleNotificationClick = (unitId?: string) => {
        if (unitId) {
            setLoadedUnitId(unitId);
            setFullUnitCalcInitialStep(4);
            setActiveCalculator(CalculatorType.FullUnit);
            onClose();
        }
    };

    const notificationIcons: { [key in NotificationType]: React.ReactNode } = {
        [NotificationType.Global]: <MegaphoneIcon className="w-6 h-6 text-sky-500" />,
        [NotificationType.UnitUpdate]: <BookmarkIcon className="w-6 h-6 text-green-500" />,
    };

    return (
        <div className={`absolute mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-30 animate-fade-in-dropdown ${isRtl ? 'start-0' : 'end-0'}`}>
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-600">
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">{t('notifications.title')}</h3>
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {userNotifications.length > 0 ? (
                    <ul className="divide-y divide-neutral-200 dark:divide-neutral-600">
                        {userNotifications.map(n => (
                            <li 
                                key={n.id}
                                onClick={() => handleNotificationClick(n.relatedUnitId)}
                                className={`flex items-start gap-4 p-4 transition-colors ${n.relatedUnitId ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-600' : ''}`}
                            >
                                {!n.isRead && <div className="mt-1.5 w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0"></div>}
                                <div className={`flex-shrink-0 ${n.isRead ? 'ms-4' : ''}`}>{notificationIcons[n.type]}</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-neutral-800 dark:text-neutral-100">{n.title}</p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-0.5">{n.message}</p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-400 mt-1">{getRelativeTime(new Date(n.timestamp))}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center p-12">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('notifications.empty')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;