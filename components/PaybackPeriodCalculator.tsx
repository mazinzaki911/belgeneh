
import React, { useState, useMemo } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import ResultDisplay from './shared/ResultDisplay';
import { getCalculators } from '../constants';
import { CalculatorType } from '../types';
import { useTranslation } from '../src/contexts/LanguageContext';
import { getPaybackAnalysis } from '../utils/analytics';

interface PaybackPeriodCalculatorProps {
    currency: string;
}

const PaybackPeriodCalculator: React.FC<PaybackPeriodCalculatorProps> = ({ currency }) => {
  const { t } = useTranslation();
  const [initialInvestment, setInitialInvestment] = useState('');
  const [annualCashFlow, setAnnualCashFlow] = useState('');

  const rawPaybackPeriod = useMemo(() => {
    const investment = parseFloat(initialInvestment);
    const cashFlow = parseFloat(annualCashFlow);
    if (isNaN(investment) || isNaN(cashFlow) || cashFlow <= 0) {
      return 0;
    }
    return investment / cashFlow;
  }, [initialInvestment, annualCashFlow]);

  const formattedPaybackPeriod = useMemo(() => {
    const locale = 'en-US';
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return rawPaybackPeriod.toLocaleString(locale, options);
  }, [rawPaybackPeriod]);

  const paybackAnalysis = useMemo(() => {
    if (rawPaybackPeriod <= 0 || !isFinite(rawPaybackPeriod)) {
        return null;
    }
    return getPaybackAnalysis(rawPaybackPeriod);
  }, [rawPaybackPeriod]);

  const calculatorInfo = useMemo(() => getCalculators(t).find(c => c.id === CalculatorType.Payback), [t]);

  return (
    <CalculatorCard
      title={t('calculators.payback.name')}
      description={t('calculators.payback.description')}
      icon={calculatorInfo?.icon}
    >
      <div className="space-y-4">
        <NumberInput
          label={t('paybackCalculator.initialInvestmentLabel')}
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(e.target.value)}
          placeholder={`${t('common.example')}: 60,000`}
          currency={currency}
          tooltip={t('paybackCalculator.initialInvestmentTooltip')}
        />
        <NumberInput
          label={t('paybackCalculator.annualCashFlowLabel')}
          value={annualCashFlow}
          onChange={(e) => setAnnualCashFlow(e.target.value)}
          placeholder={`${t('common.example')}: 9,000`}
          currency={currency}
          tooltip={t('paybackCalculator.annualCashFlowTooltip')}
        />
      </div>
      <ResultDisplay 
        label={t('paybackCalculator.paybackResultLabel')}
        value={formattedPaybackPeriod} 
        unit={t('common.years')}
        tooltip={t('paybackCalculator.paybackResultTooltip')}
      />
      
      {paybackAnalysis && (
        <div className={`mt-4 p-4 rounded-lg border ${paybackAnalysis.colorClasses}`}>
          <h3 className="font-bold text-lg mb-1">{t(`analysis.paybackPeriod.${paybackAnalysis.ratingKey}.rating`)}</h3>
          <p className="text-sm">{t(`analysis.paybackPeriod.${paybackAnalysis.ratingKey}.description`)}</p>
        </div>
      )}
    </CalculatorCard>
  );
};

export default PaybackPeriodCalculator;