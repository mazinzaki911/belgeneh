import React, { useId } from 'react';
import InfoTooltip from './InfoTooltip';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  tooltip?: string;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, min, max, tooltip }) => {
  const id = useId();
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor={id} className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{label}</label>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className="relative">
        <input
          id={id}
          type="date"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg outline-none transition-colors duration-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default DateInput;