import React from 'react';
import { GoogleIcon } from '../../constants';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTranslation } from '../../src/contexts/LanguageContext';

interface SocialButtonProps {
  provider: 'google';
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider }) => {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const icons: { [key: string]: React.ReactNode } = {
    google: <GoogleIcon className="w-6 h-6" />,
  };

  const text: { [key: string]: string } = {
    google: t('login.googleButton'),
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      type="button"
      className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm text-md font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors"
    >
      {icons[provider]}
      {text[provider]}
    </button>
  );
};
