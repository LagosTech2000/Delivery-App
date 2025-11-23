import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const user = await authService.getCurrentUser();
                    setUser(user);
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const response = await authService.login(credentials);
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.user);
    };

    const register = async (credentials: RegisterCredentials) => {
        const response = await authService.register(credentials);
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.user);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
