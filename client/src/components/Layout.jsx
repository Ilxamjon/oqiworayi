import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, UserPlus, CreditCard, CalendarCheck, Home, BookOpen, LogOut, LogIn, LayoutDashboard, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

const Layout = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="bg-indigo-600 rounded-lg p-1.5 transition-transform group-hover:scale-110">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
                                O'quv Markazi
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-1">
                            <NavLink to="/" icon={<Home size={18} />} label="Bosh Sahifa" active={location.pathname === '/'} />

                            {!user && (
                                <NavLink to="/register" icon={<UserPlus size={18} />} label="Ro'yxatdan O'tish" active={location.pathname === '/register'} />
                            )}

                            {user && (
                                <NavLink to="/payment" icon={<CreditCard size={18} />} label="To'lov" active={location.pathname === '/payment'} />
                            )}

                            <NavLink to="/courses" icon={<BookOpen size={18} />} label="Kurslar" active={location.pathname === '/courses'} />

                            {/* Role based links */}
                            {user && user.role === 'admin' && (
                                <NavLink to="/admin" icon={<LayoutDashboard size={18} />} label="Admin Panel" active={location.pathname === '/admin'} />
                            )}

                            {user && (user.role === 'teacher' || user.role === 'admin') && (
                                <>
                                    <NavLink to="/teacher" icon={<LayoutDashboard size={18} />} label="O'qituvchi Paneli" active={location.pathname === '/teacher'} />
                                    <NavLink to="/attendance" icon={<CalendarCheck size={18} />} label="Davomat" active={location.pathname === '/attendance'} />
                                </>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <Link to="/profile">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                        >
                                            <User size={16} className="mr-2" /> Profil
                                        </Button>
                                    </Link>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {user.fullName}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <LogOut size={16} className="mr-2" /> Chiqish
                                    </Button>
                                </div>
                            ) : (
                                <Link to="/login">
                                    <Button size="sm" variant="primary">
                                        <LogIn size={16} className="mr-2" /> Kirish
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow pt-24 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} O'quv Markazi. Barcha huquqlar himoyalangan.
                </div>
            </footer>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            active
                ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
        )}
    >
        {icon}
        <span className="hidden lg:inline">{label}</span>
    </Link>
);

export default Layout;
