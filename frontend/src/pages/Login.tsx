import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, User, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await auth.login(username, password);
      localStorage.setItem('token', response.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-dark flex items-center justify-center p-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[15%] w-96 h-96 bg-brand-accent/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[15%] w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[120px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg glass-card rounded-[2.5rem] p-12 border border-white/10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-accent to-fuchsia-500 flex items-center justify-center shadow-accent-glow mb-6">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-black text-white text-center">
            Welcome <span className="text-brand-glow">Back</span>
          </h1>
          <p className="mt-3 text-slate-400 text-center font-medium">
            Access your secure survey command center.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-accent transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-accent/50 focus:ring-4 focus:ring-brand-accent/10 transition-all placeholder:text-slate-600"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-accent transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-accent/50 focus:ring-4 focus:ring-brand-accent/10 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-bold text-rose-400 bg-rose-400/10 p-3 rounded-xl border border-rose-400/20 text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-premium w-full py-4 text-white flex items-center justify-center gap-2 group shadow-lg shadow-brand-accent/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign in to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-sm font-medium">
            New to the platform?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-brand-glow hover:text-white font-bold transition-colors underline decoration-brand-glow/30"
            >
              Construct Account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

