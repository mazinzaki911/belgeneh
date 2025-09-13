import React, { useState } from 'react';
import { SavedUnit, UnitStatus, NotificationType } from '../types';
import { getUnitStatusConfig } from '../constants';
import SelectInput from './shared/SelectInput';
import DateInput from './shared/DateInput';
import TextAreaInput from './shared/TextAreaInput';
import { useTranslation } from '../src/contexts/LanguageContext';
import { useNotification } from '../src/contexts/NotificationContext';
import { useData } from '../src/contexts/DataContext';
import { useAuth } from '../src/contexts/AuthContext';

const Modal: React.FC<{title: string, onClose: () => void, children: React.ReactNode}> = ({title, onClose, children}) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h3>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

interface EditDealModalProps {
  unit: SavedUnit;
  onClose: () => void;
}

const EditDealModal: React.FC<EditDealModalProps> = ({ unit, onClose }) => {
    const { t } = useTranslation();
    const { handleSaveUnit } = useData();
    const { addNotification } = useNotification();
    const { currentUser } = useAuth();
    
    const UNIT_STATUS_CONFIG = getUnitStatusConfig(t);
    const [status, setStatus] = useState<UnitStatus>(unit.status);
    const [dealDate, setDealDate] = useState(unit.dealDate || '');
    const [notes, setNotes] = useState(unit.notes || '');

    const handleSave = () => {
        const updatedUnit = { ...unit, status, dealDate, notes };
        handleSaveUnit(updatedUnit);

        // Send notification if status changed
        if (unit.status !== status && currentUser) {
            const oldStatusText = UNIT_STATUS_CONFIG[unit.status]?.text || unit.status;
            const newStatusText = UNIT_STATUS_CONFIG[status]?.text || status;
            addNotification({
                title: t('notifications.unitUpdate.title', { unitName: unit.name }),
                message: t('notifications.unitUpdate.message', { oldStatus: oldStatusText, newStatus: newStatusText }),
                type: NotificationType.UnitUpdate,
                userId: currentUser.id,
                relatedUnitId: unit.id,
            });
        }
        onClose();
    };

    return (
        <Modal title={t('editDealModal.title', { unitName: unit.name })} onClose={onClose}>
            <div className="space-y-6">
                <SelectInput
                    label={t('editDealModal.unitStatusLabel')}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UnitStatus)}
                    tooltip={t('editDealModal.unitStatusTooltip')}
                >
                    {Object.entries(UNIT_STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.text}</option>
                    ))}
                </SelectInput>
                
                <DateInput
                    label={t('editDealModal.importantDateLabel')}
                    value={dealDate}
                    onChange={(e) => setDealDate(e.target.value)}
                    tooltip={t('editDealModal.importantDateTooltip')}
                />

                <TextAreaInput
                    label={t('editDealModal.notesLabel')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('editDealModal.notesPlaceholder')}
                    tooltip={t('editDealModal.notesTooltip')}
                />
            </div>
            <div className="mt-8 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 font-semibold">
                    {t('common.cancel')}
                </button>
                <button onClick={handleSave} className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold">
                    {t('editDealModal.saveChanges')}
                </button>
            </div>
        </Modal>
    );
};

export default EditDealModal;