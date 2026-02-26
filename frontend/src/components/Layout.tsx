import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    LogOut,
    ClipboardList,
    Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../services/api';

interface LayoutProps {
    children: React.ReactNode;
}

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ClipboardList, label: 'Create Survey', path: '/create-survey' },
    { icon: FileText, label: 'Templates', path: '/templates' },
];

const adminItems = [
    { icon: Users, label: 'User Management', path: '/user-management' },
];

export default function Layout({ children }: LayoutProps) {
    const navigate = useNavigate();
    const role = localStorage.getItem('role') || 'user';
    const isAdmin = role === 'admin';

    const handleLogout = async () => {
        try {
            await auth.logout();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const displayItems = isAdmin ? [...sidebarItems, ...adminItems] : sidebarItems;

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-brand-blue/[0.03] rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute top-[40%] -right-[15%] w-[70%] h-[70%] bg-brand-cyan/[0.03] rounded-full blur-[180px] animate-pulse-slow" style={{ animationDelay: '-2s' }}></div>
            </div>

            {/* Sidebar */}
            <aside className="relative z-10 w-64 border-r border-slate-200 bg-white flex flex-col shadow-sm">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer group/logo" onClick={() => navigate('/dashboard')}>
                        <img
                            src="/brand/logo-full.png"
                            alt="Marketeers"
                            className="h-14 w-auto object-contain transition-transform duration-500 group-hover/logo:scale-105"
                        />
                    </div>

                    <nav className="space-y-3">
                        {displayItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group overflow-hidden
                                    ${isActive
                                        ? 'text-brand-blue font-black shadow-premium bg-white border-slate-100 border'
                                        : 'text-slate-400 font-bold hover:text-slate-900 hover:bg-slate-50 border border-transparent'}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-blue rounded-r-full"
                                                initial={{ x: -10 }}
                                                animate={{ x: 0 }}
                                            />
                                        )}
                                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        <span className="text-sm tracking-tight">{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-dot"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue"
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 text-slate-400 hover:text-brand-red transition-all w-full px-5 py-3 hover:bg-brand-red/5 rounded-2xl group border border-transparent hover:border-brand-red/10"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black uppercase tracking-widest text-[10px]">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <header className="sticky top-0 z-20 h-24 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-12 justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-inner-soft">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">System Online</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 text-right">
                            <div className="hidden sm:block">
                                <p className="text-sm font-black text-slate-900 leading-none mb-1">
                                    {isAdmin ? 'Administrator' : 'Client'} Access
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {isAdmin ? 'Master Node' : 'Service Interface'}
                                </p>
                            </div>
                            <div className="relative group">
                                <div className="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-display font-black text-lg shadow-xl shadow-brand-blue/20 group-hover:scale-105 transition-transform cursor-pointer border-2 border-white">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
