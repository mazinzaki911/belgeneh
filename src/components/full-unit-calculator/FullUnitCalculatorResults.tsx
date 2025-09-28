import React, { useState, useMemo } from 'react';
import ResultDisplay from '../shared/ResultDisplay';
import CollapsibleSection from '../shared/CollapsibleSection';
import { useTranslation } from '../../contexts/LanguageContext';
import { formatYearsAndMonths } from '../../utils/formatters';
import { calculateUnitAnalytics } from '../../utils/analytics';

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

interface FullUnitCalculatorResultsProps {
    analytics: ReturnType<typeof calculateUnitAnalytics>;
    currency: string;
    unitName: string;
}

const FullUnitCalculatorResults: React.FC<FullUnitCalculatorResultsProps> = ({ analytics, currency }) => {
    const { t, language } = useTranslation();
    const [projectionYears, setProjectionYears] = useState(10);

    const { formatted, analysis, showAdvancedMetrics, showAppreciation, showNpv, hasRent, raw } = analytics;
    
    const analysisItems = [
        { key: 'roi', label: t('fullUnitCalculator.roiLabel'), value: formatted.roi, tooltip: t('fullUnitCalculator.roiTooltip'), analysis: analysis.roi, show: showAdvancedMetrics },
        { key: 'roe', label: t('fullUnitCalculator.roeLabel'), value: formatted.roe, tooltip: t('fullUnitCalculator.roeTooltip'), analysis: analysis.roe, show: showAdvancedMetrics },
        { key: 'capRate', label: t('fullUnitCalculator.capRateLabel'), value: formatted.capRate, tooltip: t('fullUnitCalculator.capRateTooltip'), analysis: analysis.capRate, show: showAdvancedMetrics },
        { key: 'paybackPeriod', label: t('fullUnitCalculator.totalPaybackPeriodLabel'), value: formatYearsAndMonths(analytics.raw.totalPaybackPeriodFromContract, t), unit: '', tooltip: t('fullUnitCalculator.totalPaybackPeriodTooltip'), analysis: analysis.paybackPeriod, show: hasRent },
    ];

    const longTermItems = [
        { 
            key: 'futureValue',
            label: raw.appreciationYears > 0 ? t('fullUnitCalculator.futureValueLabel', { years: raw.appreciationYears }) : t('fullUnitCalculator.futureValueLabelSimple'), 
            value: formatted.futureValue, 
            unit: currency, 
            tooltip: raw.appreciationYears > 0 ? t('fullUnitCalculator.futureValueTooltip', { years: raw.appreciationYears }) : t('fullUnitCalculator.futureValueTooltipSimple'), 
            analysis: null, 
            show: showAppreciation 
        },
        { key: 'npv', label: t('fullUnitCalculator.npvLabel'), value: formatted.npv, unit: currency, tooltip: t('fullUnitCalculator.npvTooltip'), analysis: analysis.npv, show: showNpv }
    ];

    const breakEvenYear = useMemo(() => {
        const breakEvenRow = analytics.cashFlowProjection[20].find(row => row.cumulativeCashFlow >= 0);
        return breakEvenRow ? breakEvenRow.year : null;
    }, [analytics.cashFlowProjection]);

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <CollapsibleSection title={t('fullUnitCalculator.results.keyMetrics')} isOpenByDefault>
                <div className="space-y-6">
                    <ResultDisplay label={t('fullUnitCalculator.totalCostLabel')} value={formatted.totalCost} unit={currency} tooltip={t('fullUnitCalculator.totalCostTooltip')} />
                    <ResultDisplay label={t('fullUnitCalculator.paidUntilHandoverLabel')} value={formatted.paidUntilHandover} unit={currency} tooltip={t('fullUnitCalculator.paidUntilHandoverTooltip')} />
                    {analysisItems.filter(item => item.show).map(item => (
                        <div key={item.key}>
                            <ResultDisplay label={item.label} value={item.value} unit={item.unit ?? '%'} tooltip={item.tooltip} />
                            {item.analysis && (
                                <div className={`mt-4 p-4 rounded-lg border ${item.analysis.colorClasses}`}>
                                    <h3 className="font-bold text-lg mb-1">{t(`analysis.${item.key}.${item.analysis.ratingKey}.rating`)}</h3>
                                    <p className="text-sm" dangerouslySetInnerHTML={{__html: t(`analysis.${item.key}.${item.analysis.ratingKey}.description`, {amount: `<strong>${item.value}</strong>`, currency: `<strong>${currency}</strong>`})}}/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {(showAppreciation || showNpv) && (
                <CollapsibleSection title={t('fullUnitCalculator.results.longTerm')} isOpenByDefault>
                     <div className="space-y-6">
                        {longTermItems.filter(item => item.show).map(item => (
                            <div key={item.key}>
                                <ResultDisplay label={item.label} value={item.value} unit={item.unit} tooltip={item.tooltip} />
                                {item.analysis && (
                                     <div className={`mt-4 p-4 rounded-lg border ${item.analysis.colorClasses}`}>
                                        <h3 className="font-bold text-lg mb-1">{t(`analysis.${item.key}.${item.analysis.ratingKey}.rating`)}</h3>
                                        <p className="text-sm" dangerouslySetInnerHTML={{__html: t(`analysis.${item.key}.${item.analysis.ratingKey}.description`, {amount: `<strong>${item.value}</strong>`, currency: `<strong>${currency}</strong>`})}}/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {hasRent && (
                <CollapsibleSection title={t('fullUnitCalculator.results.cashFlow')} isOpenByDefault>
                    <div className="flex justify-center items-center gap-3 text-primary dark:text-primary-dark mb-2">
                        <ChartBarIcon className="w-8 h-8"/>
                        <h3 className="text-2xl font-bold text-center">{t('fullUnitCalculator.cashFlowProjectionTitle')}</h3>
                    </div>
                    <p className="text-center text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-6 text-sm">
                        {t('fullUnitCalculator.cashFlowProjectionDescription')}
                    </p>
                    <div className="overflow-x-auto custom-scrollbar">
                       <div className="flex justify-center gap-2 mb-4 p-1 bg-neutral-200 dark:bg-neutral-900/50 rounded-full mx-auto w-fit">
                            {[5, 10, 15, 20].map(year => (
                                <button 
                                    key={year} 
                                    onClick={() => setProjectionYears(year)} 
                                    className={`px-5 py-1.5 rounded-full font-semibold text-sm transition-all duration-300 ${projectionYears === year ? 'bg-white dark:bg-neutral-700 text-primary shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-neutral-700/60'}`}
                                >
                                    {language === 'ar' ? `${year} ${t(year >= 11 ? 'common.year' : 'common.years')}` : `${year} ${t('common.years')}`}
                                </button>
                            ))}
                       </div>
                       <table className="w-full min-w-max text-center">
                           <thead className="border-b-2 border-neutral-200 dark:border-neutral-700">
                               <tr className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.year')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.rent')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.expenses')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.installments')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.netCashFlow')}</th>
                                   <th className="p-3 font-semibold">{t('fullUnitCalculator.projectionTableHeaders.cumulative')}</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                               {analytics.cashFlowProjection[projectionYears].map((row: any) => (
                                   <tr key={row.year} className={`text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 ${row.year === 0 ? 'bg-neutral-100 dark:bg-neutral-700/50 font-medium' : ''}`}>
                                       <td className="p-2 font-semibold">{row.year === 0 ? t('fullUnitCalculator.handoverYearLabel') : row.year}</td>
                                       <td className="p-2">{row.rent > 0 ? row.rent.toLocaleString('en-US', {maximumFractionDigits: 0}) : '-'}</td>
                                       <td className="p-2 text-amber-600 dark:text-amber-400">{row.expenses > 0 ? `-${row.expenses.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-'}</td>
                                       <td className="p-2 text-red-600 dark:text-red-400">{row.installments > 0 ? `-${row.installments.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-'}</td>
                                       <td className={`p-2 font-bold ${row.netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{row.netCashFlow.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                       <td className={`p-2 font-bold ${row.cumulativeCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{row.cumulativeCashFlow.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                    </div>
                     <div className="mt-6 text-center text-sm p-4 bg-primary-light dark:bg-primary/10 rounded-lg border border-primary/20">
                        {breakEvenYear !== null ? (
                             <p className="font-semibold text-neutral-700 dark:text-neutral-200" dangerouslySetInnerHTML={{ __html: t('fullUnitCalculator.cashFlowSummary', { breakEvenYear: breakEvenYear === 0 ? t('fullUnitCalculator.withinFirstYear') : breakEvenYear }) }}/>
                        ) : (
                            <p className="font-semibold text-neutral-700 dark:text-neutral-200" dangerouslySetInnerHTML={{ __html: t('fullUnitCalculator.cashFlowSummaryNotPositive', { projectionYears: 20 }) }}/>
                        )}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
};

export default FullUnitCalculatorResults;