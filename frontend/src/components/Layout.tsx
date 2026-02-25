import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    LogOut,
    TrendingUp,
    ShieldCheck,
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
        <div className="flex min-h-screen bg-brand-dark text-slate-100 overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-accent/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
            </div>

            {/* Sidebar */}
            <aside className="relative z-10 w-64 border-r border-white/5 bg-brand-dark/40 backdrop-blur-3xl flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-fuchsia-500 flex items-center justify-center shadow-accent-glow">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-display font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            GatedSub
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        {sidebarItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive
                                        ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20 shadow-inner'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'}
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

                <div className="mt-auto p-8 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-400 hover:text-rose-400 transition-colors w-full px-4 py-2 hover:bg-rose-500/5 rounded-xl group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
                <header className="sticky top-0 z-20 h-20 bg-brand-dark/20 backdrop-blur-md border-b border-white/5 flex items-center px-10 justify-between">
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
                        <div className="w-px h-6 bg-white/10 mx-2"></div>
                        <span className="text-sm font-semibold text-slate-300">Admin Portal</span>
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
