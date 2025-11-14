import React, { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { SignUpScreen } from './SignUpScreen';
import { EmailVerificationScreen } from './auth/EmailVerificationScreen';

type AuthView = 'login' | 'signup' | 'verify-email';

const Login: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  const handleShowLogin = () => setView('login');
  const handleShowSignUp = () => setView('signup');
  const handleSignUpSuccess = () => setView('verify-email');

  switch (view) {
    case 'signup':
      return <SignUpScreen onLoginClick={handleShowLogin} onSignUpSuccess={handleSignUpSuccess} />;
    case 'verify-email':
      return <EmailVerificationScreen />;
    case 'login':
    default:
      return <LoginScreen onSignUpClick={handleShowSignUp} />;
  }
};

export default Login;
