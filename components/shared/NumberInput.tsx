
import React, { useMemo, useId } from 'react';
import InfoTooltip from './InfoTooltip';
import { useTranslation } from '../../src/contexts/LanguageContext';

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  currency?: string;
  unit?: string;
  tooltip?: string;
  error?: boolean;
  readOnly?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, placeholder, currency, unit, tooltip, error, readOnly = false }) => {
  const id = useId();
  const { isRtl } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const rawValue = e.target.value;
    const parsedValue = rawValue.replace(/,/g, '');

    // Allow only valid number patterns (including empty, negative, and decimal points)
    if (parsedValue === '' || /^-?\d*\.?\d*$/.test(parsedValue)) {
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: parsedValue,
        },
      };
      onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Format the value for display with thousand separators
  const formattedValue = useMemo(() => {
    if (value === null || value === undefined || value === '') return '';
    // Preserve trailing decimal point or negative sign for better typing experience
    if (value.endsWith('.') || value === '-') return value;
    
    const parts = value.split('.');
    const decimalPart = parts[1];
    
    // Format the integer part with commas
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
  }, [value]);
  
  const errorClasses = 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500';
  const defaultClasses = 'border-neutral-300 dark:border-neutral-600 focus:ring-primary dark:focus:ring-primary-dark';
  const readOnlyClasses = 'bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed';

  const paddingClasses = currency || unit
    ? isRtl
      ? 'ps-4 pe-14'
      : 'pe-4 ps-14'
    : 'px-4';

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
          inputMode="decimal"
          value={formattedValue}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full py-3 bg-neutral-50 dark:bg-neutral-700/50 border text-neutral-900 dark:text-neutral-100 rounded-lg outline-none transition-colors duration-200 focus:ring-2 focus:border-transparent ${paddingClasses} ${textAlignClass} ${error ? errorClasses : defaultClasses} ${readOnly ? readOnlyClasses : ''}`}
        />
        {(currency || unit) && (
          <span className={`absolute top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none ${isRtl ? 'left-3' : 'right-3'}`}>
            {currency || unit}
          </span>
        )}
      </div>
    </div>
  );
};

export default NumberInput;