import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserStatus, AuthState, AuthActions, CalculatorType } from '../../types';

const AuthContext = createContext<(AuthState & AuthActions) | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const item = window.localStorage.getItem('app_users');
            const parsedUsers = item ? JSON.parse(item) : [];
             if (parsedUsers.length === 0) {
                const adminUser: User = {
                    id: 'admin-001',
                    name: 'Said Fathy',
                    email: 'said@gmail.com',
                    password: '1',
                    status: UserStatus.Active,
                    joinDate: new Date().toISOString().split('T')[0],
                    usage: {},
                    role: 'admin',
                };
                return [adminUser];
            }
            // Ensure all users have a role and usage property for backward compatibility
            return parsedUsers.map((u: User) => ({ ...u, usage: u.usage || {}, role: u.role || 'user' }));
        } catch (error) { return []; }
    });
    
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const item = window.sessionStorage.getItem('currentUser');
            return item ? JSON.parse(item) : null;
        } catch (error) { return null; }
    });
    
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => { window.localStorage.setItem('app_users', JSON.stringify(users)); }, [users]);
    useEffect(() => {
        if (currentUser) {
            window.sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            window.sessionStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    const signUp = async (userData: Omit<User, 'id' | 'status' | 'joinDate' | 'usage' | 'role' | 'profilePicture'>): Promise<{ success: boolean; error?: string }> => {
        if (users.some(u => u.email === userData.email)) {
            return { success: false, error: 'login.errors.emailInUse' };
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...userData,
            status: UserStatus.Active,
            joinDate: new Date().toISOString().split('T')[0],
            usage: {},
            role: 'user',
            profilePicture: '',
        };
        setUsers(prev => [...prev, newUser]);
        return { success: true };
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const user = users.find(u => u.email === email);
        if (!user || user.password !== password) {
            return { success: false, error: 'login.errors.invalidCredentials' };
        }
        if (user.status === UserStatus.Suspended) {
            return { success: false, error: 'login.errors.suspendedAccount' };
        }
        setCurrentUser({ ...user, usage: user.usage || {}, role: user.role || 'user' });
        return { success: true };
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    };
    
    const deleteUser = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const toggleUserStatus = (userId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, status: u.status === UserStatus.Active ? UserStatus.Suspended : UserStatus.Active };
            }
            return u;
        }));
    };

    const recordToolUsage = (toolId: CalculatorType) => {
        if (!currentUser) return;

        const updatedUser = {
            ...currentUser,
            usage: {
                ...currentUser.usage,
                [toolId]: (currentUser.usage[toolId] || 0) + 1,
            },
        };

        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const changePassword = async (userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, error: 'profilePage.toast.password.userNotFound' };
        }
        
        const user = users[userIndex];
        if (user.password !== oldPass) {
            return { success: false, error: 'profilePage.toast.password.incorrect' };
        }

        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...user, password: newPass };
        setUsers(updatedUsers);

        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, password: newPass } : null);
        }
        
        return { success: true };
    };

    const deleteOwnAccount = async (userId: string, password?: string): Promise<{ success: boolean; error?: string }> => {
        const user = users.find(u => u.id === userId);
        if (!user) {
            return { success: false, error: 'profilePage.toast.delete.userNotFound' };
        }

        // For simplicity in this frontend-only auth, we check password.
        // In a real app, this might be handled by a re-authentication flow.
        if (user.password && user.password !== password) {
             return { success: false, error: 'profilePage.toast.password.incorrect' };
        }
        
        setUsers(prev => prev.filter(u => u.id !== userId));
        logout();
        return { success: true };
    };

    const value: AuthState & AuthActions = {
        currentUser, users, userToEdit, userToDelete,
        signUp, login, logout, updateUser, deleteUser,
        toggleUserStatus, setUserToEdit, setUserToDelete,
        recordToolUsage, changePassword, deleteOwnAccount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};