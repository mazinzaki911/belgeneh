

import React, { useId } from 'react';
import InfoTooltip from './InfoTooltip';
import { useTranslation } from '../../contexts/LanguageContext';

interface SelectInputProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  tooltip?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, children, tooltip }) => {
  const id = useId();
  const { isRtl } = useTranslation();

  const paddingClasses = isRtl ? 'pl-10 pr-4' : 'pr-10 pl-4';

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor={id} className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{label}</label>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full py-3 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg outline-none transition-colors duration-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent appearance-none ${paddingClasses}`}
        >
          {children}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 flex items-center px-2 text-neutral-700 dark:text-neutral-300 ${isRtl ? 'left-0' : 'right-0'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default SelectInput;