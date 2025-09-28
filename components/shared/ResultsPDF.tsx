import React from 'react';
import { calculateUnitAnalytics } from '../../utils/analytics';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { formatYearsAndMonths } from '../../utils/formatters';
import { AppLogoIcon } from '../../constants';

interface ResultsPDFProps {
    analytics: ReturnType<typeof calculateUnitAnalytics>;
    currency: string;
    unitName: string;
}

const PDFResultRow: React.FC<{ label: string, value: string, unit?: string, isHighlighted?: boolean }> = ({ label, value, unit, isHighlighted }) => (
    <div className={`flex justify-between items-baseline py-3 px-4 ${isHighlighted ? 'bg-blue-50' : ''}`}>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-base font-bold text-gray-800">{value} {unit}</p>
    </div>
);


const ResultsPDF = React.forwardRef<HTMLDivElement, ResultsPDFProps>(({ analytics, currency, unitName }, ref) => {
    const { t, isRtl } = useTranslation();
    const { formatted, raw, hasRent, showAdvancedMetrics, showAppreciation, showNpv, cashFlowProjection } = analytics;

    const analysisItems = [
        { key: 'roi', label: t('fullUnitCalculator.roiLabel'), value: formatted.roi, show: showAdvancedMetrics },
        { key: 'roe', label: t('fullUnitCalculator.roeLabel'), value: formatted.roe, show: showAdvancedMetrics },
        { key: 'capRate', label: t('fullUnitCalculator.capRateLabel'), value: formatted.capRate, show: showAdvancedMetrics },
        { key: 'paybackPeriod', label: t('fullUnitCalculator.totalPaybackPeriodLabel'), value: formatYearsAndMonths(raw.totalPaybackPeriodFromContract, t), unit: '', show: hasRent },
    ];

    const longTermItems = [
        { 
            key: 'futureValue',
            label: raw.appreciationYears > 0 ? t('fullUnitCalculator.futureValueLabel', { years: raw.appreciationYears }) : t('fullUnitCalculator.futureValueLabelSimple'), 
            value: formatted.futureValue, 
            unit: currency, 
            show: showAppreciation 
        },
        { key: 'npv', label: t('fullUnitCalculator.npvLabel'), value: formatted.npv, unit: currency, show: showNpv }
    ];
    
    return (
        <div 
            ref={ref} 
            className="absolute -top-[9999px] -left-[9999px] w-[800px] bg-white text-gray-800 p-10 font-sans"
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
            <div className="flex justify-between items-center pb-4 border-b-2 border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('pdfReport.title')}</h1>
                    <h2 className="text-xl text-gray-600 mt-1">{unitName}</h2>
                </div>
                <AppLogoIcon className="w-40 h-auto" />
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold text-blue-700 mb-4">{t('fullUnitCalculator.results.keyMetrics')}</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                    <PDFResultRow label={t('fullUnitCalculator.totalCostLabel')} value={formatted.totalCost} unit={currency} isHighlighted />
                    <PDFResultRow label={t('fullUnitCalculator.paidUntilHandoverLabel')} value={formatted.paidUntilHandover} unit={currency} />
                    {analysisItems.filter(i => i.show).map(item => (
                        <PDFResultRow key={item.key} label={item.label} value={item.value} unit={item.unit ?? '%'} />
                    ))}
                </div>
            </div>

            {(showAppreciation || showNpv) && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-blue-700 mb-4">{t('fullUnitCalculator.results.longTerm')}</h3>
                     <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                        {longTermItems.filter(i => i.show).map(item => (
                             <PDFResultRow key={item.key} label={item.label} value={item.value} unit={item.unit} />
                        ))}
                    </div>
                </div>
            )}
            
            {hasRent && (
                 <div className="mt-8">
                    <h3 className="text-xl font-bold text-blue-700 mb-4">{t('fullUnitCalculator.results.cashFlow')}</h3>
                    <table className="w-full text-sm text-center">
                       <thead className="bg-gray-100 border-b-2 border-gray-300">
                           <tr className="font-semibold text-gray-600">
                               <th className="p-2">{t('fullUnitCalculator.projectionTableHeaders.year')}</th>
                               <th className="p-2">{t('fullUnitCalculator.projectionTableHeaders.rent')}</th>
                               <th className="p-2">{t('fullUnitCalculator.projectionTableHeaders.expenses')}</th>
                               <th className="p-2">{t('fullUnitCalculator.projectionTableHeaders.installments')}</th>
                               <th className="p-2">{t('fullUnitCalculator.projectionTableHeaders.netCashFlow')}</th>
                               <th className="p-2">{t('fullUnitCalculator.projectionTableHeaders.cumulative')}</th>
                           </tr>
                       </thead>
                       <tbody>
                           {cashFlowProjection[20].map((row: any, index: number) => (
                               <tr key={row.year} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                   <td className="p-2 font-semibold">{row.year === 0 ? t('fullUnitCalculator.handoverYearLabel') : row.year}</td>
                                   <td className="p-2">{row.rent > 0 ? row.rent.toLocaleString('en-US', {maximumFractionDigits: 0}) : '-'}</td>
                                   <td className="p-2">{row.expenses > 0 ? `-${row.expenses.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-'}</td>
                                   <td className="p-2">{row.installments > 0 ? `-${row.installments.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-'}</td>
                                   <td className={`p-2 font-bold ${row.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>{row.netCashFlow.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                   <td className={`p-2 font-bold ${row.cumulativeCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>{row.cumulativeCashFlow.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
            )}
            
            <div className="text-center mt-12 text-xs text-gray-500 pt-4 border-t border-gray-200">
                <p>{t('pdfReport.generatedBy')}</p>
            </div>
        </div>
    );
});

export default ResultsPDF;
