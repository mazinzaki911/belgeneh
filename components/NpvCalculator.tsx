import React, { useState, useMemo } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import ResultDisplay from './shared/ResultDisplay';
import InfoTooltip from './shared/InfoTooltip';
import { getCalculators, ChevronDownIcon, ChevronUpIcon } from '../constants';
import { CalculatorType } from '../types';
import { useTranslation } from '../src/contexts/LanguageContext';
import { getNpvAnalysis } from '../utils/analytics';

interface NpvCalculatorProps {
    currency: string;
}

const NpvCalculator: React.FC<NpvCalculatorProps> = ({ currency }) => {
  const { t, language } = useTranslation();
  const [initialInvestment, setInitialInvestment] = useState('');
  const [annualCashFlow, setAnnualCashFlow] = useState('');
  const [discountRate, setDiscountRate] = useState('');
  const [holdingPeriod, setHoldingPeriod] = useState('');
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);

  const calculations = useMemo(() => {
    const investment = parseFloat(initialInvestment);
    const cashFlow = parseFloat(annualCashFlow);
    const rate = parseFloat(discountRate);
    const years = parseInt(holdingPeriod, 10);
    
    const locale = 'en-US';
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    
    const defaultResult = {
        npv: { raw: 0, formatted: (0).toLocaleString(locale, options) },
        breakEvenSalePrice: { raw: 0, formatted: (0).toLocaleString(locale, options) }
    };

    if (isNaN(investment) || isNaN(cashFlow) || isNaN(rate) || isNaN(years) || rate <= 0 || years <= 0) {
      return defaultResult;
    }

    const discountFactor = 1 + rate / 100;

    let presentValueOfCashFlows = 0;
    for (let i = 1; i <= years; i++) {
      presentValueOfCashFlows += cashFlow / Math.pow(discountFactor, i);
    }
    
    let currentNpv = -investment + presentValueOfCashFlows;

    const breakEvenSalePriceRaw = (investment - presentValueOfCashFlows) * Math.pow(discountFactor, years);
    
    return { 
        npv: { raw: currentNpv, formatted: currentNpv.toLocaleString(locale, options) },
        breakEvenSalePrice: { raw: breakEvenSalePriceRaw, formatted: breakEvenSalePriceRaw.toLocaleString(locale, options) }
    };
  }, [initialInvestment, annualCashFlow, discountRate, holdingPeriod]);
  
  const npvAnalysis = useMemo(() => {
    const rawNpv = calculations.npv.raw;

    if (rawNpv === 0 && !initialInvestment && !annualCashFlow && !discountRate && !holdingPeriod) {
        return null;
    }

    return getNpvAnalysis(rawNpv);
  }, [calculations.npv.raw, initialInvestment, annualCashFlow, discountRate, holdingPeriod]);
  
  const npvColorClass = useMemo(() => {
    const rawNpv = calculations.npv.raw;
    if (rawNpv > 0) return 'text-green-600 dark:text-green-400';
    if (rawNpv < 0) return 'text-red-600 dark:text-red-400';
    return 'text-neutral-800 dark:text-neutral-100';
  }, [calculations.npv.raw]);

  const calculatorInfo = useMemo(() => getCalculators(t, language).find(c => c.id === CalculatorType.NPV), [t, language]);

  return (
    <CalculatorCard
      title={calculatorInfo?.name || t('calculators.npv.name')}
      description={calculatorInfo?.tooltip || t('calculators.npv.description')}
      icon={calculatorInfo?.icon}
    >
        <div className="space-y-6">
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('npvCalculator.initialInvestment')}</h3>
                <NumberInput
                    label={t('npvCalculator.initialInvestmentCostLabel')}
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(e.target.value)}
                    placeholder={t('npvCalculator.initialInvestmentCostPlaceholder')}
                    currency={currency}
                    tooltip={t('npvCalculator.initialInvestmentCostTooltip')}
                />
            </div>
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('npvCalculator.futureProjections')}</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NumberInput
                        label={t('npvCalculator.annualCashFlowLabel')}
                        value={annualCashFlow}
                        onChange={(e) => setAnnualCashFlow(e.target.value)}
                        placeholder={t('npvCalculator.annualCashFlowPlaceholder')}
                        currency={currency}
                        tooltip={t('npvCalculator.annualCashFlowTooltip')}
                    />
                    <NumberInput
                        label={t('npvCalculator.holdingPeriodLabel')}
                        value={holdingPeriod}
                        onChange={(e) => setHoldingPeriod(e.target.value)}
                        placeholder={t('npvCalculator.holdingPeriodPlaceholder')}
                        tooltip={t('npvCalculator.holdingPeriodTooltip')}
                    />
                    <div className="sm:col-span-2">
                        <NumberInput
                            label={t('npvCalculator.discountRateLabel')}
                            value={discountRate}
                            onChange={(e) => setDiscountRate(e.target.value)}
                            placeholder={t('npvCalculator.discountRatePlaceholder')}
                            unit="%"
                            tooltip={t('npvCalculator.discountRateTooltip')}
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-6 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <button
            onClick={() => setIsExplanationVisible(!isExplanationVisible)}
            className="w-full flex justify-between items-center p-4 text-left font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-t-lg transition-colors"
            aria-expanded={isExplanationVisible}
            >
            <span>{t('npvCalculator.explanationTitle')}</span>
            {isExplanationVisible ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </button>
            {isExplanationVisible && (
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-lg">
                <div className="space-y-4 text-neutral-600 dark:text-neutral-300">
                    <div>
                        <h4 className="font-bold text-lg mb-2 text-neutral-800 dark:text-neutral-100">{t('npvCalculator.practicalExampleTitle')}</h4>
                        <div className="text-sm space-y-2 p-3 bg-white dark:bg-neutral-700 rounded-lg shadow-sm">
                            <p dangerouslySetInnerHTML={{ __html: t('npvCalculator.exampleInvestment') }} />
                            <p dangerouslySetInnerHTML={{ __html: t('npvCalculator.exampleDiscountRate') }} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white dark:bg-neutral-700/50 border-l-4 border-green-500 shadow-sm">
                             <h5 className="font-bold text-green-700 dark:text-green-400">{t('npvCalculator.scenario1Title')}</h5>
                             <p className="text-sm mt-2" dangerouslySetInnerHTML={{ __html: t('npvCalculator.scenario1Details') }} />
                        </div>
                         <div className="p-4 rounded-lg bg-white dark:bg-neutral-700/50 border-l-4 border-neutral-500 shadow-sm">
                             <h5 className="font-bold text-neutral-700 dark:text-neutral-300">{t('npvCalculator.scenario2Title')}</h5>
                             <p className="text-sm mt-2" dangerouslySetInnerHTML={{ __html: t('npvCalculator.scenario2Details') }} />
                        </div>
                        <div className="p-4 rounded-lg bg-white dark:bg-neutral-700/50 border-l-4 border-red-500 shadow-sm">
                             <h5 className="font-bold text-red-700 dark:text-red-400">{t('npvCalculator.scenario3Title')}</h5>
                             <p className="text-sm mt-2" dangerouslySetInnerHTML={{ __html: t('npvCalculator.scenario3Details') }} />
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <h4 className="font-semibold">{t('npvCalculator.resultsInterpretationTitle')}</h4>
                        <ul className="list-disc list-inside space-y-1 pr-4 text-sm mt-1">
                            <li dangerouslySetInnerHTML={{ __html: t('npvCalculator.interpretationPositive') }} />
                            <li dangerouslySetInnerHTML={{ __html: t('npvCalculator.interpretationZero') }} />
                            <li dangerouslySetInnerHTML={{ __html: t('npvCalculator.interpretationNegative') }} />
                        </ul>
                    </div>
                </div>
            </div>
            )}
        </div>

        <div className="mt-8 space-y-4">
            <div className="p-6 bg-primary-light dark:bg-primary/10 rounded-lg border-2 border-dashed border-primary/20 dark:border-primary/30 text-center">
                <div className="flex items-center justify-center gap-2">
                    <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">{t('npvCalculator.npvResultLabel')}</p>
                    <InfoTooltip text={t('npvCalculator.npvResultTooltip')} />
                </div>
                <p className={`text-4xl sm:text-5xl font-extrabold my-2 ${npvColorClass}`}>
                    {calculations.npv.formatted} <span className="text-2xl sm:text-3xl font-bold">{currency}</span>
                </p>
            </div>
            
            <ResultDisplay 
            label={t('npvCalculator.breakEvenSalePriceLabel')}
            value={calculations.breakEvenSalePrice.formatted} 
            unit={currency} 
            tooltip={t('npvCalculator.breakEvenSalePriceTooltip')}
            />
        </div>

      {npvAnalysis && (
        <div className={`mt-4 p-4 rounded-lg border ${npvAnalysis.colorClasses}`}>
          <h3 className="font-bold text-lg mb-1">{t(`analysis.npv.${npvAnalysis.ratingKey}.rating`)}</h3>
          <p className="text-sm" dangerouslySetInnerHTML={{ __html: t(`analysis.npv.${npvAnalysis.ratingKey}.description`, { amount: `<strong>${calculations.npv.formatted}</strong>`, currency: `<strong>${currency}</strong>` }) }} />
        </div>
      )}
    </CalculatorCard>
  );
};

export default NpvCalculator;