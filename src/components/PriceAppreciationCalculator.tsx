import React, { useState, useMemo } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import ResultDisplay from './shared/ResultDisplay';
import { getCalculators } from '../constants';
import { CalculatorType } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface PriceAppreciationCalculatorProps {
    currency: string;
}

const PriceAppreciationCalculator: React.FC<PriceAppreciationCalculatorProps> = ({ currency }) => {
  const { t, language } = useTranslation();
  const appSettings = useAppSettings();
  const [purchasePrice, setPurchasePrice] = useState('');
  const [annualAppreciationRate, setAnnualAppreciationRate] = useState('');
  const [numberOfYears, setNumberOfYears] = useState('');

  const appreciation = useMemo(() => {
    const initial = parseFloat(purchasePrice);
    const rate = parseFloat(annualAppreciationRate);
    const years = parseInt(numberOfYears, 10);
    const locale = 'en-US';
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    const defaultResult = {
      futureValue: (0).toLocaleString(locale, options),
      amount: (0).toLocaleString(locale, options),
      percentage: (0).toLocaleString(locale, options),
    };

    if (isNaN(initial) || isNaN(rate) || isNaN(years) || initial <= 0 || years <= 0) {
      return defaultResult;
    }

    const annualRateDecimal = rate / 100;
    const futureValue = initial * Math.pow(1 + annualRateDecimal, years);
    const appreciationAmount = futureValue - initial;
    const appreciationPercentage = (appreciationAmount / initial) * 100;

    return {
      futureValue: futureValue.toLocaleString(locale, options),
      amount: appreciationAmount.toLocaleString(locale, options),
      percentage: isFinite(appreciationPercentage) ? appreciationPercentage.toLocaleString(locale, options) : '∞',
    };
  }, [purchasePrice, annualAppreciationRate, numberOfYears]);

  const calculatorInfo = useMemo(() => getCalculators(t, language, appSettings).find(c => c.id === CalculatorType.Appreciation), [t, language, appSettings]);

  return (
    <CalculatorCard
      title={calculatorInfo?.name || t('calculators.appreciation.name')}
      description={calculatorInfo?.tooltip || t('calculators.appreciation.description')}
      icon={calculatorInfo?.icon}
    >
      <div className="space-y-4">
        <NumberInput
          label={t('appreciationCalculator.initialPurchasePriceLabel')}
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          placeholder={t('appreciationCalculator.initialPurchasePricePlaceholder')}
          currency={currency}
          tooltip={t('appreciationCalculator.initialPurchasePriceTooltip')}
        />
        <NumberInput
          label={t('appreciationCalculator.annualAppreciationRateLabel')}
          value={annualAppreciationRate}
          onChange={(e) => setAnnualAppreciationRate(e.target.value)}
          placeholder={t('appreciationCalculator.annualAppreciationRatePlaceholder')}
          unit="%"
          tooltip={t('appreciationCalculator.annualAppreciationRateTooltip')}
        />
        <NumberInput
          label={t('appreciationCalculator.investmentYearsLabel')}
          value={numberOfYears}
          onChange={(e) => setNumberOfYears(e.target.value)}
          placeholder={t('appreciationCalculator.investmentYearsPlaceholder')}
          unit={t('common.years')}
          tooltip={t('appreciationCalculator.investmentYearsTooltip')}
        />
      </div>
      <ResultDisplay 
        label={t('appreciationCalculator.estimatedFutureValueLabel')} 
        value={appreciation.futureValue} 
        unit={currency} 
        tooltip={t('appreciationCalculator.estimatedFutureValueTooltip')}
      />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultDisplay 
            label={t('appreciationCalculator.totalAppreciationAmountLabel')} 
            value={appreciation.amount} 
            unit={currency} 
            tooltip={t('appreciationCalculator.totalAppreciationAmountTooltip')}
        />
        <ResultDisplay 
            label={t('appreciationCalculator.totalAppreciationPercentageLabel')} 
            value={appreciation.percentage} 
            unit="%" 
            tooltip={t('appreciationCalculator.totalAppreciationPercentageTooltip')}
        />
      </div>
    </CalculatorCard>
  );
};

export default PriceAppreciationCalculator;