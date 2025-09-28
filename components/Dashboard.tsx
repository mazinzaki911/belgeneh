
import React, { useState, useMemo } from 'react';
import { SavedUnit } from '../types';
import { calculateUnitAnalytics } from '../utils/analytics';
import { getCalculators, StarIcon, ComparisonDashboardIcon, LightBulbIcon } from '../constants';
import { CalculatorType } from '../types';
import InfoTooltip from './shared/InfoTooltip';
import { useData } from '../src/contexts/DataContext';
import { useUI } from '../src/contexts/UIContext';
import { useTranslation } from '../src/contexts/LanguageContext';
import { formatYearsAndMonths } from '../utils/formatters';
import { useAppSettings } from '../src/contexts/AppSettingsContext';


interface DashboardProps {
  currency: string;
}

type MetricKey = 'totalCost' | 'paidUntilHandover' | 'totalPaybackPeriodFromContract' | 'roi' | 'roe' | 'capRate';

export const Dashboard: React.FC<DashboardProps> = ({ currency }) => {
  const { savedUnits, setLoadedUnitId } = useData();
  const { setActiveCalculator, setFullUnitCalcInitialStep } = useUI();
  const { t, language, isRtl } = useTranslation();
  const appSettings = useAppSettings();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(savedUnits.map(u => u.id)));
  
  const metricsToShow: readonly { key: MetricKey, label: string; lowerIsBetter: boolean; tooltip: string; }[] = useMemo(() => [
    { key: 'totalCost', label: t('dashboard.metrics.totalCost'), lowerIsBetter: true, tooltip: t('dashboard.tooltips.totalCost') },
    { key: 'paidUntilHandover', label: t('dashboard.metrics.paidUntilHandover'), lowerIsBetter: true, tooltip: t('dashboard.tooltips.paidUntilHandover') },
    { key: 'totalPaybackPeriodFromContract', label: t('dashboard.metrics.paybackPeriod'), lowerIsBetter: true, tooltip: t('dashboard.tooltips.paybackPeriod') },
    { key: 'roi', label: t('dashboard.metrics.roi'), lowerIsBetter: false, tooltip: t('dashboard.tooltips.roi') },
    { key: 'roe', label: t('dashboard.metrics.roe'), lowerIsBetter: false, tooltip: t('dashboard.tooltips.roe') },
    { key: 'capRate', label: t('dashboard.metrics.capRate'), lowerIsBetter: false, tooltip: t('dashboard.tooltips.capRate') },
  ], [t]);
  

  const handleLoadUnit = (unitId: string) => {
    setLoadedUnitId(unitId);
    setFullUnitCalcInitialStep(4);
    setActiveCalculator(CalculatorType.FullUnit);
  };


  const handleUnitSelect = (unitId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(unitId)) {
      newSelectedIds.delete(unitId);
    } else {
      newSelectedIds.add(unitId);
    }
    setSelectedIds(newSelectedIds);
  };

  const selectedUnits = useMemo(() => savedUnits.filter(u => selectedIds.has(u.id)), [savedUnits, selectedIds]);
  const calculatorInfo = useMemo(() => getCalculators(t, language, appSettings).find(c => c.id === CalculatorType.Dashboard), [t, language, appSettings]);
  
  const comparisonData = useMemo(() => {
    if (selectedUnits.length < 1) {
      return { analyticsData: [], bestValues: {}, recommendation: null };
    }

    const analyticsData = selectedUnits.map(unit => ({
      unit,
      analytics: calculateUnitAnalytics(unit.data)
    }));

    const bestValues: { [key: string]: number | null } = {};
    const scores = new Map<string, number>();
    const wins = new Map<string, string[]>();

    metricsToShow.forEach(metric => {
      const bestValue = analyticsData.reduce((best: number | null, current) => {
        const currentValue = current.analytics.raw[metric.key as MetricKey];
        if (currentValue === null || !isFinite(currentValue) || currentValue === 0) return best;
        if (best === null) return currentValue;
        return metric.lowerIsBetter ? Math.min(best, currentValue) : Math.max(best, currentValue);
      }, null);
      
      bestValues[metric.key] = bestValue;

      if (bestValue === null) return;

      analyticsData.forEach(data => {
        const rawValue = data.analytics.raw[metric.key as MetricKey];
        if (rawValue === bestValue) {
            const unitId = data.unit.id;
            scores.set(unitId, (scores.get(unitId) || 0) + 1);
            const currentWins = wins.get(unitId) || [];
            wins.set(unitId, [...currentWins, metric.label]);
        }
      });
    });

    let maxScore = -1;
    scores.forEach(score => { if (score > maxScore) maxScore = score; });
    
    const winners: SavedUnit[] = [];
    scores.forEach((score, unitId) => {
        if (score === maxScore && maxScore > 0) {
            const winnerUnit = savedUnits.find(u => u.id === unitId);
            if (winnerUnit) winners.push(winnerUnit);
        }
    });

    let recommendation: { type: 'singleWinner' | 'tie' | 'noClearWinner', units: SavedUnit[], metrics?: string[] } | null = null;
    if (selectedUnits.length > 1) {
        if (winners.length === 1) {
            const winningUnit = winners[0];
            const winningMetrics = wins.get(winningUnit.id) || [];
            recommendation = { type: 'singleWinner', units: [winningUnit], metrics: winningMetrics };
        } else if (winners.length > 1) {
            recommendation = { type: 'tie', units: winners };
        } else {
            recommendation = { type: 'noClearWinner', units: [] };
        }
    }

    return { analyticsData, bestValues, recommendation };
  }, [selectedUnits, metricsToShow, savedUnits]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 text-neutral-800 dark:text-neutral-100">
            {calculatorInfo?.icon}
            <h1 className="text-3xl font-bold">{calculatorInfo?.name}</h1>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">{calculatorInfo?.tooltip}</p>
      </div>

      {savedUnits.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-12 text-center">
            <ComparisonDashboardIcon className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600" />
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mt-4">{t('dashboard.emptyState.title')}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-md mx-auto">
                {t('dashboard.emptyState.description')}
            </p>
        </div>
      ) : (
        <>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
                 <div>
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">{t('dashboard.step1Title')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {savedUnits.map(unit => (
                            <label key={unit.id} className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(unit.id)}
                                    onChange={() => handleUnitSelect(unit.id)}
                                    className="form-checkbox h-5 w-5 text-primary dark:bg-neutral-600 rounded focus:ring-primary"
                                />
                                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate" title={unit.name}>{unit.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            
            {selectedUnits.length > 0 ? (
                <>
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{t('dashboard.resultsTitle')}</h3>
                            
                            {/* Mobile & Small Tablet View: List of Metrics */}
                            <div className="lg:hidden mt-4 space-y-4">
                                {metricsToShow.map(metric => {
                                    const bestValue = comparisonData.bestValues[metric.key];
                                    return (
                                    <div key={metric.key} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <h4 className="font-semibold text-neutral-700 dark:text-neutral-200">{metric.label}</h4>
                                            <InfoTooltip text={metric.tooltip} />
                                        </div>
                                        <div className="space-y-2">
                                            {comparisonData.analyticsData.map(({ unit, analytics }) => {
                                                const rawValue = analytics.raw[metric.key];
                                                const isBest = rawValue !== null && isFinite(rawValue) && rawValue === bestValue;
                                                
                                                let displayValue: string;
                                                let valueUnit = '';
                                                
                                                if (metric.key === 'totalPaybackPeriodFromContract') {
                                                    displayValue = formatYearsAndMonths(rawValue, t);
                                                } else {
                                                    displayValue = analytics.formatted[metric.key];
                                                    if (['roi', 'roe', 'capRate'].includes(metric.key)) {
                                                        valueUnit = '%';
                                                    }
                                                }

                                                return (
                                                    <div key={unit.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50">
                                                        <span className="font-medium text-neutral-600 dark:text-neutral-300">{unit.name}</span>
                                                        <div className={`flex items-center gap-1 font-bold ${isBest ? 'text-green-600 dark:text-green-400' : 'text-neutral-800 dark:text-neutral-100'}`}>
                                                            {isBest && <StarIcon className="w-4 h-4 text-amber-400" />}
                                                            <span>{displayValue} {valueUnit}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden lg:block">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className={`w-full min-w-max border-collapse text-center`}>
                                    <thead>
                                        <tr className="bg-neutral-50 dark:bg-neutral-800">
                                            <th className={`p-4 font-semibold text-neutral-600 dark:text-neutral-300 z-30 sticky top-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700`}>{t('dashboard.metricHeader')}</th>
                                            {selectedUnits.map(unit => (
                                                <th key={unit.id} className="p-4 font-bold text-primary dark:text-primary-dark whitespace-nowrap min-w-[160px] sticky top-0 z-20 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                                                    <button onClick={() => handleLoadUnit(unit.id)} className="hover:underline" title={`${t('dashboard.goToUnit')} ${unit.name}`}>
                                                        {unit.name}
                                                    </button>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                        {metricsToShow.map(metric => (
                                            <tr key={metric.key} className="group hover:bg-primary-light/50 dark:hover:bg-primary/10 transition-colors duration-150">
                                                <th className={`p-4 font-semibold text-neutral-700 dark:text-neutral-200 text-start z-10 whitespace-nowrap sticky transition-colors duration-150 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 group-hover:bg-primary-light/50 dark:group-hover:bg-primary/10`}>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{metric.label}</span>
                                                        <InfoTooltip text={metric.tooltip} />
                                                    </div>
                                                </th>
                                                {selectedUnits.map(unitInColumn => {
                                                    const dataForUnit = comparisonData.analyticsData.find(d => d.unit.id === unitInColumn.id);
                                                    if (!dataForUnit) return <td key={unitInColumn.id} className="p-4">-</td>;

                                                    const { analytics } = dataForUnit;
                                                    const rawValue = analytics.raw[metric.key];
                                                    const isBest = rawValue !== null && isFinite(rawValue) && rawValue === comparisonData.bestValues[metric.key];
                                                    
                                                    let displayValue: string;
                                                    let unit = '';
                                                    
                                                    if (metric.key === 'totalPaybackPeriodFromContract') {
                                                        displayValue = formatYearsAndMonths(rawValue, t);
                                                    } else {
                                                        displayValue = analytics.formatted[metric.key];
                                                        if (['roi', 'roe', 'capRate'].includes(metric.key)) {
                                                            unit = '%';
                                                        }
                                                    }
                                                    
                                                    return (
                                                        <td key={unitInColumn.id} className={`p-4 font-semibold transition-colors duration-150 ${isBest ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10' : 'text-neutral-800 dark:text-neutral-100'}`}>
                                                            <div className="flex justify-center items-center gap-1">
                                                                {isBest && <StarIcon className="w-4 h-4 text-amber-400" />}
                                                                <span>{displayValue} {unit}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {comparisonData.recommendation && (
                        <div className="mt-8 bg-primary-light dark:bg-neutral-800 rounded-2xl shadow-lg p-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
                                <StarIcon className="w-12 h-12 text-primary dark:text-primary-dark flex-shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{t('dashboard.recommendation.title')}</h3>
                                    
                                    {comparisonData.recommendation.type === 'singleWinner' && (
                                        <div className="mt-2">
                                            <p className="text-neutral-700 dark:text-neutral-200">
                                                {t('dashboard.recommendation.theStrongest')}: <span className="font-bold text-lg text-neutral-900 dark:text-white">{comparisonData.recommendation.units[0].name}</span>
                                            </p>
                                            {comparisonData.recommendation.metrics && comparisonData.recommendation.metrics.length > 0 && (
                                                <div className="mt-3">
                                                    <h4 className="font-semibold text-sm text-neutral-600 dark:text-neutral-300">{t('dashboard.recommendation.keyStrengths')}:</h4>
                                                    <ul className="mt-1 list-disc list-inside text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
                                                        {comparisonData.recommendation.metrics.slice(0, 3).map(metric => (
                                                            <li key={metric}><strong>{metric}</strong></li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {comparisonData.recommendation.type === 'tie' && (
                                         <p className="mt-2 text-neutral-700 dark:text-neutral-200">
                                            {t('dashboard.recommendation.tieMessage')}: <span className="font-bold text-neutral-900 dark:text-white">{comparisonData.recommendation.units.map(u => u.name).join(` ${t('common.and')} `)}</span>
                                        </p>
                                    )}

                                    {comparisonData.recommendation.type === 'noClearWinner' && (
                                        <p className="mt-2 text-neutral-700 dark:text-neutral-200">{t('dashboard.recommendation.noClearWinner')}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-12 text-center">
                    <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">{t('dashboard.emptySelection.title')}</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">{t('dashboard.emptySelection.description')}</p>
                </div>
            )}
        </>
      )}
    </div>
  );
};
