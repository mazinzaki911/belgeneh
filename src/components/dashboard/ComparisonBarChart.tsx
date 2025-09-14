import React from 'react';
import { StarIcon } from '../../constants';
import { useTranslation } from '../../contexts/LanguageContext';

interface ChartData {
  name: string;
  value: number;
}

interface ComparisonBarChartProps {
  data: ChartData[];
  metricLabel: string;
  lowerIsBetter: boolean;
}

const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ data, metricLabel, lowerIsBetter }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return <div className="text-center text-neutral-500 dark:text-neutral-400 p-8">{t('dashboard.customReportBuilder.selectUnitsFirst')}</div>;
  }
  
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 1);
  const bestValue = lowerIsBetter 
    ? Math.min(...data.map(d => d.value).filter(v => v !== 0))
    : Math.max(...data.map(d => d.value));

  const colors = [
    'bg-primary', 'bg-sky-500', 'bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-lime-500'
  ];

  return (
    <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl shadow-md">
      <h4 className="text-xl font-bold text-center text-neutral-700 dark:text-neutral-200 mb-8">{t('dashboard.compareMetric', { metricLabel })}</h4>
      <div className="flex justify-around items-end h-72 gap-2 sm:gap-4 border-b-2 border-neutral-300 dark:border-neutral-600 pb-2 px-2">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (Math.abs(item.value) / maxValue) * 100 : 0;
          const isBest = item.value === bestValue && item.value !== 0;
          const color = colors[index % colors.length];

          return (
            <div key={item.name} className="flex flex-col items-center justify-end h-full flex-1 min-w-0">
              <div
                className={`relative group w-full max-w-12 rounded-t-lg transition-all duration-300 hover:brightness-110 transform origin-bottom animate-grow-in ${color} ${isBest ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-neutral-800/50' : ''}`}
                style={{ height: `${height}%` }}
              >
                <div 
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-neutral-800 text-white text-xs font-bold rounded-lg py-1.5 px-3 pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                >
                    {item.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                {isBest && (
                    <StarIcon className="absolute -top-6 -right-1.5 w-5 h-5 text-amber-400 drop-shadow-md" />
                )}
              </div>
              <div className="mt-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 w-full truncate pt-1 text-center" title={item.name}>
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonBarChart;