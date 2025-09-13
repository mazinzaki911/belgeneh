
import React from 'react';

interface CalculatorCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const CalculatorCard: React.FC<CalculatorCardProps> = ({ title, description, children, icon }) => {
  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
                <div className="mb-6 text-center">
                    <div className="flex justify-center items-center gap-3 text-neutral-800 dark:text-neutral-100">
                        {icon}
                        <h2 className="text-2xl font-bold">{title}</h2>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">{description}</p>
                </div>
                {children}
            </div>
        </div>
    </div>
  );
};

export default CalculatorCard;