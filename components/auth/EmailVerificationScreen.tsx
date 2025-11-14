import React from 'react';
import { AuthLayout } from './AuthLayout';
import { MailOpenIcon } from '../../constants';
import { useTranslation } from '../../src/contexts/LanguageContext';

export const EmailVerificationScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AuthLayout
      title={t('login.verifyEmailTitle')}
      subtitle={t('login.verifyEmailSubtitle')}
    >
      <div className="text-center">
        <MailOpenIcon className="w-16 h-16 text-primary mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-300">
          {t('login.verifyEmailMessage')}
        </p>
      </div>
    </AuthLayout>
  );
};
