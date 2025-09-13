import { useCallback } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export const useRelativeTime = () => {
    const { t, language } = useTranslation();

    const getRelativeTime = useCallback((date: Date) => {
        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

        if (seconds < 60) {
            return rtf.format(-seconds, 'second');
        } else if (minutes < 60) {
            return rtf.format(-minutes, 'minute');
        } else if (hours < 24) {
            return rtf.format(-hours, 'hour');
        } else {
            return rtf.format(-days, 'day');
        }
    }, [language, t]);

    return getRelativeTime;
};
