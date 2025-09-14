
import React, { useState, useMemo } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import ResultDisplay from './shared/ResultDisplay';
import { getCalculators } from '../constants';
import { CalculatorType } from '../types';
import { useTranslation } from '../src/contexts/LanguageContext';
import { getRoiAnalysis } from '../utils/analytics';

interface RoiCalculatorProps {
    currency: string;
}

const RoiCalculator: React.FC<RoiCalculatorProps> = ({ currency }) => {
  const { t, language } = useTranslation();
  const [annualGrossRent, setAnnualGrossRent] = useState('');
  const [annualExpenses, setAnnualExpenses] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [additionalCosts, setAdditionalCosts] = useState('');

  const rawRoi = useMemo(() => {
    const rent = parseFloat(annualGrossRent) || 0;
    const expenses = parseFloat(annualExpenses) || 0;
    const price = parseFloat(purchasePrice) || 0;
    const costs = parseFloat(additionalCosts) || 0;

    const netProfit = rent - expenses;
    const investmentCost = price + costs;

    if (investmentCost === 0) {
      return 0;
    }
    return (netProfit / investmentCost) * 100;
  }, [annualGrossRent, annualExpenses, purchasePrice, additionalCosts]);

  const formattedRoi = useMemo(() => {
    const locale = 'en-US';
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return rawRoi.toLocaleString(locale, options);
  }, [rawRoi]);

  const roiAnalysis = useMemo(() => {
    if (rawRoi <= 0 || !isFinite(rawRoi)) {
      return null;
    }
    return getRoiAnalysis(rawRoi);
  }, [rawRoi]);

  const calculatorInfo = useMemo(() => getCalculators(t, language).find(c => c.id === CalculatorType.ROI), [t, language]);

  return (
    <CalculatorCard
      title={t('calculators.roi.name')}
      description={t('calculators.roi.description')}
      icon={calculatorInfo?.icon}
    >
      <div className="space-y-6">
        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('roiCalculator.annualRevenueAndExpenses')}</h3>
            <div className="space-y-4">
                <NumberInput
                  label={t('roiCalculator.annualGrossRentLabel')}
                  value={annualGrossRent}
                  onChange={(e) => setAnnualGrossRent(e.target.value)}
                  placeholder={`${t('common.example')}: 180,000`}
                  currency={currency}
                  tooltip={t('roiCalculator.annualGrossRentTooltip')}
                />
                <NumberInput
                  label={t('roiCalculator.annualExpensesLabel')}
                  value={annualExpenses}
                  onChange={(e) => setAnnualExpenses(e.target.value)}
                  placeholder={`${t('common.example')}: 30,000`}
                  currency={currency}
                  tooltip={t('roiCalculator.annualExpensesTooltip')}
                />
            </div>
        </div>

        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
             <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('roiCalculator.investmentCosts')}</h3>
             <div className="space-y-4">
                <NumberInput
                  label={t('roiCalculator.purchasePriceLabel')}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder={`${t('common.example')}: 2,000,000`}
                  currency={currency}
                  tooltip={t('roiCalculator.purchasePriceTooltip')}
                />
                <NumberInput
                  label={t('roiCalculator.additionalCostsLabel')}
                  value={additionalCosts}
                  onChange={(e) => setAdditionalCosts(e.target.value)}
                  placeholder={`${t('common.example')}: 250,000`}
                  currency={currency}
                  tooltip={t('roiCalculator.additionalCostsTooltip')}
                />
            </div>
        </div>
      </div>
      
      <ResultDisplay 
        label={t('roiCalculator.roiResultLabel')} 
        value={formattedRoi} 
        unit="%" 
        tooltip={t('roiCalculator.roiResultTooltip')}
      />

      {roiAnalysis && (
        <div className={`mt-4 p-4 rounded-lg border ${roiAnalysis.colorClasses}`}>
          <h3 className="font-bold text-lg mb-1">{t(`analysis.roi.${roiAnalysis.ratingKey}.rating`)}</h3>
          <p className="text-sm">{t(`analysis.roi.${roiAnalysis.ratingKey}.description`)}</p>
        </div>
      )}

    </CalculatorCard>
  );
};

export default RoiCalculator;