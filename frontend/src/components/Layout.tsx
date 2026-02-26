import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    LogOut,
    TrendingUp,
    MousePointer2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../services/api';

interface LayoutProps {
    children: React.ReactNode;
}

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: MousePointer2, label: 'Surveys', path: '/create-survey' },
];

export default function Layout({ children }: LayoutProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.logout();
            localStorage.removeItem('token');
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <div className="flex min-h-screen bg-brand-dark text-slate-800 overflow-hidden font-sans">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-blue/5 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-brand-glow/5 rounded-full blur-[150px] animate-pulse-slow"></div>
            </div>

            {/* Sidebar */}
            <aside className="relative z-10 w-64 border-r border-slate-200 bg-white flex flex-col shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <img
                            src="/brand/logo-full.png"
                            alt="Marketeers"
                            className="h-10 w-auto object-contain"
                        />
                    </div>

                    <nav className="space-y-2">
                        {sidebarItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                                        ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                                        : 'text-slate-500 hover:text-brand-blue hover:bg-slate-50 border border-transparent'}
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                {item.path === '/dashboard' && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-glow animate-pulse"></div>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-500 hover:text-rose-600 transition-colors w-full px-4 py-2 hover:bg-rose-50 rounded-xl group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
                <header className="sticky top-0 z-20 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-10 justify-between">
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Live Status: <span className="text-emerald-400">System Healthy</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-dark bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                    UI
                                </div>
                            ))}
                        </div>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <span className="text-sm font-semibold text-slate-900">Admin Portal</span>
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
