import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { AuthInput } from './AuthInput';
import { AtSymbolIcon } from '../../constants';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTranslation } from '../../src/contexts/LanguageContext';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBackToLogin }) => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setEmailSent(true);
    } else {
      const errorMessage = result.error?.startsWith('login.') ? t(result.error) : (result.error || t('login.errors.generic'));
      setError(errorMessage);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout title={t('login.resetEmailSentTitle')} subtitle={t('login.forgotPasswordTitle')}>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">{t('login.resetEmailSentMessage')}</p>
              <button
                onClick={onBackToLogin}
                className="mt-3 text-sm font-semibold text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
              >
                {t('login.backToLogin')}
              </button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('login.forgotPasswordTitle')} subtitle={t('login.forgotPasswordSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          id="forgot-email"
          type="email"
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<AtSymbolIcon className="w-5 h-5" />}
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
        >
          {isLoading ? t('login.loading') : t('login.sendResetLink')}
        </button>
      </form>

      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full text-center text-sm text-primary dark:text-primary-dark hover:underline focus:outline-none"
      >
        {t('login.backToLogin')}
      </button>
    </AuthLayout>
  );
};
