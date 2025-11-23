
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import type { LoginCredentials } from '../types/auth';
import { Package } from 'lucide-react';

export const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginCredentials>();

    const onSubmit = async (data: LoginCredentials) => {
        try {
            await login(data);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login failed', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid email or password';
            setError('root', {
                message: errorMessage,
            });
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="bg-primary-100 p-3 rounded-2xl">
                            <Package className="h-10 w-10 text-primary-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
                    <p className="text-slate-500">Sign in to your account to continue</p>
                </div>

                <Card className="border-slate-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-center">Sign In</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="name@example.com"
                                {...register('email', { required: 'Email is required' })}
                                error={errors.email?.message}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password', { required: 'Password is required' })}
                                error={errors.password?.message}
                            />

                            {errors.root && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                                    {errors.root.message}
                                </div>
                            )}

                            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                                Sign in
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
