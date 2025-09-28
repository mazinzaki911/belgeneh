
import React, { useState, useRef, CSSProperties } from 'react';

const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" fill="currentColor"/>
    </svg>
);

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [style, setStyle] = useState<CSSProperties>({
    opacity: 0,
    visibility: 'hidden',
    transform: 'scale(0.95) translateY(4px)',
    transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out, visibility 0.2s',
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const margin = 16;

    let newLeft = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

    if (newLeft < margin) {
      newLeft = margin;
    } else if (newLeft + tooltipRect.width > viewportWidth - margin) {
      newLeft = viewportWidth - tooltipRect.width - margin;
    }

    const relativeLeft = newLeft - triggerRect.left;

    setStyle(prev => ({
      ...prev,
      left: `${relativeLeft}px`,
      bottom: '100%',
      marginBottom: '0.75rem',
      opacity: 1,
      visibility: 'visible',
      transform: 'scale(1) translateY(0)',
    }));
  };

  const handleMouseEnter = () => {
    requestAnimationFrame(calculatePosition);
  };

  const handleMouseLeave = () => {
    setStyle(prev => ({
      ...prev,
      opacity: 0,
      visibility: 'hidden',
      transform: 'scale(0.95) translateY(4px)',
    }));
  };

  return (
    <div
      className="relative flex items-center group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
      ref={triggerRef}
      aria-describedby="tooltip-content"
    >
      <QuestionMarkCircleIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors duration-200 cursor-help" />
      <div
        ref={tooltipRef}
        role="tooltip"
        id="tooltip-content"
        className={`absolute z-20 w-64 px-3 py-2 rounded-lg shadow-xl
                   bg-neutral-700 dark:bg-neutral-800 text-white dark:text-neutral-100
                   text-sm leading-relaxed pointer-events-none`}
        style={style}
      >
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                        border-x-8 border-x-transparent
                        border-t-8 border-t-neutral-700 dark:border-t-neutral-800"></div>
      </div>
    </div>
  );
};

export default InfoTooltip;
