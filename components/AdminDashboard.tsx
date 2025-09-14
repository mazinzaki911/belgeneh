import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useAppSettings } from '../src/contexts/AppSettingsContext';
import { useNotification } from '../src/contexts/NotificationContext';
import { useToast } from '../src/contexts/ToastContext';
import { useTranslation } from '../src/contexts/LanguageContext';
import { User, UserStatus, NotificationType, CalculatorType, AppSettings, CalculatorSettings } from '../types';
import { getCalculators, PencilIcon, TrashIcon, UserIcon, CheckCircleIcon, PauseCircleIcon, AVAILABLE_ICONS, ChevronDownIcon, ArrowUpTrayIcon, ToolsGuideIcon, UsersIcon } from '../constants';
import StatCard from '../src/components/admin/StatCard';
import UserStatusPieChart from '../src/components/admin/UserStatusPieChart';
import ComparisonBarChart from '../src/components/dashboard/ComparisonBarChart';
import TextInput from './shared/TextInput';
import NumberInput from './shared/NumberInput';
import TextAreaInput from './shared/TextAreaInput';


const AnalyticsTab: FC = () => {
    const { t, language } = useTranslation();
    const { users } = useAuth();
    const { calculatorSettings } = useAppSettings();

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
        users.forEach(user => {
            Object.entries(user.usage || {}).forEach(([toolId, count]) => {
                usageCounts[toolId] = (usageCounts[toolId] || 0) + count;
            });
        });

        const calculators = getCalculators(t, language, calculatorSettings);
        return Object.entries(usageCounts)
            .map(([toolId, value]) => ({
                name: calculators.find(c => c.id === toolId)?.name || toolId,
                value,
            }))
            .sort((a, b) => b.value - a.value);
    }, [users, t, language, calculatorSettings]);
    
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
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('adminDashboard.analytics.userStatusDistribution')}</h3>
                    {stats.totalUsers > 0 ? (
                        <UserStatusPieChart data={pieChartData} ariaLabel={pieChartAriaLabel} />
                    ) : <p className="text-neutral-500 dark:text-neutral-400">{t('adminDashboard.analytics.noUsersYet')}</p>}
                </div>
                 <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
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
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 animate-fade-in">
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
                                <td className="px-6 py-4">{Object.values(user.usage || {}).reduce((a, b) => a + b, 0)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === UserStatus.Active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'}`}>
                                        {t(user.status === UserStatus.Active ? 'adminDashboard.statusActive' : 'adminDashboard.statusSuspended')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => setUserToEdit(user)} className="font-medium text-primary hover:underline">{t('adminDashboard.actions.edit')}</button>
                                    <button onClick={() => toggleUserStatus(user.id)} className="font-medium text-amber-600 hover:underline">{t(user.status === UserStatus.Active ? 'adminDashboard.actions.suspend' : 'adminDashboard.actions.activate')}</button>
                                    <button onClick={() => setUserToDelete(user)} className="font-medium text-red-600 hover:underline">{t('adminDashboard.actions.delete')}</button>
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
    const { isMaintenanceMode, maintenanceMessage, toolUsageLimit, disabledTools, setAppSettings } = useAppSettings();
    const { addNotification } = useNotification();
    const showToast = useToast();
    
    const [localSettings, setLocalSettings] = useState({ isMaintenanceMode, maintenanceMessage, toolUsageLimit, disabledTools });
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');

    const handleSave = () => {
        setAppSettings(localSettings);
        showToast('Settings saved!', 'success');
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
    
    const calculators = getCalculators(t, language);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
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

            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('adminDashboard.settings.usageLimitsTitle')}</h3>
                 <NumberInput label={t('adminDashboard.settings.usageLimitLabel')} value={String(localSettings.toolUsageLimit)} onChange={e => setLocalSettings(s => ({...s, toolUsageLimit: parseInt(e.target.value, 10) || 0}))} tooltip={t('adminDashboard.settings.usageLimitTooltip')} />
            </div>
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
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
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
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
    const { calculatorSettings, setAppSettings } = useAppSettings();
    const showToast = useToast();
    
    const [localSettings, setLocalSettings] = useState<CalculatorSettings>(JSON.parse(JSON.stringify(calculatorSettings)));
    
    const calculators = useMemo(() => getCalculators(t, language), [t, language]);
    
    const handleSettingChange = (toolId: string, field: 'name_ar' | 'name_en' | 'icon' | 'customIcon', value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            [toolId]: {
                ...prev[toolId],
                [field]: value,
            },
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
                    handleSettingChange(toolId, 'customIcon', event.target.result as string);
                }
            };
            reader.onerror = () => showToast(t('adminDashboard.toolCustomization.fileReadError'), 'error');
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        setAppSettings({ calculatorSettings: localSettings });
        showToast('Customizations saved!', 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{t('adminDashboard.toolCustomization.title')}</h3>
                <p className="text-sm text-neutral-500 mt-1">{t('adminDashboard.toolCustomization.description')}</p>
            </div>

            {calculators.map(calc => (
                <div key={calc.id} className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        {calc.icon}
                        <h4 className="text-lg font-bold">{getCalculators(t, language, localSettings).find(c => c.id === calc.id)?.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label={t('adminDashboard.toolCustomization.nameAr')} value={localSettings[calc.id]?.name_ar || ''} onChange={(e) => handleSettingChange(calc.id, 'name_ar', e.target.value)} />
                        <TextInput label={t('adminDashboard.toolCustomization.nameEn')} value={localSettings[calc.id]?.name_en || ''} onChange={(e) => handleSettingChange(calc.id, 'name_en', e.target.value)} />
                        
                        <div className="md:col-span-2">
                           <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 block mb-2">{t('adminDashboard.toolCustomization.icon')}</label>
                           <div className="flex flex-wrap items-center gap-4">
                                <select value={localSettings[calc.id]?.icon || calc.iconName} onChange={(e) => handleSettingChange(calc.id, 'icon', e.target.value)} className="flex-1 min-w-[150px] py-3 px-4 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-300 dark:border-neutral-600 rounded-lg">
                                   {Object.keys(AVAILABLE_ICONS).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                                </select>
                                <span className="text-sm font-bold">{t('common.or')}</span>
                               <input type="file" id={`icon-upload-${calc.id}`} className="hidden" accept="image/*" onChange={(e) => handleIconUpload(calc.id, e)} />
                               <label htmlFor={`icon-upload-${calc.id}`} className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
                                   <ArrowUpTrayIcon className="w-5 h-5" /> {t('adminDashboard.toolCustomization.uploadIcon')}
                               </label>
                               {localSettings[calc.id]?.customIcon && (
                                   <button onClick={() => handleSettingChange(calc.id, 'customIcon', '')} className="text-red-500 text-sm font-semibold">{t('adminDashboard.toolCustomization.removeIcon')}</button>
                               )}
                           </div>
                           <p className="text-xs text-neutral-400 mt-2">{t('adminDashboard.toolCustomization.iconUploadHint')}</p>
                        </div>
                    </div>
                </div>
            ))}
            
            <div className="flex justify-end mt-8">
                <button onClick={handleSave} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform hover:scale-105">{t('common.save')}</button>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: t('adminDashboard.tabs.analytics') },
    { id: 'userManagement', label: t('adminDashboard.tabs.userManagement') },
    { id: 'appSettings', label: t('adminDashboard.tabs.appSettings') },
    { id: 'toolCustomization', label: t('adminDashboard.tabs.toolCustomization') },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{t('adminDashboard.title')}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">{t('adminDashboard.description')}</p>
      </div>

      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary dark:border-primary-dark dark:text-primary-dark'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:hover:text-neutral-200 dark:hover:border-neutral-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'userManagement' && <UserManagementTab />}
        {activeTab === 'appSettings' && <AppSettingsTab />}
        {activeTab === 'toolCustomization' && <ToolCustomizationTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;