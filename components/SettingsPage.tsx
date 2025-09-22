import React from 'react';
import { Cog6ToothIcon } from '../constants';
import { useTranslation } from '../src/contexts/LanguageContext';

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();

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
          <div>
              <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 text-center mb-4">{t('settingsPage.language.title')}</h2>
              <div className="flex justify-center items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg max-w-xs mx-auto">
                  <button onClick={() => setLanguage('en')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${language === 'en' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark shadow-sm' : 'text-neutral-600 dark:text-neutral-300'}`}>{t('settingsPage.language.english')}</button>
                  <button onClick={() => setLanguage('ar')} className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${language === 'ar' ? 'bg-white dark:bg-neutral-700 text-primary dark:text-primary-dark shadow-sm' : 'text-neutral-600 dark:text-neutral-300'}`}>{t('settingsPage.language.arabic')}</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default SettingsPage;