import React, { useState, useMemo, useEffect } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import DateInput from './shared/DateInput';
import SelectInput from './shared/SelectInput';
import { getCalculators } from '../constants';
import { CalculatorType } from '../types';
import ErrorMessage from '../src/components/shared/ErrorMessage';
import { useTranslation } from '../src/contexts/LanguageContext';

interface PaymentPlanCalculatorProps {
    currency: string;
}

type Payment = {
    name: string;
    date: Date;
    percent: number;
    amount: number;
    isInstallment: boolean;
    index?: number;
};

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);
  
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.716C7.59 2.25 6.68 3.16 6.68 4.334v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const WandSparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-2.25-1.328l-4.148.932a.5.5 0 0 0-.03.962l1.591 5.961a3 3 0 0 0 2.25 1.328l4.148-.932a.5.5 0 0 0 .03-.962l-1.59-5.962a3 3 0 0 0-2.25-1.328Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.53 16.122a3 3 0 0 0-2.25-1.328l-4.148.932a.5.5 0 0 0-.03.962l1.591 5.961a3 3 0 0 0 2.25 1.328l4.148-.932a.5.5 0 0 0 .03-.962l-1.59-5.962a3 3 0 0 0-2.25-1.328Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.009 2.245a3 3 0 0 0-2.25-1.328l-4.148.932a.5.5 0 0 0-.03.962l1.591 5.961a3 3 0 0 0 2.25 1.328l4.148-.932a.5.5 0 0 0 .03-.962l-1.59-5.962a3 3 0 0 0-2.25-1.328Z" />
    </svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const PaymentPlanCalculator: React.FC<PaymentPlanCalculatorProps> = ({ currency }) => {
    const { t } = useTranslation();
    const [unitAmount, setUnitAmount] = useState('');
    const [downPaymentPercent, setDownPaymentPercent] = useState('');
    const [maintenancePercentage, setMaintenancePercentage] = useState('');
    const [handoverPaymentPercent, setHandoverPaymentPercent] = useState('');
    
    const [numberOfInstallments, setNumberOfInstallments] = useState('');
    const [frequency, setFrequency] = useState(3); 
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [handoverDate, setHandoverDate] = useState('');
    
    const [installmentPercents, setInstallmentPercents] = useState<string[]>([]);
    
    const [isCustomFillVisible, setIsCustomFillVisible] = useState(false);
    const [fillType, setFillType] = useState('range'); 
    const [rangeFrom, setRangeFrom] = useState('');
    const [rangeTo, setRangeTo] = useState('');
    const [rangePercent, setRangePercent] = useState('');
    const [patternStep, setPatternStep] = useState('');
    const [patternPercent, setPatternPercent] = useState('');
    const [patternCount, setPatternCount] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [installmentErrors, setInstallmentErrors] = useState<boolean[]>([]);

    const numInstallments = parseInt(numberOfInstallments, 10) || 0;

    const frequencyOptions = useMemo(() => ([
        { label: t('fullUnitCalculator.monthly'), value: 1 },
        { label: t('fullUnitCalculator.quarterly'), value: 3 },
        { label: t('fullUnitCalculator.semiAnnually'), value: 6 },
        { label: t('fullUnitCalculator.annually'), value: 12 },
    ]), [t]);

    useEffect(() => {
        if (numInstallments >= 0 && numInstallments <= 100) { 
            const newInstallments = Array(numInstallments).fill('');
            const limit = Math.min(numInstallments, installmentPercents.length);
            for(let i = 0; i < limit; i++){
                newInstallments[i] = installmentPercents[i];
            }
            setInstallmentPercents(newInstallments);
        }
    }, [numberOfInstallments]);

    useEffect(() => {
        const newErrors: Record<string, string> = {};

        const p_downPaymentPercent = parseFloat(downPaymentPercent);
        if (p_downPaymentPercent > 100) newErrors.downPaymentPercent = t('fullUnitCalculator.errors.percentageMax');
        if (p_downPaymentPercent < 0) newErrors.downPaymentPercent = t('fullUnitCalculator.errors.percentageMin');

        const p_maintenancePercentage = parseFloat(maintenancePercentage);
        if (p_maintenancePercentage > 100) newErrors.maintenancePercentage = t('fullUnitCalculator.errors.percentageMax');
        if (p_maintenancePercentage < 0) newErrors.maintenancePercentage = t('fullUnitCalculator.errors.percentageMin');
        
        const p_handoverPaymentPercent = parseFloat(handoverPaymentPercent);
        if (p_handoverPaymentPercent > 100) newErrors.handoverPaymentPercent = t('fullUnitCalculator.errors.percentageMax');
        if (p_handoverPaymentPercent < 0) newErrors.handoverPaymentPercent = t('fullUnitCalculator.errors.percentageMin');

        setErrors(newErrors);

        const newInstallmentErrors = installmentPercents.map(p => {
            if (p === '') return false;
            const val = parseFloat(p);
            return isNaN(val) ? false : val > 100 || val < 0;
        });
        setInstallmentErrors(newInstallmentErrors);

    }, [downPaymentPercent, maintenancePercentage, handoverPaymentPercent, installmentPercents, t]);

    const handleInstallmentPercentChange = (index: number, value: string) => {
        const newPercents = [...installmentPercents];
        newPercents[index] = value;
        setInstallmentPercents(newPercents);
    };

    const format = (num: number | undefined): string => {
        const locale = 'en-US';
        const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        if (typeof num !== 'number' || !isFinite(num)) {
            return '0.00';
        }
        return num.toLocaleString(locale, options);
    };

    const calculations = useMemo(() => {
        const p_unitAmount = parseFloat(unitAmount) || 0;
        const p_downPaymentPercent = parseFloat(downPaymentPercent) || 0;
        const p_maintenancePercentage = parseFloat(maintenancePercentage) || 0;
        const p_handoverPaymentPercent = parseFloat(handoverPaymentPercent) || 0;

        const maintenanceAmount = p_unitAmount * (p_maintenancePercentage / 100);
        const totalCost = p_unitAmount + maintenanceAmount;
        
        const baseDate = new Date(startDate);

        const addMonths = (date: Date, months: number) => {
            const newDate = new Date(date);
            newDate.setMonth(newDate.getMonth() + months);
            return newDate;
        };
        
        const allPayments: Payment[] = [];

        installmentPercents.forEach((percentStr, index) => {
            const instPercent = parseFloat(percentStr) || 0;
            allPayments.push({
                name: t('paymentPlanCalculator.installment', { index: index + 1 }),
                date: addMonths(baseDate, (index + 1) * frequency),
                percent: instPercent,
                amount: p_unitAmount * (instPercent / 100),
                isInstallment: true,
                index: index,
            });
        });

        const handoverPaymentAmount = p_unitAmount * (p_handoverPaymentPercent / 100);
        if (p_handoverPaymentPercent > 0 && handoverDate) {
            allPayments.push({
                name: t('paymentPlanCalculator.handoverPayment'),
                date: new Date(handoverDate),
                percent: p_handoverPaymentPercent,
                amount: handoverPaymentAmount,
                isInstallment: false,
            });
        }
        
        allPayments.sort((a, b) => a.date.getTime() - b.date.getTime());

        const formattedPaymentPlan = allPayments.map(p => ({
            ...p,
            date: p.date.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        }));
        
        const downPaymentAmount = p_unitAmount * (p_downPaymentPercent / 100);
        const totalInstallmentsPercent = installmentPercents.reduce((acc, p) => acc + (parseFloat(p) || 0), 0);
        const totalPercentScheduled = p_downPaymentPercent + totalInstallmentsPercent + p_handoverPaymentPercent;

        const totalInstallmentsAmount = installmentPercents.reduce((acc, p) => acc + (p_unitAmount * (parseFloat(p) || 0) / 100), 0);
        const totalAmountScheduled = downPaymentAmount + totalInstallmentsAmount + handoverPaymentAmount;

        const remainingPercentForInstallments = 100 - p_downPaymentPercent - p_handoverPaymentPercent;

        return {
            maintenanceAmount: format(maintenanceAmount),
            totalCost: format(totalCost),
            downPaymentAmount: format(downPaymentAmount),
            handoverPaymentAmount: format(handoverPaymentAmount),
            paymentPlan: formattedPaymentPlan,
            totalPercentScheduled: totalPercentScheduled.toFixed(2),
            totalAmountScheduled: format(totalAmountScheduled),
            remainingPercentForInstallments,
        };
    }, [unitAmount, downPaymentPercent, maintenancePercentage, startDate, frequency, installmentPercents, handoverPaymentPercent, handoverDate, t]);

    const handleDistributeEqually = () => {
        if (numInstallments > 0 && calculations.remainingPercentForInstallments > 0) {
            const percentPerInstallment = (calculations.remainingPercentForInstallments / numInstallments).toFixed(2);
            setInstallmentPercents(Array(numInstallments).fill(percentPerInstallment));
        }
    };

    const handleClearAll = () => {
        if (numInstallments > 0) {
            setInstallmentPercents(Array(numInstallments).fill(''));
        }
    };

    const handleApplyCustomFill = () => {
        const newPercents = [...installmentPercents];
    
        if (fillType === 'range') {
            const from = parseInt(rangeFrom, 10);
            const to = parseInt(rangeTo, 10);
            if (!isNaN(from) && !isNaN(to) && from > 0 && to >= from && to <= numInstallments) {
                for (let i = from - 1; i < to; i++) {
                    newPercents[i] = rangePercent;
                }
            }
        } else if (fillType === 'pattern') {
            const step = parseInt(patternStep, 10);
            const count = patternCount ? parseInt(patternCount, 10) : Infinity;
            if (!isNaN(step) && step > 0) {
                let appliedCount = 0;
                for (let i = step - 1; i < numInstallments && appliedCount < count; i += step) {
                    newPercents[i] = patternPercent;
                    appliedCount++;
                }
            }
        }
        setInstallmentPercents(newPercents);
        setIsCustomFillVisible(false);
    };

    const calculatorInfo = useMemo(() => getCalculators(t).find(c => c.id === CalculatorType.PaymentPlan), [t]);
    const totalPercent = parseFloat(calculations.totalPercentScheduled);
    const hasInstallmentError = installmentErrors.some(e => e);

    return (
        <CalculatorCard
            title={calculatorInfo?.name || t('calculators.paymentPlan.name')}
            description={calculatorInfo?.tooltip || t('calculators.paymentPlan.description')}
            icon={calculatorInfo?.icon}
        >
            <div className="space-y-6">
                 <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('paymentPlanCalculator.unitDetails')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NumberInput label={t('paymentPlanCalculator.unitPriceLabel')} value={unitAmount} onChange={(e) => setUnitAmount(e.target.value)} currency={currency} tooltip={t('paymentPlanCalculator.unitPriceTooltip')} />
                        <div>
                            <NumberInput label={t('paymentPlanCalculator.downPaymentLabel')} value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(e.target.value)} unit="%" tooltip={t('paymentPlanCalculator.downPaymentTooltip')} error={!!errors.downPaymentPercent} />
                            <ErrorMessage message={errors.downPaymentPercent} />
                        </div>
                        <div>
                            <NumberInput label={t('paymentPlanCalculator.maintenancePercentageLabel')} value={maintenancePercentage} onChange={(e) => setMaintenancePercentage(e.target.value)} placeholder={t('paymentPlanCalculator.maintenancePercentagePlaceholder')} unit="%" tooltip={t('paymentPlanCalculator.maintenancePercentageTooltip')} error={!!errors.maintenancePercentage} />
                            <ErrorMessage message={errors.maintenancePercentage} />
                        </div>
                        <div>
                            <NumberInput label={t('paymentPlanCalculator.handoverPaymentLabel')} value={handoverPaymentPercent} onChange={(e) => setHandoverPaymentPercent(e.target.value)} placeholder={t('paymentPlanCalculator.handoverPaymentPlaceholder')} unit="%" tooltip={t('paymentPlanCalculator.handoverPaymentTooltip')} error={!!errors.handoverPaymentPercent} />
                            <ErrorMessage message={errors.handoverPaymentPercent} />
                        </div>
                    </div>
                 </div>

                 <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('paymentPlanCalculator.planSettings')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NumberInput label={t('paymentPlanCalculator.installmentsCountLabel')} value={numberOfInstallments} onChange={(e) => setNumberOfInstallments(e.target.value)} tooltip={t('paymentPlanCalculator.installmentsCountTooltip')} />
                        <SelectInput label={t('paymentPlanCalculator.paymentMethodLabel')} value={frequency} onChange={(e) => setFrequency(parseInt(e.target.value))} tooltip={t('paymentPlanCalculator.paymentMethodTooltip')}>
                            {frequencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </SelectInput>
                        <DateInput label={t('paymentPlanCalculator.startDateLabel')} value={startDate} onChange={(e) => setStartDate(e.target.value)} tooltip={t('paymentPlanCalculator.startDateTooltip')} />
                        <DateInput label={t('paymentPlanCalculator.handoverDateLabel')} value={handoverDate} onChange={(e) => setHandoverDate(e.target.value)} tooltip={t('paymentPlanCalculator.handoverDateTooltip')} />
                    </div>
                 </div>

                {(unitAmount && (numInstallments > 0 || parseFloat(handoverPaymentPercent) > 0)) && (
                    <div className="p-2 sm:p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-x-auto">
                        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center mb-4 gap-2">
                           <h3 className="text-lg font-semibold text-primary dark:text-primary-dark">{t('paymentPlanCalculator.paymentSchedule')}</h3>
                           {numInstallments > 0 && (
                             <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-2">
                                <button
                                    onClick={handleDistributeEqually}
                                    disabled={calculations.remainingPercentForInstallments <= 0}
                                    className="flex w-full sm:w-auto justify-center items-center gap-2 px-3 py-1.5 text-sm font-semibold text-primary bg-primary-light dark:text-primary-dark dark:bg-primary/20 rounded-md transition-colors hover:bg-primary/20 dark:hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    <span>{t('paymentPlanCalculator.distributeEqually')}</span>
                                </button>
                                <button
                                    onClick={() => setIsCustomFillVisible(!isCustomFillVisible)}
                                    className="flex w-full sm:w-auto justify-center items-center gap-2 px-3 py-1.5 text-sm font-semibold text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-500/20 rounded-md transition-colors hover:bg-purple-200 dark:hover:bg-purple-500/30"
                                >
                                    <WandSparklesIcon className="w-4 h-4" />
                                    <span>{t('paymentPlanCalculator.customFill')}</span>
                                </button>
                                <button
                                     onClick={handleClearAll}
                                     className="flex w-full sm:w-auto justify-center items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-500/20 rounded-md transition-colors hover:bg-red-200 dark:hover:bg-red-500/30"
                                >
                                     <TrashIcon className="w-4 h-4" />
                                     <span>{t('paymentPlanCalculator.clearInstallments')}</span>
                                </button>
                             </div>
                           )}
                        </div>

                        {hasInstallmentError && <div className="my-2"><ErrorMessage message={t('paymentPlanCalculator.installmentPercentageError')} /></div>}

                        {isCustomFillVisible && numInstallments > 0 && (
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg my-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-neutral-700 dark:text-neutral-200">{t('paymentPlanCalculator.customFillTool.title')}</h4>
                                    <button onClick={() => setIsCustomFillVisible(false)} className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"><XMarkIcon className="w-5 h-5"/></button>
                                </div>
                                <div className="flex items-center gap-6 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="fillType" value="range" checked={fillType === 'range'} onChange={(e) => setFillType(e.target.value)} className="form-radio text-primary dark:bg-neutral-600"/>
                                        <span className="font-medium">{t('paymentPlanCalculator.customFillTool.fillRange')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="fillType" value="pattern" checked={fillType === 'pattern'} onChange={(e) => setFillType(e.target.value)} className="form-radio text-primary dark:bg-neutral-600"/>
                                        <span className="font-medium">{t('paymentPlanCalculator.customFillTool.fillPattern')}</span>
                                    </label>
                                </div>
                                {fillType === 'range' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <NumberInput label={t('paymentPlanCalculator.customFillTool.fromInstallmentLabel')} value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} placeholder={t('paymentPlanCalculator.customFillTool.fromInstallmentPlaceholder')} tooltip={t('paymentPlanCalculator.customFillTool.fromInstallmentTooltip')}/>
                                        <NumberInput label={t('paymentPlanCalculator.customFillTool.toInstallmentLabel')} value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} placeholder={`${numInstallments}`} tooltip={t('paymentPlanCalculator.customFillTool.toInstallmentTooltip')}/>
                                        <NumberInput label={t('paymentPlanCalculator.customFillTool.installmentPercentLabel')} value={rangePercent} onChange={(e) => setRangePercent(e.target.value)} unit="%" tooltip={t('paymentPlanCalculator.customFillTool.installmentPercentTooltipRange')}/>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <NumberInput label={t('paymentPlanCalculator.customFillTool.everyNthInstallmentLabel')} value={patternStep} onChange={(e) => setPatternStep(e.target.value)} placeholder={t('paymentPlanCalculator.customFillTool.everyNthInstallmentPlaceholder')} tooltip={t('paymentPlanCalculator.customFillTool.everyNthInstallmentTooltip')}/>
                                        <NumberInput label={t('paymentPlanCalculator.customFillTool.forNTimesLabel')} value={patternCount} onChange={(e) => setPatternCount(e.target.value)} placeholder={t('paymentPlanCalculator.customFillTool.forNTimesPlaceholder')} tooltip={t('paymentPlanCalculator.customFillTool.forNTimesTooltip')}/>
                                        <NumberInput label={t('paymentPlanCalculator.customFillTool.applyPercentLabel')} value={patternPercent} onChange={(e) => setPatternPercent(e.target.value)} unit="%" tooltip={t('paymentPlanCalculator.customFillTool.applyPercentTooltipPattern')}/>
                                    </div>
                                )}
                                <div className="mt-4 flex justify-end">
                                    <button onClick={handleApplyCustomFill} className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 transition-colors">
                                        {t('paymentPlanCalculator.customFillTool.applyButton')}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="min-w-full">
                           <div className="grid grid-cols-4 gap-4 font-semibold text-neutral-600 dark:text-neutral-300 p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-t-lg">
                                <div>{t('paymentPlanCalculator.scheduleHeaders.payment')}</div>
                                <div className="text-center">{t('paymentPlanCalculator.scheduleHeaders.date')}</div>
                                <div className="text-center">{t('paymentPlanCalculator.scheduleHeaders.percentage')}</div>
                                <div className="text-left">{t('paymentPlanCalculator.scheduleHeaders.amount', { currency })}</div>
                           </div>
                            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {calculations.paymentPlan.map((payment, index) => (
                                   <div key={index} className="grid grid-cols-4 gap-4 items-center p-2">
                                       <div className="font-medium text-neutral-800 dark:text-neutral-200">{payment.name}</div>
                                       <div className="text-center text-neutral-500 dark:text-neutral-400">{payment.date}</div>
                                       <div className="px-2">
                                            {payment.isInstallment && typeof payment.index === 'number' ? (
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={installmentPercents[payment.index]} 
                                                    onChange={(e) => handleInstallmentPercentChange(payment.index!, e.target.value)} 
                                                    className={`w-full text-center bg-white dark:bg-neutral-600 border rounded-md py-1 text-neutral-800 dark:text-neutral-100 ${installmentErrors[payment.index] ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-500'}`}
                                                    placeholder="0" 
                                                />
                                            ) : (
                                                <span className="w-full text-center block py-1 font-medium text-neutral-700 dark:text-neutral-300">{payment.percent.toFixed(2)}</span>
                                            )}
                                       </div>
                                       <div className="text-left font-semibold text-primary dark:text-primary-dark">{format(payment.amount)}</div>
                                   </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {unitAmount && (
                    <div className="p-4 border-2 border-dashed border-primary/20 dark:border-neutral-600 rounded-lg">
                        <h3 className="text-xl font-bold text-center text-neutral-800 dark:text-neutral-100 mb-4">{t('paymentPlanCalculator.financialSummary')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-primary-light dark:bg-neutral-700/50 rounded-md">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('paymentPlanCalculator.downPaymentAmount')}</p>
                                <p className="text-xl font-bold text-primary dark:text-primary-dark">{calculations.downPaymentAmount} {currency}</p>
                            </div>
                            {(parseFloat(handoverPaymentPercent) || 0) > 0 && (
                                <div className="p-3 bg-primary-light dark:bg-neutral-700/50 rounded-md">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('paymentPlanCalculator.handoverPaymentAmount')}</p>
                                    <p className="text-xl font-bold text-primary dark:text-primary-dark">{calculations.handoverPaymentAmount} {currency}</p>
                                </div>
                            )}
                             <div className="p-3 bg-primary-light dark:bg-neutral-700/50 rounded-md">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('paymentPlanCalculator.totalCost')}</p>
                                <p className="text-xl font-bold text-primary dark:text-primary-dark">{calculations.totalCost} {currency}</p>
                            </div>
                             <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-md">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('paymentPlanCalculator.totalScheduledPercentage')}</p>
                                <p className="text-xl font-bold text-neutral-700 dark:text-neutral-200">{calculations.totalPercentScheduled} %</p>
                            </div>
                             <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-md sm:col-span-2">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('paymentPlanCalculator.totalScheduledAmount')}</p>
                                <p className="text-xl font-bold text-neutral-700 dark:text-neutral-200">{calculations.totalAmountScheduled} {currency}</p>
                            </div>
                        </div>
                         {Math.abs(totalPercent - 100.00) < 0.01 && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/20 rounded-lg text-center font-semibold">
                                {t('paymentPlanCalculator.status.complete')}
                            </div>
                        )}
                        {totalPercent > 100.01 && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20 rounded-lg text-center font-semibold">
                                {t('paymentPlanCalculator.status.over')}
                            </div>
                        )}
                         {totalPercent < 99.99 && totalPercent > 0 && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/20 rounded-lg text-center font-semibold">
                                {t('paymentPlanCalculator.status.inProgress', { remaining: (100 - totalPercent).toFixed(2) })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CalculatorCard>
    );
};

export default PaymentPlanCalculator;