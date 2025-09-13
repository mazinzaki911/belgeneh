import React from 'react';

interface ChartDataItem {
    label: string;
    value: number;
    color: string;
}

interface PortfolioAllocationChartProps {
  data: ChartDataItem[];
  ariaLabel: string;
  currency: string;
}

const PortfolioAllocationChart: React.FC<PortfolioAllocationChartProps> = ({ data, ariaLabel, currency }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  let cumulativePercent = 0;
  const gradients = data.map(item => {
    const percent = (item.value / total) * 100;
    const gradient = `${item.color} ${cumulativePercent}% ${cumulativePercent + percent}%`;
    cumulativePercent += percent;
    return gradient;
  }).join(', ');

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
      <div
        role="img"
        aria-label={ariaLabel}
        className="relative w-48 h-48 rounded-full flex-shrink-0"
        style={{ background: `conic-gradient(${gradients})` }}
      >
        <div className="absolute inset-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-full"></div>
      </div>
      <div className="space-y-3">
        {data.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }}></span>
            <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-200">{item.label}:</span>
                <span className="text-neutral-600 dark:text-neutral-300 font-medium">{item.value.toLocaleString('en-US')} {currency}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">({((item.value / total) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioAllocationChart;
