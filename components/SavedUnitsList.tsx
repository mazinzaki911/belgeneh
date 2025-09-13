import React from 'react';
import { PlusCircleIcon, PencilIcon, TrashIcon, getUnitStatusConfig, BookmarkIcon } from '../constants';
import { useData } from '../src/contexts/DataContext';
import { useUI } from '../src/contexts/UIContext';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { UnitStatus, CalculatorType } from '../types';

const SavedUnitsList: React.FC = () => {
  const { 
    savedUnits, 
    setLoadedUnitId,
    setUnitToDelete, 
    setEditingDealUnit,
  } = useData();
  const { setActiveCalculator, setFullUnitCalcInitialStep } = useUI();
  const { t } = useTranslation();
  const UNIT_STATUS_CONFIG = getUnitStatusConfig(t);

  const handleLoadUnit = (unitId: string, options?: { initialStep?: number }) => {
    setLoadedUnitId(unitId);
    setFullUnitCalcInitialStep(options?.initialStep || 1);
    setActiveCalculator(CalculatorType.FullUnit);
  };

  const handleNewUnit = () => {
      setLoadedUnitId(null);
      setFullUnitCalcInitialStep(1);
      setActiveCalculator(CalculatorType.FullUnit);
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('savedUnitsList.title')}</h1>
            <button
              onClick={handleNewUnit}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              aria-label={t('savedUnitsList.newAnalysis')}
            >
              <PlusCircleIcon className="w-6 h-6" />
              <span>{t('savedUnitsList.newAnalysis')}</span>
            </button>
        </div>

        {savedUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedUnits.map(unit => (
                    <div key={unit.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col transition-shadow hover:shadow-xl">
                        <div className="p-5 flex-grow">
                            <div className="flex justify-between items-start">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 truncate" title={unit.name}>
                                    {unit.name}
                                </h2>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${UNIT_STATUS_CONFIG[unit.status as UnitStatus]?.colorClasses || ''}`}>
                                    {UNIT_STATUS_CONFIG[unit.status as UnitStatus]?.text || unit.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('savedUnitsList.lastUpdate', { date: unit.dealDate ? new Date(unit.dealDate).toLocaleDateString('ar-EG') : t('savedUnitsList.notSet') })}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-2">
                            <button
                                onClick={() => setEditingDealUnit(unit)}
                                className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                aria-label={t('savedUnitsList.editDeal', { unitName: unit.name })}
                                title={t('common.edit')}
                            >
                                <PencilIcon className="w-5 h-5"/>
                            </button>
                            <button
                                onClick={() => setUnitToDelete(unit)}
                                className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                aria-label={t('savedUnitsList.deleteUnit', { unitName: unit.name })}
                                title={t('common.delete')}
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                             <button
                                onClick={() => handleLoadUnit(unit.id, { initialStep: 4 })}
                                className="px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500/40 transition-colors"
                            >
                                {t('savedUnitsList.openAnalysis')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <BookmarkIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-4">{t('savedUnitsList.emptyState.title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                    {t('savedUnitsList.emptyState.description')}
                </p>
                <button
                    onClick={handleNewUnit}
                    className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>{t('savedUnitsList.emptyState.button')}</span>
                </button>
            </div>
        )}
    </div>
  );
};

export default SavedUnitsList;