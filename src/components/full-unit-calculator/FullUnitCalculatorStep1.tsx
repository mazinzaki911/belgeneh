import React from 'react';
import TextInput from '../shared/TextInput';
import ErrorMessage from '../shared/ErrorMessage';
import { useTranslation } from '../../contexts/LanguageContext';

interface FullUnitCalculatorStep1Props {
    unitName: string;
    dispatch: React.Dispatch<any>;
    isStep1Attempted: boolean;
    errors: Record<string, string>;
}

const FullUnitCalculatorStep1: React.FC<FullUnitCalculatorStep1Props> = ({ unitName, dispatch, isStep1Attempted, errors }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 animate-fade-in pb-16">
            <h3 className="text-xl font-bold text-center text-primary dark:text-primary-dark">{t('fullUnitCalculator.step1Title')}</h3>
            <div>
                <TextInput
                    label={t('fullUnitCalculator.unitNameLabel')}
                    value={unitName}
                    onChange={(e) => dispatch({ type: 'SET_UNIT_NAME', payload: e.target.value })}
                    placeholder={t('fullUnitCalculator.unitNamePlaceholder')}
                    tooltip={t('fullUnitCalculator.unitNameTooltip')}
                    autoFocus
                />
                {isStep1Attempted && errors.unitName && <ErrorMessage message={errors.unitName} />}
            </div>
        </div>
    );
};

export default FullUnitCalculatorStep1;