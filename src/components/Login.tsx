import React, { useState } from 'react';
import { AppLogoIcon, AtSymbolIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface InputFieldProps {
    id: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ id, type, value, onChange, placeholder, icon, children }) => {
    const hasEndIcon = React.Children.count(children) > 0;
    const inputPaddingClass = hasEndIcon ? 'ps-10 pe-10' : 'ps-10 pe-4';

    return (
      <div className="relative">
        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-neutral-400">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required
          className={`w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg outline-none transition-colors duration-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark focus:border-transparent ${inputPaddingClass} py-3`}
          placeholder={placeholder}
        />
        {children}
      </div>
    );
};

const Login: React.FC = () => {
    const { t } = useTranslation();
    const { login, signUp, signInWithGoogle } = useAuth();
    const showToast = useToast();
    const [isLoginView, setIsLoginView] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Sign up state
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');

    // Success state for signup
    const [signupSuccess, setSignupSuccess] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(loginEmail, loginPassword);

        if (!result.success) {
            // Show translated error or raw error if available
            const errorMessage = (result as any).rawError || t(result.error || 'login.errors.generic');
            setError(errorMessage);
            setIsLoading(false);
        }
        // If success, the auth state change will handle navigation
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSignupSuccess(false);

        const result = await signUp({
            name: signUpName,
            email: signUpEmail,
            password: signUpPassword
        });

        setIsLoading(false);

        if (result.success) {
            // Clear form
            setSignUpName('');
            setSignUpEmail('');
            setSignUpPassword('');
            setError('');

            if (result.emailVerificationRequired) {
                // Show success state - email verification needed
                setSignupSuccess(true);
                showToast(t('login.verificationEmailSent'), 'success');
            } else {
                // No email verification needed - user will be auto-logged in
                showToast(t('login.signUpSuccess'), 'success');
            }
        } else {
            // Show error
            const errorMessage = result.rawError || t(result.error || 'login.errors.generic');
            setError(errorMessage);
            setSignupSuccess(false);
        }
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setShowPassword(false);
        setSignupSuccess(false);
    };

    const switchToLogin = () => {
        setIsLoginView(true);
        setError('');
        setShowPassword(false);
        setSignupSuccess(false);
    };

    return (
        <div className="flex justify-center items-start sm:items-center min-h-screen bg-neutral-100 dark:bg-neutral-950 p-4 py-12 sm:py-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <AppLogoIcon className="w-full h-auto max-w-[240px] mx-auto" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mt-4">
                            {isLoginView ? t('login.title') : t('login.signUpTitle')}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                             {isLoginView ? t('login.subtitle') : t('login.signUpSubtitle')}
                        </p>
                    </div>

                    {/* Success Message After Signup */}
                    {signupSuccess && !isLoginView && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div className="mr-3">
                                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                                        {t('login.accountCreated') || 'تم إنشاء الحساب بنجاح!'}
                                    </h3>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                        {t('login.checkEmailMessage') || 'يرجى التحقق من بريدك الإلكتروني والنقر على رابط التفعيل لتتمكن من تسجيل الدخول.'}
                                    </p>
                                    <button
                                        onClick={switchToLogin}
                                        className="mt-3 text-sm font-semibold text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
                                    >
                                        {t('login.goToLogin') || 'انتقل إلى تسجيل الدخول'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Forms */}
                    {isLoginView ? (
                        // LOGIN FORM
                        <form onSubmit={handleLogin} className="space-y-6">
                            <InputField
                                id="login-email"
                                type="email"
                                placeholder={t('login.emailPlaceholder')}
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                icon={<AtSymbolIcon className="w-5 h-5" />}
                            />
                            <InputField
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('login.passwordPlaceholder')}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                icon={<LockClosedIcon className="w-5 h-5" />}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400 hover:text-neutral-600"
                                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </InputField>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <p className="text-red-700 dark:text-red-300 text-sm text-center">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? t('login.loading') : t('login.loginButton')}
                            </button>
                        </form>
                    ) : (
                        // SIGNUP FORM
                        !signupSuccess && (
                            <form onSubmit={handleSignUp} className="space-y-6">
                                <InputField
                                    id="signup-name"
                                    type="text"
                                    placeholder={t('login.namePlaceholder')}
                                    value={signUpName}
                                    onChange={(e) => setSignUpName(e.target.value)}
                                    icon={<UserIcon className="w-5 h-5" />}
                                />
                                <InputField
                                    id="signup-email"
                                    type="email"
                                    placeholder={t('login.emailPlaceholder')}
                                    value={signUpEmail}
                                    onChange={(e) => setSignUpEmail(e.target.value)}
                                    icon={<AtSymbolIcon className="w-5 h-5" />}
                                />
                                <InputField
                                    id="signup-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t('login.passwordPlaceholder')}
                                    value={signUpPassword}
                                    onChange={(e) => setSignUpPassword(e.target.value)}
                                    icon={<LockClosedIcon className="w-5 h-5" />}
                                >
                                   <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400 hover:text-neutral-600"
                                        aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                                    >
                                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </InputField>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                        <p className="text-red-700 dark:text-red-300 text-sm text-center">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? t('login.signingUp') : t('login.signUpButton')}
                                </button>
                            </form>
                        )
                    )}

                    {/* Google Sign-In Button */}
                    {!signupSuccess && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                                        {t('login.orContinueWith')}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    setIsLoading(true);
                                    const result = await signInWithGoogle();
                                    if (!result.success) {
                                        setError(t('login.errors.google'));
                                        setIsLoading(false);
                                    }
                                    // If successful, the browser will redirect to Google
                                }}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                {t('login.googleButton')}
                            </button>
                        </>
                    )}

                    {/* Toggle Between Login/Signup */}
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
                        {isLoginView ? t('login.noAccount') : t('login.hasAccount')}{' '}
                        <button
                            onClick={toggleView}
                            className="font-semibold text-primary dark:text-primary-dark hover:underline focus:outline-none"
                        >
                             {isLoginView ? t('login.signUpLink') : t('login.loginLink')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
