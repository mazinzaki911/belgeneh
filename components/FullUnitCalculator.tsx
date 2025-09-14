import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import ResultDisplay from './shared/ResultDisplay';
import DateInput from './shared/DateInput';
import TextInput from './shared/TextInput';
import SelectInput from './shared/SelectInput';
import ErrorMessage from '../src/components/shared/ErrorMessage';
import { getCalculators, BookmarkIcon, CheckCircleIcon, PlusCircleIcon, ChevronDownIcon, ChevronUpIcon } from '../constants';
import { CalculatorType, SavedUnit, FullUnitData, UnitStatus } from '../types';
import { calculateUnitAnalytics } from '../utils/analytics';
import { useData } from '../src/contexts/DataContext';
import { useUI } from '../src/contexts/UIContext';
import { useToast } from '../src/contexts/ToastContext';
import InfoTooltip from './shared/InfoTooltip';
import { useTranslation } from '../src/contexts/LanguageContext';
import { formatYearsAndMonths } from '../utils/formatters';
import CollapsibleSection from '../src/components/shared/CollapsibleSection';

interface FullUnitCalculatorProps {
    currency: string;
}

const Stepper: React.FC<{ currentStep: number; setStep: (step: number) => void }> = ({ currentStep, setStep }) => {
    const { t } = useTranslation();
    const steps = t('fullUnitCalculator.stepper', { returnObjects: true }) as unknown as string[];
    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((title, index) => {
                const stepNumber = index + 1;
                const isCompleted = currentStep > stepNumber;
                const isActive = currentStep === stepNumber;
                return (
                    <React.Fragment key={stepNumber}>
                        <div className="flex items-center">
                            <button
                                onClick={() => setStep(stepNumber)}
                                className={`flex items-center gap-2 text-right transition-all duration-300 ${isActive ? 'text-primary dark:text-primary-dark' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${isActive ? 'bg-primary-light dark:bg-primary/20 border-primary' : isCompleted ? 'bg-green-100 dark:bg-green-500/20 border-green-500' : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600'}`}>
                                    {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : stepNumber}
                                </div>
                                <span className="hidden sm:block font-semibold">{title}</span>
                            </button>
                        </div>
                        {stepNumber < steps.length && <div className="flex-1 h-0.5 bg-neutral-200 dark:bg-neutral-700 mx-2 sm:mx-4"></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const FullUnitCalculator: React.FC<FullUnitCalculatorProps> = ({ currency }) => {
    const { t, language } = useTranslation();
    const { savedUnits, loadedUnitId, handleSaveUnit, setLoadedUnitId } = useData();
    const { fullUnitCalcInitialStep, setFullUnitCalcInitialStep } = useUI();
    const showToast = useToast();

    const initialFormData: FullUnitData = {
        totalPrice: '', downPaymentPercentage: '', installmentAmount: '', installmentFrequency: '3',
        maintenancePercentage: '', handoverPaymentPercentage: '', contractDate: new Date().toISOString().split('T')[0],
        handoverDate: '', monthlyRent: '', annualRentIncrease: '10', annualOperatingExpenses: '',
        annualAppreciationRate: '20', appreciationYears: '', discountRate: '10'
    };

    const [unitName, setUnitName] = useState('');
    const [formData, setFormData] = useState<FullUnitData>(initialFormData);
    const [currentStep, setCurrentStep] = useState(fullUnitCalcInitialStep || 1);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isStep1Attempted, setIsStep1Attempted] = useState(false);
    
    const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
    const isSaving = useRef(false);

    useEffect(() => {
        if (isSaving.current) {
            isSaving.current = false;
            return;
        }

        const loadedUnit = savedUnits.find(u => u.id === loadedUnitId);
        if (loadedUnit) {
            setUnitName(loadedUnit.name);
            setFormData(loadedUnit.data);
            setCurrentStep(fullUnitCalcInitialStep || 4); // Jump to results if loaded
        } else {
            handleStartOver();
        }
        setFullUnitCalcInitialStep(1); // Reset initial step after use
    }, [loadedUnitId, savedUnits]);

    const validateStep = useCallback((step: number) => {
        const newErrors: Record<string, string> = {};
        if (step === 1) {
            if (!unitName.trim()) newErrors.unitName = t('fullUnitCalculator.errors.unitNameRequired');
        }
        if (step === 2) {
            const p_down = parseFloat(formData.downPaymentPercentage);
            if (p_down > 100) newErrors.downPaymentPercentage = t('fullUnitCalculator.errors.percentageMax');
            if (p_down < 0) newErrors.downPaymentPercentage = t('fullUnitCalculator.errors.percentageMin');

            const p_maint = parseFloat(formData.maintenancePercentage);
            if (p_maint > 100) newErrors.maintenancePercentage = t('fullUnitCalculator.errors.percentageMax');
            if (p_maint < 0) newErrors.maintenancePercentage = t('fullUnitCalculator.errors.percentageMin');

            const p_handover = parseFloat(formData.handoverPaymentPercentage);
            if (p_handover > 100) newErrors.handoverPaymentPercentage = t('fullUnitCalculator.errors.percentageMax');
            if (p_handover < 0) newErrors.handoverPaymentPercentage = t('fullUnitCalculator.errors.percentageMin');

            if (formData.handoverDate && formData.contractDate && new Date(formData.handoverDate) < new Date(formData.contractDate)) {
                newErrors.handoverDate = t('fullUnitCalculator.errors.handoverDateInvalid');
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, unitName, t]);

    useEffect(() => {
        if (currentStep === 1 && !isStep1Attempted) {
          setErrors(prevErrors => {
            if (prevErrors.unitName) {
              const { unitName, ...rest } = prevErrors;
              return rest;
            }
            return prevErrors;
          });
          return;
        }
        validateStep(currentStep);
    }, [currentStep, isStep1Attempted, validateStep]);


    const handleInputChange = (field: keyof FullUnitData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep === 1) {
            setIsStep1Attempted(true);
        }
        if (validateStep(currentStep)) {
            if (currentStep < 4) setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleStartOver = () => {
        setUnitName('');
        setFormData(initialFormData);
        setLoadedUnitId(null);
        setCurrentStep(1);
        setIsStep1Attempted(false);
    };

    const analytics = useMemo(() => calculateUnitAnalytics(formData), [formData]);
    const isSaved = loadedUnitId && savedUnits.some(u => u.id === loadedUnitId);

    const handleSave = () => {
        setIsStep1Attempted(true);
        if (!unitName.trim()) {
            setErrors(prev => ({ ...prev, unitName: t('fullUnitCalculator.errors.unitNameRequired') }));
            setCurrentStep(1);
            return;
        }
        isSaving.current = true;
        const unitToSave: SavedUnit = {
            id: loadedUnitId || `unit-${Date.now()}`,
            name: unitName,
            data: formData,
            status: savedUnits.find(u => u.id === loadedUnitId)?.status || UnitStatus.UnderConsideration
        };
        handleSaveUnit(unitToSave);
        setSaveState('saved');
        setTimeout(() => {
            setSaveState('idle');
        }, 2000);
    };

    const frequencyOptions = useMemo(() => ([
        { label: t('fullUnitCalculator.monthly'), value: 1 },
        { label: t('fullUnitCalculator.quarterly'), value: 3 },
        { label: t('fullUnitCalculator.semiAnnually'), value: 6 },
        { label: t('fullUnitCalculator.annually'), value: 12 },
    ]), [t]);

    const calculatorInfo = useMemo(() => getCalculators(t, language).find(c => c.id === CalculatorType.FullUnit), [t, language]);

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-center text-primary dark:text-primary-dark">{t('fullUnitCalculator.step1Title')}</h3>
                        <div>
                            <TextInput
                                label={t('fullUnitCalculator.unitNameLabel')}
                                value={unitName}
                                onChange={(e) => setUnitName(e.target.value)}
                                placeholder={t('fullUnitCalculator.unitNamePlaceholder')}
                                tooltip={t('fullUnitCalculator.unitNameTooltip')}
                                autoFocus
                            />
                            {isStep1Attempted && errors.unitName && <ErrorMessage message={errors.unitName} />}
                        </div>
                    </div>
                );
            case 2:
                const p_totalPrice = parseFloat(formData.totalPrice) || 0;
                const p_maintenancePercentage = parseFloat(formData.maintenancePercentage) || 0;
                const maintenanceAmount = p_totalPrice * (p_maintenancePercentage / 100);
                const formattedMaintenanceAmount = isFinite(maintenanceAmount) ? maintenanceAmount.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0';

                return (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-center text-primary dark:text-primary-dark">{t('fullUnitCalculator.step2Title')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <NumberInput label={t('fullUnitCalculator.totalPriceLabel')} value={formData.totalPrice} onChange={(e) => handleInputChange('totalPrice', e.target.value)} currency={currency} tooltip={t('fullUnitCalculator.totalPriceTooltip')} />
                            <div>
                                <NumberInput label={t('fullUnitCalculator.downPaymentLabel')} value={formData.downPaymentPercentage} onChange={(e) => handleInputChange('downPaymentPercentage', e.target.value)} unit="%" tooltip={t('fullUnitCalculator.downPaymentTooltip')} error={!!errors.downPaymentPercentage} />
                                <ErrorMessage message={errors.downPaymentPercentage} />
                            </div>
                            <SelectInput label={t('fullUnitCalculator.paymentMethodLabel')} value={formData.installmentFrequency} onChange={(e) => handleInputChange('installmentFrequency', e.target.value)} tooltip={t('fullUnitCalculator.paymentMethodTooltip')}>
                               {frequencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </SelectInput>
                            <NumberInput label={t('fullUnitCalculator.installmentAmountLabel')} value={formData.installmentAmount} onChange={(e) => handleInputChange('installmentAmount', e.target.value)} currency={currency} tooltip={t('fullUnitCalculator.installmentAmountTooltip')} />
                            <div>
                                <NumberInput label={t('fullUnitCalculator.maintenanceDepositLabel')} value={formData.maintenancePercentage} onChange={(e) => handleInputChange('maintenancePercentage', e.target.value)} unit="%" tooltip={t('fullUnitCalculator.maintenanceDepositTooltip')} error={!!errors.maintenancePercentage} />
                                 {p_totalPrice > 0 && p_maintenancePercentage > 0 && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 text-center">
                                        {t('fullUnitCalculator.equalsAmount', { amount: formattedMaintenanceAmount, currency })}
                                    </p>
                                )}
                                <ErrorMessage message={errors.maintenancePercentage} />
                            </div>
                            <div>
                                <NumberInput label={t('fullUnitCalculator.handoverPaymentLabel')} value={formData.handoverPaymentPercentage} onChange={(e) => handleInputChange('handoverPaymentPercentage', e.target.value)} unit="%" tooltip={t('fullUnitCalculator.handoverPaymentTooltip')} error={!!errors.handoverPaymentPercentage} />
                                 <ErrorMessage message={errors.handoverPaymentPercentage} />
                            </div>
                            <DateInput label={t('fullUnitCalculator.contractDateLabel')} value={formData.contractDate} onChange={(e) => handleInputChange('contractDate', e.target.value)} tooltip={t('fullUnitCalculator.contractDateTooltip')} />
                            <div>
                                <DateInput label={t('fullUnitCalculator.handoverDateLabel')} value={formData.handoverDate} onChange={(e) => handleInputChange('handoverDate', e.target.value)} tooltip={t('fullUnitCalculator.handoverDateTooltip')} min={formData.contractDate} />
                                <ErrorMessage message={errors.handoverDate} />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                 return (
                    <div className="space-y-8 animate-fade-in">
                        <h3 className="text-xl font-bold text-center text-primary dark:text-primary-dark">{t('fullUnitCalculator.step3Title')}</h3>
                        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                           <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">{t('fullUnitCalculator.rentAndOpsTitle')}</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                               <NumberInput label={t('fullUnitCalculator.monthlyRentLabel')} value={formData.monthlyRent} onChange={(e) => handleInputChange('monthlyRent', e.target.value)} currency={currency} tooltip={t('fullUnitCalculator.monthlyRentTooltip')} />
                               <NumberInput label={t('fullUnitCalculator.annualRentIncreaseLabel')} value={formData.annualRentIncrease} onChange={(e) => handleInputChange('annualRentIncrease', e.target.value)} unit="%" tooltip={t('fullUnitCalculator.annualRentIncreaseTooltip')} />
                               <div className="sm:col-span-2">
                                   <NumberInput label={t('fullUnitCalculator.annualOpsExpensesLabel')} value={formData.annualOperatingExpenses} onChange={(e) => handleInputChange('annualOperatingExpenses', e.target.value)} currency={currency} tooltip={t('fullUnitCalculator.annualOpsExpensesTooltip')} />
                               </div>
                           </div>
                        </div>
                        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                           <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">{t('fullUnitCalculator.advancedAnalysisTitle')}</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                               <NumberInput label={t('fullUnitCalculator.annualAppreciationRateLabel')} value={formData.annualAppreciationRate} onChange={(e) => handleInputChange('annualAppreciationRate', e.target.value)} unit="%" tooltip={t('fullUnitCalculator.annualAppreciationRateTooltip')} />
                               <NumberInput label={t('fullUnitCalculator.priceProjectionTermLabel')} value={formData.appreciationYears} onChange={(e) => handleInputChange('appreciationYears', e.target.value)} unit={t('common.years')} tooltip={t('fullUnitCalculator.priceProjectionTermTooltip')} />
                               <div className="sm:col-span-2">
                                  <NumberInput label={t('fullUnitCalculator.discountRateNpvLabel')} value={formData.discountRate} onChange={(e) => handleInputChange('discountRate', e.target.value)} unit="%" tooltip={t('fullUnitCalculator.discountRateNpvTooltip')} />
                               </div>
                           </div>
                        </div>
                    </div>
                );
            case 4:
                return <ResultsView analytics={analytics} currency={currency} unitName={unitName} />;
            default:
                return null;
        }
    };
    
    const isStep1Invalid = !unitName.trim();
    const isStep2Invalid = Object.keys(errors).length > 0 || !formData.totalPrice;

    return (
      <div>
        <CalculatorCard
            title={currentStep === 4 ? t('fullUnitCalculator.step4Title') : calculatorInfo?.name || ''}
            description={currentStep < 4 ? calculatorInfo?.tooltip || '' : unitName}
            icon={calculatorInfo?.icon}
        >
            {currentStep < 4 && <Stepper currentStep={currentStep} setStep={(s) => { if(validateStep(currentStep)) setCurrentStep(s); }} />}
            
            {renderStep()}

            {currentStep < 4 && (
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {currentStep > 1 && (
                        <button onClick={prevStep} className="w-full sm:w-auto px-6 py-3 font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">{t('common.previous')}</button>
                    )}
                    <div className="relative group w-full sm:w-auto" style={{ marginLeft: currentStep === 1 ? 'auto' : ''}}>
                       <button onClick={nextStep} disabled={(currentStep === 1 && isStep1Invalid) || (currentStep === 2 && isStep2Invalid)} className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed">{t('common.next')}</button>
                        {(currentStep === 1 && isStep1Invalid) && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-neutral-700 text-white text-xs rounded py-1 px-2 invisible group-hover:visible">{t('fullUnitCalculator.errors.step1InvalidTooltip')}</span>}
                        {(currentStep === 2 && isStep2Invalid) && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-neutral-700 text-white text-xs rounded py-1 px-2 invisible group-hover:visible">{isStep2Invalid && !formData.totalPrice ? t('fullUnitCalculator.errors.step2IncompleteTooltip') : t('fullUnitCalculator.errors.step2InvalidTooltip')}</span>}
                    </div>
                </div>
            )}
        </CalculatorCard>
        
        {currentStep === 4 && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg flex flex-wrap justify-center items-center gap-3">
                 <button
                    onClick={handleSave}
                    disabled={saveState === 'saved'}
                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white rounded-lg transition-colors ${
                        saveState === 'saved'
                        ? 'bg-teal-500 cursor-default'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                 >
                    {saveState === 'saved' ? (
                        <>
                            <CheckCircleIcon className="w-5 h-5" />
                            <span>{t('fullUnitCalculator.saveButtonSaved')}</span>
                        </>
                    ) : (
                        <>
                            {isSaved ? <CheckCircleIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                            <span>{isSaved ? t('fullUnitCalculator.saveButtonUpdate') : t('fullUnitCalculator.saveButtonSave')}</span>
                        </>
                    )}
                </button>
                 <button onClick={handleStartOver} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>{t('fullUnitCalculator.newAnalysisButton')}</span>
                </button>
            </div>
        )}
      </div>
    );
};


const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const ResultsView: React.FC<{analytics: ReturnType<typeof calculateUnitAnalytics>, currency: string, unitName: string}> = ({analytics, currency, unitName}) => {
    const { t, language } = useTranslation();
    const [projectionYears, setProjectionYears] = useState(10);

    const { formatted, analysis, showAdvancedMetrics, showAppreciation, showNpv, hasRent, raw } = analytics;
    
    const analysisItems = [
        { key: 'roi', label: t('fullUnitCalculator.roiLabel'), value: formatted.roi, tooltip: t('fullUnitCalculator.roiTooltip'), analysis: analysis.roi, show: showAdvancedMetrics },
        { key: 'roe', label: t('fullUnitCalculator.roeLabel'), value: formatted.roe, tooltip: t('fullUnitCalculator.roeTooltip'), analysis: analysis.roe, show: showAdvancedMetrics },
        { key: 'capRate', label: t('fullUnitCalculator.capRateLabel'), value: formatted.capRate, tooltip: t('fullUnitCalculator.capRateTooltip'), analysis: analysis.capRate, show: showAdvancedMetrics },
        { key: 'paybackPeriod', label: t('fullUnitCalculator.totalPaybackPeriodLabel'), value: formatYearsAndMonths(analytics.raw.totalPaybackPeriodFromContract, t), unit: '', tooltip: t('fullUnitCalculator.totalPaybackPeriodTooltip'), analysis: analysis.paybackPeriod, show: hasRent },
    ];

    const longTermItems = [
        { 
            key: 'futureValue',
            label: raw.appreciationYears > 0 ? t('fullUnitCalculator.futureValueLabel', { years: raw.appreciationYears }) : t('fullUnitCalculator.futureValueLabelSimple'), 
            value: formatted.futureValue, 
            unit: currency, 
            tooltip: raw.appreciationYears > 0 ? t('fullUnitCalculator.futureValueTooltip', { years: raw.appreciationYears }) : t('fullUnitCalculator.futureValueTooltipSimple'), 
            analysis: null, 
            show: showAppreciation 
        },
        { key: 'npv', label: t('fullUnitCalculator.npvLabel'), value: formatted.npv, unit: currency, tooltip: t('fullUnitCalculator.npvTooltip'), analysis: analysis.npv, show: showNpv }
    ];

    const breakEvenYear = useMemo(() => {
        const breakEvenRow = analytics.cashFlowProjection[20].find(row => row.cumulativeCashFlow >= 0);
        return breakEvenRow ? breakEvenRow.year : null;
    }, [analytics.cashFlowProjection]);

    return (
        <div className="space-y-6 animate-fade-in">
            <CollapsibleSection title={t('fullUnitCalculator.results.keyMetrics')} isOpenByDefault>
                <div className="space-y-6">
                    <ResultDisplay label={t('fullUnitCalculator.totalCostLabel')} value={formatted.totalCost} unit={currency} tooltip={t('fullUnitCalculator.totalCostTooltip')} />
                    <ResultDisplay label={t('fullUnitCalculator.paidUntilHandoverLabel')} value={formatted.paidUntilHandover} unit={currency} tooltip={t('fullUnitCalculator.paidUntilHandoverTooltip')} />
                    {analysisItems.filter(item => item.show).map(item => (
                        <div key={item.key}>
                            <ResultDisplay label={item.label} value={item.value} unit={item.unit ?? '%'} tooltip={item.tooltip} />
                            {item.analysis && (
                                <div className={`mt-4 p-4 rounded-lg border ${item.analysis.colorClasses}`}>
                                    <h3 className="font-bold text-lg mb-1">{t(`analysis.${item.key}.${item.analysis.ratingKey}.rating`)}</h3>
                                    <p className="text-sm" dangerouslySetInnerHTML={{__html: t(`analysis.${item.key}.${item.analysis.ratingKey}.description`, {amount: `<strong>${item.value}</strong>`, currency: `<strong>${currency}</strong>`})}}/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {(showAppreciation || showNpv) && (
                <CollapsibleSection title={t('fullUnitCalculator.results.longTerm')}>
                     <div className="space-y-6">
                        {longTermItems.filter(item => item.show).map(item => (
                            <div key={item.key}>
                                <ResultDisplay label={item.label} value={item.value} unit={item.unit} tooltip={item.tooltip} />
                                {item.analysis && (
                                     <div className={`mt-4 p-4 rounded-lg border ${item.analysis.colorClasses}`}>
                                        <h3 className="font-bold text-lg mb-1">{t(`analysis.${item.key}.${item.analysis.ratingKey}.rating`)}</h3>
                                        <p className="text-sm" dangerouslySetInnerHTML={{__html: t(`analysis.${item.key}.${item.analysis.ratingKey}.description`, {amount: `<strong>${item.value}</strong>`, currency: `<strong>${currency}</strong>`})}}/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {hasRent && (
                <CollapsibleSection title={t('fullUnitCalculator.results.cashFlow')}>
                    <div className="flex justify-center items-center gap-3 text-primary dark:text-primary-dark mb-2">
                        <ChartBarIcon className="w-8 h-8"/>
                        <h3 className="text-2xl font-bold text-center">{t('fullUnitCalculator.cashFlowProjectionTitle')}</h3>
                    </div>
                    <p className="text-center text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-6 text-sm">
                        {t('fullUnitCalculator.cashFlowProjectionDescription')}
                    </p>
                    <div className="overflow-x-auto custom-scrollbar">
                       <div className="flex justify-center gap-2 mb-4 p-1 bg-neutral-200 dark:bg-neutral-900/50 rounded-full mx-auto w-fit">
                            {[5, 10, 15, 20].map(year => (
                                <button 
                                    key={year} 
                                    onClick={() => setProjectionYears(year)} 
                                    className={`px-5 py-1.5 rounded-full font-semibold text-sm transition-all duration-300 ${projectionYears === year ? 'bg-white dark:bg-neutral-700 text-primary shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-neutral-700/60'}`}
                                >
                                    {language === 'ar' ? `${year} ${t(year >= 11 ? 'common.year' : 'common.years')}` : `${year} ${t('common.years')}`}
                                </button>
                            ))}
                       </div>
                       <table className="w-full min-w-max text-center">
                           <thead className="border-b-2 border-neutral-200 dark:border-neutral-700">
                               <tr className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.year')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.rent')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.expenses')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.installments')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.netCashFlow')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.cumulative')}</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                               {analytics.cashFlowProjection[projectionYears].map((row: any) => (
                                   <tr key={row.year} className={`text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 ${row.year === 0 ? 'bg-neutral-100 dark:bg-neutral-700/50 font-medium' : ''}`}>
                                       <td className="p-2 font-semibold">{row.year === 0 ? t('fullUnitCalculator.handoverYearLabel') : row.year}</td>
                                       <td className="p-2">{row.rent > 0 ? row.rent.toLocaleString('en-US', {maximumFractionDigits: 0}) : '-'}</td>
                                       <td className="p-2 text-amber-600 dark:text-amber-400">{row.expenses > 0 ? `-${row.expenses.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-'}</td>
                                       <td className="p-2 text-red-600 dark:text-red-400">{row.installments > 0 ? `-${row.installments.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-'}</td>
                                       <td className={`p-2 font-bold ${row.netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{row.netCashFlow.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                       <td className={`p-2 font-bold ${row.cumulativeCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{row.cumulativeCashFlow.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                    </div>
                     <div className="mt-6 text-center text-sm p-4 bg-primary-light dark:bg-primary/10 rounded-lg border border-primary/20">
                        {breakEvenYear !== null ? (
                             <p className="font-semibold text-neutral-700 dark:text-neutral-200" dangerouslySetInnerHTML={{ __html: t('fullUnitCalculator.cashFlowSummary', { breakEvenYear: breakEvenYear === 0 ? t('fullUnitCalculator.withinFirstYear') : breakEvenYear }) }}/>
                        ) : (
                            <p className="font-semibold text-neutral-700 dark:text-neutral-200" dangerouslySetInnerHTML={{ __html: t('fullUnitCalculator.cashFlowSummaryNotPositive', { projectionYears: 20 }) }}/>
                        )}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}

export default FullUnitCalculator;