

import React, { useState, useMemo } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import ResultDisplay from './shared/ResultDisplay';
// FIX: Corrected import path for constants.
import { getCalculators } from '../constants';
import { CalculatorType } from '../types';
import { useTranslation } from '../src/contexts/LanguageContext';
import { getRoeAnalysis } from '../utils/analytics';

interface RoeCalculatorProps {
    currency: string;
}

const RoeCalculator: React.FC<RoeCalculatorProps> = ({ currency }) => {
  const { t, language } = useTranslation();
  const [annualGrossRent, setAnnualGrossRent] = useState('');
  const [annualExpenses, setAnnualExpenses] = useState('');
  const [annualMortgage, setAnnualMortgage] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState('');

  const rawRoe = useMemo(() => {
    const rent = parseFloat(annualGrossRent) || 0;
    const expenses = parseFloat(annualExpenses) || 0;
    const mortgage = parseFloat(annualMortgage) || 0;
    const dp = parseFloat(downPayment) || 0;
    const costs = parseFloat(additionalCosts) || 0;
    
    const cashFlow = rent - expenses - mortgage;
    const equity = dp + costs;
    
    if (equity === 0) {
      return 0;
    }
    return (cashFlow / equity) * 100;
  }, [annualGrossRent, annualExpenses, annualMortgage, downPayment, additionalCosts]);

  const formattedRoe = useMemo(() => {
    const locale = 'en-US';
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return rawRoe.toLocaleString(locale, options);
  }, [rawRoe]);

  const roeAnalysis = useMemo(() => {
    if (rawRoe <= 0 || !isFinite(rawRoe)) {
      return null;
    }
    return getRoeAnalysis(rawRoe);
  }, [rawRoe]);

  const calculatorInfo = useMemo(() => getCalculators(t, language).find(c => c.id === CalculatorType.ROE), [t, language]);

  return (
    <CalculatorCard
      title={t('calculators.roe.name')}
      description={t('calculators.roe.description')}
      icon={calculatorInfo?.icon}
    >
      <div className="space-y-6">
        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('roeCalculator.annualCashFlow')}</h3>
            <div className="space-y-4">
                <NumberInput
                  label={t('roeCalculator.annualGrossRentLabel')}
                  value={annualGrossRent}
                  onChange={(e) => setAnnualGrossRent(e.target.value)}
                  placeholder={`${t('common.example')}: 180,000`}
                  currency={currency}
                  tooltip={t('roeCalculator.annualGrossRentTooltip')}
                />
                <NumberInput
                  label={t('roeCalculator.annualExpensesLabel')}
                  value={annualExpenses}
                  onChange={(e) => setAnnualExpenses(e.target.value)}
                  placeholder={`${t('common.example')}: 30,000`}
                  currency={currency}
                  tooltip={t('roeCalculator.annualExpensesTooltip')}
                />
                 <NumberInput
                  label={t('roeCalculator.annualMortgageLabel')}
                  value={annualMortgage}
                  onChange={(e) => setAnnualMortgage(e.target.value)}
                  placeholder={`${t('common.example')}: 120,000`}
                  currency={currency}
                  tooltip={t('roeCalculator.annualMortgageTooltip')}
                />
            </div>
        </div>

        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
             <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('roeCalculator.investedCapital')}</h3>
             <div className="space-y-4">
                <NumberInput
                  label={t('roeCalculator.downPaymentLabel')}
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder={`${t('common.example')}: 400,000`}
                  currency={currency}
                  tooltip={t('roeCalculator.downPaymentTooltip')}
                />
                <NumberInput
                  label={t('roeCalculator.additionalCostsLabel')}
                  value={additionalCosts}
                  onChange={(e) => setAdditionalCosts(e.target.value)}
                  placeholder={`${t('common.example')}: 50,000`}
                  currency={currency}
                  tooltip={t('roeCalculator.additionalCostsTooltip')}
                />
            </div>
        </div>
      </div>
      <ResultDisplay 
        label={t('roeCalculator.roeResultLabel')}
        value={formattedRoe} 
        unit="%" 
        tooltip={t('roeCalculator.roeResultTooltip')}
      />
      
      {roeAnalysis && (
        <div className={`mt-4 p-4 rounded-lg border ${roeAnalysis.colorClasses}`}>
          <h3 className="font-bold text-lg mb-1">{t(`analysis.roe.${roeAnalysis.ratingKey}.rating`)}</h3>
          <p className="text-sm">{t(`analysis.roe.${roeAnalysis.ratingKey}.description`)}</p>
        </div>
      )}
    </CalculatorCard>
  );
};

export default RoeCalculator;