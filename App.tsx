import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import RoiCalculator from './components/RoiCalculator';
import RoeCalculator from './components/RoeCalculator';
import CapRateCalculator from './components/CapRateCalculator';
import PaybackPeriodCalculator from './components/PaybackPeriodCalculator';
import PriceAppreciationCalculator from './components/PriceAppreciationCalculator';
import NpvCalculator from './components/NpvCalculator';
import FullUnitCalculator from './components/FullUnitCalculator';
import PaymentPlanCalculator from './components/PaymentPlanCalculator';
import MortgageCalculator from './components/MortgageCalculator';
// FIX: The Dashboard component is a named export, not a default export.
import { Dashboard } from './components/Dashboard';
import EditDealModal from './components/EditDealModal';
import ConfirmationModal from './components/shared/ConfirmationModal';
import SavedUnitsList from './components/SavedUnitsList';
// FIX: Corrected import path for ToastContainer.
import ToastContainer from './src/components/shared/Toast';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import EditUserModal from './components/EditUserModal';
import IntroductionPage from './components/IntroductionPage';
import MaintenancePage from './components/MaintenancePage';
import AdminDashboard from './components/AdminDashboard';
import PortfolioManager from './components/PortfolioManager';
import AddEditPropertyModal from './components/portfolio/AddEditPropertyModal';
import PropertyManagementModal from './components/portfolio/PropertyManagementModal';
import OnboardingTour from './components/shared/OnboardingTour';


import { CalculatorType } from './types';
import { getCalculators } from './constants';
import { useAuth } from './src/contexts/AuthContext';
import { useData } from './src/contexts/DataContext';
import { useUI } from './src/contexts/UIContext';
import { useTranslation } from './src/contexts/LanguageContext';
import { useAppSettings } from './src/contexts/AppSettingsContext';

const App: React.FC = () => {
  const { t, language } = useTranslation();
  
  const { currentUser, userToEdit, userToDelete: adminUserToDelete, deleteUser, setUserToEdit, setUserToDelete: setAdminUserToDelete } = useAuth();
  const { 
    editingDealUnit, unitToDelete, handleDeleteUnit, setEditingDealUnit, setUnitToDelete,
    isAddPropertyModalOpen, setIsAddPropertyModalOpen, propertyToEdit, setPropertyToEdit,
    propertyToDelete, setPropertyToDelete, deletePortfolioProperty, propertyToManage, setPropertyToManage
  } = useData();
  const { activeCalculator } = useUI();
  const { isMaintenanceMode, calculatorSettings } = useAppSettings();

  const [currency] = useState('EGP');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const mainContentRef = useRef<HTMLElement>(null);
  
  const CALCULATORS = useMemo(() => getCalculators(t, language, calculatorSettings), [t, language, calculatorSettings]);
  
  useEffect(() => {
    document.title = t('app.title');
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', t('app.description'));
    }
  }, [t]);

  useEffect(() => {
    // Check if the user has completed the tour before
    const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
    if (!hasCompletedOnboarding && currentUser) {
        setShowOnboarding(true);
    }
  }, [currentUser]);


  // Scroll to top when calculator changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeCalculator]);
  
  const handleOnboardingComplete = () => {
      localStorage.setItem('onboardingComplete', 'true');
      setShowOnboarding(false);
  };

  if (!currentUser) {
    return <Login />;
  }
  
  if (isMaintenanceMode && currentUser.role !== 'admin') {
    return <MaintenancePage />;
  }

  const renderActiveCalculator = () => {
    switch (activeCalculator) {
      case CalculatorType.Introduction:
        return <IntroductionPage />;
      case CalculatorType.ROI:
        return <RoiCalculator currency={currency} />;
      case CalculatorType.ROE:
        return <RoeCalculator currency={currency} />;
      case CalculatorType.CapRate:
        return <CapRateCalculator currency={currency} />;
      case CalculatorType.Payback:
        return <PaybackPeriodCalculator currency={currency} />;
      case CalculatorType.Appreciation:
        return <PriceAppreciationCalculator currency={currency} />;
      case CalculatorType.NPV:
        return <NpvCalculator currency={currency} />;
      case CalculatorType.FullUnit:
        return <FullUnitCalculator currency={currency} />;
      case CalculatorType.PaymentPlan:
        return <PaymentPlanCalculator currency={currency} />;
      case CalculatorType.Mortgage:
        return <MortgageCalculator currency={currency} />;
      case CalculatorType.Dashboard:
        return <Dashboard currency={currency} />;
       case CalculatorType.SavedUnits:
        return <SavedUnitsList />;
      case CalculatorType.Portfolio:
        return <PortfolioManager currency={currency} />;
      case CalculatorType.Profile:
        return <ProfilePage currentUser={currentUser} />;
      case CalculatorType.Settings:
        return <SettingsPage />;
      case CalculatorType.AdminDashboard:
        return <AdminDashboard />;
      default:
        return <IntroductionPage />;
    }
  };

  const activeCalculatorInfo = CALCULATORS.find(c => c.id === activeCalculator);

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100">
        {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}
        <ToastContainer />

        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            />
        )}
        
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className="flex-1 flex flex-col z-10">
            <Header 
              title={activeCalculatorInfo?.name || t('app.title')} 
              onMenuClick={() => setIsSidebarOpen(true)}
            />
            <main ref={mainContentRef} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {renderActiveCalculator()}
            </main>
        </div>
        
        {editingDealUnit && (
            <EditDealModal 
                unit={editingDealUnit} 
                onClose={() => setEditingDealUnit(null)} 
            />
        )}

        {(isAddPropertyModalOpen || propertyToEdit) && (
            <AddEditPropertyModal
                propertyToEdit={propertyToEdit}
                onClose={() => {
                    setIsAddPropertyModalOpen(false);
                    setPropertyToEdit(null);
                }}
            />
        )}

        {propertyToManage && (
            <PropertyManagementModal
                property={propertyToManage}
                onClose={() => setPropertyToManage(null)}
            />
        )}

        {unitToDelete && (
            <ConfirmationModal
                isOpen={!!unitToDelete}
                onClose={() => setUnitToDelete(null)}
                onConfirm={() => {
                    handleDeleteUnit(unitToDelete.id);
                    setUnitToDelete(null);
                }}
                title={t('confirmationModals.deleteUnitTitle')}
                message={<p dangerouslySetInnerHTML={{ __html: t('confirmationModals.deleteUnitMessage', { unitName: unitToDelete.name }) }} />}
            />
        )}

        {propertyToDelete && (
            <ConfirmationModal
                isOpen={!!propertyToDelete}
                onClose={() => setPropertyToDelete(null)}
                onConfirm={() => {
                    deletePortfolioProperty(propertyToDelete.id);
                    setPropertyToDelete(null);
                }}
                title={t('confirmationModals.deletePropertyTitle')}
                message={<p dangerouslySetInnerHTML={{ __html: t('confirmationModals.deletePropertyMessage', { propertyName: propertyToDelete.name }) }} />}
            />
        )}

        {userToEdit && (
            <EditUserModal
                user={userToEdit}
                onClose={() => setUserToEdit(null)}
            />
        )}
        {adminUserToDelete && (
            <ConfirmationModal
                isOpen={!!adminUserToDelete}
                onClose={() => setAdminUserToDelete(null)}
                onConfirm={() => {
                    deleteUser(adminUserToDelete.id);
                    setAdminUserToDelete(null);
                }}
                title={t('confirmationModals.deleteUserTitle')}
                message={<p dangerouslySetInnerHTML={{ __html: t('confirmationModals.deleteUserMessage', { userName: adminUserToDelete.name }) }} />}
            />
        )}
    </div>
  );
};

export default App;