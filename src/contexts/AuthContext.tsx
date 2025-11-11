import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserStatus, AuthState, AuthActions, CalculatorType } from '../types';
import { supabase } from '../lib/supabase';
import { userProfileAPI } from '../lib/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const AuthContext = createContext<(AuthState & AuthActions) | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state and listen for changes
    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadUserProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadUserProfile(session.user);
            } else {
                setCurrentUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
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
                return { success: false, error: 'login.errors.invalidCredentials' };
            }

            if (data.user) {
                // Check if user is suspended
                const profile = await userProfileAPI.get(data.user.id);
                if (profile.status === 'Suspended') {
                    await supabase.auth.signOut();
                    return { success: false, error: 'login.errors.suspendedAccount' };
                }

                return { success: true };
            }

            return { success: false, error: 'login.errors.invalidCredentials' };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setCurrentUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                    skipBrowserRedirect: false,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                return { success: false, error: error.message };
            }

            // Force redirect if browser didn't do it automatically
            if (data?.url) {
                window.location.href = data.url;
            }

            return { success: true };
        } catch (error: any) {
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
