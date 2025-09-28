import React, { useMemo } from 'react';
import NumberInput from '../shared/NumberInput';
import DateInput from '../shared/DateInput';
import SelectInput from '../shared/SelectInput';
import ErrorMessage from '../shared/ErrorMessage';
import { useTranslation } from '../../contexts/LanguageContext';
import { FullUnitData } from '../../types';

interface FullUnitCalculatorStep2Props {
    formData: FullUnitData;
    dispatch: React.Dispatch<any>;
    errors: Record<string, string>;
    currency: string;
}

const FullUnitCalculatorStep2: React.FC<FullUnitCalculatorStep2Props> = ({ formData, dispatch, errors, currency }) => {
    const { t } = useTranslation();

    const handleInputChange = (field: keyof FullUnitData, value: string) => {
        dispatch({ type: 'SET_FORM_DATA', payload: { field, value } });
    };

    const frequencyOptions = useMemo(() => ([
        { label: t('fullUnitCalculator.monthly'), value: 1 },
        { label: t('fullUnitCalculator.quarterly'), value: 3 },
        { label: t('fullUnitCalculator.semiAnnually'), value: 6 },
        { label: t('fullUnitCalculator.annually'), value: 12 },
    ]), [t]);

    const p_totalPrice = parseFloat(formData.totalPrice) || 0;
    const p_maintenancePercentage = parseFloat(formData.maintenancePercentage) || 0;
    const maintenanceAmount = p_totalPrice * (p_maintenancePercentage / 100);
    const formattedMaintenanceAmount = isFinite(maintenanceAmount) ? maintenanceAmount.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0';

    return (
        <div className="space-y-6 animate-fade-in pb-16">
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
};

export default FullUnitCalculatorStep2;