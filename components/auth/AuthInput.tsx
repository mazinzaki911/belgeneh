import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '../../constants';
import { useTranslation } from '../../src/contexts/LanguageContext';

interface AuthInputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
}

export const AuthInput: React.FC<AuthInputProps> = ({ id, type, value, onChange, placeholder, icon }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative">
      <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-neutral-400">
        {icon}
      </span>
      <input
        id={id}
        type={isPassword && showPassword ? 'text' : type}
        value={value}
        onChange={onChange}
        required
        className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg outline-none transition-colors duration-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent ps-10 pe-4 py-3"
        placeholder={placeholder}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400 hover:text-neutral-600"
          aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
        >
          {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};
