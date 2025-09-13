import React, { useState } from 'react';
import { ChevronDownIcon } from '../../../constants';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  isOpenByDefault?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, isOpenByDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-start font-bold text-xl text-primary dark:text-primary-dark hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
