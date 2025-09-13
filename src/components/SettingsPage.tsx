import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon, SunIcon, MoonIcon, ComputerDesktopIcon, DocumentArrowDownIcon } from '../constants';
import { useTranslation } from '../src/contexts/LanguageContext';
import { Theme } from '../types';
import { useData } from '../src/contexts/DataContext';
import { exportToJson, exportToCsv } from '../utils/exportUtils';
import ConfirmationModal from './shared/ConfirmationModal';
import { useToast } from '../src/contexts/ToastContext';
import InfoTooltip from './shared/InfoTooltip';

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { savedUnits, portfolioProperties, resetApplicationData } = useData();
  const showToast = useToast();
  
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => document.documentElement.classList.toggle('dark', e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const handleExportJson = () => {
    exportToJson({ savedUnits, portfolioProperties });
  };
  
  const handleExportCsv = () => {
    exportToCsv({ savedUnits, portfolioProperties });
  };
  
  const handleResetData = () => {
    resetApplicationData();
    showToast(t('settingsPage.dangerZone.toast.resetSuccess'), 'success');
    setIsResetModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 text-neutral-800 dark:text-neutral-100">
            <Cog6ToothIcon className="w-8 h-8"/>
            <h1 className="text-3xl font-bold">{t('settingsPage.title')}</h1>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Language Section */}
          <div className="pb-6">
              <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 text-center mb-4">{t('settingsPage.language.title')}</h2>
              <div className="flex justify-center items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg max-w-xs mx-auto">
                  <button onClick={() => setLanguage('en')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${language === 'en' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark shadow-sm' : 'text-neutral-600 dark:text-neutral-300'}`}>{t('settingsPage.language.english')}</button>
                  <button onClick={() => setLanguage('ar')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${language === 'ar' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark shadow-sm' : 'text-neutral-600 dark:text-neutral-300'}`}>{t('settingsPage.language.arabic')}</button>
              </div>
          </div>

          {/* Appearance Section */}
          <div className="py-6 border-t border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 text-center mb-4">{t('settingsPage.appearance.title')}</h2>
              <div className="flex justify-center items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg max-w-xs mx-auto">
                  <button onClick={() => setTheme('light')} className={`flex-1 p-2 rounded-md transition-colors flex flex-col items-center gap-1 ${theme === 'light' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark' : 'text-neutral-500'}`}><SunIcon className="w-5 h-5"/> <span className="text-xs font-medium">{t('settingsPage.appearance.light')}</span></button>
                  <button onClick={() => setTheme('dark')} className={`flex-1 p-2 rounded-md transition-colors flex flex-col items-center gap-1 ${theme === 'dark' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark' : 'text-neutral-500'}`}><MoonIcon className="w-5 h-5"/> <span className="text-xs font-medium">{t('settingsPage.appearance.dark')}</span></button>
                  <button onClick={() => setTheme('system')} className={`flex-1 p-2 rounded-md transition-colors flex flex-col items-center gap-1 ${theme === 'system' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark' : 'text-neutral-500'}`}><ComputerDesktopIcon className="w-5 h-5"/> <span className="text-xs font-medium">{t('settingsPage.appearance.system')}</span></button>
              </div>
          </div>

          {/* Data Management Section */}
          <div className="py-6 border-t border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 text-center mb-2">{t('settingsPage.dataManagement.title')}</h2>
              <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mb-6">{t('settingsPage.dataManagement.description')}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={handleExportJson} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"><DocumentArrowDownIcon className="w-5 h-5"/> {t('settingsPage.dataManagement.exportJson')}</button>
                  <button onClick={handleExportCsv} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"><DocumentArrowDownIcon className="w-5 h-5"/> {t('settingsPage.dataManagement.exportCsv')}</button>
              </div>
          </div>
          
          {/* Danger Zone */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-red-500/30">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 text-center mb-4">{t('settingsPage.dangerZone.title')}</h2>
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                      <p className="font-semibold text-neutral-800 dark:text-neutral-100">{t('settingsPage.dangerZone.resetButton')}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{t('settingsPage.dangerZone.resetDescription')}</p>
                  </div>
                  <button onClick={() => setIsResetModalOpen(true)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex-shrink-0">{t('settingsPage.dangerZone.resetButton')}</button>
              </div>
          </div>
      </div>

      <ConfirmationModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleResetData}
          title={t('settingsPage.dangerZone.resetModal.title')}
          message={<p>{t('settingsPage.dangerZone.resetModal.message')}</p>}
      />
    </div>
  );
};

export default SettingsPage;