export interface User {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'agent' | 'admin';
    phone?: string;
    email_verified: boolean;
    is_online?: boolean;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: 'customer' | 'agent';
}
