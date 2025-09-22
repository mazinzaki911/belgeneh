import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { useToast } from '../src/contexts/ToastContext';
import TextInput from './shared/TextInput';
import SelectInput from './shared/SelectInput';
import { useTranslation } from '../src/contexts/LanguageContext';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose }) => {
    const { t } = useTranslation();
    const { updateUser } = useAuth();
    const showToast = useToast();
    const [name, setName] = useState(user.name);
    const [role, setRole] = useState<'admin' | 'user'>(user.role);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            updateUser({ ...user, name: name.trim(), role });
            showToast(t('editUserModal.toast.success'), 'success');
            onClose();
        } else {
            showToast(t('editUserModal.toast.error'), 'error');
        }
    };
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('editUserModal.title')}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('editUserModal.description', { email: user.email })}</p>
                        <div className="mt-6 space-y-4">
                            <TextInput 
                                label={t('editUserModal.nameLabel')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                            <SelectInput
                                label={t('editUserModal.roleLabel')}
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                            >
                                <option value="user">{t('editUserModal.roleUser')}</option>
                                <option value="admin">{t('editUserModal.roleAdmin')}</option>
                            </SelectInput>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold ring-1 ring-inset ring-slate-300 dark:ring-slate-600"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;