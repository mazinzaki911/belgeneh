import React from 'react';
import { CalculatorType, UnitStatus, TFunction, AppSettings } from './types';
import { useTranslation } from './src/contexts/LanguageContext';

export const getUnitStatusConfig = (t: TFunction): { [key in UnitStatus]: { text: string; colorClasses: string } } => ({
  [UnitStatus.UnderConsideration]: { text: t('unitStatus.underConsideration'), colorClasses: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300' },
  [UnitStatus.OfferMade]: { text: t('unitStatus.offerMade'), colorClasses: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' },
  [UnitStatus.Purchased]: { text: t('unitStatus.purchased'), colorClasses: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' },
  [UnitStatus.Rejected]: { text: t('unitStatus.rejected'), colorClasses: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' },
  [UnitStatus.Pending]: { text: t('unitStatus.pending'), colorClasses: 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-300' },
});

export const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

export const BanknotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
);

export const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M8.25 21V3.625c0-1.036.84-1.875 1.875-1.875h.375c1.036 0 1.875.84 1.875 1.875V21m-4.5 0v-6.75h4.5v6.75" />
  </svg>
);

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const ArrowTrendingUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.28m5.94 2.28L16.5 21.75" />
  </svg>
);

export const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 20.25c1.623 0 2.99-1.313 3.25-2.962V8.441c0-1.649-1.367-3-3.25-3-1.883 0-3.25 1.351-3.25 3v8.847c0 1.649 1.367 2.962 3.25 2.962Zm-12 0c1.623 0 2.99-1.313 3.25-2.962V8.441c0-1.649-1.367-3-3.25-3-1.883 0-3.25 1.351-3.25 3v8.847c0 1.649 1.367 2.962 3.25 2.962Z" />
    </svg>
);

export const CalculatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm3-6h.008v.008H11.25v-.008Zm0 3h.008v.008H11.25v-.008Zm0 3h.008v.008H11.25v-.008Zm3-6h.008v.008H14.25v-.008Zm0 3h.008v.008H14.25v-.008Zm.75-12V12m0 0v6.75m0-6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM4.5 6.75A.75.75 0 0 1 5.25 6h13.5a.75.75 0 0 1 0 1.5H5.25A.75.75 0 0 1 4.5 6.75Z" />
    </svg>
);

export const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm-3-3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm-3-3h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008Zm6-3h.008v.008H12v-.008Zm3 0h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Z" />
  </svg>
);

export const HomeModernIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

export const Squares2X2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5h4.5v-4.5h-4.5Zm0 7.5v4.5h4.5v-4.5h-4.5Zm0 7.5v4.5h4.5v-4.5h-4.5Zm7.5-15v4.5h4.5v-4.5h-4.5Zm0 7.5v4.5h4.5v-4.5h-4.5Zm0 7.5v4.5h4.5v-4.5h-4.5Zm7.5-15v4.5h4.5v-4.5h-4.5Zm0 7.5v4.5h4.5v-4.5h-4.5Zm0 7.5v4.5h4.5v-4.5h-4.5Z" />
  </svg>
);

export const DocumentArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.716C7.59 2.25 6.68 3.16 6.68 4.334v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

export const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
);

export const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

export const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

export const ComputerDesktopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
);

export const WandSparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

export const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={3} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={3} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

export const AppLogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="100 420 800 180" xmlns="http://www.w3.org/2000/svg" {...props}>
        {/* B-shape graphic */}
        <g className="fill-primary dark:fill-primary-dark">
            <polygon points="170.33,541.6 148.47,524.89 114.57,557.57 149.2,536.2 171.07,553.39 216.27,504.01 220.5,509.79 225.6,487.06 203.74,493.94 210.2,497.9 170.33,541.6"/>
            <path d="M162,461h10v74.84l11-11.22V442h10v68.73l13.03-14.22l-8.56-5.22l25.5-7.99 c7.49-8.04,14.06-16.73,14.06-30.01c0-9.43-6.81-28.28-37.86-28.28c-8.71,0-55.66,0.59-60.21,0.59c-0.95,0-12.9-0.59-21.43-0.59 c-2.09,0-3.03,0.39-3.03,1.57c0,0.78,0.76,1.17,1.52,1.17c1.71,0,4.92,0.24,6.45,0.59c6.25,1.42,7.76,4.5,8.16,11.16 c0.37,6.27,0.38,11.75,0.38,42.29v34.46c0,8.34,0.01,16.02-0.06,22.71L141,528.93V483h11v42.06l10,7.93V461L162,461z"/>
            <path d="M216.03,508.31l-44.67,48.79l-22.35-17.58l-18.21,11.23c-0.13,2.54-0.31,4.75-0.55,6.6 c-0.71,5.63-1.75,9.86-5.62,10.66c-1.75,0.36-4.07,0.77-5.81,0.77c-1.16,0-1.55,0.58-1.55,1.16c0,1.16,0.97,1.55,3.1,1.55 c2.91,0,7.36-0.29,11.24-0.39c4.07-0.1,7.36-0.19,7.75-0.19c0.77,0,44.65,0.29,50.28,0.58c5.62,0.29,11.82,0.58,13.95,0.58 c33.13,0,49.4-21.51,49.4-42.24c0-18.73-13.1-31.38-25.74-37.72l-5.41,24.12L216.03,508.31L216.03,508.31z"/>
        </g>
        {/* Text paths for "Belgeneh" */}
        <g className="fill-neutral-900 dark:fill-neutral-100">
            <path d="M338.97,484.71c4.3,1.1,7.66,2.99,10.09,5.69c2.42,2.7,3.64,6.59,3.64,11.67c0,4.07-0.82,7.53-2.46,10.38 c-1.64,2.86-3.87,5.18-6.68,6.98c-2.81,1.8-6.1,3.11-9.85,3.93c-3.75,0.82-7.74,1.23-11.96,1.23H284.2v-81.15h35.77 c10.24,0,17.92,1.94,23.04,5.81c5.12,3.87,7.68,9.44,7.68,16.71c0,2.89-0.29,5.41-0.88,7.56c-0.59,2.15-1.41,3.97-2.46,5.45 c-1.06,1.49-2.31,2.68-3.75,3.58C342.15,483.45,340.61,484.17,338.97,484.71z M305.31,461.61v14.31h15.95 c2.35,0,4.38-0.45,6.1-1.35c1.72-0.9,2.58-2.72,2.58-5.45c0-5-3.32-7.51-9.97-7.51H305.31z M305.31,506.41h16.42 c3.28,0,5.8-0.53,7.56-1.58s2.64-2.91,2.64-5.57c0-1.95-0.69-3.64-2.05-5.04c-1.37-1.41-3.97-2.11-7.8-2.11h-16.77V506.41z"/>
            <path d="M420.59,443.44v19.7h-35.3v11.02h30.61v19.7h-30.61v11.02h35.3v19.7h-56.41v-81.15H420.59z"/>
            <path d="M455.06,443.44v60.86h38.7v20.29h-59.81v-81.15H455.06z"/>
            <path d="M498.92,483.89c0-6.1,0.96-11.71,2.87-16.83c1.92-5.12,4.71-9.54,8.39-13.25c3.67-3.71,8.19-6.61,13.54-8.68 c5.35-2.07,11.47-3.11,18.35-3.11h0.12c6.18,0,11.85,0.82,17.01,2.46c5.16,1.64,9.65,4.26,13.49,7.86l-11.61,15.83 c-2.58-2.27-5.38-3.91-8.38-4.93c-3.01-1.02-6.51-1.52-10.5-1.52h-0.12c-3.6,0-6.76,0.55-9.5,1.64c-2.74,1.1-5.04,2.64-6.92,4.63 c-1.88,1.99-3.28,4.34-4.22,7.04c-0.94,2.7-1.41,5.65-1.41,8.85v0.12c0,3.13,0.47,6.04,1.41,8.74c0.94,2.7,2.3,5.04,4.1,7.04 c1.8,1.99,4.03,3.58,6.69,4.75c2.66,1.17,5.67,1.76,9.03,1.76h0.12c3.75,0,7.1-0.55,10.03-1.64c2.93-1.09,4.94-2.74,6.04-4.93 v-1.76h-15.95v-17h33.3v43.63h-12.9l-0.82-6.8c-4.93,5.47-12.12,8.21-21.58,8.21h-0.12c-6.33,0-12-1.04-17-3.11 c-5-2.07-9.25-4.98-12.72-8.74c-3.48-3.75-6.14-8.19-7.97-13.31c-1.84-5.12-2.76-10.73-2.76-16.83V483.89z"/>
            <path d="M643.75,443.44v19.7h-35.3v11.02h30.61v19.7h-30.61v11.02h35.3v19.7h-56.41v-81.15H643.75z"/>
            <path d="M709.54,443.44h20.52v81.15h-18.41l-34.01-44.56v44.56h-20.52v-81.15h18.41l34.01,44.68V443.44z"/>
            <path d="M801.95,443.44v19.7h-35.3v11.02h30.61v19.7h-30.61v11.02h35.3v19.7h-56.41v-81.15H801.95z"/>
            <path d="M815.32,443.44h21.11v30.37h30.73v-30.37h21.11v81.15h-21.11v-30.84h-30.73v30.84h-21.11V443.44z"/>
        </g>
        {/* Text paths for "Calculate and decide" */}
        <g className="fill-neutral-600 dark:fill-neutral-400">
            <path d="M284.85,549.54v-0.02c0-1.24,0.19-2.38,0.59-3.43c0.39-1.04,0.95-1.94,1.68-2.7c0.73-0.76,1.63-1.34,2.69-1.77 c1.06-0.42,2.26-0.63,3.6-0.63h0.02c1.15,0,2.23,0.17,3.26,0.5c1.03,0.33,1.93,0.87,2.71,1.6l-2.36,3.22 c-0.53-0.46-1.09-0.8-1.68-1s-1.24-0.31-1.92-0.31h-0.02c-0.67,0-1.27,0.12-1.79,0.36c-0.53,0.24-0.97,0.56-1.34,0.97 c-0.37,0.41-0.65,0.88-0.84,1.43c-0.19,0.55-0.29,1.13-0.29,1.76v0.02c0.02,0.64,0.12,1.23,0.31,1.79 c0.19,0.56,0.47,1.04,0.84,1.45c0.37,0.41,0.81,0.72,1.33,0.96c0.52,0.23,1.11,0.35,1.78,0.35h0.02c0.8,0,1.48-0.12,2.04-0.35 c0.56-0.23,1.09-0.55,1.56-0.97l2.36,3.23c-0.73,0.68-1.6,1.21-2.59,1.56c-1,0.36-2.12,0.54-3.38,0.54h-0.02 c-1.34,0-2.54-0.21-3.6-0.63s-1.96-1.01-2.69-1.78c-0.73-0.76-1.29-1.67-1.68-2.71C285.05,551.93,284.85,550.79,284.85,549.54z"/>
            <path d="M322.41,541.28h4.63l6.55,16.53h-4.54l-1.1-3.11h-6.45l-1.1,3.11h-4.54L322.41,541.28z M322.86,550.93h3.73l-1.86-5.23 L322.86,550.93z"/>
            <path d="M356.14,541.28v12.4h7.88v4.13h-12.18v-16.53H356.14z"/>
            <path d="M381.56,549.54v-0.02c0-1.24,0.19-2.38,0.59-3.43c0.39-1.04,0.95-1.94,1.68-2.7c0.73-0.76,1.63-1.34,2.69-1.77 c1.06-0.42,2.26-0.63,3.6-0.63h0.02c1.15,0,2.23,0.17,3.26,0.5c1.03,0.33,1.93,0.87,2.71,1.6l-2.36,3.22 c-0.53-0.46-1.09-0.8-1.68-1s-1.24-0.31-1.92-0.31h-0.02c-0.67,0-1.27,0.12-1.79,0.36c-0.53,0.24-0.97,0.56-1.34,0.97 c-0.37,0.41-0.65,0.88-0.84,1.43c-0.19,0.55-0.29,1.13-0.29,1.76v0.02c0.02,0.64,0.12,1.23,0.31,1.79 c0.19,0.56,0.47,1.04,0.84,1.45c0.37,0.41,0.81,0.72,1.33,0.96c0.52,0.23,1.11,0.35,1.78,0.35h0.02c0.8,0,1.48-0.12,2.04-0.35 c0.56-0.23,1.09-0.55,1.56-0.97l2.36,3.23c-0.73,0.68-1.6,1.21-2.59,1.56c-1,0.36-2.12,0.54-3.38,0.54h-0.02 c-1.34,0-2.54-0.21-3.6-0.63s-1.96-1.01-2.69-1.78c-0.73-0.76-1.29-1.67-1.68-2.71C381.75,551.93,381.56,550.79,381.56,549.54z"/>
            <path d="M414.07,550.24v-8.96h4.3v8.96c0,0.73,0.09,1.34,0.27,1.82c0.18,0.48,0.42,0.86,0.72,1.13c0.29,0.28,0.64,0.47,1.03,0.59 s0.78,0.17,1.18,0.17h0.02c0.41,0,0.81-0.06,1.19-0.17c0.38-0.11,0.72-0.31,1.02-0.59c0.29-0.28,0.53-0.66,0.72-1.13 c0.18-0.48,0.27-1.08,0.27-1.82v-8.96h4.3v8.96c0,1.37-0.19,2.55-0.56,3.54s-0.9,1.8-1.56,2.45c-0.67,0.65-1.46,1.12-2.38,1.42 c-0.92,0.3-1.92,0.45-3,0.45h-0.02c-1.08,0-2.08-0.15-3-0.45c-0.92-0.3-1.71-0.78-2.38-1.42c-0.67-0.64-1.19-1.46-1.56-2.45 C414.26,552.79,414.07,551.61,414.07,550.24z"/>
            <path d="M452.63,541.28v12.4h7.88v4.13h-12.18v-16.53H452.63z"/>
            <path d="M484.16,541.28h4.63l6.55,16.53h-4.54l-1.1-3.11h-6.45l-1.1,3.11h-4.54L484.16,541.28z M484.62,550.93h3.73l-1.86-5.23 L484.62,550.93z"/>
            <path d="M524.58,541.28v4.13h-4.68v12.4h-4.3v-12.4h-4.68v-4.13H524.58z"/>
            <path d="M554.57,541.28v4.01h-7.19v2.25h6.24v4.01h-6.24v2.25h7.19v4.01h-11.49v-16.53H554.57z"/>
            <path d="M600.91,541.28h4.63l6.55,16.53h-4.54l-1.1-3.11H600l-1.1,3.11h-4.54L600.91,541.28z M601.37,550.93h3.73l-1.86-5.23 L601.37,550.93z"/>
            <path d="M641.02,541.28h4.18v16.53h-3.75l-6.93-9.08v9.08h-4.18v-16.53h3.75l6.93,9.1V541.28z"/>
            <path d="M671.46,541.28c1.34,0,2.53,0.2,3.57,0.6c1.04,0.4,1.92,0.96,2.63,1.68s1.25,1.59,1.61,2.6c0.37,1.01,0.55,2.14,0.55,3.38 v0.02c0,1.24-0.18,2.37-0.55,3.38s-0.9,1.88-1.61,2.59s-1.58,1.27-2.63,1.67c-1.04,0.4-2.23,0.6-3.57,0.6h-6.62v-16.53H671.46z M669.14,553.75h2.32c1.35,0,2.37-0.37,3.05-1.12c0.68-0.75,1.02-1.77,1.02-3.06v-0.02c0-1.29-0.34-2.31-1.02-3.07 c-0.68-0.76-1.69-1.13-3.05-1.13h-2.32V553.75z"/>
            <path d="M727.58,541.28c1.34,0,2.53,0.2,3.57,0.6c1.04,0.4,1.92,0.96,2.63,1.68s1.25,1.59,1.61,2.6c0.37,1.01,0.55,2.14,0.55,3.38 v0.02c0,1.24-0.18,2.37-0.55,3.38s-0.9,1.88-1.61,2.59s-1.58,1.27-2.63,1.67c-1.04,0.4-2.23,0.6-3.57,0.6h-6.62v-16.53H727.58z M725.26,553.75h2.32c1.35,0,2.37-0.37,3.05-1.12c0.68-0.75,1.02-1.77,1.02-3.06v-0.02c0-1.29-0.34-2.31-1.02-3.07 c-0.68-0.76-1.69-1.13-3.05-1.13h-2.32V553.75z"/>
            <path d="M766.11,541.28v4.01h-7.19v2.25h6.24v4.01h-6.24v2.25h7.19v4.01h-11.49v-16.53H766.11z"/>
            <path d="M784.36,549.54v-0.02c0-1.24,0.2-2.38,0.58-3.43c0.39-1.04,0.95-1.94,1.68-2.7c0.73-0.76,1.63-1.34,2.69-1.77 c1.06-0.42,2.26-0.63,3.6-0.63h0.02c1.15,0,2.23,0.17,3.26,0.5c1.03,0.33,1.93,0.87,2.71,1.6l-2.37,3.22 c-0.53-0.46-1.09-0.8-1.68-1c-0.6-0.21-1.24-0.31-1.92-0.31h-0.02c-0.67,0-1.27,0.12-1.79,0.36c-0.53,0.24-0.97,0.56-1.34,0.97 c-0.37,0.41-0.64,0.88-0.84,1.43c-0.19,0.55-0.29,1.13-0.29,1.76v0.02c0.02,0.64,0.12,1.23,0.31,1.79 c0.19,0.56,0.47,1.04,0.84,1.45c0.37,0.41,0.81,0.72,1.33,0.96c0.52,0.23,1.11,0.35,1.78,0.35h0.02c0.8,0,1.48-0.12,2.04-0.35 c0.57-0.23,1.09-0.55,1.56-0.97l2.37,3.23c-0.73,0.68-1.6,1.21-2.59,1.56c-1,0.36-2.12,0.54-3.38,0.54h-0.02 c-1.34,0-2.54-0.21-3.6-0.63s-1.96-1.01-2.69-1.78s-1.29-1.67-1.68-2.71C784.56,551.93,784.36,550.79,784.36,549.54z"/>
            <path d="M817.28,557.81v-16.53h4.3v16.53H817.28z"/>
            <path d="M847.84,541.28c1.34,0,2.53,0.2,3.57,0.6c1.04,0.4,1.92,0.96,2.63,1.68s1.25,1.59,1.61,2.6c0.37,1.01,0.55,2.14,0.55,3.38 v0.02c0,1.24-0.18,2.37-0.55,3.38s-0.9,1.88-1.61,2.59s-1.58,1.27-2.63,1.67c-1.04,0.4-2.23,0.6-3.57,0.6h-6.62v-16.53H847.84z M845.52,553.75h2.32c1.35,0,2.37-0.37,3.05-1.12c0.68-0.75,1.02-1.77,1.02-3.06v-0.02c0-1.29-0.34-2.31-1.02-3.07 c-0.68-0.76-1.69-1.13-3.05-1.13h-2.32V553.75z"/>
            <path d="M886.37,541.28v4.01h-7.19v2.25h6.24v4.01h-6.24v2.25h7.19v4.01h-11.49v-16.53H886.37z"/>
        </g>
    </svg>
);


export const ArrowLeftStartOnRectangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3h12" />
    </svg>
);

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
);

export const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

export const Cog6ToothIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.55-.22 1.156-.22 1.706 0 .55.22 1.02.684 1.11 1.226l.043.25a2.25 2.25 0 0 1 3.484 2.108l-.043.25c-.09.542-.56 1.007-1.11 1.226-.55.22-1.156.22-1.706 0-.55-.22-1.02-.684-1.11-1.226l-.043-.25a2.25 2.25 0 0 1-3.484-2.108l.043-.25Zm-1.88 6.223a2.25 2.25 0 0 0-3.484 2.108l.043.25c.09.542.56 1.007 1.11 1.226.55.22 1.156.22 1.706 0 .55.22 1.02-.684 1.11-1.226l.043-.25a2.25 2.25 0 0 0-3.484-2.108l-.043-.25Zm6.341 0a2.25 2.25 0 0 0-3.484 2.108l.043.25c.09.542.56 1.007 1.11 1.226.55.22 1.156.22 1.706 0 .55.22 1.02-.684-1.11-1.226l.043-.25a2.25 2.25 0 0 0-3.484-2.108l-.043-.25Zm-1.88 6.223a2.25 2.25 0 0 1 3.484 2.108l-.043.25c-.09.542-.56 1.007-1.11 1.226-.55.22-1.156.22-1.706 0-.55-.22-1.02-.684-1.11-1.226l-.043-.25a2.25 2.25 0 0 1-3.484-2.108l.043-.25Zm-6.341 0a2.25 2.25 0 0 1 3.484 2.108l-.043.25c-.09.542-.56 1.007-1.11 1.226-.55.22-1.156.22-1.706 0-.55-.22-1.02-.684-1.11-1.226l-.043-.25a2.25 2.25 0 0 1-3.484-2.108l.043-.25Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export const AtSymbolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
  </svg>
);

export const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
  </svg>
);

export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.487-11.187-8.264l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.492,44,29.909,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

export const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v-2.25a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 14.25 7.5v-1.5a3.375 3.375 0 0 0-3.375-3.375H10.5a3.375 3.375 0 0 0-3.375 3.375v1.5c0 .621-.504 1.125-1.125 1.125h-1.5a3.375 3.375 0 0 0-3.375 3.375v2.25m17.55-3.375-2.25 2.25m-13.5-2.25L3.375 14.15m10.125-2.25h-4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 18.375a3.375 3.375 0 0 0 3.375 3.375h9.75a3.375 3.375 0 0 0 3.375-3.375V16.5h-16.5v1.875Z" />
  </svg>
);

export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9h-9v9Z" />
      <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z" />
    </svg>
);

export const PauseCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const ListBulletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
    </svg>
);

export const ArrowUpTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

export const PiggyBankIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M12 15h.01M12 12h.01M12 9h.01M12 6h.01" />
  </svg>
);
export const ChartPieIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
);
export const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.5v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);
export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21 8.25Z" />
    </svg>
);
export const CurrencyPoundIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6c-3.125 0-4.5 1.375-4.5 3.375S11.125 12.75 14.25 12.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75h4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5c0-4.142 3.358-7.5 7.5-7.5h.75c4.142 0 7.5 3.358 7.5 7.5v3c0 4.142-3.358 7.5-7.5 7.5h-.75c-4.142 0-7.5-3.358-7.5-7.5v-3Z" />
    </svg>
);
export const ReceiptPercentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m2.25-9h.01M7.5 12h.01M7.5 15h.01" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3.75A2.25 2.25 0 0 0 18 1.5H6A2.25 2.25 0 0 0 3.75 3Z" />
    </svg>
);
export const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-1.5c1.5-1.5 1.5-3.75 0-5.25S13.5 3 12 3S9 4.25 7.5 5.75s-1.5 3.75 0 5.25c.5.5 1 1 1.5 1.5M12 18v-5.25" />
    </svg>
);
export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.75-5.25T21 9.75a9 9 0 1 0-18 0 9.094 9.094 0 0 0 3.75 5.25m10.5 0a9.094 9.094 0 0 1-3.75 5.25m3.75-5.25a9.094 9.094 0 0 0-3.75-5.25m0 0a9 9 0 1 0-6.75 0 9.094 9.094 0 0 0 6.75 0Z" />
    </svg>
);
export const BuildingLibraryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
    </svg>
);
export const WrenchScrewdriverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

export const AVAILABLE_ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  BookOpenIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  HomeModernIcon,
  BookmarkIcon,
  Squares2X2Icon,
  BriefcaseIcon,
  ChartBarIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ScaleIcon,
  UserIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  PiggyBankIcon,
  ChartPieIcon,
  DocumentTextIcon,
  KeyIcon,
  CurrencyPoundIcon,
  ReceiptPercentIcon,
  LightBulbIcon,
  UsersIcon,
  BuildingLibraryIcon,
  WrenchScrewdriverIcon,
};

const defaultCalculators = [
  { id: CalculatorType.Introduction, defaultNameKey: 'introduction', groupKey: 'essential', defaultIcon: 'BookOpenIcon' },
  { id: CalculatorType.FullUnit, defaultNameKey: 'fullUnit', groupKey: 'essential', defaultIcon: 'CalculatorIcon' },
  { id: CalculatorType.PaymentPlan, defaultNameKey: 'paymentPlan', groupKey: 'essential', defaultIcon: 'CalendarDaysIcon' },
  { id: CalculatorType.Mortgage, defaultNameKey: 'mortgage', groupKey: 'essential', defaultIcon: 'HomeModernIcon' },
  
  { id: CalculatorType.SavedUnits, defaultNameKey: 'savedUnits', groupKey: 'assetManagement', defaultIcon: 'BookmarkIcon' },
  { id: CalculatorType.Dashboard, defaultNameKey: 'dashboard', groupKey: 'assetManagement', defaultIcon: 'Squares2X2Icon' },
  { id: CalculatorType.Portfolio, defaultNameKey: 'portfolio', groupKey: 'assetManagement', defaultIcon: 'BriefcaseIcon' },
  
  { id: CalculatorType.ROI, defaultNameKey: 'roi', groupKey: 'advancedAnalysis', defaultIcon: 'ChartBarIcon' },
  { id: CalculatorType.ROE, defaultNameKey: 'roe', groupKey: 'advancedAnalysis', defaultIcon: 'BanknotesIcon' },
  { id: CalculatorType.CapRate, defaultNameKey: 'capRate', groupKey: 'advancedAnalysis', defaultIcon: 'BuildingOfficeIcon' },
  { id: CalculatorType.Payback, defaultNameKey: 'payback', groupKey: 'advancedAnalysis', defaultIcon: 'ClockIcon' },
  { id: CalculatorType.Appreciation, defaultNameKey: 'appreciation', groupKey: 'advancedAnalysis', defaultIcon: 'ArrowTrendingUpIcon' },
  { id: CalculatorType.NPV, defaultNameKey: 'npv', groupKey: 'advancedAnalysis', defaultIcon: 'ScaleIcon' },
  
  { id: CalculatorType.Profile, defaultNameKey: 'profile', groupKey: 'account', defaultIcon: 'UserIcon' },
  { id: CalculatorType.Settings, defaultNameKey: 'settings', groupKey: 'account', defaultIcon: 'Cog6ToothIcon' },
  { id: CalculatorType.AdminDashboard, defaultNameKey: 'adminDashboard', groupKey: 'administration', defaultIcon: 'ShieldCheckIcon' },
];

export const getCalculators = (t: TFunction, settings?: AppSettings['calculatorSettings']) => {
  const { language } = useTranslation();

  return defaultCalculators.map(calc => {
    const override = settings?.[calc.id];
    
    const name = language === 'ar' 
        ? override?.name_ar || t(`calculators.${calc.defaultNameKey}.name`)
        : override?.name_en || t(`calculators.${calc.defaultNameKey}.name`);

    const iconName = (override && AVAILABLE_ICONS[override.icon]) ? override.icon : calc.defaultIcon;
    
    let iconElement;
    if (override?.customIcon) {
        iconElement = <img src={override.customIcon} className="w-6 h-6 rounded-sm object-cover" alt={name} />;
    } else {
        const IconComponent = AVAILABLE_ICONS[iconName];
        iconElement = <IconComponent className="w-6 h-6" />;
    }

    return {
      id: calc.id,
      name: name,
      group: t(`calculatorGroups.${calc.groupKey}`),
      icon: iconElement,
      iconName,
      tooltip: t(`calculators.${calc.defaultNameKey}.tooltip`),
    };
  });
};