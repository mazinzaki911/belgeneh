
import React, { useState, useMemo } from 'react';
import { User } from '../types';
// FIX: Corrected import path for constants.
import { UserCircleIcon, LockClosedIcon, PencilIcon, ClockIcon, WandSparklesIcon, TrashIcon } from '../constants';
import { useAuth } from '../src/contexts/AuthContext';
import { useToast } from '../src/contexts/ToastContext';
import { useTranslation } from '../src/contexts/LanguageContext';
import TextInput from './shared/TextInput';
import { getCalculators } from '../constants';
// FIX: Import 'useAppSettings' to access application settings.
import { useAppSettings } from '../src/contexts/AppSettingsContext';

interface ProfilePageProps {
  currentUser: User | null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser }) => {
  const { t, language } = useTranslation();
  const { updateUser, changePassword } = useAuth();
  const showToast = useToast();
  // FIX: Import and use appSettings for getCalculators
  const appSettings = useAppSettings();
  
  // State for editing profile info
  const [name, setName] = useState(currentUser?.name || '');
  const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || '');

  // State for changing password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!currentUser) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 512;
            const MAX_HEIGHT = 512;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL(file.type);
                setProfilePicture(dataUrl);
            }
        };
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = () => {
    if (!currentUser) return;
    setProfilePicture('');
    updateUser({ ...currentUser, profilePicture: '' });
    showToast(t('profilePage.toast.pictureRemoved'), 'success');
  };

  const handleSaveInfo = () => {
    if (name.trim()) {
      updateUser({ ...currentUser, name: name.trim(), profilePicture });
      showToast(t('profilePage.toast.success'), 'success');
    } else {
      showToast(t('profilePage.toast.error'), 'error');
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
          showToast(t('profilePage.toast.password.mismatch'), 'error');
          return;
      }
      if (newPassword.length < 1) {
          showToast(t('profilePage.toast.password.tooShort'), 'error');
          return;
      }
      const result = await changePassword(currentUser.id, currentPassword, newPassword);
      if (result.success) {
          showToast(t('profilePage.toast.password.success'), 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
      } else {
          showToast(t(result.error!), 'error');
      }
  };
  
  // FIX: Add explicit types to the reduce function's parameters to resolve arithmetic operation errors on 'unknown' types.
  const totalUsage = Object.values(currentUser.usage || {}).reduce((sum: number, count: number) => sum + count, 0);
  const mostUsedTool = useMemo(() => {
    if (!currentUser.usage || Object.keys(currentUser.usage).length === 0) return null;
    const calculators = getCalculators(t, language, appSettings);
    // FIX: Add explicit types to sort function parameters to resolve arithmetic operation errors.
    const mostUsedId = Object.entries(currentUser.usage).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0][0];
    return calculators.find(c => c.id === mostUsedId)?.name || mostUsedId;
  }, [currentUser.usage, t, language, appSettings]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative group">
            {profilePicture ? (
                <img src={profilePicture} alt={currentUser.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"/>
            ) : (
                <UserCircleIcon className="w-24 h-24 text-neutral-400 dark:text-neutral-500" />
            )}
             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center gap-2 rounded-full transition-opacity duration-300">
                <label htmlFor="profile-picture-upload" className="cursor-pointer p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" title={t('profilePage.editInfo.changePicture')}>
                    <PencilIcon className="w-7 h-7 text-white" />
                </label>
                {profilePicture && (
                    <button
                        onClick={handleRemovePicture}
                        className="cursor-pointer p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        aria-label={t('profilePage.removePicture')}
                        title={t('profilePage.removePicture')}
                    >
                        <TrashIcon className="w-7 h-7 text-white" />
                    </button>
                )}
            </div>
            <input id="profile-picture-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{currentUser.name}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">{currentUser.email}</p>
        </div>
        <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('profilePage.activity.joinDate')}</p>
            <p className="font-semibold text-neutral-700 dark:text-neutral-200">{new Date(currentUser.joinDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6 flex items-center gap-4">
              <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-lg">
                  <ClockIcon className="w-8 h-8 text-primary dark:text-primary-dark" />
              </div>
              <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">{t('profilePage.activity.totalUsage')}</p>
                  <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{totalUsage}</p>
              </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6 flex items-center gap-4">
               <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-lg">
                  <WandSparklesIcon className="w-8 h-8 text-primary dark:text-primary-dark" />
              </div>
              <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">{t('profilePage.activity.mostUsed')}</p>
                  <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{mostUsedTool || t('common.notApplicable')}</p>
              </div>
          </div>
      </div>
      
      {/* Edit Info */}
       <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('profilePage.editInfo.title')}</h2>
          <div className="space-y-4">
              <TextInput label={t('profilePage.editInfo.nameLabel')} value={name} onChange={e => setName(e.target.value)} />
              <TextInput label={t('profilePage.editInfo.emailLabel')} value={currentUser.email} onChange={() => {}} />
          </div>
          <div className="mt-6 flex justify-end">
              <button onClick={handleSaveInfo} className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">{t('common.save')}</button>
          </div>
      </div>

       {/* Change Password */}
       <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-3 sm:p-6">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">{t('profilePage.security.title')}</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
              <TextInput label={t('profilePage.security.currentPassword')} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              <TextInput label={t('profilePage.security.newPassword')} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <TextInput label={t('profilePage.security.confirmPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              <div className="mt-6 flex justify-end">
                 <button type="submit" className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">{t('profilePage.security.changePasswordButton')}</button>
              </div>
          </form>
      </div>

    </div>
  );
};
