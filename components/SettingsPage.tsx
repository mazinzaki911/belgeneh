

import React, { useState } from 'react';
import { Cog6ToothIcon, DocumentArrowDownIcon, TrashIcon } from '../constants';
import { useTranslation } from '../src/contexts/LanguageContext';
import { useData } from '../src/contexts/DataContext';
import { useToast } from '../src/contexts/ToastContext';
import { exportToJson, exportToCsv } from '../utils/exportUtils';
import ConfirmationModal from './shared/ConfirmationModal';

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { savedUnits, portfolioProperties, resetApplicationData } = useData();
  const showToast = useToast();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleExport = (format: 'json' | 'csv') => {
    if (savedUnits.length === 0 && portfolioProperties.length === 0) {
      showToast(t('settingsPage.dataManagement.noDataToExport'), 'info');
      return;
    }
    const dataToExport = { savedUnits, portfolioProperties };
    if (format === 'json') {
      exportToJson(dataToExport);
    } else {
      exportToCsv(dataToExport);
    }
    showToast(t('settingsPage.dataManagement.exportSuccess'), 'success');
  };
  
  const handleResetConfirm = () => {
    resetApplicationData();
    setIsResetModalOpen(false);
    showToast(t('settingsPage.dataManagement.resetSuccess'), 'success');
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 text-neutral-800 dark:text-neutral-100">
              <Cog6ToothIcon className="w-8 h-8"/>
              <h1 className="text-3xl font-bold">{t('settingsPage.title')}</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 text-center mb-4">{t('settingsPage.language.title')}</h2>
            <div className="flex justify-center items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg max-w-xs mx-auto">
                <button onClick={() => setLanguage('en')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${language === 'en' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark shadow-sm' : 'text-neutral-600 dark:text-neutral-300'}`}>{t('settingsPage.language.english')}</button>
                <button onClick={() => setLanguage('ar')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${language === 'ar' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark shadow-sm' : 'text-neutral-600 dark:text-neutral-300'}`}>{t('settingsPage.language.arabic')}</button>
            </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 text-center mb-2">{t('settingsPage.dataManagement.title')}</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-6">{t('settingsPage.dataManagement.description')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => handleExport('json')} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>{t('settingsPage.dataManagement.exportJson')}</span>
            </button>
            <button onClick={() => handleExport('csv')} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>{t('settingsPage.dataManagement.exportCsv')}</span>
            </button>
            <div className="sm:col-span-2 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700 flex flex-col items-center">
               <button onClick={() => setIsResetModalOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors">
                 <TrashIcon className="w-5 h-5" />
                 <span>{t('settingsPage.dataManagement.resetData')}</span>
               </button>
               <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">{t('settingsPage.dataManagement.resetDataTooltip')}</p>
            </div>
          </div>
        </div>

      </div>
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title={t('confirmationModals.resetDataTitle')}
        message={<p>{t('confirmationModals.resetDataMessage')}</p>}
      />
    </>
  );
};

export default SettingsPage;