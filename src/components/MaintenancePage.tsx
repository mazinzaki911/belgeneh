import React from 'react';
import { Cog6ToothIcon } from '../constants';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useTranslation } from '../contexts/LanguageContext';

const MaintenancePage: React.FC = () => {
  const { maintenanceMessage } = useAppSettings();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-950 p-4 text-center">
      <div className="max-w-md">
        <Cog6ToothIcon className="w-24 h-24 mx-auto text-primary dark:text-primary-dark" />
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mt-6">
            {t('maintenancePage.title')}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 mt-3 text-lg">
          {maintenanceMessage}
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
