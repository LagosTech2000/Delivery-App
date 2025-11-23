
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Package, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-primary-600 p-1.5 rounded-lg">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                DeliveryApp
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                                    Dashboard
                                </Link>
                                <Link to="/requests" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">
                                    Requests
                                </Link>
                                <div className="h-6 w-px bg-slate-200 mx-2" />
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-slate-700">
                                        {user.name}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600">
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost">Log in</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Sign up</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-500 hover:text-slate-700 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 animate-slide-up">
                    <div className="px-4 pt-2 pb-4 space-y-2">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/requests"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Requests
                                </Link>
                                <div className="border-t border-slate-100 my-2" />
                                <div className="px-3 py-2 flex items-center justify-between">
                                    <span className="font-medium text-slate-700">{user.name}</span>
                                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600">
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-2 mt-4">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-center">Log in</Button>
                                </Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full justify-center">Sign up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
