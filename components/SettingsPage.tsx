import React from 'react';
import { Cog6ToothIcon, DocumentArrowDownIcon } from '../constants';
import { useTranslation } from '../src/contexts/LanguageContext';
import { useData } from '../src/contexts/DataContext';
import { exportToJson, exportToCsv } from '../utils/exportUtils';

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { savedUnits, portfolioProperties } = useData();
  
  const handleExportJson = () => {
    exportToJson({ savedUnits, portfolioProperties });
  };
  
  const handleExportCsv = () => {
    exportToCsv({ savedUnits, portfolioProperties });
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

          {/* Data Management Section */}
          <div className="py-6 border-t border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 text-center mb-2">{t('settingsPage.dataManagement.title')}</h2>
              <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mb-6">{t('settingsPage.dataManagement.description')}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={handleExportJson} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"><DocumentArrowDownIcon className="w-5 h-5"/> {t('settingsPage.dataManagement.exportJson')}</button>
                  <button onClick={handleExportCsv} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"><DocumentArrowDownIcon className="w-5 h-5"/> {t('settingsPage.dataManagement.exportCsv')}</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default SettingsPage;