import { TFunction } from '../types';

export const formatYearsAndMonths = (decimalYears: number, t: TFunction): string => {
    if (!isFinite(decimalYears) || decimalYears < 0) {
        return t('common.notApplicable');
    }
    
    if (decimalYears === 0) {
        return t('common.immediately');
    }

    const totalMonths = Math.round(decimalYears * 12);
    if (totalMonths === 0) {
        return t('common.lessThanAMonth');
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const parts = [];
    if (years > 0) {
        parts.push(`${years} ${t(years === 1 ? 'common.year' : 'common.years')}`);
    }
    if (months > 0) {
        parts.push(`${months} ${t(months === 1 ? 'common.month' : 'common.months')}`);
    }

    return parts.join(` ${t('common.and')} `);
};
