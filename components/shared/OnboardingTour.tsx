import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { CalculatorType } from '../../types';

interface TourStep {
  target?: string;
  titleKey: string;
  contentKey: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const { t, isRtl } = useTranslation();
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const steps: TourStep[] = useMemo(() => [
        { titleKey: 'welcome.title', contentKey: 'welcome.content' },
        { target: '#onboarding-sidebar-nav', titleKey: 'sidebar.title', contentKey: 'sidebar.content', placement: isRtl ? 'left' : 'right' },
        { target: `#onboarding-tool-${CalculatorType.FullUnit}`, titleKey: 'fullUnit.title', contentKey: 'fullUnit.content', placement: isRtl ? 'left' : 'right' },
        { target: `#onboarding-tool-${CalculatorType.SavedUnits}`, titleKey: 'savedUnits.title', contentKey: 'savedUnits.content', placement: isRtl ? 'left' : 'right' },
        { target: `#onboarding-tool-${CalculatorType.Dashboard}`, titleKey: 'dashboard.title', contentKey: 'dashboard.content', placement: isRtl ? 'left' : 'right' },
        { target: `#onboarding-tool-${CalculatorType.Portfolio}`, titleKey: 'portfolio.title', contentKey: 'portfolio.content', placement: isRtl ? 'left' : 'right' },
        { titleKey: 'finishTour.title', contentKey: 'finishTour.content' },
    ], [isRtl]);

    const currentStep = steps[stepIndex];

    const updateTargetRect = useCallback(() => {
        if (currentStep?.target) {
            const element = document.querySelector(currentStep.target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Timeout to wait for scroll to finish
                setTimeout(() => {
                    setTargetRect(element.getBoundingClientRect());
                }, 300);
            } else {
                setTargetRect(null);
            }
        } else {
            setTargetRect(null);
        }
    }, [currentStep]);

    useEffect(() => {
        updateTargetRect();
        window.addEventListener('resize', updateTargetRect);
        return () => window.removeEventListener('resize', updateTargetRect);
    }, [stepIndex, updateTargetRect]);

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
        }
    };

    const isCentered = !currentStep.target || !targetRect;

    const tooltipStyle: React.CSSProperties = isCentered || !targetRect ? {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    } : {
        top: targetRect.bottom + 10,
        left: targetRect.left + targetRect.width / 2,
        transform: 'translateX(-50%)',
    };

    if (!isCentered && targetRect) {
      if (currentStep.placement === 'right') {
          tooltipStyle.top = targetRect.top;
          tooltipStyle.left = targetRect.right + 15;
          tooltipStyle.transform = 'translateY(0)';
      } else if (currentStep.placement === 'left') {
          tooltipStyle.top = targetRect.top;
          tooltipStyle.left = targetRect.left - 15;
          tooltipStyle.transform = 'translateX(-100%)';
      }
    }


    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={onComplete}></div>
            
            {/* Highlight Box */}
            {targetRect && (
                <div
                    className="absolute rounded-lg border-2 border-primary border-dashed transition-all duration-300 pointer-events-none"
                    style={{
                        top: targetRect.top - 5,
                        left: targetRect.left - 5,
                        width: targetRect.width + 10,
                        height: targetRect.height + 10,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
                    }}
                ></div>
            )}

            {/* Tooltip */}
            <div
                className={`absolute bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-6 w-80 transition-all duration-300 animate-fade-in-dropdown`}
                style={tooltipStyle}
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-primary dark:text-primary-dark mb-2">{t(`onboarding.${currentStep.titleKey}`)}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">{t(`onboarding.${currentStep.contentKey}`)}</p>

                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-400">
                        {t('onboarding.stepOf', { current: stepIndex + 1, total: steps.length })}
                    </span>
                    <div className="flex items-center gap-2">
                        {stepIndex > 0 && (
                             <button onClick={onComplete} className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200">
                                {t('onboarding.skip')}
                            </button>
                        )}
                        {stepIndex > 0 && (
                            <button onClick={handlePrev} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600">
                                {t('common.previous')}
                            </button>
                        )}
                        <button onClick={handleNext} className="px-3 py-1.5 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary/90">
                            {stepIndex === steps.length - 1 ? t('onboarding.finish') : t('common.next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
