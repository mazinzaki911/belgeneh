import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    SavedUnit,
    DataState,
    DataActions,
    PortfolioProperty,
} from '../types';
import { savedUnitsAPI, portfolioAPI } from '../lib/api';
import { supabase } from '../lib/supabase';

const DataContext = createContext<(DataState & DataActions) | undefined>(undefined);

export const DataContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Saved Units State
    const [savedUnits, setSavedUnits] = useState<SavedUnit[]>([]);
    const [loadedUnitId, setLoadedUnitId] = useState<string | null>(null);
    const [editingDealUnit, setEditingDealUnit] = useState<SavedUnit | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<SavedUnit | null>(null);
    const [loading, setLoading] = useState(false);

    // Portfolio State
    const [portfolioProperties, setPortfolioProperties] = useState<PortfolioProperty[]>([]);
    const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState<PortfolioProperty | null>(null);
    const [propertyToDelete, setPropertyToDelete] = useState<PortfolioProperty | null>(null);
    const [propertyToManage, setPropertyToManage] = useState<PortfolioProperty | null>(null);

    // Load data when user is authenticated
    useEffect(() => {
        const loadData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await Promise.all([
                    loadSavedUnits(),
                    loadPortfolioProperties(),
                ]);
            }
        };

        loadData();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                loadData();
            } else if (event === 'SIGNED_OUT') {
                // Clear data on sign out
                setSavedUnits([]);
                setPortfolioProperties([]);
                setLoadedUnitId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load saved units from API
    const loadSavedUnits = async () => {
        try {
            setLoading(true);
            const units = await savedUnitsAPI.getAll();
            setSavedUnits(units);
        } catch (error) {
            console.error('Error loading saved units:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load portfolio properties from API
    const loadPortfolioProperties = async () => {
        try {
            setLoading(true);
            const properties = await portfolioAPI.getAll();
            setPortfolioProperties(properties);
        } catch (error) {
            console.error('Error loading portfolio properties:', error);
        } finally {
            setLoading(false);
        }
    };

    // Saved Units Actions
    const handleSaveUnit = async (unitToSave: SavedUnit) => {
        try {
            const savedUnit = await savedUnitsAPI.upsert(unitToSave);

            // Update local state
            const index = savedUnits.findIndex(u => u.id === savedUnit.id);
            if (index > -1) {
                setSavedUnits(prev => prev.map(u => u.id === savedUnit.id ? savedUnit : u));
            } else {
                setSavedUnits(prev => [...prev, savedUnit]);
            }

            setLoadedUnitId(savedUnit.id);
        } catch (error) {
            console.error('Error saving unit:', error);
            throw error;
        }
    };

    const handleDeleteUnit = async (unitId: string) => {
        try {
            await savedUnitsAPI.delete(unitId);
            setSavedUnits(currentUnits => currentUnits.filter(u => u.id !== unitId));
            if (loadedUnitId === unitId) setLoadedUnitId(null);
        } catch (error) {
            console.error('Error deleting unit:', error);
            throw error;
        }
    };

    // Portfolio Actions
    const addOrUpdatePortfolioProperty = async (property: PortfolioProperty) => {
        try {
            const savedProperty = await portfolioAPI.upsert(property);

            // Update local state
            setPortfolioProperties(prev => {
                const index = prev.findIndex(p => p.id === savedProperty.id);
                if (index > -1) {
                    return prev.map(p => p.id === savedProperty.id ? savedProperty : p);
                }
                return [...prev, savedProperty];
            });
        } catch (error) {
            console.error('Error saving property:', error);
            throw error;
        }
    };

    const deletePortfolioProperty = async (propertyId: string) => {
        try {
            await portfolioAPI.delete(propertyId);
            setPortfolioProperties(prev => prev.filter(p => p.id !== propertyId));
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    };

    const resetApplicationData = async () => {
        try {
            // Delete all units and properties
            await Promise.all([
                ...savedUnits.map(unit => savedUnitsAPI.delete(unit.id)),
                ...portfolioProperties.map(prop => portfolioAPI.delete(prop.id)),
            ]);

            // Clear local state
            setSavedUnits([]);
            setPortfolioProperties([]);
            setLoadedUnitId(null);
        } catch (error) {
            console.error('Error resetting application data:', error);
            throw error;
        }
    };

    const value: DataState & DataActions = {
        savedUnits,
        loadedUnitId,
        editingDealUnit,
        unitToDelete,
        portfolioProperties,
        isAddPropertyModalOpen,
        propertyToEdit,
        propertyToDelete,
        propertyToManage,
        handleSaveUnit,
        handleDeleteUnit,
        setLoadedUnitId,
        setEditingDealUnit,
        setUnitToDelete,
        addOrUpdatePortfolioProperty,
        deletePortfolioProperty,
        setIsAddPropertyModalOpen,
        setPropertyToEdit,
        setPropertyToDelete,
        setPropertyToManage,
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
