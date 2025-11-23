import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                'rounded-2xl border border-slate-100 bg-white text-slate-950 shadow-sm hover:shadow-md transition-shadow duration-300',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
            {children}
        </div>
    );
};

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    return (
        <h3 className={cn('font-semibold leading-none tracking-tight text-lg', className)} {...props}>
            {children}
        </h3>
    );
};

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={cn('p-6 pt-0', className)} {...props}>
            {children}
        </div>
    );
};
