import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CalculatorType, UIState, UIActions } from '../../types';

const UIContext = createContext<(UIState & UIActions) | undefined>(undefined);

export const UIContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(CalculatorType.Introduction);
    const [fullUnitCalcInitialStep, setFullUnitCalcInitialStep] = useState(1);
    
    const value: UIState & UIActions = {
        activeCalculator,
        fullUnitCalcInitialStep,
        setActiveCalculator,
        setFullUnitCalcInitialStep,
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within an UIContextProvider');
    }
    return context;
};