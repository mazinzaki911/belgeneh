
import React, { useId } from 'react';
import InfoTooltip from './InfoTooltip';
import { useTranslation } from '../../src/contexts/LanguageContext';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  tooltip?: string;
  autoFocus?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, tooltip, autoFocus = false }) => {
  const id = useId();
  const { isRtl } = useTranslation();
  const textAlignClass = isRtl ? 'text-right' : 'text-left';

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor={id} className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{label}</label>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg outline-none transition-colors duration-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent ${textAlignClass}`}
        />
      </div>
    </div>
  );
};

export default TextInput;