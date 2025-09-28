import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

interface FullUnitCalculatorStepperProps {
    currentStep: number;
    maxStepReached: number;
    setStep: (step: number) => void;
}

const CheckmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
    </svg>
);

const FullUnitCalculatorStepper: React.FC<FullUnitCalculatorStepperProps> = ({ currentStep, maxStepReached, setStep }) => {
    const { t } = useTranslation();
    const steps = t('fullUnitCalculator.stepper', { returnObjects: true }) as unknown as string[];
    
    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((title, index) => {
                const stepNumber = index + 1;
                const isCompleted = maxStepReached > stepNumber;
                const isActive = currentStep === stepNumber;
                const isClickable = stepNumber <= maxStepReached;

                const circleBaseClasses = 'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300';
                const circleStateClasses = isActive
                    ? 'bg-primary border-primary text-white'
                    : isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300';

                const labelStateClasses = isActive
                    ? 'text-primary dark:text-primary-dark'
                    : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300';
                
                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex items-center">
                            <button
                                onClick={() => isClickable && setStep(stepNumber)}
                                disabled={!isClickable}
                                className={`group flex items-center gap-2 text-right transition-all duration-300 ${!isClickable ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                                <div className={`${circleBaseClasses} ${circleStateClasses}`}>
                                    {isCompleted ? (
                                        <CheckmarkIcon className="w-5 h-5" />
                                    ) : (
                                        <span className="font-bold">
                                            {stepNumber}
                                        </span>
                                    )}
                                </div>
                                <span className={`hidden sm:block font-semibold ${labelStateClasses}`}>{title}</span>
                            </button>
                        </div>
                        {stepNumber < steps.length && <div className="flex-1 h-0.5 bg-neutral-200 dark:bg-neutral-700 mx-2 sm:mx-4"></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default FullUnitCalculatorStepper;