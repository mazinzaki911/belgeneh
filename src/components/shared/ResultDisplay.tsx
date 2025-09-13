import React from 'react';
import InfoTooltip from './InfoTooltip';

interface ResultDisplayProps {
  label: string;
  value: string;
  unit?: string;
  tooltip?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, value, unit, tooltip }) => {
  return (
    <div className="mt-8 p-6 bg-primary-light dark:bg-primary/10 rounded-lg border-2 border-dashed border-primary/20 dark:border-primary/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center text-center sm:text-right">
        <div className="flex items-center justify-center sm:justify-start gap-2">
            <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">{label}</p>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-dark break-all">
          {value} <span className="text-lg sm:text-xl">{unit}</span>
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;