import { useReducer, useMemo, useEffect } from 'react';
import { FullUnitData, SavedUnit, TFunction } from '../../types';
import { calculateUnitAnalytics } from '../../utils/analytics';

type State = {
    unitName: string;
    formData: FullUnitData;
    currentStep: number;
    maxStepReached: number;
    errors: Record<string, string>;
    isStep1Attempted: boolean;
    analytics: ReturnType<typeof calculateUnitAnalytics>;
    autosavedData: any | null;
};

type Action =
    | { type: 'SET_UNIT_NAME'; payload: string }
    | { type: 'SET_FORM_DATA'; payload: { field: keyof FullUnitData; value: string } }
    | { type: 'NEXT_STEP'; payload: { t: TFunction } }
    | { type: 'PREV_STEP' }
    | { type: 'SET_STEP'; payload: number }
    | { type: 'VALIDATE_AND_SET_ERROR'; payload: { t: TFunction } }
    | { type: 'LOAD_UNIT'; payload: { unit: SavedUnit; initialStep: number } }
    | { type: 'RESET_STATE' }
    | { type: 'LOAD_AUTOSAVE' }
    | { type: 'RESTORE_STATE'; payload: any };


const initialFormData: FullUnitData = {
    totalPrice: '', downPaymentPercentage: '', installmentAmount: '', installmentFrequency: '3',
    maintenancePercentage: '', handoverPaymentPercentage: '', contractDate: new Date().toISOString().split('T')[0],
    handoverDate: '', monthlyRent: '', annualRentIncrease: '10', annualOperatingExpenses: '',
    annualAppreciationRate: '20', appreciationYears: '', discountRate: '10'
};

const initialState: State = {
    unitName: '',
    formData: initialFormData,
    currentStep: 1,
    maxStepReached: 1,
    errors: {},
    isStep1Attempted: false,
    analytics: calculateUnitAnalytics(initialFormData),
    autosavedData: null,
};

const validateStep = (step: number, state: State, t: TFunction): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
        if (!state.unitName.trim()) newErrors.unitName = t('fullUnitCalculator.errors.unitNameRequired');
    }
    if (step === 2) {
        const { downPaymentPercentage, maintenancePercentage, handoverPaymentPercentage, handoverDate, contractDate } = state.formData;
        const p_down = parseFloat(downPaymentPercentage);
        if (p_down > 100) newErrors.downPaymentPercentage = t('fullUnitCalculator.errors.percentageMax');
        if (p_down < 0) newErrors.downPaymentPercentage = t('fullUnitCalculator.errors.percentageMin');

        const p_maint = parseFloat(maintenancePercentage);
        if (p_maint > 100) newErrors.maintenancePercentage = t('fullUnitCalculator.errors.percentageMax');
        if (p_maint < 0) newErrors.maintenancePercentage = t('fullUnitCalculator.errors.percentageMin');

        const p_handover = parseFloat(handoverPaymentPercentage);
        if (p_handover > 100) newErrors.handoverPaymentPercentage = t('fullUnitCalculator.errors.percentageMax');
        if (p_handover < 0) newErrors.handoverPaymentPercentage = t('fullUnitCalculator.errors.percentageMin');
        
        if (handoverDate && contractDate && new Date(handoverDate) < new Date(contractDate)) {
            newErrors.handoverDate = t('fullUnitCalculator.errors.handoverDateInvalid');
        }
    }
    return newErrors;
};


const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_UNIT_NAME':
            return { ...state, unitName: action.payload };
        case 'SET_FORM_DATA':
            const newFormData = { ...state.formData, [action.payload.field]: action.payload.value };
            return { ...state, formData: newFormData, analytics: calculateUnitAnalytics(newFormData) };
        case 'NEXT_STEP': {
            const isStep1 = state.currentStep === 1;
            const newIsStep1Attempted = isStep1 ? true : state.isStep1Attempted;
            const validationErrors = validateStep(state.currentStep, state, action.payload.t);
            if (Object.keys(validationErrors).length === 0) {
                const newStep = state.currentStep < 4 ? state.currentStep + 1 : 4;
                return {
                    ...state,
                    currentStep: newStep,
                    maxStepReached: Math.max(state.maxStepReached, newStep),
                    isStep1Attempted: newIsStep1Attempted,
                    errors: {},
                };
            }
            return { ...state, errors: validationErrors, isStep1Attempted: newIsStep1Attempted };
        }
        case 'PREV_STEP':
            return { ...state, currentStep: state.currentStep > 1 ? state.currentStep - 1 : 1 };
        case 'SET_STEP':
            if (action.payload <= state.maxStepReached) {
                return { ...state, currentStep: action.payload };
            }
            return state;
        case 'VALIDATE_AND_SET_ERROR': {
            const validationErrors = validateStep(1, state, action.payload.t);
             if (Object.keys(validationErrors).length > 0) {
                return { ...state, errors: validationErrors, isStep1Attempted: true, currentStep: 1 };
             }
             return state;
        }
        case 'LOAD_UNIT':
            return {
                ...state,
                unitName: action.payload.unit.name,
                formData: action.payload.unit.data,
                analytics: calculateUnitAnalytics(action.payload.unit.data),
                currentStep: action.payload.initialStep,
                maxStepReached: action.payload.initialStep,
            };
        case 'RESET_STATE':
            return { ...initialState, autosavedData: state.autosavedData };
        case 'LOAD_AUTOSAVE':
             try {
                const savedDataString = localStorage.getItem('fullUnitCalculator_autosave');
                if (savedDataString) {
                    const parsedData = JSON.parse(savedDataString);
                    if (parsedData && (parsedData.unitName || parsedData.formData?.totalPrice)) {
                        return { ...state, autosavedData: parsedData };
                    }
                }
            } catch (error) {
                console.error("Failed to load auto-saved data:", error);
                localStorage.removeItem('fullUnitCalculator_autosave');
            }
            return state;
        case 'RESTORE_STATE':
            return {
                ...state,
                unitName: action.payload.unitName,
                formData: action.payload.formData,
                currentStep: action.payload.currentStep,
                maxStepReached: action.payload.maxStepReached,
                analytics: calculateUnitAnalytics(action.payload.formData),
                autosavedData: null,
            };
        default:
            return state;
    }
};

export const useFullUnitCalculatorState = (initialStep: number) => {
    const [state, dispatch] = useReducer(reducer, {
        ...initialState,
        currentStep: initialStep,
        maxStepReached: initialStep,
    });
    
    useEffect(() => {
        dispatch({ type: 'LOAD_AUTOSAVE' });
    }, []);

    return { state, dispatch };
};