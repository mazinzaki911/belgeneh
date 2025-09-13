import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    SavedUnit, 
    UnitStatus,
    DataState,
    DataActions,
    PortfolioProperty,
    PropertyType
} from '../../types';

const DataContext = createContext<(DataState & DataActions) | undefined>(undefined);

const getFutureDate = (years: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().split('T')[0];
};

const defaultSavedUnits: SavedUnit[] = [
    {
        id: 'default-1',
        name: 'شقة التجمع',
        status: UnitStatus.UnderConsideration,
        data: {
            totalPrice: "2500000",
            downPaymentPercentage: "20",
            installmentAmount: "30000",
            installmentFrequency: "3",
            maintenancePercentage: "8",
            handoverPaymentPercentage: "10",
            contractDate: new Date().toISOString().split('T')[0],
            handoverDate: getFutureDate(2),
            monthlyRent: "12000",
            annualRentIncrease: "10",
            annualOperatingExpenses: "5000",
            annualAppreciationRate: "15",
            appreciationYears: "5",
            discountRate: "18",
        },
    },
    {
        id: 'default-2',
        name: 'فيلا الساحل',
        status: UnitStatus.UnderConsideration,
        data: {
            totalPrice: "8000000",
            downPaymentPercentage: "25",
            installmentAmount: "100000",
            installmentFrequency: "3",
            maintenancePercentage: "10",
            handoverPaymentPercentage: "15",
            contractDate: new Date().toISOString().split('T')[0],
            handoverDate: getFutureDate(3),
            monthlyRent: "40000",
            annualRentIncrease: "12",
            annualOperatingExpenses: "25000",
            annualAppreciationRate: "20",
            appreciationYears: "5",
            discountRate: "20",
        },
    },
];

const defaultPortfolioProperties: PortfolioProperty[] = [
    {
        id: 'portfolio-1',
        name: 'شقة مدينتي',
        propertyType: PropertyType.Apartment,
        purchasePrice: 1800000,
        monthlyRent: 9000,
        annualOperatingExpenses: 4000,
        propertyTax: 2000,
        insurance: 0,
        area: 120,
        gardenArea: 50,
        tasks: [],
    },
    {
        id: 'portfolio-2',
        name: 'محل تجاري بالعاصمة',
        propertyType: PropertyType.Shop,
        purchasePrice: 3200000,
        monthlyRent: 22000,
        annualOperatingExpenses: 10000,
        propertyTax: 5000,
        insurance: 1500,
        internalArea: 60,
        externalArea: 25,
        tasks: [],
    },
];

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Saved Units State
    const [savedUnits, setSavedUnits] = useState<SavedUnit[]>(() => {
        try {
            const item = window.localStorage.getItem('savedUnits');
            const parsedItem = item ? JSON.parse(item) : null;
            return (parsedItem && parsedItem.length > 0) ? parsedItem : defaultSavedUnits;
        } catch (error) { 
            return defaultSavedUnits;
        }
    });
    const [loadedUnitId, setLoadedUnitId] = useState<string | null>(null);
    const [editingDealUnit, setEditingDealUnit] = useState<SavedUnit | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<SavedUnit | null>(null);

    // Portfolio State
    const [portfolioProperties, setPortfolioProperties] = useState<PortfolioProperty[]>(() => {
        try {
            const item = window.localStorage.getItem('portfolio_properties');
            const parsedItem = item ? JSON.parse(item) : null;
            return (parsedItem && parsedItem.length > 0) ? parsedItem : defaultPortfolioProperties;
        } catch (error) {
            return defaultPortfolioProperties;
        }
    });
    const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState<PortfolioProperty | null>(null);
    const [propertyToDelete, setPropertyToDelete] = useState<PortfolioProperty | null>(null);
    const [propertyToManage, setPropertyToManage] = useState<PortfolioProperty | null>(null);


    useEffect(() => { window.localStorage.setItem('savedUnits', JSON.stringify(savedUnits)); }, [savedUnits]);
    useEffect(() => { window.localStorage.setItem('portfolio_properties', JSON.stringify(portfolioProperties)); }, [portfolioProperties]);

    // Saved Units Actions
    const handleSaveUnit = (unitToSave: SavedUnit) => {
        const index = savedUnits.findIndex(u => u.id === unitToSave.id);
        if (index > -1) {
            setSavedUnits(prev => prev.map(u => u.id === unitToSave.id ? unitToSave : u));
        } else {
            setSavedUnits(prev => [...prev, unitToSave]);
        }
        setLoadedUnitId(unitToSave.id);
    };

    const handleDeleteUnit = (unitId: string) => {
        setSavedUnits(currentUnits => currentUnits.filter(u => u.id !== unitId));
        if (loadedUnitId === unitId) setLoadedUnitId(null);
    };

    // Portfolio Actions
    const addOrUpdatePortfolioProperty = (property: PortfolioProperty) => {
        setPortfolioProperties(prev => {
            const index = prev.findIndex(p => p.id === property.id);
            if (index > -1) {
                return prev.map(p => p.id === property.id ? property : p);
            }
            return [...prev, property];
        });
    };
    
    const deletePortfolioProperty = (propertyId: string) => {
        setPortfolioProperties(prev => prev.filter(p => p.id !== propertyId));
    };
    
    const resetApplicationData = () => {
        setSavedUnits(defaultSavedUnits);
        setPortfolioProperties(defaultPortfolioProperties);
    };

    const value: DataState & DataActions = {
        savedUnits, loadedUnitId, editingDealUnit, unitToDelete,
        portfolioProperties, isAddPropertyModalOpen, propertyToEdit, propertyToDelete, propertyToManage,
        handleSaveUnit, handleDeleteUnit, setLoadedUnitId, setEditingDealUnit, setUnitToDelete,
        addOrUpdatePortfolioProperty, deletePortfolioProperty, setIsAddPropertyModalOpen, setPropertyToEdit, setPropertyToDelete, setPropertyToManage,
        resetApplicationData,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataContextProvider');
    }
    return context;
};