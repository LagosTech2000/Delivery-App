
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import type { RegisterCredentials } from '../types/auth';
import { Package } from 'lucide-react';

export const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<any>();

    const onSubmit = async (data: any) => {
        try {
            // Combine country code and phone number if both provided
            const submitData: RegisterCredentials = {
                email: data.email,
                password: data.password,
                name: data.name,
                role: data.role,
                phone: data.phoneNumber ? `${data.countryCode || '+1'}${data.phoneNumber}` : undefined
            };

            await registerUser(submitData);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Registration failed', error);

            // Handle validation errors from backend
            if (error.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                backendErrors.forEach((err: { field: string; message: string }) => {
                    if (err.field === 'email' || err.field === 'password' || err.field === 'name' || err.field === 'phone') {
                        setError(err.field as any, { message: err.message });
                    }
                });
                setError('root', {
                    message: error.response.data.error || 'Please fix the errors above',
                });
            } else {
                setError('root', {
                    message: error.response?.data?.error || error.message || 'Registration failed. Please try again.',
                });
            }
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="bg-primary-100 p-3 rounded-2xl">
                            <Package className="h-10 w-10 text-primary-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
                    <p className="text-slate-500">Join our platform to start shipping</p>
                </div>

                <Card className="border-slate-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-center">Sign Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                {...register('name', { required: 'Name is required' })}
                                error={errors.name?.message}
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="name@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                error={errors.email?.message}
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">Phone (optional)</label>
                                <div className="flex gap-2">
                                    <select
                                        {...register('countryCode')}
                                        defaultValue="+1"
                                        className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-900"
                                    >
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                        <option value="+504">🇭🇳 +504</option>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+86">🇨🇳 +86</option>
                                        <option value="+81">🇯🇵 +81</option>
                                        <option value="+49">🇩🇪 +49</option>
                                        <option value="+33">🇫🇷 +33</option>
                                        <option value="+39">🇮🇹 +39</option>
                                        <option value="+34">🇪🇸 +34</option>
                                        <option value="+52">🇲🇽 +52</option>
                                        <option value="+55">🇧🇷 +55</option>
                                        <option value="+61">🇦🇺 +61</option>
                                        <option value="+7">🇷🇺 +7</option>
                                        <option value="+82">🇰🇷 +82</option>
                                        <option value="+234">🇳🇬 +234</option>
                                    </select>
                                    <input
                                        type="tel"
                                        placeholder="1234567890"
                                        {...register('phoneNumber')}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-slate-400"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Digits only - no +, spaces, or dashes. Example: 2025551234
                                </p>
                                {errors.phone?.message && (
                                    <p className="text-sm text-red-600 ml-1">{errors.phone.message}</p>
                                )}
                            </div>

                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message: 'Password must contain uppercase, lowercase, and number'
                                        }
                                    })}
                                    error={errors.password?.message}
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Must be 8+ characters with uppercase, lowercase, and number
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 ml-1">I am a...</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            value="customer"
                                            className="peer sr-only"
                                            {...register('role', { required: 'Role is required' })}
                                            defaultChecked
                                        />
                                        <div className="rounded-xl border-2 border-slate-200 p-4 text-center hover:bg-slate-50 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 transition-all">
                                            Customer
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            value="agent"
                                            className="peer sr-only"
                                            {...register('role')}
                                        />
                                        <div className="rounded-xl border-2 border-slate-200 p-4 text-center hover:bg-slate-50 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 transition-all">
                                            Agent
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {errors.root && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                                    {errors.root.message}
                                </div>
                            )}

                            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
