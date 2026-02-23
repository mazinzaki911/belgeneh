import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, UserStatus, AuthState, AuthActions, CalculatorType } from '../types';
import { supabase } from '../lib/supabase';
import { userProfileAPI } from '../lib/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const AuthContext = createContext<(AuthState & AuthActions) | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
    const verifyOtpPromiseRef = useRef<Promise<void> | null>(null);

    // Initialize Google Auth on mobile platforms
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            console.log('[GoogleAuth] Initializing for native platform...');
            GoogleAuth.initialize({
                clientId: '939947634439-ej4d6pb6vctqujssocf4bkddu742clqu.apps.googleusercontent.com',
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
            }).then(() => {
                console.log('[GoogleAuth] ✅ Initialization successful');
            }).catch(error => {
                console.error('[GoogleAuth] ❌ Initialization failed:', error);
                console.error('[GoogleAuth] Error details:', JSON.stringify(error, null, 2));
            });
        } else {
            console.log('[GoogleAuth] Running on web platform - skipping native initialization');
        }
    }, []);

    // Initialize auth state and listen for changes
    useEffect(() => {
        setLoading(true);
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setIsPasswordRecovery(true);
                }
                if (session?.user && (session.user.email_confirmed_at || session.user.confirmed_at)) {
                    await loadUserProfile(session.user);
                } else {
                    setCurrentUser(null);
                }
                setLoading(false);
            }
        );

        // Handle branded email links with token_hash (e.g. belgeneh.com?token_hash=xxx&type=recovery)
        const params = new URLSearchParams(window.location.search);
        const tokenHash = params.get('token_hash');
        const type = params.get('type') as 'signup' | 'recovery' | 'email' | null;
        if (tokenHash && type) {
            // Set recovery flag early so App.tsx can show the reset screen
            // while verifyOtp runs in the background (user can start typing password)
            if (type === 'recovery') {
                setIsPasswordRecovery(true);
            }
            // Store the promise so handlePasswordRecovery can await it before calling updateUser
            verifyOtpPromiseRef.current = supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
                if (error) {
                    console.error('Token verification failed:', error.message);
                    if (type === 'recovery') {
                        setIsPasswordRecovery(false);
                    }
                }
                // Clean up URL params
                window.history.replaceState({}, '', window.location.pathname);
            });
        }

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Load user profile from database
    const loadUserProfile = async (supabaseUser: SupabaseUser) => {
        try {
            const profile = await userProfileAPI.get(supabaseUser.id);

            const user: User = {
                id: profile.id,
                name: profile.name,
                email: supabaseUser.email!,
                status: profile.status as UserStatus,
                joinDate: new Date(profile.created_at).toISOString().split('T')[0],
                usage: profile.usage || {},
                role: profile.role as 'admin' | 'user',
                profilePicture: profile.profile_picture || undefined,
            };

            setCurrentUser(user);
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load all users (for admin)
    useEffect(() => {
        if (currentUser?.role === 'admin') {
            loadAllUsers();
        }
    }, [currentUser?.role]);

    const loadAllUsers = async () => {
        try {
            const profiles = await userProfileAPI.getAll();

            // Get auth users to merge email information
            const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();

            const allUsers: User[] = profiles.map(profile => {
                const authUser = authUsers?.find(u => u.id === profile.id);
                return {
                    id: profile.id,
                    name: profile.name,
                    email: authUser?.email || '',
                    status: profile.status as UserStatus,
                    joinDate: new Date(profile.created_at).toISOString().split('T')[0],
                    usage: profile.usage || {},
                    role: profile.role as 'admin' | 'user',
                    profilePicture: profile.profile_picture || undefined,
                };
            });

            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const signUp = async (userData: Omit<User, 'id' | 'status' | 'joinDate' | 'usage' | 'role' | 'profilePicture'>): Promise<{ success: boolean; error?: string; emailVerificationRequired?: boolean }> => {
        try {
            if (!userData.password) {
                return { success: false, error: 'Password is required' };
            }

            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                    },
                    emailRedirectTo: `${window.location.origin}/`,
                },
            });

            if (error) {
                // Map common Supabase errors to translation keys
                if (error.message.includes('already registered')) {
                    return { success: false, error: 'login.errors.emailInUse' };
                }
                if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
                    return { success: false, error: 'login.errors.tooManyRequests', rawError: error.message };
                }
                if (error.message.includes('security purposes')) {
                    return { success: false, error: 'login.errors.rateLimited', rawError: error.message };
                }

                // For other errors, mark as raw error
                return { success: false, error: 'login.errors.generic', rawError: error.message };
            }

            if (data.user) {
                // When email confirmation is enabled, Supabase returns a fake success
                // for already-registered emails (to prevent email enumeration).
                // Detect this by checking if the identities array is empty.
                if (data.user.identities && data.user.identities.length === 0) {
                    return { success: false, error: 'login.errors.emailInUse' };
                }

                // Check if email confirmation is required
                // If session is null, email confirmation is required
                const emailVerificationRequired = !data.session;

                return {
                    success: true,
                    emailVerificationRequired
                };
            }

            return { success: false, error: 'Unknown error occurred' };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Check for specific error types
                if (error.message.includes('Email not confirmed') ||
                    error.message.includes('email_not_confirmed') ||
                    error.message.includes('not verified') ||
                    error.message.toLowerCase().includes('confirmation')) {
                    return { success: false, error: 'login.emailNotVerified' };
                }

                if (error.message.includes('Invalid login credentials') ||
                    error.message.includes('Invalid email or password')) {
                    return { success: false, error: 'login.errors.invalidCredentials' };
                }

                // Return the raw error for other cases
                return { success: false, error: 'login.errors.generic', rawError: error.message };
            }

            if (data.user) {
                // Check if email is verified (additional safety check)
                if (!data.user.email_confirmed_at && !data.user.confirmed_at) {
                    await supabase.auth.signOut();
                    return { success: false, error: 'login.emailNotVerified' };
                }

                // Check if user is suspended
                try {
                    const profile = await userProfileAPI.get(data.user.id);
                    if (profile.status === 'Suspended') {
                        await supabase.auth.signOut();
                        return { success: false, error: 'login.errors.suspendedAccount' };
                    }
                } catch (profileError) {
                    // Profile might not exist yet - log but don't fail login
                    console.error('Error loading profile:', profileError);
                }

                return { success: true };
            }

            return { success: false, error: 'login.errors.invalidCredentials' };
        } catch (error: any) {
            return { success: false, error: 'login.errors.generic', rawError: error.message };
        }
    };

    const logout = async () => {
        // Clear local state FIRST — don't wait for network
        setCurrentUser(null);
        try {
            // Try server-side sign out with 5s timeout
            // If network hangs (common on mobile), local state is already cleared
            await Promise.race([
                supabase.auth.signOut(),
                new Promise(resolve => setTimeout(resolve, 5000)),
            ]);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('[GoogleAuth] Starting sign-in process...');
            console.log('[GoogleAuth] Platform:', Capacitor.getPlatform());
            console.log('[GoogleAuth] Is Native:', Capacitor.isNativePlatform());

            // Use native Google Sign-In on mobile platforms
            if (Capacitor.isNativePlatform()) {
                try {
                    console.log('[GoogleAuth] 🔄 Initiating native Google Sign-In...');

                    // Sign in with Google
                    const googleUser = await GoogleAuth.signIn();

                    console.log('[GoogleAuth] ✅ Google Sign-In completed');
                    console.log('[GoogleAuth] Google User data:', JSON.stringify(googleUser, null, 2));

                    if (!googleUser || !googleUser.authentication) {
                        console.error('[GoogleAuth] ❌ No authentication data received');
                        console.error('[GoogleAuth] googleUser object:', googleUser);
                        return { success: false, error: 'No authentication data received from Google. Please try again.' };
                    }

                    const idToken = googleUser.authentication.idToken;
                    const accessToken = googleUser.authentication.accessToken;

                    console.log('[GoogleAuth] ID Token:', idToken ? '✅ present' : '❌ missing');
                    console.log('[GoogleAuth] Access Token:', accessToken ? '✅ present' : '❌ missing');

                    if (!idToken) {
                        console.error('[GoogleAuth] ❌ No ID token received from Google');
                        return { success: false, error: 'Authentication failed: No ID token received. Please check your Google Cloud Console configuration.' };
                    }

                    // Sign in to Supabase using the ID token
                    console.log('[GoogleAuth] 🔄 Exchanging token with Supabase...');
                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: idToken,
                        access_token: accessToken,
                    });

                    console.log('[GoogleAuth] Supabase response:', {
                        success: !!data.user,
                        error: error?.message,
                        user: data.user?.email
                    });

                    if (error) {
                        console.error('[GoogleAuth] ❌ Supabase auth error:', error);
                        console.error('[GoogleAuth] Error details:', JSON.stringify(error, null, 2));
                        return { success: false, error: `Authentication failed: ${error.message}` };
                    }

                    if (data.user) {
                        console.log('[GoogleAuth] ✅ Successfully signed in:', data.user.email);
                        console.log('[GoogleAuth] User ID:', data.user.id);
                        return { success: true };
                    }

                    console.error('[GoogleAuth] ❌ Unknown error - no user data returned');
                    return { success: false, error: 'Authentication completed but no user data received. Please try again.' };
                } catch (error: any) {
                    console.error('[GoogleAuth] ❌ Native Google Sign-In error:', error);
                    console.error('[GoogleAuth] Error type:', error?.constructor?.name);
                    console.error('[GoogleAuth] Error message:', error?.message);
                    console.error('[GoogleAuth] Error code:', error?.code);
                    console.error('[GoogleAuth] Error stack:', error?.stack);
                    console.error('[GoogleAuth] Full error object:', JSON.stringify(error, null, 2));

                    // Show detailed error to user for debugging
                    const errorDetails = `
Error Message: ${error?.message || 'Unknown'}
Error Code: ${error?.code || 'N/A'}
Error Type: ${error?.constructor?.name || 'Unknown'}

Full Error: ${JSON.stringify(error, null, 2)}
                    `.trim();

                    console.error('[GoogleAuth] Error details for user:', errorDetails);

                    // Alert user with detailed error (only on mobile for debugging)
                    if (Capacitor.isNativePlatform()) {
                        alert(`Google Sign-In Error\n\n${errorDetails}`);
                    }

                    // Provide more specific error messages
                    let errorMessage = error.message || 'Failed to sign in with Google';
                    if (error?.code === '10' || errorMessage.includes('10')) {
                        errorMessage = `Error 10: Google Sign-In configuration error. SHA-1 fingerprint might not be registered in Google Cloud Console.\n\nCode: ${error?.code}\nMessage: ${error?.message}`;
                    } else if (errorMessage.includes('network')) {
                        errorMessage = 'Network error. Please check your internet connection and try again.';
                    } else if (errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
                        errorMessage = 'Sign-in was cancelled.';
                    } else {
                        // Include code in generic error
                        errorMessage = `${errorMessage}${error?.code ? ` (Code: ${error.code})` : ''}`;
                    }

                    return { success: false, error: errorMessage };
                }
            } else {
                // Use web OAuth flow for browsers
                console.log('Starting web OAuth flow...');
                console.log('Current URL:', window.location.href);
                console.log('Redirect URL will be:', `${window.location.origin}/`);

                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/`,
                        skipBrowserRedirect: false,
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'select_account',
                        },
                    },
                });

                console.log('OAuth response:', { data, error });

                if (error) {
                    console.error('OAuth error:', error);
                    return { success: false, error: error.message };
                }

                if (!data?.url) {
                    console.error('No redirect URL received from Supabase');
                    return { success: false, error: 'No redirect URL received from authentication provider' };
                }

                console.log('Redirecting to:', data.url);

                // The browser will redirect to Google OAuth page
                // After successful authentication, Google will redirect back to redirectTo URL
                window.location.href = data.url;

                // Return success - the actual authentication will happen after redirect
                return { success: true };
            }
        } catch (error: any) {
            console.error('Google Sign-In error:', error);
            return { success: false, error: error.message };
        }
    };

    const updateUser = async (updatedUser: User) => {
        try {
            // Update profile in database
            await userProfileAPI.update(updatedUser.id, {
                name: updatedUser.name,
                profile_picture: updatedUser.profilePicture,
                status: updatedUser.status,
                role: updatedUser.role,
            });

            // Update local state
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

            if (currentUser?.id === updatedUser.id) {
                setCurrentUser(updatedUser);
            }

            // Reload users list if admin
            if (currentUser?.role === 'admin') {
                await loadAllUsers();
            }
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };

    const deleteUser = async (userId: string) => {
        try {
            // Delete from auth (will cascade to profile via trigger)
            const { error } = await supabase.auth.admin.deleteUser(userId);

            if (error) throw error;

            setUsers(prev => prev.filter(u => u.id !== userId));

            // Reload users list if admin
            if (currentUser?.role === 'admin') {
                await loadAllUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    };

    const toggleUserStatus = async (userId: string) => {
        try {
            const user = users.find(u => u.id === userId);
            if (!user) return;

            const newStatus = user.status === UserStatus.Active ? UserStatus.Suspended : UserStatus.Active;

            await userProfileAPI.update(userId, {
                status: newStatus,
            });

            setUsers(prev => prev.map(u => {
                if (u.id === userId) {
                    return { ...u, status: newStatus };
                }
                return u;
            }));
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw error;
        }
    };

    const recordToolUsage = async (toolId: CalculatorType) => {
        if (!currentUser) return;

        try {
            await userProfileAPI.recordUsage(currentUser.id, toolId);

            const updatedUser = {
                ...currentUser,
                usage: {
                    ...currentUser.usage,
                    [toolId]: (currentUser.usage[toolId] || 0) + 1,
                },
            };

            setCurrentUser(updatedUser);
            setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        } catch (error) {
            console.error('Error recording tool usage:', error);
        }
    };

    const changePassword = async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // First verify the old password by attempting to sign in
            if (currentUser?.email) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: currentUser.email,
                    password: oldPass,
                });

                if (signInError) {
                    return { success: false, error: 'profilePage.toast.password.incorrect' };
                }
            }

            // Update password
            const { error } = await supabase.auth.updateUser({
                password: newPass,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteOwnAccount = async (userId: string, password?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            if (!currentUser?.email || !password) {
                return { success: false, error: 'profilePage.toast.password.incorrect' };
            }

            // Verify password first
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: currentUser.email,
                password: password,
            });

            if (signInError) {
                return { success: false, error: 'profilePage.toast.password.incorrect' };
            }

            // Delete user account (this will cascade to profile and all related data)
            const { error } = await supabase.auth.admin.deleteUser(userId);

            if (error) throw error;

            await logout();
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/`,
            });

            if (error) {
                if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
                    return { success: false, error: 'login.errors.tooManyRequests' };
                }
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/`,
                },
            });

            if (error) {
                if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
                    return { success: false, error: 'login.errors.tooManyRequests' };
                }
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const clearPasswordRecovery = () => {
        setIsPasswordRecovery(false);
    };

    const handlePasswordRecovery = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Wait for token verification to complete first (user may submit before verifyOtp resolves)
            if (verifyOtpPromiseRef.current) {
                await verifyOtpPromiseRef.current;
                verifyOtpPromiseRef.current = null;
            }

            // Verify we have a valid session before attempting password update
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return { success: false, error: 'login.errors.recoveryLinkExpired' };
            }

            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            // Don't clear isPasswordRecovery here — let the UI show the success message first.
            // The caller should invoke clearPasswordRecovery() when the user dismisses the screen.
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const value: AuthState & AuthActions = {
        currentUser,
        users,
        userToEdit,
        userToDelete,
        signUp,
        login,
        logout,
        signInWithGoogle,
        updateUser,
        deleteUser,
        toggleUserStatus,
        setUserToEdit,
        setUserToDelete,
        recordToolUsage,
        changePassword,
        deleteOwnAccount,
        forgotPassword,
        resendVerificationEmail,
        isPasswordRecovery,
        handlePasswordRecovery,
        clearPasswordRecovery,
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Loading...
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};
