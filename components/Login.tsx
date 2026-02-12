import React, { useState, useEffect } from 'react';
import { LoginScreen } from './LoginScreen';
import { SignUpScreen } from './SignUpScreen';
import { EmailVerificationScreen } from './auth/EmailVerificationScreen';
import { ForgotPasswordScreen } from './auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './auth/ResetPasswordScreen';
import { useAuth } from '../src/contexts/AuthContext';

type AuthView = 'login' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password';

const Login: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const { isPasswordRecovery } = useAuth();

  // When Supabase fires PASSWORD_RECOVERY event (user clicked reset link in email),
  // automatically show the reset password form
  useEffect(() => {
    if (isPasswordRecovery) {
      setView('reset-password');
    }
  }, [isPasswordRecovery]);

  const handleShowLogin = () => setView('login');
  const handleShowSignUp = () => setView('signup');
  const handleSignUpSuccess = () => setView('verify-email');
  const handleForgotPassword = () => setView('forgot-password');

  switch (view) {
    case 'signup':
      return <SignUpScreen onLoginClick={handleShowLogin} onSignUpSuccess={handleSignUpSuccess} />;
    case 'verify-email':
      return <EmailVerificationScreen />;
    case 'forgot-password':
      return <ForgotPasswordScreen onBackToLogin={handleShowLogin} />;
    case 'reset-password':
      return <ResetPasswordScreen onPasswordReset={handleShowLogin} />;
    case 'login':
    default:
      return <LoginScreen onSignUpClick={handleShowSignUp} onForgotPasswordClick={handleForgotPassword} />;
  }
};

export default Login;
