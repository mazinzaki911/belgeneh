import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-xl shadow-md flex items-center gap-6">
      <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
        <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
