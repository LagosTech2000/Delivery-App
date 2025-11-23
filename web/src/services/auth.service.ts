import { api } from './api';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<any>('/auth/login', credentials);
        console.log('Login response:', response.data);
        return response.data.data || response.data;
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await api.post<any>('/auth/register', credentials);
        console.log('Register response:', response.data);
        // Handle both { data: response } and direct response
        return response.data.data || response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    async getCurrentUser(): Promise<User> {
        const { data } = await api.get<{ data: { user: User } }>('/auth/me');
        return data.data.user;
    },
};
