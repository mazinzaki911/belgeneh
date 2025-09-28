

import React, { useMemo } from 'react';
import { PortfolioProperty } from '../types';
import { getCalculators, NewPortfolioIcon, PlusCircleIcon, PencilIcon, TrashIcon, StarIcon, ListBulletIcon } from '../constants';
import { CalculatorType, PropertyType } from '../types';
import { useData } from '../contexts/DataContext';
import { useTranslation } from '../contexts/LanguageContext';
import { getCapRateAnalysis } from '../utils/analytics';
import PortfolioAllocationChart from './portfolio/PortfolioAllocationChart';
import { useAppSettings } from '../contexts/AppSettingsContext';

interface PortfolioManagerProps {
  currency: string;
}

const PropertyCard: React.FC<{ property: PortfolioProperty; currency: string; }> = ({ property, currency }) => {
    const { t } = useTranslation();
    const { setPropertyToEdit, setPropertyToDelete, setPropertyToManage } = useData();
    
    const annualRent = property.monthlyRent * 12;
    const totalAnnualExpenses = property.annualOperatingExpenses + property.propertyTax + property.insurance;
    const noi = annualRent - totalAnnualExpenses;
    const capRate = property.purchasePrice > 0 ? (noi / property.purchasePrice) * 100 : 0;
    const capRateAnalysis = getCapRateAnalysis(capRate);

    const formatNumber = (num: number) => num.toLocaleString('en-US', { maximumFractionDigits: 0 });

    const netIncomeColor = noi > 0 ? 'text-green-600 dark:text-green-400' : noi < 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-200';

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 truncate" title={property.name}>{property.name}</h3>
                        <p className="text-sm font-semibold text-primary dark:text-primary-dark">{t(`portfolioManager.propertyTypes.${property.propertyType}`)}</p>
                    </div>
                    {capRateAnalysis && (
                        <div className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${capRateAnalysis.colorClasses}`}>
                            {t(`portfolioManager.ratings.${capRateAnalysis.ratingKey}`)}
                        </div>
                    )}
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.purchasePrice')}</span>
                        <span className="font-bold text-neutral-700 dark:text-neutral-200">{formatNumber(property.purchasePrice)} {currency}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.annualRent')}</span>
                        <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                            + {formatNumber(annualRent)} <span className="text-xs">{currency}</span>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.totalAnnualExpenses')}</span>
                        <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                            - {formatNumber(totalAnnualExpenses)} <span className="text-xs">{currency}</span>
                        </span>
                    </div>

                    <div className="pt-3 mt-3 border-t border-dashed border-neutral-300 dark:border-neutral-600">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500 dark:text-neutral-400 font-semibold">{t('portfolioManager.card.netAnnualIncome')}</span>
                            <span className={`font-extrabold ${netIncomeColor}`}>{formatNumber(noi)} {currency}</span>
                        </div>
                    </div>


                    {property.propertyType === PropertyType.Shop ? (
                        <>
                            {property.internalArea && (
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.internalArea')}</span>
                                    <span className="font-bold text-neutral-700 dark:text-neutral-200">{formatNumber(property.internalArea)} m²</span>
                                </div>
                            )}
                            {property.externalArea && (
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.externalArea')}</span>
                                    <span className="font-bold text-neutral-700 dark:text-neutral-200">{formatNumber(property.externalArea)} m²</span>
                                </div>
                            )}
                        </>
                    ) : property.propertyType === PropertyType.Apartment ? (
                         <>
                            {property.area && (
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.modal.areaLabel')}</span>
                                    <span className="font-bold text-neutral-700 dark:text-neutral-200">{formatNumber(property.area)} m²</span>
                                </div>
                            )}
                            {property.gardenArea && (
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.gardenArea')}</span>
                                    <span className="font-bold text-neutral-700 dark:text-neutral-200">{formatNumber(property.gardenArea)} m²</span>
                                </div>
                            )}
                            {property.roofArea && (
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.roofArea')}</span>
                                    <span className="font-bold text-neutral-700 dark:text-neutral-200">{formatNumber(property.roofArea)} m²</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {property.area && (
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.modal.areaLabel')}</span>
                                    <span className="font-bold text-neutral-700 dark:text-neutral-200">{formatNumber(property.area)} m²</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-center font-semibold text-neutral-600 dark:text-neutral-300 mb-2">{t('portfolioManager.card.investmentPerformance')}</p>
                    <div className="flex justify-center items-baseline gap-2 text-3xl font-extrabold text-primary dark:text-primary-dark">
                        {isFinite(capRate) ? capRate.toFixed(2) : '0.00'}<span className="text-lg">%</span>
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.capRate')}</span>
                    </div>
                </div>

            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center gap-1">
                <button onClick={() => setPropertyToManage(property)} className="p-2 text-neutral-500 hover:text-primary dark:hover:text-primary-dark transition-colors" title={t('portfolioManager.card.manage')}><ListBulletIcon className="w-5 h-5"/></button>
                <button onClick={() => setPropertyToEdit(property)} className="p-2 text-neutral-500 hover:text-primary dark:hover:text-primary-dark transition-colors" title={t('common.edit')}><PencilIcon className="w-5 h-5"/></button>
                <button onClick={() => setPropertyToDelete(property)} className="p-2 text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title={t('common.delete')}><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

const SummaryStatCard: React.FC<{ title: string; value: string; currency: string; colorClass?: string; isMain?: boolean }> = ({ title, value, currency, colorClass = 'text-primary dark:text-primary-dark', isMain = false }) => (
    <div className={`p-4 ${isMain ? 'bg-primary-light dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-800'} rounded-lg text-center`}>
        <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{title}</p>
        <p className={`mt-1 ${isMain ? 'text-4xl' : 'text-2xl'} font-bold ${colorClass}`}>
            {value} {!isMain && <span className="text-lg font-medium">{currency}</span>}
        </p>
    </div>
);


export const PortfolioManager: React.FC<PortfolioManagerProps> = ({ currency }) => {
  const { portfolioProperties, setIsAddPropertyModalOpen } = useData();
  const { t, language } = useTranslation();
  const appSettings = useAppSettings();
  
  const calculatorInfo = useMemo(() => getCalculators(t, language, appSettings).find(c => c.id === CalculatorType.Portfolio), [t, language, appSettings]);
  
  const portfolioSummary = useMemo(() => {
    const totalValue = portfolioProperties.reduce((sum, p) => sum + p.purchasePrice, 0);
    const totalMonthlyRent = portfolioProperties.reduce((sum, p) => sum + p.monthlyRent, 0);
    const totalAnnualRent = totalMonthlyRent * 12;

    const totalAnnualExpenses = portfolioProperties.reduce((sum, p) => {
        return sum + (p.annualOperatingExpenses + p.propertyTax + p.insurance);
    }, 0);

    const totalMonthlyExpenses = totalAnnualExpenses / 12;
    const netAnnualIncome = totalAnnualRent - totalAnnualExpenses;
    
    const allocation = portfolioProperties.reduce((acc, p) => {
        acc[p.propertyType] = (acc[p.propertyType] || 0) + p.purchasePrice;
        return acc;
    }, {} as Record<PropertyType, number>);

    return { totalValue, totalMonthlyRent, totalAnnualRent, totalAnnualExpenses, totalMonthlyExpenses, netAnnualIncome, allocation };
  }, [portfolioProperties]);

  const allocationChartData = useMemo(() => {
    const colors: { [key in PropertyType]: string } = {
        [PropertyType.Apartment]: '#3B82F6',
        [PropertyType.Shop]: '#10B981',
        [PropertyType.Office]: '#F59E0B',
        [PropertyType.Clinic]: '#8B5CF6',
    };
    return Object.entries(portfolioSummary.allocation).map(([type, value]) => ({
        label: t(`portfolioManager.propertyTypes.${type}`),
        value,
        color: colors[type as PropertyType],
    }));
  }, [portfolioSummary.allocation, t]);

  const chartAriaLabel = t('portfolioManager.summary.chartAriaLabel');
  
  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-start">
                <div className="flex justify-center sm:justify-start items-center gap-3 text-neutral-800 dark:text-neutral-100">
                    {calculatorInfo?.icon}
                    <h1 className="text-3xl font-bold">{calculatorInfo?.name}</h1>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2">{calculatorInfo?.tooltip}</p>
            </div>
            <button
                onClick={() => setIsAddPropertyModalOpen(true)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
                <PlusCircleIcon className="w-6 h-6" />
                <span>{t('portfolioManager.addProperty')}</span>
            </button>
        </div>

      {portfolioProperties.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-12 text-center">
            <NewPortfolioIcon className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600" />
            <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200 mt-4">{t('portfolioManager.emptyState.title')}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-md mx-auto">{t('portfolioManager.emptyState.description')}</p>
             <button
                onClick={() => setIsAddPropertyModalOpen(true)}
                className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors"
            >
                <PlusCircleIcon className="w-5 h-5" />
                <span>{t('portfolioManager.emptyState.button')}</span>
            </button>
        </div>
      ) : (
        <>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-6 text-center sm:text-start">{t('portfolioManager.summary.title')}</h2>
                
                <div className="p-4 bg-primary-light dark:bg-neutral-800 rounded-lg text-center mb-6">
                    <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{t('portfolioManager.summary.totalValue')}</p>
                    <p className="text-4xl font-bold text-primary dark:text-primary-dark mt-1">{portfolioSummary.totalValue.toLocaleString('en-US')} <span className="text-2xl font-medium">{currency}</span></p>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-200 mb-3">{t('portfolioManager.summary.annualSummary')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SummaryStatCard 
                            title={t('portfolioManager.summary.totalAnnualRent')}
                            value={`+ ${portfolioSummary.totalAnnualRent.toLocaleString('en-US')}`}
                            currency={currency}
                            colorClass="text-green-600 dark:text-green-400"
                        />
                        <SummaryStatCard 
                            title={t('portfolioManager.summary.totalAnnualExpenses')}
                            value={`- ${portfolioSummary.totalAnnualExpenses.toLocaleString('en-US')}`}
                            currency={currency}
                            colorClass="text-red-600 dark:text-red-400"
                        />
                        <SummaryStatCard 
                            title={t('portfolioManager.summary.netAnnualIncome')}
                            value={portfolioSummary.netAnnualIncome.toLocaleString('en-US')}
                            currency={currency}
                            colorClass={portfolioSummary.netAnnualIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-200 mb-3">{t('portfolioManager.summary.monthlySummary')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SummaryStatCard 
                            title={t('portfolioManager.summary.totalMonthlyRent')}
                            value={portfolioSummary.totalMonthlyRent.toLocaleString('en-US')}
                            currency={currency}
                            colorClass="text-neutral-700 dark:text-neutral-200"
                        />
                        <SummaryStatCard 
                            title={t('portfolioManager.summary.totalMonthlyExpenses')}
                            value={portfolioSummary.totalMonthlyExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            currency={currency}
                            colorClass="text-neutral-700 dark:text-neutral-200"
                        />
                    </div>
                </div>


                 <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-200 text-center mb-4">{t('portfolioManager.summary.allocationByValue')}</h3>
                    {allocationChartData.length > 0 ? (
                        <PortfolioAllocationChart data={allocationChartData} ariaLabel={chartAriaLabel} currency={currency} />
                    ) : (
                        <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">{t('portfolioManager.summary.emptyChart')}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioProperties.map(prop => (
                    <PropertyCard key={prop.id} property={prop} currency={currency} />
                ))}
            </div>
        </>
      )}
    </div>
  );
};
