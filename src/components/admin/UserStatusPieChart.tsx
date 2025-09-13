import React from 'react';

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  ariaLabel: string;
}

const UserStatusPieChart: React.FC<PieChartProps> = ({ data, ariaLabel }) => {
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
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div
        role="img"
        aria-label={ariaLabel}
        className="w-40 h-40 rounded-full"
        style={{ background: `conic-gradient(${gradients})` }}
      ></div>
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: item.color }}></span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-200">{item.label}:</span>
            <span className="text-neutral-500 dark:text-neutral-400">{item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStatusPieChart;
