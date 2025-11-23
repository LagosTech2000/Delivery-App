import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md active:bg-primary-800',
            secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-sm hover:shadow-md active:bg-secondary-800',
            outline: 'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
            ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-4 py-2.5 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
