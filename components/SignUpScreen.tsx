
import React, { useState } from 'react';
import { AuthLayout } from './auth/AuthLayout';
import { AuthInput } from './auth/AuthInput';
import { SocialButton } from './auth/SocialButton';
import { AtSymbolIcon, LockClosedIcon, UserIcon } from '../constants';
import { useAuth } from '../src/contexts/AuthContext';
import { useTranslation } from '../src/contexts/LanguageContext';

interface SignUpScreenProps {
  onLoginClick: () => void;
  onSignUpSuccess: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onLoginClick, onSignUpSuccess }) => {
  const { t } = useTranslation();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await signUp({ name, email, password });
    if (result.success) {
      onSignUpSuccess();
    } else {
      setError(t(result.error || 'login.errors.generic'));
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('login.signUpTitle')}
      subtitle={t('login.signUpSubtitle')}
    >
      <form onSubmit={handleSignUp} className="space-y-6">
        <AuthInput
          id="signup-name"
          type="text"
          placeholder={t('login.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<UserIcon className="w-5 h-5" />}
        />
        <AuthInput
          id="signup-email"
          type="email"
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<AtSymbolIcon className="w-5 h-5" />}
        />
        <AuthInput
          id="signup-password"
          type="password"
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockClosedIcon className="w-5 h-5" />}
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
        >
          {isLoading ? t('login.signingUp') : t('login.signUpButton')}
        </button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-500">{t('login.orContinueWith')}</span>
        </div>
      </div>
      <SocialButton provider="google" />
      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        {t('login.hasAccount')}{' '}
        <button onClick={onLoginClick} className="font-semibold text-primary dark:text-primary-dark hover:underline focus:outline-none">
          {t('login.loginLink')}
        </button>
      </p>
    </AuthLayout>
  );
};
