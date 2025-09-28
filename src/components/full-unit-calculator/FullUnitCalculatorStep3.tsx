import React from 'react';
import NumberInput from '../shared/NumberInput';
import { useTranslation } from '../../contexts/LanguageContext';
import { FullUnitData } from '../../types';

interface FullUnitCalculatorStep3Props {
    formData: FullUnitData;
    dispatch: React.Dispatch<any>;
    currency: string;
}

const FullUnitCalculatorStep3: React.FC<FullUnitCalculatorStep3Props> = ({ formData, dispatch, currency }) => {
    const { t } = useTranslation();
    
    const handleInputChange = (field: keyof FullUnitData, value: string) => {
        dispatch({ type: 'SET_FORM_DATA', payload: { field, value } });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-16">
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
};

export default FullUnitCalculatorStep3;