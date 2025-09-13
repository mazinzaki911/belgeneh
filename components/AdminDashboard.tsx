import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { useAppSettings } from '../../src/contexts/AppSettingsContext';
import { useNotification } from '../../src/contexts/NotificationContext';
import { useToast } from '../../src/contexts/ToastContext';
import { useTranslation } from '../../src/contexts/LanguageContext';
import { User, UserStatus, NotificationType, CalculatorType, AppSettings, CalculatorSettings } from '../types';
// FIX: Import CalculatorIcon to resolve 'Cannot find name' error.
import { getCalculators, PencilIcon, TrashIcon, UserIcon, CheckCircleIcon, PauseCircleIcon, AVAILABLE_ICONS, ChevronDownIcon, ArrowUpTrayIcon, CalculatorIcon } from '../constants';
import StatCard from '../src/components/admin/StatCard';
import UserStatusPieChart from '../src/components/admin/UserStatusPieChart';
import ComparisonBarChart from '../src/components/dashboard/ComparisonBarChart';
import TextInput from './shared/TextInput';
import NumberInput from './shared/NumberInput';
import TextAreaInput from './shared/TextAreaInput';

const AnalyticsTab: FC = () => {
    const { t } = useTranslation();
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

        const calculators = getCalculators(t, calculatorSettings);
        return Object.entries(usageCounts)
            .map(([toolId, value]) => ({
                name: calculators.find(c => c.id === toolId)?.name || toolId,
                value,
            }))
            .sort((a, b) => b.value - a.value);
    }, [users, t, calculatorSettings]);
    
    const pieChartData = [
        { label: t('adminDashboard.stats.activeUsers'), value: stats.activeUsers, color: '#10B981' },
        { label: t('adminDashboard.stats.suspendedUsers'), value: stats.suspendedUsers, color: '#F59E0B' },
    ];
    
    const pieChartAriaLabel = t('adminDashboard.analytics.pieChartLabel', { active: ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0), suspended: ((stats.suspendedUsers / stats.totalUsers) * 100).toFixed(0) });

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('adminDashboard.stats.totalUsers')} value={stats.totalUsers} icon={<UserIcon className="w-6 h-6 text-primary" />} />
                <StatCard title={t('adminDashboard.stats.activeUsers')} value={stats.activeUsers} icon={<CheckCircleIcon className="w-6 h-6 text-primary" />} />
                <StatCard title={t('adminDashboard.stats.suspendedUsers')} value={stats.suspendedUsers} icon={<PauseCircleIcon className="w-6 h-6 text-primary" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('adminDashboard.analytics.userStatusDistribution')}</h3>
                    {users.length > 0 ? <UserStatusPieChart data={pieChartData} ariaLabel={pieChartAriaLabel}/> : <p className="text-center text-neutral-500 py-8">{t('adminDashboard.analytics.noUsersYet')}</p>}
                </div>
                 <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('adminDashboard.analytics.mostUsedTools')}</h3>
                     {toolUsageData.length > 0 ? (
                        <ComparisonBarChart data={toolUsageData} metricLabel={t('adminDashboard.analytics.uses')} lowerIsBetter={false} />
                    ) : (
                        <p className="text-center text-neutral-500 py-8">{t('adminDashboard.analytics.noUsageData')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserManagementTab: FC = () => {
    const { t } = useTranslation();
    const { users, toggleUserStatus, setUserToEdit, setUserToDelete, currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => u.id !== currentUser?.id)
            .filter(u => 
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, searchTerm, currentUser]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-bold">{t('adminDashboard.manageUsers', { count: filteredUsers.length })}</h3>
                <div className="w-full sm:w-72">
                  <TextInput 
                      label="" 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                      placeholder={t('adminDashboard.searchPlaceholder')} 
                  />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b dark:border-neutral-600">
                        <tr>
                            <th className="p-4">{t('adminDashboard.tableHeaders.user')}</th>
                            <th className="p-4">{t('adminDashboard.tableHeaders.joinDate')}</th>
                            <th className="p-4">{t('adminDashboard.tableHeaders.usage')}</th>
                            <th className="p-4">{t('adminDashboard.tableHeaders.status')}</th>
                            <th className="p-4 text-center">{t('adminDashboard.tableHeaders.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                            <tr key={user.id} className="border-b dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                                <td className="p-4">
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-neutral-500">{user.email}</p>
                                </td>
                                <td className="p-4">{new Date(user.joinDate).toLocaleDateString()}</td>
                                <td className="p-4">{Object.values(user.usage || {}).reduce((a, b) => a + b, 0)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === UserStatus.Active ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'}`}>
                                        {user.status === UserStatus.Active ? t('adminDashboard.statusActive') : t('adminDashboard.statusSuspended')}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-center items-center gap-2">
                                        <button onClick={() => setUserToEdit(user)} className="p-2 text-neutral-500 hover:text-primary" title={t('adminDashboard.actions.edit')}><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => toggleUserStatus(user.id)} className="p-2 text-neutral-500 hover:text-yellow-500" title={user.status === UserStatus.Active ? t('adminDashboard.actions.suspend') : t('adminDashboard.actions.activate')}>
                                            {user.status === UserStatus.Active ? <PauseCircleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}
                                        </button>
                                        <button onClick={() => setUserToDelete(user)} className="p-2 text-neutral-500 hover:text-red-500" title={t('adminDashboard.actions.delete')}><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-neutral-500">{t('adminDashboard.emptyState')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-md disabled:opacity-50">
                        {t('adminDashboard.pagination.previous')}
                    </button>
                    <span className="text-sm">{t('adminDashboard.pagination.pageOf', { current: currentPage, total: totalPages })}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-md disabled:opacity-50">
                        {t('adminDashboard.pagination.next')}
                    </button>
                </div>
            )}
        </div>
    );
};

const SettingsTab: FC = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const { addNotification } = useNotification();
    const { 
        isMaintenanceMode, 
        maintenanceMessage, 
        toolUsageLimit, 
        disabledTools, 
        setAppSettings 
    } = useAppSettings();

    const [localSettings, setLocalSettings] = useState<Pick<AppSettings, 'isMaintenanceMode' | 'maintenanceMessage' | 'toolUsageLimit' | 'disabledTools'>>({
        isMaintenanceMode,
        maintenanceMessage,
        toolUsageLimit,
        disabledTools,
    });
    
    useEffect(() => {
        setLocalSettings({
            isMaintenanceMode,
            maintenanceMessage,
            toolUsageLimit,
            disabledTools
        });
    }, [isMaintenanceMode, maintenanceMessage, toolUsageLimit, disabledTools]);

    const handleSettingChange = (key: keyof typeof localSettings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleToolToggle = (toolId: string) => {
        handleSettingChange('disabledTools', {
            ...localSettings.disabledTools,
            [toolId]: !localSettings.disabledTools[toolId],
        });
    };

    const handleSaveSettings = () => {
        setAppSettings(localSettings);
        showToast(t('common.save'), 'success');
    };

    const { calculatorSettings } = useAppSettings();
    const calculators = useMemo(() => getCalculators(t, calculatorSettings).filter(c => 
        ![CalculatorType.AdminDashboard, CalculatorType.Introduction, CalculatorType.Profile, CalculatorType.Settings].includes(c.id)
    ), [t, calculatorSettings]);
    
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');

    const handleSendNotification = () => {
        if (notificationTitle.trim() && notificationMessage.trim()) {
            addNotification({
                title: notificationTitle,
                message: notificationMessage,
                type: NotificationType.Global,
                userId: null,
            });
            showToast(t('adminDashboard.notifications.sentSuccess'), 'success');
            setNotificationTitle('');
            setNotificationMessage('');
        } else {
            showToast(t('adminDashboard.notifications.sentError'), 'error');
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">{t('adminDashboard.settings.maintenanceModeTitle')}</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{t('adminDashboard.settings.maintenanceToggle')}</p>
                        <p className="text-sm text-neutral-500">{t('adminDashboard.settings.maintenanceDescription')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={localSettings.isMaintenanceMode} onChange={e => handleSettingChange('isMaintenanceMode', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
                {localSettings.isMaintenanceMode && (
                    <div className="mt-4">
                        <TextInput 
                            label={t('adminDashboard.settings.maintenanceMessage')} 
                            value={localSettings.maintenanceMessage}
                            onChange={e => handleSettingChange('maintenanceMessage', e.target.value)}
                        />
                    </div>
                )}
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">{t('adminDashboard.settings.usageLimitsTitle')}</h3>
                 <NumberInput
                    label={t('adminDashboard.settings.usageLimitLabel')}
                    value={String(localSettings.toolUsageLimit)}
                    onChange={e => handleSettingChange('toolUsageLimit', parseInt(e.target.value, 10) || 0)}
                    tooltip={t('adminDashboard.settings.usageLimitTooltip')}
                />
            </div>
            
             <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-2">{t('adminDashboard.settings.toolManagementTitle')}</h3>
                <p className="text-sm text-neutral-500 mb-6">{t('adminDashboard.settings.toolManagementDescription')}</p>
                <div className="space-y-4">
                    {calculators.map(calc => (
                        <div key={calc.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                {calc.icon}
                                <span className="font-semibold">{calc.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${!localSettings.disabledTools[calc.id] ? 'text-green-600' : 'text-neutral-400'}`}>
                                    {!localSettings.disabledTools[calc.id] ? t('adminDashboard.settings.statusActive') : t('adminDashboard.settings.statusInactive')}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={!localSettings.disabledTools[calc.id]} onChange={() => handleToolToggle(calc.id)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-500 peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">{t('adminDashboard.notifications.title')}</h3>
                <div className="space-y-4">
                    <TextInput 
                        label={t('adminDashboard.notifications.notificationTitle')}
                        value={notificationTitle}
                        onChange={e => setNotificationTitle(e.target.value)}
                        placeholder={t('adminDashboard.notifications.notificationTitlePlaceholder')}
                    />
                    <TextAreaInput
                        label={t('adminDashboard.notifications.notificationMessage')}
                        value={notificationMessage}
                        onChange={e => setNotificationMessage(e.target.value)}
                        placeholder={t('adminDashboard.notifications.notificationMessagePlaceholder')}
                    />
                    <div className="flex justify-end">
                        <button onClick={handleSendNotification} className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90">
                            {t('adminDashboard.notifications.sendButton')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-8">
                <button onClick={handleSaveSettings} className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105">
                    {t('common.save')}
                </button>
            </div>
        </div>
    );
};

const IconPicker: FC<{ value: string; onChange: (iconKey: string) => void; }> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const SelectedIcon = AVAILABLE_ICONS[value] || CalculatorIcon;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <SelectedIcon className="w-6 h-6 text-primary dark:text-primary-dark" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{value}</span>
                </div>
                <ChevronDownIcon className="w-5 h-5 text-neutral-500" />
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-4 gap-2 p-2">
                        {Object.entries(AVAILABLE_ICONS).map(([key, IconComponent]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => { onChange(key); setIsOpen(false); }}
                                className={`p-2 flex items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 ${value === key ? 'ring-2 ring-primary' : ''}`}
                            >
                                <IconComponent className="w-6 h-6 text-neutral-700 dark:text-neutral-200" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const ToolCustomizationTab: FC = () => {
    const { t } = useTranslation();
    const { calculatorSettings, setAppSettings } = useAppSettings();
    const showToast = useToast();
    
    const [localSettings, setLocalSettings] = useState<CalculatorSettings>(calculatorSettings);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const currentToolIdForUpload = useRef<string | null>(null);

    useEffect(() => {
        setLocalSettings(calculatorSettings);
    }, [calculatorSettings]);

    const calculators = useMemo(() => getCalculators(t, {}), [t]);
    
    const handleSettingChange = (toolId: string, field: 'name_ar' | 'name_en' | 'icon' | 'customIcon', value: string) => {
        const defaultTool = calculators.find(c => c.id === toolId);
        if (!defaultTool) return;
        
        setLocalSettings(prev => {
            const currentToolSettings = prev[toolId] || {
                name_ar: defaultTool.name,
                name_en: defaultTool.name,
                icon: defaultTool.iconName,
            };
            
            // FIX: Explicitly type newSettings to allow adding the optional customIcon property.
            const newSettings: {
                name_ar: string;
                name_en: string;
                icon: string;
                customIcon?: string;
            } = { ...currentToolSettings };

            if (field === 'customIcon') {
                newSettings.customIcon = value;
            } else {
                (newSettings as any)[field] = value;
            }

            return {
                ...prev,
                [toolId]: newSettings,
            };
        });
    };

    const handleRemoveCustomIcon = (toolId: string) => {
        setLocalSettings(prev => {
            const { [toolId]: toolToUpdate, ...rest } = prev;
            if (toolToUpdate) {
                const { customIcon, ...restOfTool } = toolToUpdate;
                return { ...rest, [toolId]: restOfTool };
            }
            return prev;
        });
    };

    const handleUploadClick = (toolId: string) => {
        currentToolIdForUpload.current = toolId;
        uploadInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const toolId = currentToolIdForUpload.current;
        if (!file || !toolId) return;

        if (file.size > 102400) { // 100KB limit
            showToast(t('adminDashboard.toolCustomization.fileTooLarge'), 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            handleSettingChange(toolId, 'customIcon', reader.result as string);
        };
        reader.onerror = () => {
            showToast(t('adminDashboard.toolCustomization.fileReadError'), 'error');
        };
        reader.readAsDataURL(file);

        // Reset file input value
        e.target.value = '';
    };

    const handleSave = () => {
        setAppSettings({ calculatorSettings: localSettings });
        showToast(t('common.save'), 'success');
    };

    return (
        <div className="space-y-8">
            <input type="file" accept="image/png, image/jpeg, image/svg+xml, image/webp" ref={uploadInputRef} onChange={handleFileChange} className="hidden" />
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
                 <h3 className="text-xl font-bold mb-2">{t('adminDashboard.toolCustomization.title')}</h3>
                 <p className="text-sm text-neutral-500 mb-6">{t('adminDashboard.toolCustomization.description')}</p>
                 <div className="space-y-6">
                    {calculators.map(calc => {
                        const currentSettings = localSettings[calc.id];
                        const defaultSettings = calculators.find(c => c.id === calc.id);
                        const IconComponent = AVAILABLE_ICONS[currentSettings?.icon || defaultSettings?.iconName || 'CalculatorIcon'];

                        return (
                            <div key={calc.id} className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                <div className="flex flex-col md:flex-row items-stretch gap-4">
                                    <div className="flex flex-col items-center gap-2 p-2 bg-white dark:bg-neutral-700 rounded-lg">
                                        <label className="text-xs font-semibold text-neutral-500">{t('adminDashboard.toolCustomization.icon')}</label>
                                        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                                            {currentSettings?.customIcon ? (
                                                <img src={currentSettings.customIcon} alt={t('adminDashboard.toolCustomization.customIcon')} className="w-12 h-12 rounded-md object-cover" />
                                            ) : (
                                                <IconComponent className="w-12 h-12 text-primary dark:text-primary-dark" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => handleUploadClick(calc.id)} title={t('adminDashboard.toolCustomization.uploadIcon')} className="p-1.5 text-neutral-500 hover:text-primary dark:hover:text-primary-dark bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                <ArrowUpTrayIcon className="w-5 h-5"/>
                                            </button>
                                            {currentSettings?.customIcon && (
                                                <button type="button" onClick={() => handleRemoveCustomIcon(calc.id)} title={t('adminDashboard.toolCustomization.removeIcon')} className="p-1.5 text-neutral-500 hover:text-red-500 dark:hover:text-red-400 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                    <TrashIcon className="w-5 h-5"/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-neutral-500 mb-1 block">{t('adminDashboard.toolCustomization.predefinedIcon')}</label>
                                            <IconPicker
                                                value={currentSettings?.icon || defaultSettings?.iconName || 'CalculatorIcon'}
                                                onChange={(iconKey) => handleSettingChange(calc.id, 'icon', iconKey)}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <TextInput 
                                                label={t('adminDashboard.toolCustomization.nameAr')}
                                                value={currentSettings?.name_ar || defaultSettings?.name || ''}
                                                onChange={(e) => handleSettingChange(calc.id, 'name_ar', e.target.value)}
                                            />
                                            <TextInput 
                                                label={t('adminDashboard.toolCustomization.nameEn')}
                                                value={currentSettings?.name_en || defaultSettings?.name || ''}
                                                onChange={(e) => handleSettingChange(calc.id, 'name_en', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </div>
            <div className="flex justify-end mt-8">
                <button onClick={handleSave} className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105">
                    {t('common.save')}
                </button>
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
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">{t('adminDashboard.title')}</h1>
                <p className="text-neutral-500 mt-2">{t('adminDashboard.description')}</p>
            </div>

            <div className="border-b border-neutral-200 dark:border-neutral-700">
                <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:hover:text-neutral-200 dark:hover:border-neutral-500'
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
                {activeTab === 'appSettings' && <SettingsTab />}
                {activeTab === 'toolCustomization' && <ToolCustomizationTab />}
            </div>
        </div>
    );
};

export default AdminDashboard;