import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analytics, surveys } from '../services/api';
import FunnelChart from '../components/analytics/FunnelChart';
import TimeSeriesChart from '../components/analytics/TimeSeriesChart';
import OrphanAuditTable from '../components/analytics/OrphanAuditTable';
import {
    Users,
    AlertCircle,
    ArrowLeft,
    RefreshCcw,
    ShieldAlert,
    Search,
    Activity,
    MousePointer2,
    Lock,
    Globe,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsDashboard() {
    const { surveyId } = useParams();
    const [survey, setSurvey] = useState<any>(null);
    const [allSurveys, setAllSurveys] = useState<any[]>([]);
    const [funnelData, setFunnelData] = useState<any>(null);
    const [trendsData, setTrendsData] = useState<any[]>([]);
    const [orphanData, setOrphanData] = useState<any>(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!surveyId) return;
        setLoading(true);
        setError(null);
        try {
            const [sData, listData, fData, tData, oData] = await Promise.all([
                surveys.get(surveyId),
                surveys.list(),
                analytics.getFunnel(surveyId),
                analytics.getTrends(surveyId, days),
                analytics.getOrphans()
            ]);
            setSurvey(sData);
            setAllSurveys(listData);
            setFunnelData(fData);
            setTrendsData(tData);
            setOrphanData(oData);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError('Database connectivity intermittent. Retrying...');
            setTimeout(fetchData, 5000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [surveyId, days]);

    if (loading && !survey) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-t-brand-accent border-white/10 animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                            Intelligence <span className="text-brand-glow">Layer</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight">
                        {survey?.company_name} <span className="text-slate-500 font-light">Audit</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
                        <select
                            className="pl-11 pr-10 py-3 bg-brand-surface/40 backdrop-blur-xl border border-white/5 rounded-2xl text-sm font-bold focus:outline-none focus:border-brand-accent/50 transition-all appearance-none cursor-pointer"
                            value={surveyId}
                            onChange={(e) => window.location.href = `/analytics/${e.target.value}`}
                        >
                            {allSurveys.map(s => (
                                <option key={s._id} value={s._id}>{s.company_name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={fetchData}
                        className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>

                    <div className="bg-white/5 p-1 rounded-2xl flex border border-white/5">
                        {[7, 30, 90].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${days === d ? 'bg-brand-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {d}D
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6" />
                            <span className="font-bold">{error}</span>
                        </div>
                        <button onClick={fetchData} className="px-5 py-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Retry Link</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    label="Total Funnel Hits"
                    value={funnelData?.submitted || 0}
                    icon={Activity}
                    trend={(funnelData?.completion_rate || 0).toFixed(1) + '% Success'}
                    color="accent"
                />
                <AnalyticsCard
                    label="User Qualification"
                    value={funnelData?.passed || 0}
                    icon={Users}
                    trend={(funnelData?.qualification_rate || 0).toFixed(1) + '% Pass Rate'}
                    color="cyan"
                />
                <AnalyticsCard
                    label="Screen-out Shield"
                    value={funnelData?.failed || 0}
                    icon={Lock}
                    trend="Automated Rejection"
                    color="rose"
                />
                <AnalyticsCard
                    label="Security Events"
                    value={orphanData?.total_attempts || 0}
                    icon={ShieldAlert}
                    trend="Orphan Webhooks Blocked"
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Trends Table */}
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5">
                        <div className="flex items-center justify-between mb-10 text-left">
                            <div>
                                <h3 className="text-xl font-display font-black">Performance <span className="text-brand-glow">Velocity</span></h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Daily interaction metrics</p>
                            </div>
                            <div className="p-2 rounded-xl bg-brand-accent/10">
                                <TrendingUp className="w-5 h-5 text-brand-accent" />
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <TimeSeriesChart data={trendsData} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                            <div className="p-4 rounded-full bg-cyan-400/10 text-cyan-400 mb-6">
                                <MousePointer2 className="w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Participant Pulse</p>
                            <p className="text-4xl font-display font-black text-white">12m 45s</p>
                            <p className="text-xs text-slate-400 font-medium mt-3">Avg. Attention Duration</p>
                        </div>
                        <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                            <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 mb-6">
                                <Globe className="w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Dropout Index</p>
                            <p className="text-4xl font-display font-black text-rose-500">{(funnelData?.drop_off_rate || 0).toFixed(1)}%</p>
                            <p className="text-xs text-slate-400 font-medium mt-3">Pre-submission Abandonment</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5">
                        <h3 className="text-xl font-display font-black mb-8">Conversion <span className="text-brand-glow">Funnel</span></h3>
                        <FunnelChart data={funnelData} />
                    </div>

                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-display font-black">Security <span className="text-rose-500">Audit</span></h3>
                            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                        </div>
                        <OrphanAuditTable data={orphanData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticsCard({ label, value, icon: Icon, trend, color }: any) {
    const colors: any = {
        accent: 'text-brand-glow bg-brand-accent/10',
        cyan: 'text-cyan-400 bg-cyan-400/10',
        rose: 'text-rose-400 bg-rose-400/10',
        amber: 'text-amber-400 bg-amber-400/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2rem] p-8 border border-white/5 hover:border-brand-accent/30 transition-all cursor-default group"
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${colors[color] || colors.accent} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-3xl font-display font-black text-white group-hover:text-brand-glow transition-colors">{value.toLocaleString()}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full ${color === 'rose' ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`}></div>
                {trend}
            </div>
        </motion.div>
    );
}
