
import React, { useState } from 'react';
import { AppLogoIcon, AtSymbolIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import GoogleSignInButton from './GoogleSignInButton';

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
    console.log('🟠 [Login] Component rendering...');

    const { t } = useTranslation();
    const { login, signUp } = useAuth();
    const showToast = useToast();
    const [isLoginView, setIsLoginView] = useState(true);

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Sign up state
    const [signUpName, setSignUpName] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const result = await login(loginEmail, loginPassword);
        if (!result.success) {
            setError(t(result.error || 'login.errors.generic'));
            setIsLoading(false);
        }
    };
    
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        console.log('🟡 [SignUp] Starting signup process...');
        const result = await signUp({ name: signUpName, email: signUpEmail, password: signUpPassword });
        console.log('🟡 [SignUp] Result:', result);

        if (result.success) {
            console.log('🟢 [SignUp] Signup successful!');
            if (result.emailVerificationRequired) {
                console.log('🟢 [SignUp] Email verification required - showing success message');
                // Show success message and inform user to check email
                showToast(t('login.verificationEmailSent'), 'success');
                setIsLoading(false);
                // Clear form
                setSignUpName('');
                setSignUpEmail('');
                setSignUpPassword('');
                // Show message in UI
                setError('');
            } else {
                console.log('🟢 [SignUp] No email verification needed - attempting auto-login');
                // Email verification not required, try to login
                const loginResult = await login(signUpEmail, signUpPassword);
                if (!loginResult.success) {
                    setError(t(loginResult.error || 'login.errors.generic'));
                    setIsLoading(false);
                }
            }
        } else {
            console.error('🔴 [SignUp] Signup failed:', result.error);
            // If rawError exists, show it directly; otherwise translate the error key
            const errorMessage = result.rawError || t(result.error || 'login.errors.generic');
            console.log('🔴 [SignUp] Error message:', errorMessage);
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setShowPassword(false);
    };

    return (
        <div className="flex justify-center items-start sm:items-center min-h-screen bg-neutral-100 dark:bg-neutral-950 p-4 py-12 sm:py-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-8">
                    <div className="text-center">
                        <AppLogoIcon className="w-full h-auto max-w-[240px] mx-auto" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mt-4">
                            {isLoginView ? t('login.title') : t('login.signUpTitle')}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                             {isLoginView ? t('login.subtitle') : t('login.signUpSubtitle')}
                        </p>
                    </div>

                    {isLoginView ? (
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
                            
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? t('login.loading') : t('login.loginButton')}
                            </button>
                        </form>
                    ) : (
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

                             {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? t('login.signingUp') : t('login.signUpButton')}
                            </button>
                        </form>
                    )}

                    <GoogleSignInButton disabled={isLoading} />

                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                        {isLoginView ? t('login.noAccount') : t('login.hasAccount')}{' '}
                        <button onClick={toggleView} className="font-semibold text-primary dark:text-primary-dark hover:underline focus:outline-none">
                             {isLoginView ? t('login.signUpLink') : t('login.loginLink')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;