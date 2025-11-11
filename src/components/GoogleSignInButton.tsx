import React, { useState } from 'react';
import { GoogleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from '../contexts/LanguageContext';

interface GoogleSignInButtonProps {
    disabled?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ disabled = false }) => {
    // Log at the very start of render
    console.log('🟣 [GoogleSignInButton] Component RENDERING, disabled:', disabled);

    const { t } = useTranslation();
    const { signInWithGoogle } = useAuth();
    const showToast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Log component mount
    React.useEffect(() => {
        console.log('🔵 [GoogleSignInButton] Component MOUNTED, disabled:', disabled);
    }, [disabled]);

    const handleClick = async () => {
        console.log('🟢 [GoogleSignInButton] ===== BUTTON CLICKED =====');
        console.log('🟢 [GoogleSignInButton] Disabled:', disabled, 'isLoading:', isLoading);

        // Add a visible alert for debugging
        console.log('🟢 [GoogleSignInButton] About to show alert...');
        alert('Google Sign-In button clicked! Check console for details.');

        try {
            setIsLoading(true);
            console.log('🟢 [GoogleSignInButton] Loading state set to true');
            console.log('🟢 [GoogleSignInButton] Calling signInWithGoogle function...');

            const result = await signInWithGoogle();

            console.log('🟢 [GoogleSignInButton] OAuth result received:', JSON.stringify(result));

            if (!result.success) {
                console.error('🔴 [GoogleSignInButton] OAuth failed:', result.error);
                const errorMessage = result.error || t('login.errors.google');
                showToast(errorMessage, 'error');
                setIsLoading(false);
            } else {
                console.log('🟢 [GoogleSignInButton] OAuth initiated successfully, should redirect soon...');
            }
            // If successful, user will be redirected, so no need to setIsLoading(false)
        } catch (err) {
            console.error('🔴 [GoogleSignInButton] Exception caught:', err);
            console.error('🔴 [GoogleSignInButton] Error stack:', (err as Error)?.stack);
            showToast(t('login.errors.google'), 'error');
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300 dark:border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-500">
                        {t('login.orContinueWith')}
                    </span>
                </div>
            </div>

            {/* Google Sign-In Button */}
            <button
                onClick={handleClick}
                disabled={disabled || isLoading}
                type="button"
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm text-md font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
                        <span>{t('login.loading')}</span>
                    </>
                ) : (
                    <>
                        <GoogleIcon className="w-6 h-6" />
                        <span>{t('login.googleButton')}</span>
                    </>
                )}
            </button>
        </>
    );
};

export default GoogleSignInButton;
