
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { CalculatorType } from '../../types';

interface TourStep {
  target?: string;
  titleKey: string;
  contentKey: string;
}

interface OnboardingTourProps {
  onComplete: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, setIsSidebarOpen }) => {
    const { t } = useTranslation();
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    const steps: TourStep[] = useMemo(() => [
        { titleKey: 'welcome.title', contentKey: 'welcome.content' },
        { target: '#onboarding-sidebar-nav', titleKey: 'sidebar.title', contentKey: 'sidebar.content' },
        { target: `#onboarding-tool-${CalculatorType.Introduction}`, titleKey: 'introduction.title', contentKey: 'introduction.content' },
        { target: `#onboarding-tool-${CalculatorType.FullUnit}`, titleKey: 'fullUnit.title', contentKey: 'fullUnit.content' },
        { target: `#onboarding-tool-${CalculatorType.PaymentPlan}`, titleKey: 'paymentPlan.title', contentKey: 'paymentPlan.content' },
        { target: `#onboarding-tool-${CalculatorType.Mortgage}`, titleKey: 'mortgage.title', contentKey: 'mortgage.content' },
        { target: `#onboarding-tool-${CalculatorType.SavedUnits}`, titleKey: 'savedUnits.title', contentKey: 'savedUnits.content' },
        { target: `#onboarding-tool-${CalculatorType.Dashboard}`, titleKey: 'dashboard.title', contentKey: 'dashboard.content' },
        { target: `#onboarding-tool-${CalculatorType.Portfolio}`, titleKey: 'portfolio.title', contentKey: 'portfolio.content' },
        { target: `#onboarding-tool-${CalculatorType.ROI}`, titleKey: 'roi.title', contentKey: 'roi.content' },
        { target: `#onboarding-tool-${CalculatorType.ROE}`, titleKey: 'roe.title', contentKey: 'roe.content' },
        { target: `#onboarding-tool-${CalculatorType.CapRate}`, titleKey: 'capRate.title', contentKey: 'capRate.content' },
        { target: `#onboarding-tool-${CalculatorType.Payback}`, titleKey: 'payback.title', contentKey: 'payback.content' },
        { target: `#onboarding-tool-${CalculatorType.Appreciation}`, titleKey: 'appreciation.title', contentKey: 'appreciation.content' },
        { target: `#onboarding-tool-${CalculatorType.NPV}`, titleKey: 'npv.title', contentKey: 'npv.content' },
        { titleKey: 'finishTour.title', contentKey: 'finishTour.content' },
    ], [t]);

    const currentStep = steps[stepIndex];

    const calculateAndSetPositions = useCallback((elementRect: DOMRect | null) => {
        if (!elementRect) {
            setTargetRect(null);
            setTooltipStyle({
                opacity: 1,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            });
            return;
        }

        setTargetRect(elementRect);

        const tooltipNode = tooltipRef.current;
        if (!tooltipNode) return;

        const { innerWidth: vw, innerHeight: vh } = window;
        const margin = 16;
        const { width: tooltipWidth, height: tooltipHeight } = tooltipNode.getBoundingClientRect();
        
        let top = elementRect.bottom + margin;
        if (top + tooltipHeight > vh - margin && elementRect.top - tooltipHeight - margin > margin) {
            top = elementRect.top - tooltipHeight - margin;
        }

        let left = elementRect.left + elementRect.width / 2 - tooltipWidth / 2;

        if (left < margin) left = margin;
        if (left + tooltipWidth > vw - margin) left = vw - tooltipWidth - margin;
        if (top < margin) top = margin;
        if (top + tooltipHeight > vh - margin) top = vh - tooltipHeight - margin;

        setTooltipStyle({
            opacity: 1,
            top: `${top}px`,
            left: `${left}px`,
        });

    }, [tooltipRef]);

    useEffect(() => {
        const runPositioningLogic = () => {
            const targetSelector = currentStep.target;
            if (!targetSelector) {
                setTimeout(() => calculateAndSetPositions(null), 50);
                return;
            }

            const element = document.querySelector(targetSelector);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                
                setTimeout(() => {
                    const finalElement = document.querySelector(targetSelector);
                    if (finalElement) {
                        calculateAndSetPositions(finalElement.getBoundingClientRect());
                    } else {
                        calculateAndSetPositions(null);
                    }
                }, 300); // Wait for scroll to finish
            } else {
                calculateAndSetPositions(null);
            }
        };
        
        setTooltipStyle({ opacity: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

        const isMobile = window.innerWidth < 768;
        const isSidebarTarget = currentStep.target?.startsWith('#onboarding-tool-') || currentStep.target?.startsWith('#onboarding-sidebar');

        if (isMobile && isSidebarTarget) {
            setIsSidebarOpen(true);
            setTimeout(runPositioningLogic, 400); // Wait for sidebar animation
        } else {
            if (isMobile) setIsSidebarOpen(false);
            runPositioningLogic();
        }

    }, [stepIndex, currentStep, setIsSidebarOpen, calculateAndSetPositions]);
    
    useEffect(() => {
        const handleResize = () => {
             const element = currentStep.target ? document.querySelector(currentStep.target) : null;
             calculateAndSetPositions(element ? element.getBoundingClientRect() : null);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentStep, calculateAndSetPositions]);

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

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={onComplete}></div>
            
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

            <div
                ref={tooltipRef}
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
