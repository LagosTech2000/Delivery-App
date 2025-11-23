import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="text-sm font-medium text-slate-700 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
                        error && 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-red-500 ml-1 animate-fade-in">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
