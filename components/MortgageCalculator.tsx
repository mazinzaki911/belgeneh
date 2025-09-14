import React, { useState, useMemo } from 'react';
import CalculatorCard from './shared/CalculatorCard';
import NumberInput from './shared/NumberInput';
import ResultDisplay from './shared/ResultDisplay';
import { getCalculators } from '../constants';
import { CalculatorType } from '../types';
import { useTranslation } from '../src/contexts/LanguageContext';

interface MortgageCalculatorProps {
    currency: string;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ currency }) => {
  const { t, language } = useTranslation();
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');

  const calculations = useMemo(() => {
    const P_loanAmount = parseFloat(loanAmount) || 0;
    
    const locale = 'en-US';
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const format = (num: number) => isFinite(num) ? num.toLocaleString(locale, options) : '0.00';

    if (P_loanAmount <= 0) {
        return {
            monthlyPayment: '0.00',
            totalPayment: '0.00',
            totalInterest: '0.00',
        };
    }

    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    const n = years * 12; // Number of payments
    const i = (annualRate / 100) / 12; // Monthly interest rate

    let monthlyPayment = 0;
    if (i > 0 && n > 0) {
        monthlyPayment = P_loanAmount * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment > 0 ? totalPayment - P_loanAmount : 0;

    return {
        monthlyPayment: format(monthlyPayment),
        totalPayment: format(totalPayment),
        totalInterest: format(totalInterest),
    };

  }, [loanAmount, interestRate, loanTerm]);

  const calculatorInfo = useMemo(() => getCalculators(t, language).find(c => c.id === CalculatorType.Mortgage), [t, language]);

  return (
    <CalculatorCard
      title={calculatorInfo?.name || t('calculators.mortgage.name')}
      description={calculatorInfo?.tooltip || t('calculators.mortgage.description')}
      icon={calculatorInfo?.icon}
    >
      <div className="space-y-6">
        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <h3 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('mortgageCalculator.loanDetails')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <NumberInput 
                  label={t('mortgageCalculator.loanAmountLabel')} 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(e.target.value)} 
                  currency={currency} 
                  placeholder={t('mortgageCalculator.loanAmountPlaceholder')}
                  tooltip={t('mortgageCalculator.loanAmountTooltip')}
                />
              </div>
              
              <NumberInput 
                label={t('mortgageCalculator.loanTermLabel')} 
                value={loanTerm} 
                onChange={(e) => setLoanTerm(e.target.value)} 
                placeholder={t('mortgageCalculator.loanTermPlaceholder')}
                tooltip={t('mortgageCalculator.loanTermTooltip')}
              />
              <NumberInput 
                label={t('mortgageCalculator.interestRateLabel')} 
                value={interestRate} 
                onChange={(e) => setInterestRate(e.target.value)} 
                placeholder={t('mortgageCalculator.interestRatePlaceholder')}
                unit="%" 
                tooltip={t('mortgageCalculator.interestRateTooltip')}
              />
          </div>
        </div>

        <div>
          <div className="mt-8 p-6 bg-primary-light dark:bg-primary/10 rounded-lg border-2 border-dashed border-primary/20 dark:border-primary/30">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">{t('mortgageCalculator.monthlyPaymentLabel')}</p>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary-dark my-2">
                {calculations.monthlyPayment} <span className="text-xl sm:text-2xl">{currency}</span>
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('mortgageCalculator.monthlyPaymentSubtext')}</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <ResultDisplay 
                label={t('mortgageCalculator.totalInterestPaidLabel')}
                value={calculations.totalInterest} 
                unit={currency}
                tooltip={t('mortgageCalculator.totalInterestPaidTooltip')}
            />
            <ResultDisplay 
                label={t('mortgageCalculator.totalAmountPaidLabel')}
                value={calculations.totalPayment} 
                unit={currency} 
                tooltip={t('mortgageCalculator.totalAmountPaidTooltip')}
            />
          </div>
        </div>
      </div>
    </CalculatorCard>
  );
};

export default MortgageCalculator;