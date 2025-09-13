import React from 'react';

// A more stylish question mark icon
const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);


interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  return (
    <div className="relative group flex items-center">
      <QuestionMarkCircleIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500 cursor-help transition-all duration-200 group-hover:scale-110 group-hover:text-primary dark:group-hover:text-primary-dark" />
      <div
        role="tooltip"
        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-20 w-64
                   px-4 py-3 rounded-lg shadow-lg
                   bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200
                   border border-neutral-300 dark:border-neutral-600
                   text-sm leading-relaxed
                   invisible opacity-0 group-hover:visible group-hover:opacity-100 
                   transform scale-95 group-hover:scale-100
                   transition-all duration-200 ease-in-out pointer-events-none"
      >
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                        border-x-8 border-x-transparent
                        border-t-8 border-t-neutral-50 dark:border-t-neutral-700"></div>
      </div>
    </div>
  );
};

export default InfoTooltip;