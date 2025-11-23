
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export const Layout = () => {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <Outlet />
            </main>
        </div>
    );
};
