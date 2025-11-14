import React, { useState, useEffect, useMemo } from 'react';
import { PortfolioProperty, PropertyType } from '../../types';
import { useData } from '../../src/contexts/DataContext';
import { useToast } from '../../src/contexts/ToastContext';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { generateUUID } from '../../src/utils/uuid';
import TextInput from '../shared/TextInput';
import NumberInput from '../shared/NumberInput';
import SelectInput from '../shared/SelectInput';

interface AddEditPropertyModalProps {
    propertyToEdit: PortfolioProperty | null;
    onClose: () => void;
}

const AddEditPropertyModal: React.FC<AddEditPropertyModalProps> = ({ propertyToEdit, onClose }) => {
    const { t } = useTranslation();
    const { addOrUpdatePortfolioProperty } = useData();
    const showToast = useToast();

    const isEditMode = !!propertyToEdit;
    
    const [name, setName] = useState('');
    const [propertyType, setPropertyType] = useState<PropertyType>(PropertyType.Apartment);
    const [purchasePrice, setPurchasePrice] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [annualOpEx, setAnnualOpEx] = useState('');
    const [propertyTax, setPropertyTax] = useState('');
    const [insurance, setInsurance] = useState('');
    const [area, setArea] = useState('');
    const [internalArea, setInternalArea] = useState('');
    const [externalArea, setExternalArea] = useState('');
    const [gardenArea, setGardenArea] = useState('');
    const [roofArea, setRoofArea] = useState('');
    
    useEffect(() => {
        if (isEditMode) {
            setName(propertyToEdit.name);
            setPropertyType(propertyToEdit.propertyType);
            setPurchasePrice(String(propertyToEdit.purchasePrice));
            setMonthlyRent(String(propertyToEdit.monthlyRent));
            setAnnualOpEx(String(propertyToEdit.annualOperatingExpenses));
            setPropertyTax(String(propertyToEdit.propertyTax));
            setInsurance(String(propertyToEdit.insurance));
            setArea(String(propertyToEdit.area || ''));
            setInternalArea(String(propertyToEdit.internalArea || ''));
            setExternalArea(String(propertyToEdit.externalArea || ''));
            setGardenArea(String(propertyToEdit.gardenArea || ''));
            setRoofArea(String(propertyToEdit.roofArea || ''));
        }
    }, [propertyToEdit, isEditMode]);

    const netAnnualIncome = useMemo(() => {
        const annualRent = (parseFloat(monthlyRent) || 0) * 12;
        const totalExpenses = (parseFloat(annualOpEx) || 0) + (parseFloat(propertyTax) || 0) + (parseFloat(insurance) || 0);
        return annualRent - totalExpenses;
    }, [monthlyRent, annualOpEx, propertyTax, insurance]);
    
    useEffect(() => {
        if (propertyType === PropertyType.Shop) {
            setArea('');
            setGardenArea('');
            setRoofArea('');
        } else if (propertyType === PropertyType.Apartment) {
            setInternalArea('');
            setExternalArea('');
        } else {
            setInternalArea('');
            setExternalArea('');
            setGardenArea('');
            setRoofArea('');
        }
    }, [propertyType]);


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !purchasePrice.trim()) {
            showToast(t('common.saveError'), 'error');
            return;
        }

        try {
            const propertyData: PortfolioProperty = {
                id: propertyToEdit?.id || generateUUID(),
                name: name.trim(),
                propertyType,
                purchasePrice: parseFloat(purchasePrice) || 0,
                monthlyRent: parseFloat(monthlyRent) || 0,
                annualOperatingExpenses: parseFloat(annualOpEx) || 0,
                propertyTax: parseFloat(propertyTax) || 0,
                insurance: parseFloat(insurance) || 0,
                area: propertyType !== PropertyType.Shop ? (parseFloat(area) || undefined) : undefined,
                internalArea: propertyType === PropertyType.Shop ? (parseFloat(internalArea) || undefined) : undefined,
                externalArea: propertyType === PropertyType.Shop ? (parseFloat(externalArea) || undefined) : undefined,
                gardenArea: propertyType === PropertyType.Apartment ? (parseFloat(gardenArea) || undefined) : undefined,
                roofArea: propertyType === PropertyType.Apartment ? (parseFloat(roofArea) || undefined) : undefined,
            };
            await addOrUpdatePortfolioProperty(propertyData);
            showToast(isEditMode ? t('common.updateSuccess') : t('common.addSuccess'), 'success');
            onClose();
        } catch (error) {
            console.error('Error saving property:', error);
            showToast(error instanceof Error ? error.message : t('common.saveError'), 'error');
        }
    };

    const propertyTypeOptions = Object.values(PropertyType).map(type => ({
        value: type,
        label: t(`portfolioManager.propertyTypes.${type}`)
    }));
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-start sm:items-center justify-center p-4 pt-12 sm:pt-4" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                        {isEditMode ? t('portfolioManager.modal.editTitle') : t('portfolioManager.modal.addTitle')}
                    </h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <TextInput label={t('portfolioManager.modal.propertyNameLabel')} value={name} onChange={e => setName(e.target.value)} placeholder={t('portfolioManager.modal.propertyNamePlaceholder')} />
                            </div>
                            <SelectInput label={t('portfolioManager.modal.propertyTypeLabel')} value={propertyType} onChange={e => setPropertyType(e.target.value as PropertyType)}>
                                {propertyTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </SelectInput>
                            <NumberInput label={t('portfolioManager.modal.monthlyRentLabel')} value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} currency={t('common.currency')} />
                        </div>

                        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                             <h4 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('portfolioManager.modal.section.areaAndPrice')}</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <NumberInput label={t('portfolioManager.modal.purchasePriceLabel')} value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} currency={t('common.currency')} />
                                
                                {propertyType === PropertyType.Shop ? (
                                    <>
                                        <NumberInput label={t('portfolioManager.modal.internalAreaLabel')} value={internalArea} onChange={e => setInternalArea(e.target.value)} unit="m²" />
                                        <div className="sm:col-span-2">
                                          <NumberInput label={t('portfolioManager.modal.externalAreaLabel')} value={externalArea} onChange={e => setExternalArea(e.target.value)} tooltip={t('portfolioManager.modal.externalAreaTooltip')} unit="m²" />
                                        </div>
                                    </>
                                ) : propertyType === PropertyType.Apartment ? (
                                    <>
                                        <NumberInput label={t('portfolioManager.modal.areaLabel')} value={area} onChange={e => setArea(e.target.value)} unit="m²" />
                                        <NumberInput label={t('portfolioManager.modal.gardenAreaLabel')} value={gardenArea} onChange={e => setGardenArea(e.target.value)} unit="m²" />
                                        <NumberInput label={t('portfolioManager.modal.roofAreaLabel')} value={roofArea} onChange={e => setRoofArea(e.target.value)} unit="m²" />
                                    </>
                                ) : (
                                    <NumberInput label={t('portfolioManager.modal.areaLabel')} value={area} onChange={e => setArea(e.target.value)} unit="m²" />
                                )}
                             </div>
                        </div>

                         <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                             <h4 className="text-lg font-semibold text-primary dark:text-primary-dark mb-4">{t('portfolioManager.modal.section.expenses')}</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <NumberInput label={t('portfolioManager.modal.annualOperatingExpenses')} value={annualOpEx} onChange={e => setAnnualOpEx(e.target.value)} tooltip={t('portfolioManager.modal.annualOperatingExpensesTooltip')} currency={t('common.currency')} />
                                <NumberInput label={t('portfolioManager.modal.propertyTax')} value={propertyTax} onChange={e => setPropertyTax(e.target.value)} tooltip={t('portfolioManager.modal.propertyTaxTooltip')} currency={t('common.currency')} />
                                <NumberInput label={t('portfolioManager.modal.insurance')} value={insurance} onChange={e => setInsurance(e.target.value)} tooltip={t('portfolioManager.modal.insuranceTooltip')} currency={t('common.currency')} />
                             </div>
                             <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 dark:border-neutral-600">
                                <NumberInput
                                    label={t('portfolioManager.modal.netAnnualIncome')}
                                    value={String(netAnnualIncome)}
                                    onChange={() => {}}
                                    readOnly
                                    currency={t('common.currency')}
                                    tooltip={t('portfolioManager.modal.netAnnualIncomeTooltip')}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 font-semibold">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold">
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditPropertyModal;