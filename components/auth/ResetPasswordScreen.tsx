import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { AuthInput } from './AuthInput';
import { LockClosedIcon } from '../../constants';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTranslation } from '../../src/contexts/LanguageContext';

interface ResetPasswordScreenProps {
  onPasswordReset: () => void;
  successButtonLabel?: string;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onPasswordReset, successButtonLabel }) => {
  const { t } = useTranslation();
  const { handlePasswordRecovery } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('login.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('login.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    const result = await handlePasswordRecovery(newPassword);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      // Error may be a translation key (e.g. 'login.errors.recoveryLinkExpired') or a raw string
      const errKey = result.error || 'login.errors.generic';
      const translated = t(errKey);
      setError(translated !== errKey ? translated : errKey);
    }
  };

  if (success) {
    return (
      <AuthLayout title={t('login.resetPasswordTitle')} subtitle="">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">{t('login.passwordResetSuccess')}</p>
              <button
                onClick={onPasswordReset}
                className="mt-3 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
              >
                {successButtonLabel || t('login.backToLogin')}
              </button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('login.resetPasswordTitle')} subtitle={t('login.resetPasswordSubtitle')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          id="new-password"
          type="password"
          placeholder={t('login.newPasswordPlaceholder')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          icon={<LockClosedIcon className="w-5 h-5" />}
        />
        <AuthInput
          id="confirm-password"
          type="password"
          placeholder={t('login.confirmNewPasswordPlaceholder')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<LockClosedIcon className="w-5 h-5" />}
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
        >
          {isLoading ? t('login.loading') : t('login.resetPasswordButton')}
        </button>
      </form>
    </AuthLayout>
  );
};
