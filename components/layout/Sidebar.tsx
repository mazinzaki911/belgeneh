import React, { useMemo } from 'react';
import { CalculatorType } from '../../types';
import { getCalculators, XMarkIcon, AppLogoIcon } from '../../constants';
import { useAuth } from '../../src/contexts/AuthContext';
import { useUI } from '../../src/contexts/UIContext';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { useAppSettings } from '../../src/contexts/AppSettingsContext';
import { useToast } from '../../src/contexts/ToastContext';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { t, language, isRtl } = useTranslation();
  const { activeCalculator, setActiveCalculator } = useUI();
  const { currentUser, recordToolUsage } = useAuth();
  const { toolUsageLimit, disabledTools, calculatorSettings } = useAppSettings();
  const showToast = useToast();
  
  const CALCULATORS = useMemo(() => getCalculators(t, language, calculatorSettings), [t, language, calculatorSettings]);

  const handleLinkClick = (calc: (typeof CALCULATORS)[0]) => {
    // Check if tool is disabled by admin
    if (disabledTools[calc.id]) {
      showToast(t('sidebar.toolDisabled'), 'error');
      return;
    }

    const limitedToolGroups = [t('calculatorGroups.essential'), t('calculatorGroups.advancedAnalysis')];
    const isLimitedTool = limitedToolGroups.includes(calc.group);
    
    // Admin users have unlimited usage
    if (currentUser?.role !== 'admin' && isLimitedTool && toolUsageLimit > 0) {
      const totalUsage = Object.values(currentUser?.usage || {}).reduce((sum, count) => sum + count, 0);
      if (totalUsage >= toolUsageLimit) {
        showToast(t('sidebar.usageLimitReached'), 'error');
        return;
      }
    }
    
    // Record usage for tools, but not for management/account pages
    const nonUsageTrackedGroups = [
        t('calculatorGroups.administration'),
        t('calculatorGroups.account'),
        t('calculatorGroups.assetManagement'),
    ];
    if (!nonUsageTrackedGroups.includes(calc.group)) {
        recordToolUsage(calc.id);
    }
    
    setActiveCalculator(calc.id);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const visibleCalculators = React.useMemo(() => CALCULATORS.filter(calc => {
    if (calc.id === CalculatorType.AdminDashboard) {
      return currentUser?.role === 'admin';
    }
    return true;
  }), [CALCULATORS, currentUser]);

  const groupedCalculators = visibleCalculators.reduce((acc, calc) => {
    const group = calc.group || 'General';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(calc);
    return acc;
  }, {} as Record<string, typeof CALCULATORS>);

  const sidebarPositionClasses = isRtl
    ? 'right-0 border-l'
    : 'left-0 border-r';

  const sidebarTransformClasses = isSidebarOpen
    ? 'translate-x-0'
    : isRtl ? 'translate-x-full' : '-translate-x-full';

  return (
    <aside className={`w-72 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 p-4 flex flex-col fixed md:relative inset-y-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarPositionClasses} ${sidebarTransformClasses}`}>
      <div className="relative flex justify-center items-center mb-8 pt-4 pb-4">
        <AppLogoIcon className="w-full h-auto max-w-[220px]" />
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="p-2 text-neutral-500 dark:text-neutral-400 md:hidden absolute top-1/2 -translate-y-1/2"
          style={{ [isRtl ? 'left' : 'right']: '0' }}
          aria-label={t('sidebar.closeMenu')}
        >
            <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className={`flex-1 min-h-0 overflow-y-auto custom-scrollbar ${isRtl ? '-mr-2 pr-2' : '-ml-2 pl-2'}`}>
        {Object.entries(groupedCalculators).map(([groupName, calcs]) => (
          <div key={groupName} className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-400 dark:text-neutral-500 mb-2 px-3 uppercase">{groupName}</h3>
            <ul>
              {calcs.map((calc) => {
                const isToolDisabled = !!disabledTools[calc.id];
                return (
                <li key={calc.id} className="relative group my-1">
                  <button
                    onClick={() => handleLinkClick(calc)}
                    disabled={isToolDisabled}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-start transition-colors duration-200 ${
                      activeCalculator === calc.id
                        ? 'bg-primary text-white shadow-md'
                        : isToolDisabled 
                        ? 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-primary-light dark:hover:bg-primary/20 hover:text-primary dark:hover:text-primary-dark'
                    }`}
                  >
                    <span className={isToolDisabled ? 'opacity-50' : ''}>{calc.icon}</span>
                    <span className={`font-semibold ${isToolDisabled ? 'opacity-50' : ''}`}>{calc.name}</span>
                  </button>
                  <div
                    role="tooltip"
                    className={`absolute top-1/2 -translate-y-1/2 z-20 w-max max-w-xs
                      px-3 py-1.5 rounded-md shadow-lg
                      bg-neutral-800 dark:bg-neutral-950 text-white text-sm
                      invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none
                      ${isRtl ? 'left-full ml-4' : 'right-full mr-4'}`}
                  >
                    {isToolDisabled ? t('sidebar.toolDisabledTooltip') : calc.tooltip}
                  </div>
                </li>
                )}
              )}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-4 space-y-4">
        <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <p>{t('sidebar.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;