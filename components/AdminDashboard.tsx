

import React, { useState, useMemo, FC, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useAppSettings } from '../src/contexts/AppSettingsContext';
import { useNotification } from '../src/contexts/NotificationContext';
import { useToast } from '../src/contexts/ToastContext';
import { useTranslation } from '../src/contexts/LanguageContext';
import { User, UserStatus, NotificationType, CalculatorType, AppSettings, CalculatorSettings, ActionIconSettings } from '../types';
// FIX: Corrected import path for constants.
import { getCalculators, PencilIcon, TrashIcon, UserIcon, CheckCircleIcon, PauseCircleIcon, AVAILABLE_ICONS, ArrowUpTrayIcon, ToolsGuideIcon, UsersIcon, ChartPieIcon, WrenchScrewdriverIcon, Cog6ToothIcon, UserCircleIcon } from '../constants';
import StatCard from '../src/components/admin/StatCard';
import UserStatusPieChart from '../src/components/admin/UserStatusPieChart';
import ComparisonBarChart from '../src/components/dashboard/ComparisonBarChart';
import TextInput from './shared/TextInput';
import NumberInput from './shared/NumberInput';
import TextAreaInput from './shared/TextAreaInput';
// FIX: Import the 'SelectInput' component to resolve reference errors.
import SelectInput from './shared/SelectInput';


const AnalyticsTab: FC = () => {
    const { t, language } = useTranslation();
    const { users } = useAuth();
    // FIX: Get the full appSettings object to pass to getCalculators.
    const appSettings = useAppSettings();

    const stats = useMemo(() => {
        const activeUsers = users.filter(u => u.status === UserStatus.Active).length;
        const suspendedUsers = users.filter(u => u.status === UserStatus.Suspended).length;
        return {
            totalUsers: users.length,
            activeUsers,
            suspendedUsers,
        };
    }, [users]);

    const toolUsageData = useMemo(() => {
        const usageCounts: Record<string, number> = {};
        users.forEach((user: User) => {
            // FIX: Add explicit types for destructured array elements from Object.entries to resolve type errors.
            Object.entries(user.usage || {}).forEach(([toolId, count]: [string, number]) => {
                usageCounts[toolId] = (usageCounts[toolId] || 0) + count;
            });
        });

        const calculators = getCalculators(t, language, appSettings);
        return Object.entries(usageCounts)
            .map(([toolId, value]) => ({
                name: calculators.find(c => c.id === toolId)?.name || toolId,
                value,
            }))
            .sort((a, b) => b.value - a.value);
    }, [users, t, language, appSettings]);
    
    const pieChartData = [
        { label: t('adminDashboard.stats.activeUsers'), value: stats.activeUsers, color: '#10B981' },
        { label: t('adminDashboard.stats.suspendedUsers'), value: stats.suspendedUsers, color: '#F59E0B' }
    ];
    
    const pieChartAriaLabel = t('adminDashboard.analytics.pieChartLabel', { 
        active: stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0) : 0, 
        suspended: stats.totalUsers > 0 ? ((stats.suspendedUsers / stats.totalUsers) * 100).toFixed(0) : 0 
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('adminDashboard.stats.totalUsers')} value={stats.totalUsers} icon={<UsersIcon className="w-6 h-6 text-primary" />} />
                <StatCard title={t('adminDashboard.stats.activeUsers')} value={stats.activeUsers} icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />} />
                <StatCard title={t('adminDashboard.stats.suspendedUsers')} value={stats.suspendedUsers} icon={<PauseCircleIcon className="w-6 h-6 text-amber-500" />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('adminDashboard.analytics.userStatusDistribution')}</h3>
                    {stats.totalUsers > 0 ? (
                        <UserStatusPieChart data={pieChartData} ariaLabel={pieChartAriaLabel} />
                    ) : <p className="text-neutral-500 dark:text-neutral-400">{t('adminDashboard.analytics.noUsersYet')}</p>}
                </div>
                 <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('adminDashboard.analytics.mostUsedTools')}</h3>
                    {toolUsageData.length > 0 ? (
                        <ComparisonBarChart data={toolUsageData} metricLabel={t('adminDashboard.analytics.uses')} lowerIsBetter={false} />
                    ) : <p className="text-neutral-500 dark:text-neutral-400">{t('adminDashboard.analytics.noUsageData')}</p>}
                </div>
            </div>
        </div>
    );
};

const UserManagementTab: FC = () => {
    const { t } = useTranslation();
    const { users, toggleUserStatus, setUserToEdit, setUserToDelete } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const filteredUsers = useMemo(() =>
        users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * usersPerPage;
        return filteredUsers.slice(startIndex, startIndex + usersPerPage);
    }, [filteredUsers, currentPage, usersPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('adminDashboard.manageUsers', { count: filteredUsers.length })}</h3>
            <TextInput label="" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder={t('adminDashboard.searchPlaceholder')} />

            <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
                    <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('adminDashboard.tableHeaders.user')}</th>
                            <th scope="col" className="px-6 py-3">{t('adminDashboard.tableHeaders.joinDate')}</th>
                            <th scope="col" className="px-6 py-3">{t('adminDashboard.tableHeaders.usage')}</th>
                            <th scope="col" className="px-6 py-3">{t('adminDashboard.tableHeaders.status')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.tableHeaders.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(user => (
                            <tr key={user.id} className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{user.name}<br/><span className="text-xs text-neutral-500">{user.email}</span></td>
                                <td className="px-6 py-4">{new Date(user.joinDate).toLocaleDateString()}</td>
                                {/* FIX: Add explicit types to the reduce function's parameters to resolve arithmetic operation errors on 'unknown' types. */}
                                <td className="px-6 py-4">{Object.values(user.usage || {}).reduce((a: number, b: number) => a + b, 0)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === UserStatus.Active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'}`}>
                                        {t(user.status === UserStatus.Active ? 'adminDashboard.statusActive' : 'adminDashboard.statusSuspended')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                                        <button onClick={() => setUserToEdit(user)} className="font-medium text-primary hover:underline whitespace-nowrap">{t('adminDashboard.actions.edit')}</button>
                                        <button onClick={() => toggleUserStatus(user.id)} className="font-medium text-amber-600 hover:underline whitespace-nowrap">{t(user.status === UserStatus.Active ? 'adminDashboard.actions.suspend' : 'adminDashboard.actions.activate')}</button>
                                        <button onClick={() => setUserToDelete(user)} className="font-medium text-red-600 hover:underline whitespace-nowrap">{t('adminDashboard.actions.delete')}</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredUsers.length === 0 && <p className="text-center p-8 text-neutral-500 dark:text-neutral-400">{t('adminDashboard.emptyState')}</p>}

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-md disabled:opacity-50">{t('adminDashboard.pagination.previous')}</button>
                    <span>{t('adminDashboard.pagination.pageOf', { current: currentPage, total: totalPages })}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-md disabled:opacity-50">{t('adminDashboard.pagination.next')}</button>
                </div>
            )}
        </div>
    );
};

const AppSettingsTab: FC = () => {
    const { t, language } = useTranslation();
    const appSettings = useAppSettings();
    const { isMaintenanceMode, maintenanceMessage, toolUsageLimit, disabledTools, setAppSettings } = appSettings;
    const { addNotification } = useNotification();
    const showToast = useToast();
    
    const [localSettings, setLocalSettings] = useState({ isMaintenanceMode, maintenanceMessage, toolUsageLimit, disabledTools });
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        setLocalSettings({ isMaintenanceMode, maintenanceMessage, toolUsageLimit, disabledTools });
    }, [isMaintenanceMode, maintenanceMessage, toolUsageLimit, disabledTools]);

    const handleSave = () => {
        if (localSettings.isMaintenanceMode !== isMaintenanceMode) {
            const title = localSettings.isMaintenanceMode
                ? t('adminDashboard.notifications.maintenanceOnTitle')
                : t('adminDashboard.notifications.maintenanceOffTitle');
            const message = localSettings.isMaintenanceMode
                ? t('adminDashboard.notifications.maintenanceOnMessage')
                : t('adminDashboard.notifications.maintenanceOffMessage');
            
            addNotification({
                title: title,
                message: message,
                type: NotificationType.Global,
                userId: null
            });
        }
        setAppSettings(localSettings);
        showToast(t('adminDashboard.settings.saveSuccess'), 'success');
    };
    
    const handleSendNotification = () => {
        if (notificationTitle.trim() && notificationMessage.trim()) {
            addNotification({ title: notificationTitle, message: notificationMessage, type: NotificationType.Global, userId: null });
            showToast(t('adminDashboard.notifications.sentSuccess'), 'success');
            setNotificationTitle('');
            setNotificationMessage('');
        } else {
            showToast(t('adminDashboard.notifications.sentError'), 'error');
        }
    };
    
    const calculators = getCalculators(t, language, appSettings);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('adminDashboard.settings.maintenanceModeTitle')}</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <label htmlFor="maintenance-toggle" className="font-medium text-neutral-700 dark:text-neutral-200">{t('adminDashboard.settings.maintenanceToggle')}</label>
                        <p className="text-sm text-neutral-500">{t('adminDashboard.settings.maintenanceDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="maintenance-toggle" className="sr-only peer" checked={localSettings.isMaintenanceMode} onChange={e => setLocalSettings(s => ({...s, isMaintenanceMode: e.target.checked}))} />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div className="mt-4">
                    <TextInput label={t('adminDashboard.settings.maintenanceMessage')} value={localSettings.maintenanceMessage} onChange={e => setLocalSettings(s => ({...s, maintenanceMessage: e.target.value}))} />
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('adminDashboard.settings.usageLimitsTitle')}</h3>
                 <NumberInput label={t('adminDashboard.settings.usageLimitLabel')} value={String(localSettings.toolUsageLimit)} onChange={e => setLocalSettings(s => ({...s, toolUsageLimit: parseInt(e.target.value, 10) || 0}))} tooltip={t('adminDashboard.settings.usageLimitTooltip')} />
            </div>
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
                 <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">{t('adminDashboard.settings.toolManagementTitle')}</h3>
                 <p className="text-sm text-neutral-500 mb-4">{t('adminDashboard.settings.toolManagementDescription')}</p>
                 <div className="space-y-3">
                     {calculators.filter(c => c.id !== CalculatorType.AdminDashboard).map(calc => (
                         <div key={calc.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                             <div className="flex items-center gap-3">
                                 {calc.icon}
                                 <span className="font-semibold">{calc.name}</span>
                             </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" checked={!localSettings.disabledTools[calc.id]} onChange={e => setLocalSettings(s => ({...s, disabledTools: {...s.disabledTools, [calc.id]: !e.target.checked}}))} />
                                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                         </div>
                     ))}
                 </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('adminDashboard.notifications.title')}</h3>
                <div className="space-y-4">
                    <TextInput label={t('adminDashboard.notifications.notificationTitle')} value={notificationTitle} onChange={e => setNotificationTitle(e.target.value)} placeholder={t('adminDashboard.notifications.notificationTitlePlaceholder')} />
                    <TextAreaInput label={t('adminDashboard.notifications.notificationMessage')} value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} placeholder={t('adminDashboard.notifications.notificationMessagePlaceholder')} />
                    <div className="text-right">
                        <button onClick={handleSendNotification} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">{t('adminDashboard.notifications.sendButton')}</button>
                    </div>
                </div>
            </div>
            
             <div className="flex justify-end mt-8">
                <button onClick={handleSave} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform hover:scale-105">{t('common.save')}</button>
            </div>
        </div>
    );
};

const ToolCustomizationTab: FC = () => {
    const { t, language } = useTranslation();
    const appSettings = useAppSettings();
    const { calculatorSettings, actionIcons, setAppSettings } = appSettings;
    const showToast = useToast();
    
    const [localSettings, setLocalSettings] = useState<{
        calculatorSettings: CalculatorSettings,
        actionIcons: ActionIconSettings
    }>(() => JSON.parse(JSON.stringify({ calculatorSettings, actionIcons })));
    
    useEffect(() => {
        setLocalSettings(JSON.parse(JSON.stringify({ calculatorSettings, actionIcons })));
    }, [calculatorSettings, actionIcons]);

    const calculators = useMemo(() => getCalculators(t, language, appSettings), [t, language, appSettings]);
    
    const customizableActions = [
        { id: 'saveAnalysis', defaultIcon: 'DocumentArrowDownIcon' },
        { id: 'newAnalysis', defaultIcon: 'DocumentPlusIcon' },
    ];

    // FIX: Correctly handle state updates for nested objects to satisfy TypeScript's type constraints.
    const handleCalcSettingChange = (toolId: string, field: 'name_ar' | 'name_en' | 'icon' | 'customIcon', value: string) => {
        setLocalSettings(prev => {
            const calcInfo = calculators.find(c => c.id === toolId);
            const newSettings = {
                name_ar: '',
                name_en: '',
                icon: calcInfo?.iconName || '',
                ...prev.calculatorSettings[toolId],
                [field]: value,
            };

            if (field === 'customIcon' && !value) {
                delete (newSettings as Partial<typeof newSettings>).customIcon;
            }

            return {
                ...prev,
                calculatorSettings: {
                    ...prev.calculatorSettings,
                    [toolId]: newSettings,
                }
            }
        });
    };
    
    const handleActionIconChange = (actionId: string, iconName: string) => {
        setLocalSettings(prev => ({
            ...prev,
            actionIcons: {
                ...prev.actionIcons,
                [actionId]: iconName,
            }
        }));
    };

    const handleIconUpload = (toolId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024) { // 100KB limit
                showToast(t('adminDashboard.toolCustomization.fileTooLarge'), 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    handleCalcSettingChange(toolId, 'customIcon', event.target.result as string);
                }
            };
            reader.onerror = () => showToast(t('adminDashboard.toolCustomization.fileReadError'), 'error');
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        setAppSettings(localSettings);
        showToast('Customizations saved!', 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">{t('adminDashboard.toolCustomization.title')}</h3>
                <p className="text-sm text-neutral-500 mb-4">{t('adminDashboard.toolCustomization.description')}</p>
                 <div className="space-y-4">
                     {calculators.map(calc => {
                        const currentSettings = localSettings.calculatorSettings[calc.id];
                        const IconComponent = AVAILABLE_ICONS[currentSettings?.icon || calc.iconName] || (() => null);
                        return (
                         <div key={calc.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                             <div className="flex items-center gap-3 mb-4">
                                {currentSettings?.customIcon ? (
                                    currentSettings.customIcon.startsWith('data:image/svg+xml') ? (
                                        <div
                                            className="w-6 h-6 text-primary dark:text-primary-dark"
                                            style={{
                                                backgroundColor: 'currentColor',
                                                maskImage: `url("${currentSettings.customIcon}")`,
                                                WebkitMaskImage: `url("${currentSettings.customIcon}")`,
                                                maskSize: 'contain',
                                                WebkitMaskSize: 'contain',
                                                maskRepeat: 'no-repeat',
                                                WebkitMaskRepeat: 'no-repeat',
                                                maskPosition: 'center',
                                                WebkitMaskPosition: 'center',
                                            }}
                                        />
                                    ) : (
                                        <img src={currentSettings.customIcon} alt={calc.name as string} className="w-6 h-6 object-contain" />
                                    )
                                 ) : (
                                    <IconComponent className="w-6 h-6 text-primary dark:text-primary-dark" />
                                 )}
                                 <h4 className="font-bold text-lg">{calc.name}</h4>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput label={t('adminDashboard.toolCustomization.nameAr')} value={localSettings.calculatorSettings[calc.id]?.name_ar || ''} onChange={e => handleCalcSettingChange(calc.id, 'name_ar', e.target.value)} />
                                <TextInput label={t('adminDashboard.toolCustomization.nameEn')} value={localSettings.calculatorSettings[calc.id]?.name_en || ''} onChange={e => handleCalcSettingChange(calc.id, 'name_en', e.target.value)} />
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <SelectInput label={t('adminDashboard.toolCustomization.predefinedIcon')} value={localSettings.calculatorSettings[calc.id]?.icon || calc.iconName} onChange={e => handleCalcSettingChange(calc.id, 'icon', e.target.value)}>
                                         {Object.keys(AVAILABLE_ICONS).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                                     </SelectInput>
                                     <div>
                                         <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-2 block">{t('adminDashboard.toolCustomization.customIcon')}</label>
                                         <div className="flex items-center gap-2">
                                             <input type="file" accept="image/png, image/svg+xml" onChange={(e) => handleIconUpload(calc.id, e)} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary dark:file:bg-primary/20 dark:file:text-primary-dark hover:file:bg-primary/20"/>
                                             {localSettings.calculatorSettings[calc.id]?.customIcon && <button onClick={() => handleCalcSettingChange(calc.id, 'customIcon', '')} className="text-xs text-red-500 hover:underline">{t('adminDashboard.toolCustomization.removeIcon')}</button>}
                                         </div>
                                         <p className="text-xs text-neutral-400 mt-1">{t('adminDashboard.toolCustomization.iconUploadHint')}</p>
                                     </div>
                                </div>
                             </div>
                         </div>
                     )})}
                 </div>
            </div>

             <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">{t('adminDashboard.toolCustomization.actionIconsTitle')}</h3>
                <p className="text-sm text-neutral-500 mb-4">{t('adminDashboard.toolCustomization.actionIconsDescription')}</p>
                <div className="space-y-4">
                    {customizableActions.map(action => (
                         <div key={action.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                            <h4 className="font-bold mb-2">{t(`adminDashboard.toolCustomization.actions.${action.id}`)}</h4>
                             <SelectInput label={t('adminDashboard.toolCustomization.predefinedIcon')} value={localSettings.actionIcons[action.id] || action.defaultIcon} onChange={e => handleActionIconChange(action.id, e.target.value)}>
                                 {Object.keys(AVAILABLE_ICONS).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                             </SelectInput>
                         </div>
                    ))}
                </div>
             </div>

             <div className="flex justify-end mt-8">
                <button onClick={handleSave} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform hover:scale-105">{t('common.save')}</button>
            </div>
        </div>
    );
};


export const AdminDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('analytics');

    const tabs = useMemo(() => [
        { id: 'analytics', label: t('adminDashboard.tabs.analytics'), icon: <ChartPieIcon className="w-5 h-5" />, component: AnalyticsTab },
        { id: 'users', label: t('adminDashboard.tabs.userManagement'), icon: <UsersIcon className="w-5 h-5" />, component: UserManagementTab },
        { id: 'settings', label: t('adminDashboard.tabs.appSettings'), icon: <Cog6ToothIcon className="w-5 h-5" />, component: AppSettingsTab },
        { id: 'tool-customization', label: t('adminDashboard.tabs.toolCustomization'), icon: <WrenchScrewdriverIcon className="w-5 h-5" />, component: ToolCustomizationTab },
    ], [t]);

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AnalyticsTab;

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{t('adminDashboard.title')}</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-2">{t('adminDashboard.description')}</p>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-2">
                <div className="flex flex-wrap justify-center gap-2">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-neutral-600 dark:text-neutral-300 hover:bg-primary-light dark:hover:bg-primary/20'}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <ActiveComponent />
            </div>
        </div>
    );
};