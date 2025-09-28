import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for constants.
import { getCalculators, ChevronDownIcon } from '../constants';
import { CalculatorType } from '../types';
import { useUI } from '../src/contexts/UIContext';
import { useTranslation } from '../src/contexts/LanguageContext';
import { useAppSettings } from '../src/contexts/AppSettingsContext';
import { useToast } from '../src/contexts/ToastContext';

const AccordionItem: React.FC<{
    calc: ReturnType<typeof getCalculators>[0],
    isOpen: boolean,
    onToggle: () => void
}> = ({ calc, isOpen, onToggle }) => {
    const { t } = useTranslation();
    const { setActiveCalculator } = useUI();
    const { disabledTools } = useAppSettings();
    const showToast = useToast();
    const { id, name, icon } = calc;
    
    const managementTools = [
        CalculatorType.SavedUnits,
        CalculatorType.Dashboard,
        CalculatorType.Portfolio,
    ];
    const hasExample = !managementTools.includes(id);

    const isToolDisabled = !!disabledTools[id];

    const handleGoToCalculator = () => {
        if (isToolDisabled) {
            showToast(t('sidebar.toolDisabled'), 'error');
            return;
        }
        setActiveCalculator(id);
    };

    return (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <h2>
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-5 font-semibold text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                >
                    <div className="flex items-center gap-4">
                        <span className="text-primary dark:text-primary-dark">{icon}</span>
                        <span>{name}</span>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>
            </h2>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} grid`}>
                <div className="overflow-hidden">
                    <div className="p-5 bg-neutral-50 dark:bg-neutral-900/50 space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg text-neutral-700 dark:text-neutral-200">{t('introductionPage.whatItDoes')}</h4>
                            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300" dangerouslySetInnerHTML={{ __html: t(`introductionPage.${id.toLowerCase()}.whatItDoes`) }}></p>
                        </div>
                        
                        {hasExample && (
                             <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                <h4 className="font-bold text-lg text-primary dark:text-primary-dark mb-3">{t(`introductionPage.${calc.id.toLowerCase()}.exampleTitle`)}</h4>
                                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300" dangerouslySetInnerHTML={{ __html: t(`introductionPage.${calc.id.toLowerCase()}.example`) }}></p>
                            </div>
                        )}
                       
                        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                             <button 
                                onClick={handleGoToCalculator} 
                                disabled={isToolDisabled}
                                className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed"
                             >
                                {t('introductionPage.goToCalculator')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const IntroductionPage: React.FC = () => {
    const { t, language } = useTranslation();
    const appSettings = useAppSettings();
    const [openItemId, setOpenItemId] = useState<string | null>(null);

    const calculatorInfo = useMemo(() => getCalculators(t, language, appSettings).find(c => c.id === CalculatorType.Introduction), [t, language, appSettings]);
    
    const calculatorsToShow = useMemo(() => 
        getCalculators(t, language, appSettings).filter(c => 
            c.id !== CalculatorType.Introduction &&
            c.id !== CalculatorType.AdminDashboard &&
            c.id !== CalculatorType.Profile &&
            c.id !== CalculatorType.Settings
        ), [t, language, appSettings]
    );

    const handleToggle = (id: string) => {
        setOpenItemId(prevId => (prevId === id ? null : id));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <div className="flex justify-center items-center gap-3 text-neutral-800 dark:text-neutral-100">
                    {calculatorInfo?.icon}
                    <h1 className="text-3xl font-bold">{t('introductionPage.title')}</h1>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl mx-auto">{t('introductionPage.description')}</p>
            </div>
            
            <div className="space-y-4">
                {calculatorsToShow.map(calc => (
                    <AccordionItem 
                        key={calc.id}
                        calc={calc}
                        isOpen={openItemId === calc.id}
                        onToggle={() => handleToggle(calc.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default IntroductionPage;