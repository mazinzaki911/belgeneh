
import React from 'react';
import InfoTooltip from './InfoTooltip';
import { useTranslation } from '../../src/contexts/LanguageContext';

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  tooltip?: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ label, value, onChange, placeholder, rows = 4, tooltip }) => {
    const id = React.useId();
    const { isRtl } = useTranslation();
    const textAlignClass = isRtl ? 'text-right' : 'text-left';

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <label htmlFor={id} className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg outline-none transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-vertical ${textAlignClass}`}
            />
        </div>
    );
};

export default TextAreaInput;
