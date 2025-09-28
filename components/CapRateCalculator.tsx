

import React, { useState, useMemo } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import ResultDisplay from './shared/ResultDisplay';
// FIX: Corrected import path for constants.
import { getCalculators } from '../constants';
import { CalculatorType } from '../types';
import { useTranslation } from '../src/contexts/LanguageContext';
import { getCapRateAnalysis } from '../utils/analytics';

interface CapRateCalculatorProps {
    currency: string;
}

const CapRateCalculator: React.FC<CapRateCalculatorProps> = ({ currency }) => {
  const { t, language } = useTranslation();
  const [noi, setNoi] = useState('');
  const [propertyValue, setPropertyValue] = useState('');

  const rawCapRate = useMemo(() => {
    const netOperatingIncome = parseFloat(noi);
    const value = parseFloat(propertyValue);
    if (isNaN(netOperatingIncome) || isNaN(value) || value === 0) {
      return 0;
    }
    return (netOperatingIncome / value) * 100;
  }, [noi, propertyValue]);

  const formattedCapRate = useMemo(() => {
    const locale = 'en-US';
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return rawCapRate.toLocaleString(locale, options);
  }, [rawCapRate]);

  const capRateAnalysis = useMemo(() => {
    if (rawCapRate <= 0 || !isFinite(rawCapRate)) {
      return null;
    }
    return getCapRateAnalysis(rawCapRate);
  }, [rawCapRate]);
  
  const calculatorInfo = useMemo(() => getCalculators(t, language).find(c => c.id === CalculatorType.CapRate), [t, language]);

  return (
    <CalculatorCard
      title={t('calculators.capRate.name')}
      description={t('calculators.capRate.description')}
      icon={calculatorInfo?.icon}
    >
      <div className="space-y-6">
        <NumberInput
          label={t('capRateCalculator.noiLabel')}
          value={noi}
          onChange={(e) => setNoi(e.target.value)}
          placeholder={`${t('common.example')}: 18,000`}
          currency={currency}
          tooltip={t('capRateCalculator.noiTooltip')}
        />
        <NumberInput
          label={t('capRateCalculator.propertyValueLabel')}
          value={propertyValue}
          onChange={(e) => setPropertyValue(e.target.value)}
          placeholder={`${t('common.example')}: 300,000`}
          currency={currency}
          tooltip={t('capRateCalculator.propertyValueTooltip')}
        />
      </div>
      <ResultDisplay 
        label={t('capRateCalculator.capRateResultLabel')} 
        value={formattedCapRate} 
        unit="%" 
        tooltip={t('capRateCalculator.capRateResultTooltip')}
      />
      
      {capRateAnalysis && (
        <div className={`mt-4 p-4 rounded-lg border ${capRateAnalysis.colorClasses}`}>
          <h3 className="font-bold text-lg mb-1">{t(`analysis.capRate.${capRateAnalysis.ratingKey}.rating`)}</h3>
          <p className="text-sm">{t(`analysis.capRate.${capRateAnalysis.ratingKey}.description`)}</p>
        </div>
      )}
    </CalculatorCard>
  );
};

export default CapRateCalculator;