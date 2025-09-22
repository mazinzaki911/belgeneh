import React, { useState, useMemo } from 'react';
import { User, CalculatorType } from '../types';
import { UserCircleIcon, LockClosedIcon, PencilIcon, UserIcon, AtSymbolIcon, ClockIcon, WandSparklesIcon } from '../constants';
import { useAuth } from '../src/contexts/AuthContext';
import { useToast } from '../src/contexts/ToastContext';
import { useTranslation } from '../src/contexts/LanguageContext';
import TextInput from './shared/TextInput';
import ConfirmationModal from './shared/ConfirmationModal';
import { getCalculators } from '../constants';

interface ProfilePageProps {
  currentUser: User | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser }) => {
  const { t, language } = useTranslation();
  const { updateUser, changePassword } = useAuth();
  const showToast = useToast();
  
  // State for editing profile info
  const [name, setName] = useState(currentUser?.name || '');
  const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || '');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  // State for changing password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!currentUser) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
  
  const totalUsage = Object.values(currentUser.usage || {}).reduce((sum, count) => sum + count, 0);
  const mostUsedTool = useMemo(() => {
    if (!currentUser.usage || Object.keys(currentUser.usage).length === 0) return null;
    const calculators = getCalculators(t, language);
    const mostUsedId = Object.entries(currentUser.usage).sort((a, b) => b[1] - a[1])[0][0];
    return calculators.find(c => c.id === mostUsedId)?.name || mostUsedId;
  }, [currentUser.usage, t, language]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
            {profilePicture ? (
                <img src={profilePicture} alt={currentUser.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"/>
            ) : (
                <UserCircleIcon className="w-24 h-24 text-neutral-400 dark:text-neutral-500" />
            )}
            <label htmlFor="profile-picture-upload" className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer transition-opacity">
                <PencilIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </label>
            <input id="profile-picture-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{currentUser.name}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">{currentUser.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Personal Info */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2"><UserIcon className="w-6 h-6 text-primary"/>{t('profilePage.personalInfo')}</h2>
              <div className="space-y-4">
                  <TextInput label={t('profilePage.nameLabel')} value={name} onChange={(e) => setName(e.target.value)} />
                  <div>
                      <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 block mb-2">{t('profilePage.emailLabel')}</label>
                      <div className="flex items-center gap-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                          <AtSymbolIcon className="w-5 h-5 text-neutral-400"/>
                          <span className="text-neutral-700 dark:text-neutral-200">{currentUser.email}</span>
                      </div>
                  </div>
              </div>
              <div className="mt-6 flex justify-end">
                  <button onClick={handleSaveInfo} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">{t('common.save')}</button>
              </div>
          </div>
        </div>

        <div className="space-y-8">
            {/* Security */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2"><LockClosedIcon className="w-6 h-6 text-primary"/>{t('profilePage.security.title')}</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="relative">
                        <TextInput label={t('profilePage.security.currentPassword')} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="relative">
                        <TextInput label={t('profilePage.security.newPassword')} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <TextInput label={t('profilePage.security.confirmPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

                    <div className="pt-2 flex justify-end">
                         <button type="submit" className="px-6 py-2.5 border border-primary text-primary font-semibold rounded-lg hover:bg-primary-light dark:hover:bg-primary/10 transition-colors">{t('profilePage.security.changePasswordButton')}</button>
                    </div>
                </form>
            </div>
            
             {/* Activity Summary */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6">
                 <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2"><WandSparklesIcon className="w-6 h-6 text-primary"/>{t('profilePage.activity.title')}</h2>
                 <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2"><ClockIcon className="w-4 h-4"/>{t('profilePage.activity.joinDate')}</span>
                         <span className="font-bold text-neutral-700 dark:text-neutral-200">{new Date(currentUser.joinDate).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2"><UserIcon className="w-4 h-4"/>{t('profilePage.activity.totalUsage')}</span>
                         <span className="font-bold text-neutral-700 dark:text-neutral-200">{totalUsage} {t('profilePage.activity.uses')}</span>
                     </div>
                      {mostUsedTool && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2"><WandSparklesIcon className="w-4 h-4"/>{t('profilePage.activity.mostUsed')}</span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-200">{mostUsedTool}</span>
                        </div>
                      )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
