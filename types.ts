export type Theme = 'light' | 'dark';
export type Language = 'ar' | 'en';

export enum UnitStatus {
  UnderConsideration = 'UnderConsideration',
  OfferMade = 'OfferMade',
  Purchased = 'Purchased',
  Rejected = 'Rejected',
  Pending = 'Pending',
}

export enum CalculatorType {
  Introduction = 'Introduction',
  ROI = 'ROI',
  ROE = 'ROE',
  CapRate = 'CapRate',
  Payback = 'Payback',
  Appreciation = 'Appreciation',
  NPV = 'NPV',
  FullUnit = 'FullUnit',
  PaymentPlan = 'PaymentPlan',
  Mortgage = 'Mortgage',
  Dashboard = 'Dashboard',
  Portfolio = 'Portfolio',
  SavedUnits = 'SavedUnits',
  Profile = 'Profile',
  Settings = 'Settings',
  AdminDashboard = 'AdminDashboard',
}

export interface FullUnitData {
    totalPrice: string;
    downPaymentPercentage: string;
    installmentAmount: string;
    installmentFrequency: string; // 1, 3, 6, 12 months
    maintenancePercentage: string;
    handoverPaymentPercentage: string;
    contractDate: string;
    handoverDate: string;
    monthlyRent: string;
    annualRentIncrease: string;
    annualOperatingExpenses: string;
    annualAppreciationRate: string;
    appreciationYears: string;
    discountRate: string;
}

export interface SavedUnit {
    id: string;
    name: string;
    data: FullUnitData;
    status: UnitStatus;
    notes?: string;
    dealDate?: string;
}

// User Management Types
export enum UserStatus {
    Active = 'Active',
    Suspended = 'Suspended',
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Password might not always be present on the client
    status: UserStatus;
    joinDate: string;
    usage: Record<string, number>;
    role: 'admin' | 'user';
    profilePicture?: string; // URL or base64 string
}

// App Settings
export interface CalculatorSettings {
    [key: string]: {
        name_ar: string;
        name_en: string;
        icon: string; // key of the icon in AVAILABLE_ICONS
        customIcon?: string; // base64 data URL for custom icon
    };
}

export interface ActionIconSettings {
    [key: string]: string; // e.g., { saveAnalysis: 'DocumentArrowDownIcon' }
}

export interface AppSettings {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
    toolUsageLimit: number; // 0 for unlimited
    disabledTools: Record<string, boolean>;
    calculatorSettings: CalculatorSettings;
    actionIcons: ActionIconSettings;
}

export interface AppSettingsContextType extends AppSettings {
    setAppSettings: (settings: Partial<AppSettings>) => void;
}

// Notification System Types
export enum NotificationType {
    Global = 'Global',
    UnitUpdate = 'UnitUpdate'
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type: NotificationType;
    userId: string | null; // null for global notifications
    relatedUnitId?: string;
}

// New Portfolio Manager Types
export enum PropertyType {
    Apartment = 'apartment',
    Shop = 'shop',
    Office = 'office',
    Clinic = 'clinic',
}

export interface PropertyTask {
    id: string;
    title: string;
    date: string;
    notes: string;
    isCompleted: boolean;
}

export interface PortfolioProperty {
    id: string;
    name: string;
    propertyType: PropertyType;
    purchasePrice: number;
    monthlyRent: number;
    // Expenses for NOI calculation
    annualOperatingExpenses: number;
    propertyTax: number;
    insurance: number;
    // Optional area for more metrics
    area?: number;
    internalArea?: number;
    externalArea?: number;
    gardenArea?: number;
    roofArea?: number;
    tasks?: PropertyTask[];
}


// New granular context types
export interface UIState {
    activeCalculator: CalculatorType;
    fullUnitCalcInitialStep: number;
    fullUnitCurrentStep: number;
}

export interface UIActions {
    setActiveCalculator: (calculator: CalculatorType) => void;
    setFullUnitCalcInitialStep: (step: number) => void;
    setFullUnitCurrentStep: (step: number) => void;
}

export interface DataState {
    savedUnits: SavedUnit[];
    loadedUnitId: string | null;
    editingDealUnit: SavedUnit | null;
    unitToDelete: SavedUnit | null;
    portfolioProperties: PortfolioProperty[];
    isAddPropertyModalOpen: boolean;
    propertyToEdit: PortfolioProperty | null;
    propertyToDelete: PortfolioProperty | null;
    propertyToManage: PortfolioProperty | null;
}

export interface DataActions {
    handleSaveUnit: (unitToSave: SavedUnit) => void;
    handleDeleteUnit: (unitId: string) => void;
    setLoadedUnitId: (unitId: string | null) => void;
    setEditingDealUnit: (unit: SavedUnit | null) => void;
    setUnitToDelete: (unit: SavedUnit | null) => void;
    addOrUpdatePortfolioProperty: (property: PortfolioProperty) => void;
    deletePortfolioProperty: (propertyId: string) => void;
    setIsAddPropertyModalOpen: (isOpen: boolean) => void;
    setPropertyToEdit: (property: PortfolioProperty | null) => void;
    setPropertyToDelete: (property: PortfolioProperty | null) => void;
    setPropertyToManage: (property: PortfolioProperty | null) => void;
    resetApplicationData: () => void;
}

export interface AuthState {
    currentUser: User | null;
    users: User[];
    userToEdit: User | null;
    userToDelete: User | null;
}

export interface AuthActions {
    signUp: (user: Omit<User, 'id' | 'status' | 'joinDate' | 'usage' | 'role' | 'profilePicture'>) => Promise<{ success: boolean; error?: string }>;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (user: User) => void;
    deleteUser: (userId: string) => void;
    toggleUserStatus: (userId: string) => void;
    setUserToEdit: (user: User | null) => void;
    setUserToDelete: (user: User | null) => void;
    recordToolUsage: (toolId: CalculatorType) => void;
    changePassword: (userId: string, oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
    deleteOwnAccount: (userId: string, password?: string) => Promise<{ success: boolean; error?: string }>;
}

export interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAllAsRead: (userId: string) => void;
    getUnreadCount: (userId: string) => number;
}


export type TFunction = (key: string, options?: Record<string, string | number | boolean>) => any;