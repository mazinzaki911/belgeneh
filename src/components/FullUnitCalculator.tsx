import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import { getCalculators, DocumentArrowDownIcon, CheckCircleIcon, PlusCircleIcon, ArrowLeftIcon, AVAILABLE_ICONS, LightBulbIcon } from '../constants';
import { CalculatorType, SavedUnit, UnitStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from '../contexts/LanguageContext';
import { useAppSettings } from '../contexts/AppSettingsContext';
import ResultsPDF from './shared/ResultsPDF';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateUUID } from '../utils/uuid';

import { useFullUnitCalculatorState } from './full-unit-calculator/useFullUnitCalculatorState';
import FullUnitCalculatorStepper from './full-unit-calculator/FullUnitCalculatorStepper';
import FullUnitCalculatorStep1 from './full-unit-calculator/FullUnitCalculatorStep1';
import FullUnitCalculatorStep2 from './full-unit-calculator/FullUnitCalculatorStep2';
import FullUnitCalculatorStep3 from './full-unit-calculator/FullUnitCalculatorStep3';
import FullUnitCalculatorResults from './full-unit-calculator/FullUnitCalculatorResults';

interface FullUnitCalculatorProps {
    currency: string;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const FullUnitCalculator: React.FC<FullUnitCalculatorProps> = ({ currency }) => {
    const { t, language, isRtl } = useTranslation();
    const { savedUnits, loadedUnitId, handleSaveUnit, setLoadedUnitId } = useData();
    const { fullUnitCalcInitialStep, setFullUnitCalcInitialStep, fullUnitCurrentStep, setFullUnitCurrentStep } = useUI();
    const appSettings = useAppSettings();
    const { actionIcons } = appSettings;
    const showToast = useToast();

    const { state, dispatch } = useFullUnitCalculatorState(fullUnitCalcInitialStep);
    const { unitName, formData, currentStep, maxStepReached, errors, isStep1Attempted, analytics, autosavedData } = state;

    const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
    const isSaving = useRef(false);
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);
    
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isActionBarVisible, setIsActionBarVisible] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const pdfContentRef = useRef<HTMLDivElement>(null);

    const SaveIcon = useMemo(() => AVAILABLE_ICONS[actionIcons?.saveAnalysis] || DocumentArrowDownIcon, [actionIcons]);
    const NewAnalysisIcon = useMemo(() => AVAILABLE_ICONS[actionIcons?.newAnalysis] || PlusCircleIcon, [actionIcons]);
    const ExportPdfIcon = useMemo(() => AVAILABLE_ICONS[actionIcons?.exportPdf] || DocumentArrowDownIcon, [actionIcons]);

    useEffect(() => {
        if (autosavedData) {
            setShowRestorePrompt(true);
        }
    }, [autosavedData]);

    useEffect(() => {
        const isPristine = !unitName.trim() && !formData.totalPrice.trim();
        if (isPristine || showRestorePrompt) {
            return;
        }

        const dataToSave = {
            unitName,
            formData,
            currentStep,
            maxStepReached,
        };
        localStorage.setItem('fullUnitCalculator_autosave', JSON.stringify(dataToSave));
    }, [unitName, formData, currentStep, maxStepReached, showRestorePrompt]);


    const handleStartOver = useCallback(() => {
        dispatch({ type: 'RESET_STATE' });
        setLoadedUnitId(null);
        localStorage.removeItem('fullUnitCalculator_autosave');
    }, [dispatch, setLoadedUnitId]);
    
    useEffect(() => {
        if (isSaving.current) {
            isSaving.current = false;
            return;
        }

        const loadedUnit = savedUnits.find(u => u.id === loadedUnitId);
        if (loadedUnit) {
            dispatch({ type: 'LOAD_UNIT', payload: { unit: loadedUnit, initialStep: fullUnitCalcInitialStep } });
        } else if (!showRestorePrompt) { 
            handleStartOver();
        }
        setFullUnitCalcInitialStep(1); 
    }, [loadedUnitId, savedUnits, handleStartOver, setFullUnitCalcInitialStep, showRestorePrompt, dispatch, fullUnitCalcInitialStep]);

    const nextStep = () => {
        dispatch({ type: 'NEXT_STEP', payload: { t } });
    };

    const prevStep = () => {
        dispatch({ type: 'PREV_STEP' });
    };

    const handleSetStep = (targetStep: number) => {
        dispatch({ type: 'SET_STEP', payload: targetStep });
    };

    const isSaved = loadedUnitId && savedUnits.some(u => u.id === loadedUnitId);

    const handleSave = async () => {
        if (!unitName.trim()) {
            dispatch({ type: 'VALIDATE_AND_SET_ERROR', payload: { t } });
            return;
        }

        try {
            isSaving.current = true;
            const unitToSave: SavedUnit = {
                id: loadedUnitId || generateUUID(),
                name: unitName,
                data: formData,
                status: savedUnits.find(u => u.id === loadedUnitId)?.status || UnitStatus.UnderConsideration
            };
            await handleSaveUnit(unitToSave);
            localStorage.removeItem('fullUnitCalculator_autosave');
            setSaveState('saved');
            showToast(t('fullUnitCalculator.saveSuccess') || 'Saved successfully!', 'success');
            setTimeout(() => setSaveState('idle'), 2000);
        } catch (error) {
            console.error('Error saving unit:', error);
            showToast(t('fullUnitCalculator.saveError') || 'Failed to save. Please try again.', 'error');
            isSaving.current = false;
        }
    };

    const handleRestore = () => {
        if (autosavedData) {
            dispatch({ type: 'RESTORE_STATE', payload: autosavedData });
            setShowRestorePrompt(false);
            showToast(t('fullUnitCalculator.restore.successToast'), 'success');
        }
    };

    const handleDismissRestore = () => {
        handleStartOver();
        setShowRestorePrompt(false);
    };

    const handleExportPdf = async () => {
        if (!pdfContentRef.current || isExportingPdf) return;
        setIsExportingPdf(true);

        try {
            const canvas = await html2canvas(pdfContentRef.current, { scale: 2, useCORS: true });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
    
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
    
            const ratio = canvasWidth / canvasHeight;
            let imgWidth = pdfWidth - 40;
            let imgHeight = imgWidth / ratio;
            
            if (imgHeight > pdfHeight - 40) {
                imgHeight = pdfHeight - 40;
                imgWidth = imgHeight * ratio;
            }
    
            const x = (pdfWidth - imgWidth) / 2;
            const y = 20;
    
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`${unitName.replace(/ /g, '_')}_Analysis.pdf`);

        } catch (err: any) {
            console.error("Error exporting PDF:", err);
            showToast(t('fullUnitCalculator.pdf.errorToastLibNotLoaded'), 'error');
        } finally {
            setIsExportingPdf(false);
        }
    };
    
    const calculatorInfo = useMemo(() => getCalculators(t, language, appSettings).find(c => c.id === CalculatorType.FullUnit), [t, language, appSettings]);

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <FullUnitCalculatorStep1 unitName={unitName} dispatch={dispatch} isStep1Attempted={isStep1Attempted} errors={errors} />;
            case 2:
                return <FullUnitCalculatorStep2 formData={formData} dispatch={dispatch} errors={errors} currency={currency} />;
            case 3:
                return <FullUnitCalculatorStep3 formData={formData} dispatch={dispatch} currency={currency} />;
            case 4:
                return <FullUnitCalculatorResults analytics={analytics} currency={currency} unitName={unitName} />;
            default:
                return null;
        }
    };
    
    useEffect(() => {
        setFullUnitCurrentStep(currentStep);
    }, [currentStep, setFullUnitCurrentStep]);
    
    useEffect(() => {
       dispatch({ type: 'SET_STEP', payload: fullUnitCurrentStep });
    }, []);

    useEffect(() => {
        if (currentStep !== 4) {
          setIsActionBarVisible(false);
          return;
        }
    
        const mainElement = calculatorRef.current?.closest('main');
        if (!mainElement) return;
    
        const checkScroll = () => {
            const isScrolled = mainElement.scrollTop > 50;
            const isContentShort = mainElement.scrollHeight <= mainElement.clientHeight;
            setIsActionBarVisible(isScrolled || isContentShort);
        };
        
        checkScroll();
        const resizeObserver = new ResizeObserver(checkScroll);
        resizeObserver.observe(mainElement);
        mainElement.addEventListener('scroll', checkScroll, { passive: true });
    
        return () => {
          mainElement.removeEventListener('scroll', checkScroll);
          resizeObserver.disconnect();
        };
    }, [currentStep]);

    const isStep1Invalid = isStep1Attempted && !unitName.trim();
    const isStep2Invalid = Object.keys(errors).length > 0 || !formData.totalPrice;

    return (
      <div ref={calculatorRef}>
        <ResultsPDF ref={pdfContentRef} analytics={analytics} currency={currency} unitName={unitName} />
        <CalculatorCard
            title={currentStep === 4 ? t('fullUnitCalculator.step4Title') : calculatorInfo?.name || ''}
            description={currentStep < 4 ? calculatorInfo?.tooltip || '' : unitName}
            icon={calculatorInfo?.icon}
        >
            {showRestorePrompt && (
                <div className="mb-6 p-4 bg-sky-50 dark:bg-sky-900/50 border-l-4 border-sky-500 rounded-r-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <LightBulbIcon className="w-6 h-6 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                        <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">{t('fullUnitCalculator.restore.prompt')}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={handleRestore} className="px-3 py-1.5 text-sm font-bold text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors">{t('fullUnitCalculator.restore.restoreButton')}</button>
                        <button onClick={handleDismissRestore} className="px-3 py-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">{t('fullUnitCalculator.restore.discardButton')}</button>
                    </div>
                </div>
            )}
            
            <FullUnitCalculatorStepper currentStep={currentStep} maxStepReached={maxStepReached} setStep={handleSetStep} />
            
            {renderStep()}

            {currentStep < 4 && (
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {currentStep > 1 && (
                        <button onClick={prevStep} className="w-full sm:w-auto px-6 py-3 font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">{t('common.previous')}</button>
                    )}
                    <div className="relative group w-full sm:w-auto" style={{ marginLeft: currentStep === 1 ? 'auto' : ''}}>
                       <button onClick={nextStep} disabled={(currentStep === 1 && isStep1Invalid) || (currentStep === 2 && isStep2Invalid)} className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed">{currentStep === 3 ? t('common.viewResults') : t('common.next')}</button>
                        {(currentStep === 1 && isStep1Invalid) && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-neutral-700 text-white text-xs rounded py-1 px-2 invisible group-hover:visible">{t('fullUnitCalculator.errors.step1InvalidTooltip')}</span>}
                        {(currentStep === 2 && isStep2Invalid) && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-neutral-700 text-white text-xs rounded py-1 px-2 invisible group-hover:visible">{isStep2Invalid && !formData.totalPrice ? t('fullUnitCalculator.errors.step2IncompleteTooltip') : t('fullUnitCalculator.errors.step2InvalidTooltip')}</span>}
                    </div>
                </div>
            )}
        </CalculatorCard>
        
        {currentStep === 4 && (
             <div className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${isActionBarVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className={`border-t border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm ${isRtl ? 'md:right-72' : 'md:left-72'}`}>
                    <div className="max-w-2xl mx-auto p-2 sm:p-4 flex flex-wrap justify-center items-center gap-3">
                        <button
                            onClick={prevStep}
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span>{t('common.previous')}</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saveState === 'saved'}
                            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white rounded-lg transition-colors ${
                                saveState === 'saved'
                                ? 'bg-teal-500 cursor-default'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {saveState === 'saved' ? (
                                <>
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <span>{t('fullUnitCalculator.saveButtonSaved')}</span>
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="w-6 h-6" />
                                    <span>{isSaved ? t('fullUnitCalculator.saveButtonUpdate') : t('fullUnitCalculator.saveButtonSave')}</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleExportPdf}
                            disabled={isExportingPdf}
                            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white rounded-lg transition-colors bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                        >
                            {isExportingPdf ? (
                                <>
                                    <LoadingSpinner />
                                    <span>{t('fullUnitCalculator.pdf.exporting')}</span>
                                </>
                            ) : (
                                <>
                                    <ExportPdfIcon className="w-6 h-6" />
                                    <span>{t('fullUnitCalculator.pdf.exportPdfButton')}</span>
                                </>
                            )}
                        </button>
                        <button onClick={handleStartOver} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                            <NewAnalysisIcon className="w-6 h-6" />
                            <span>{t('fullUnitCalculator.newAnalysisButton')}</span>
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
};