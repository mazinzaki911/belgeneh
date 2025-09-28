import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    SavedUnit, 
    DataState,
    DataActions,
    PortfolioProperty,
} from '../types';

const DataContext = createContext<(DataState & DataActions) | undefined>(undefined);

const defaultSavedUnits: SavedUnit[] = [];

const defaultPortfolioProperties: PortfolioProperty[] = [];

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Saved Units State
    const [savedUnits, setSavedUnits] = useState<SavedUnit[]>(() => {
        try {
            const item = window.localStorage.getItem('savedUnits');
            return item ? JSON.parse(item) : defaultSavedUnits;
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
            return item ? JSON.parse(item) : defaultPortfolioProperties;
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
        setSavedUnits([]);
        setPortfolioProperties([]);
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