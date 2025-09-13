import { FullUnitData } from '../types';

const colors = {
    excellent: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
    veryGood: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300",
    good: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    average: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300",
    low: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};

export const getRoiAnalysis = (roi: number) => {
    if (!isFinite(roi)) return null;
    if (roi <= 4) return { ratingKey: "low", colorClasses: colors.low };
    if (roi <= 7) return { ratingKey: "average", colorClasses: colors.average };
    if (roi <= 10) return { ratingKey: "good", colorClasses: colors.good };
    if (roi <= 15) return { ratingKey: "veryGood", colorClasses: colors.veryGood };
    return { ratingKey: "excellent", colorClasses: colors.excellent };
};

export const getRoeAnalysis = (roe: number) => {
    if (!isFinite(roe)) return null;
    if (roe <= 6) return { ratingKey: "low", colorClasses: colors.low };
    if (roe <= 10) return { ratingKey: "average", colorClasses: colors.average };
    if (roe <= 15) return { ratingKey: "good", colorClasses: colors.good };
    if (roe <= 20) return { ratingKey: "veryGood", colorClasses: colors.veryGood };
    return { ratingKey: "excellent", colorClasses: colors.excellent };
};

export const getCapRateAnalysis = (capRate: number) => {
    if (!isFinite(capRate)) return null;
    if (capRate <= 4) return { ratingKey: "low", colorClasses: colors.low };
    if (capRate <= 6) return { ratingKey: "average", colorClasses: colors.average };
    if (capRate <= 8) return { ratingKey: "good", colorClasses: colors.good };
    if (capRate <= 10) return { ratingKey: "veryGood", colorClasses: colors.veryGood };
    return { ratingKey: "excellent", colorClasses: colors.excellent };
};

export const getPaybackAnalysis = (paybackPeriod: number) => {
    if (!isFinite(paybackPeriod) || paybackPeriod < 0) return null;
    if (paybackPeriod > 15) return { ratingKey: "low", colorClasses: colors.low };
    if (paybackPeriod > 12) return { ratingKey: "average", colorClasses: colors.average };
    if (paybackPeriod > 8) return { ratingKey: "good", colorClasses: colors.good };
    if (paybackPeriod > 5) return { ratingKey: "veryGood", colorClasses: colors.veryGood };
    return { ratingKey: "excellent", colorClasses: colors.excellent };
};

export const getNpvAnalysis = (npv: number) => {
    if (npv < -0.01) return { ratingKey: "unprofitable", colorClasses: colors.low };
    if (npv > 0.01) return { ratingKey: "profitable", colorClasses: colors.excellent };
    return { ratingKey: "breakEven", colorClasses: colors.average };
};


export const calculateUnitAnalytics = (data: FullUnitData) => {
    const {
        totalPrice,
        downPaymentPercentage,
        installmentAmount,
        installmentFrequency,
        maintenancePercentage,
        handoverPaymentPercentage,
        monthlyRent,
        contractDate,
        handoverDate,
        annualRentIncrease,
        annualOperatingExpenses,
        annualAppreciationRate,
        appreciationYears,
        discountRate,
    } = data;

    const p_totalPrice = parseFloat(totalPrice) || 0;
    const p_downPaymentPercentage = parseFloat(downPaymentPercentage) || 0;
    const p_installmentAmount = parseFloat(installmentAmount) || 0;
    const p_installmentFrequency = parseInt(installmentFrequency, 10) || 3; // Default to quarterly
    const p_maintenancePercentage = parseFloat(maintenancePercentage) || 0;
    const p_handoverPaymentPercentage = parseFloat(handoverPaymentPercentage) || 0;
    const p_monthlyRent = parseFloat(monthlyRent) || 0;
    const p_annualRentIncrease = parseFloat(annualRentIncrease) || 0;
    const p_annualOperatingExpenses = parseFloat(annualOperatingExpenses) || 0;
    const p_annualAppreciationRate = parseFloat(annualAppreciationRate) || 0;
    const p_appreciationYears = parseFloat(appreciationYears) || 0;
    const p_discountRate = parseFloat(discountRate) || 0;
    
    const locale = 'en-US';
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const format = (num: number) => isFinite(num) ? num.toLocaleString(locale, options) : '∞';

    const rentIncreaseFactor = 1 + (p_annualRentIncrease / 100);

    // Basic Calculations
    const calculatedDownPayment = p_totalPrice * (p_downPaymentPercentage / 100);
    const calculatedHandoverPayment = p_totalPrice * (p_handoverPaymentPercentage / 100);
    const maintenanceAmount = p_totalPrice * (p_maintenancePercentage / 100);
    const totalCost = p_totalPrice + maintenanceAmount;

    const totalInstallmentValue = p_totalPrice - calculatedDownPayment - calculatedHandoverPayment;
    
    const numberOfInstallments = p_installmentAmount > 0 ? totalInstallmentValue / p_installmentAmount : 0;
    const installmentsPerYear = p_installmentFrequency > 0 ? 12 / p_installmentFrequency : 0;
    const annualInstallment = p_installmentAmount * installmentsPerYear;
    const totalInstallmentMonths = numberOfInstallments * p_installmentFrequency;
    const calculatedInstallmentYears = totalInstallmentMonths / 12;
    
    const startDate = contractDate ? new Date(contractDate) : null;
    const endDate = handoverDate ? new Date(handoverDate) : null;
    
    let totalYearsUntilHandover = 0;
    let installmentsUntilHandover = 0;

    if (startDate && endDate && endDate > startDate) {
        const diffTime = endDate.getTime() - startDate.getTime();
        totalYearsUntilHandover = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        const numInstallmentsUntilHandover = Math.max(0, Math.floor(diffMonths / p_installmentFrequency));
        installmentsUntilHandover = p_installmentAmount * numInstallmentsUntilHandover;
    }

    const paidUntilHandover = calculatedDownPayment + installmentsUntilHandover + calculatedHandoverPayment + maintenanceAmount;

    const annualRent = p_monthlyRent * 12;
    const quarterlyRent = p_monthlyRent * 3;
    const hasRent = p_monthlyRent > 0;
    
    const noi = annualRent - p_annualOperatingExpenses;
    const capRate = p_totalPrice > 0 ? (noi / p_totalPrice) * 100 : 0;
    const roi = totalCost > 0 ? (noi / totalCost) * 100 : 0;
    const annualCashFlow = noi - annualInstallment;
    const roe = paidUntilHandover > 0 ? (annualCashFlow / paidUntilHandover) * 100 : 0;

    const annualRateDecimal = p_annualAppreciationRate / 100;
    const futureValue = p_appreciationYears > 0 ? p_totalPrice * Math.pow(1 + annualRateDecimal, p_appreciationYears) : p_totalPrice;
    const appreciationAmount = futureValue - p_totalPrice;

    // --- NPV Calculation ---
    let npv = 0;
    const showNpv = p_discountRate > 0 && p_appreciationYears > 0;
    if (showNpv) {
        const discountFactor = 1 + (p_discountRate / 100);
        
        npv = -paidUntilHandover; // Simplified initial investment

        // Loop through each year of the holding period
        for (let year = 1; year <= p_appreciationYears; year++) {
            let cashFlowForYear = 0;
            const yearsSinceHandover = year - totalYearsUntilHandover;

            // 1. Installments paid this year (only after handover, as pre-handover is in initial investment)
             if (yearsSinceHandover > 0) {
                const yearsFromContractStart = totalYearsUntilHandover + yearsSinceHandover;
                 if (yearsFromContractStart <= calculatedInstallmentYears) {
                    cashFlowForYear -= annualInstallment;
                 }
             }

            // 2. Rent income and operating expenses
            if (yearsSinceHandover > 0) {
                const yearIndexForRent = Math.floor(yearsSinceHandover - 0.001);
                const rentForThisYear = annualRent * Math.pow(rentIncreaseFactor, yearIndexForRent);
                
                cashFlowForYear += rentForThisYear;
                cashFlowForYear -= p_annualOperatingExpenses;
            }
            
            // 3. Terminal Value (Sale Price) in the last year
            if (year === p_appreciationYears) {
                cashFlowForYear += futureValue;
            }

            // Discount the total cash flow for the year
            npv += cashFlowForYear / Math.pow(discountFactor, year);
        }
    }
    
    const showAdvancedMetrics = hasRent && p_annualOperatingExpenses > 0;
    const showAppreciation = p_annualAppreciationRate > 0 && p_appreciationYears > 0;

    // --- ACCURATE CASH FLOW PROJECTION & PAYBACK PERIOD ---
    const cashFlowProjection: { [key: number]: any[] } = { 5: [], 10: [], 15: [], 20: [] };
    const projectionPeriods = [5, 10, 15, 20];

    if (endDate && startDate && hasRent) {
        let cumulativeCashFlow = -paidUntilHandover;

        const yearZeroEntry = {
            year: 0,
            rent: 0,
            expenses: 0,
            installments: 0,
            netCashFlow: -paidUntilHandover,
            cumulativeCashFlow: cumulativeCashFlow,
        };
        projectionPeriods.forEach(p => { cashFlowProjection[p].push(yearZeroEntry); });

        for (let year = 1; year <= 20; year++) {
            const yearAfterHandover = year;

            const currentAnnualRent = annualRent * Math.pow(rentIncreaseFactor, yearAfterHandover - 1);
            const noiForYear = currentAnnualRent - p_annualOperatingExpenses;

            const yearsFromContractStart = totalYearsUntilHandover + yearAfterHandover;
            const installmentsPaidInYear = yearsFromContractStart <= calculatedInstallmentYears ? annualInstallment : 0;
            
            const netCashFlow = noiForYear - installmentsPaidInYear;
            cumulativeCashFlow += netCashFlow;

            const projectionEntry = {
                year: yearAfterHandover,
                rent: currentAnnualRent,
                expenses: p_annualOperatingExpenses,
                installments: installmentsPaidInYear,
                netCashFlow: netCashFlow,
                cumulativeCashFlow: cumulativeCashFlow,
            };

            projectionPeriods.forEach(p => {
                if (year <= p) {
                    cashFlowProjection[p].push(projectionEntry);
                }
            });
        }
    }

    let breakEvenYearAfterHandover: number | null = null;
    const breakEvenRow = cashFlowProjection[20]?.find(row => row.cumulativeCashFlow >= 0);
    
    if (breakEvenRow) {
        const breakEvenIndex = cashFlowProjection[20].indexOf(breakEvenRow);
        const prevRow = breakEvenIndex > 0 ? cashFlowProjection[20][breakEvenIndex - 1] : null;

        if (breakEvenRow.year === 0) {
            breakEvenYearAfterHandover = 0;
        } else if (prevRow) {
            const costToCover = -prevRow.cumulativeCashFlow;
            const cashFlowInBreakEvenYear = breakEvenRow.netCashFlow;
            if (cashFlowInBreakEvenYear > 0) {
                const fractionOfYear = costToCover / cashFlowInBreakEvenYear;
                breakEvenYearAfterHandover = prevRow.year + fractionOfYear;
            } else {
                breakEvenYearAfterHandover = breakEvenRow.year;
            }
        } else {
            breakEvenYearAfterHandover = breakEvenRow.year;
        }
    }
    
    const totalPaybackPeriodFromContract = hasRent && breakEvenYearAfterHandover !== null ? totalYearsUntilHandover + breakEvenYearAfterHandover : Infinity;
    const paybackPeriod = hasRent && breakEvenYearAfterHandover !== null ? Math.max(0, totalPaybackPeriodFromContract - calculatedInstallmentYears) : Infinity;
    
    const analysis = {
        roi: showAdvancedMetrics ? getRoiAnalysis(roi) : null,
        roe: showAdvancedMetrics ? getRoeAnalysis(roe) : null,
        capRate: showAdvancedMetrics ? getCapRateAnalysis(capRate) : null,
        paybackPeriod: hasRent ? getPaybackAnalysis(totalPaybackPeriodFromContract) : null,
        npv: showNpv ? getNpvAnalysis(npv) : null,
    };
    
    return {
        formatted: {
            totalCost: format(totalCost),
            netUnitCost: format(0), // Deprecating netUnitCost as it was confusing
            maintenanceAmount: format(maintenanceAmount),
            calculatedDownPaymentValue: format(calculatedDownPayment),
            calculatedHandoverPaymentValue: format(calculatedHandoverPayment),
            calculatedInstallmentYears: format(calculatedInstallmentYears),
            installmentsUntilHandover: format(installmentsUntilHandover),
            paidUntilHandover: format(paidUntilHandover),
            rentCoveragePercentage: format(annualInstallment > 0 ? (annualRent / annualInstallment) * 100 : 0),
            paybackPeriod: format(paybackPeriod),
            totalPaybackPeriodFromContract: format(totalPaybackPeriodFromContract),
            quarterlyRent: format(quarterlyRent),
            capRate: format(capRate),
            roi: format(roi),
            roe: format(roe),
            futureValue: format(futureValue),
            appreciationAmount: format(appreciationAmount),
            npv: format(npv),
        },
        raw: {
            totalCost,
            paidUntilHandover,
            netUnitCost: 0, // Deprecating netUnitCost
            paybackPeriod,
            totalPaybackPeriodFromContract,
            roi,
            roe,
            capRate,
            futureValue,
            appreciationAmount,
            maintenanceAmount,
            calculatedDownPayment,
            calculatedHandoverPayment,
            noi,
            annualCashFlow,
            annualRent,
            npv,
            calculatedInstallmentYears,
            appreciationYears: p_appreciationYears,
        },
        analysis,
        cashFlowProjection,
        hasRent,
        showAdvancedMetrics,
        showAppreciation,
        showNpv,
    };
};