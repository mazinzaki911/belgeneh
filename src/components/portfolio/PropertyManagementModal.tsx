import React, { useState, useMemo } from 'react';
import { PortfolioProperty, PropertyTask } from '../../types';
import { useData } from '../../src/contexts/DataContext';
import { useToast } from '../../src/contexts/ToastContext';
import { useTranslation } from '../../src/contexts/LanguageContext';
import TextInput from '../shared/TextInput';
import DateInput from '../shared/DateInput';
import TextAreaInput from '../shared/TextAreaInput';
import { TrashIcon, PlusCircleIcon } from '../../constants';

interface PropertyManagementModalProps {
    property: PortfolioProperty;
    onClose: () => void;
}

const PropertyManagementModal: React.FC<PropertyManagementModalProps> = ({ property, onClose }) => {
    const { t } = useTranslation();
    const { addOrUpdatePortfolioProperty } = useData();
    const showToast = useToast();

    const [tasks, setTasks] = useState<PropertyTask[]>(() => [...(property.tasks || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [newTaskNotes, setNewTaskNotes] = useState('');

    const handleAddTask = () => {
        if (!newTaskTitle.trim() || !newTaskDate.trim()) {
            showToast(t('common.saveError'), 'error');
            return;
        }
        const newTask: PropertyTask = {
            id: `task-${Date.now()}`,
            title: newTaskTitle.trim(),
            date: newTaskDate,
            notes: newTaskNotes.trim(),
            isCompleted: false,
        };
        setTasks(prev => [...prev, newTask].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setNewTaskTitle('');
        setNewTaskDate('');
        setNewTaskNotes('');
    };

    const handleToggleTask = (taskId: string) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
        ));
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    const handleSaveChanges = () => {
        const updatedProperty = { ...property, tasks };
        addOrUpdatePortfolioProperty(updatedProperty);
        showToast(t('common.save'), 'success');
        onClose();
    };

    const annualRent = property.monthlyRent * 12;
    const totalAnnualExpenses = property.annualOperatingExpenses + property.propertyTax + property.insurance;
    const noi = annualRent - totalAnnualExpenses;
    const formatNumber = (num: number) => num.toLocaleString('en-US', { maximumFractionDigits: 0 });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{t('propertyManagementModal.title', { propertyName: property.name })}</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar space-y-6">
                    {/* Financial Summary */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                        <h4 className="text-lg font-semibold text-primary dark:text-primary-dark mb-3">{t('propertyManagementModal.financialSummary')}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.purchasePrice')}</span><span className="font-bold">{formatNumber(property.purchasePrice)}</span></div>
                            <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.annualRent')}</span><span className="font-bold text-green-600 dark:text-green-400">+{formatNumber(annualRent)}</span></div>
                            <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.totalAnnualExpenses')}</span><span className="font-bold text-red-600 dark:text-red-400">-{formatNumber(totalAnnualExpenses)}</span></div>
                            <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">{t('portfolioManager.card.netAnnualIncome')}</span><span className="font-bold">{formatNumber(noi)}</span></div>
                        </div>
                    </div>
                    
                    {/* Tasks Section */}
                    <div>
                        <h4 className="text-lg font-semibold text-primary dark:text-primary-dark mb-3">{t('propertyManagementModal.tasksAndDates')}</h4>
                        <div className="p-4 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg space-y-4">
                            <h5 className="font-bold text-neutral-700 dark:text-neutral-200">{t('propertyManagementModal.addTask')}</h5>
                            <TextInput label={t('propertyManagementModal.taskTitleLabel')} value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder={t('propertyManagementModal.taskTitlePlaceholder')} />
                            <DateInput label={t('propertyManagementModal.dueDateLabel')} value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} />
                            <TextAreaInput label={t('propertyManagementModal.notesLabel')} value={newTaskNotes} onChange={e => setNewTaskNotes(e.target.value)} rows={2} placeholder={t('propertyManagementModal.notesPlaceholder')} />
                            <div className="flex justify-end">
                                <button onClick={handleAddTask} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/90">
                                    <PlusCircleIcon className="w-5 h-5" /> {t('propertyManagementModal.addButton')}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {tasks.length > 0 ? tasks.map(task => (
                                <div key={task.id} className={`p-3 rounded-lg flex items-start gap-3 transition-colors ${task.isCompleted ? 'bg-neutral-100 dark:bg-neutral-700/40 opacity-70' : 'bg-white dark:bg-neutral-700'}`}>
                                    <input type="checkbox" checked={task.isCompleted} onChange={() => handleToggleTask(task.id)} className="mt-1 form-checkbox h-5 w-5 text-primary rounded-md focus:ring-primary dark:bg-neutral-600 border-neutral-300 dark:border-neutral-500"/>
                                    <div className="flex-1">
                                        <p className={`font-semibold ${task.isCompleted ? 'line-through text-neutral-500' : 'text-neutral-800 dark:text-neutral-100'}`}>{task.title}</p>
                                        <p className={`text-sm ${task.isCompleted ? 'line-through text-neutral-400' : 'text-neutral-500 dark:text-neutral-300'}`}>{new Date(task.date).toLocaleDateString(t('language') === 'ar' ? 'ar-EG' : 'en-CA')}</p>
                                        {task.notes && <p className="text-xs mt-1 text-neutral-400 dark:text-neutral-400 whitespace-pre-wrap">{task.notes}</p>}
                                    </div>
                                    <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-neutral-400 hover:text-red-500 dark:hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            )) : <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 py-4">{t('propertyManagementModal.emptyState')}</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 font-semibold">
                        {t('common.cancel')}
                    </button>
                    <button type="button" onClick={handleSaveChanges} className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold">
                        {t('propertyManagementModal.saveButton')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyManagementModal;
