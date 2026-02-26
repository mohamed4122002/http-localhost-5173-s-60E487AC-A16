import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analytics, surveys } from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import {
    TrendingUp, Users, CheckCircle2, AlertCircle,
    RefreshCcw, Filter,
    ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
    const { surveyId } = useParams();
    const [survey, setSurvey] = useState<any>(null);
    const [funnelData, setFunnelData] = useState<any>(null);
    const [trendsData, setTrendsData] = useState<any[]>([]);
    const [orphanData, setOrphanData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!surveyId) return;
        setLoading(true);
        try {
            const [sData, fData, tData, oData] = await Promise.all([
                surveys.get(surveyId),
                analytics.getFunnel(surveyId),
                analytics.getTrends(surveyId),
                analytics.getOrphans()
            ]);
            setSurvey(sData);
            setFunnelData(fData);
            setTrendsData(tData);
            setOrphanData(oData);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [surveyId]);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-t-brand-blue border-slate-100 animate-spin shadow-inner-soft"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Analytics</p>
        </div>
    );

    const funnelChartData = [
        { name: 'Unused', value: funnelData?.unused || 0, fill: '#BEBEBE' },      // brand.grey
        { name: 'Passed', value: funnelData?.passed || 0, fill: '#8ACAEC' },      // brand.cyan
        { name: 'Failed', value: funnelData?.failed || 0, fill: '#CD393B' },      // brand.red
        { name: 'Submitted', value: funnelData?.submitted || 0, fill: '#08306B' }, // brand.blue
    ];

    const orphanChartData = orphanData?.categories.map((c: any) => ({
        name: c._id.replace('invalid_transition_', '').replace('_', ' '),
        value: c.count
    })) || [];

    const COLORS = ['#08306B', '#CD393B', '#929292', '#8ACAEC'];

    return (
        <div className="space-y-12 pb-20">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-brand-blue/5 text-brand-blue border border-brand-blue/10">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Link to="/dashboard" className="hover:text-brand-blue transition-colors">Dashboard</Link>
                                <span className="text-slate-200">/</span>
                                <span className="text-brand-blue">{survey?.company_name}</span>
                            </div>
                        </div>
                        <h1 className="text-5xl font-display font-black tracking-tight text-slate-900">
                            Survey <span className="text-slate-400 font-light italic">Analytics</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchData}
                            className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-blue hover:border-brand-blue/30 transition-all shadow-premium active:scale-95"
                            title="Refresh Data"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <Link
                            to={`/surveys/${surveyId}`}
                            className="flex items-center gap-3 px-8 py-4 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-brand-blue/20"
                        >
                            <Users className="w-5 h-5" />
                            Access Control
                        </Link>
                    </div>
                </header>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard
                        title="Total Submissions"
                        value={funnelData?.submitted || 0}
                        icon={<CheckCircle2 className="w-6 h-6" />}
                        trend={`${(funnelData?.completion_rate || 0).toFixed(1)}% Comp. Rate`}
                        color="blue"
                        delay={0.1}
                    />
                    <StatCard
                        title="Qualified Leads"
                        value={funnelData?.passed || 0}
                        icon={<TrendingUp className="w-6 h-6" />}
                        trend={`${(funnelData?.qualification_rate || 0).toFixed(1)}% Qual. Rate`}
                        color="cyan"
                        delay={0.2}
                    />
                    <StatCard
                        title="Qualification Failures"
                        value={funnelData?.failed || 0}
                        icon={<ShieldAlert className="w-6 h-6" />}
                        trend="Initial Drop-off"
                        color="rose"
                        delay={0.3}
                    />
                    <StatCard
                        title="Orphan Submissions"
                        value={orphanData?.total_attempts || 0}
                        icon={<AlertCircle className="w-6 h-6" />}
                        trend="Abandoned Submissions"
                        color="grey"
                        delay={0.4}
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">

                    {/* Trends Chart */}
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-premium relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <div className="w-24 h-24 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-all duration-1000"></div>
                        </div>
                        <h3 className="text-2xl font-black font-display mb-10 flex items-center gap-3 text-slate-900 relative z-10">
                            <TrendingUp className="w-6 h-6 text-brand-blue" />
                            Submission Trends
                        </h3>
                        <div className="h-[350px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendsData}>
                                    <defs>
                                        <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8ACAEC" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8ACAEC" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#08306B" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#08306B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="8 8" stroke="#E2E8F0" vertical={false} />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#08306B', strokeWidth: 2, strokeDasharray: '5 5' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-5 rounded-2xl shadow-premium">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{label}</p>
                                                        <div className="space-y-2">
                                                            {payload.map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-8">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}60` }}></div>
                                                                        <span className="text-xs font-bold text-slate-500 pr-5">{entry.name}</span>
                                                                    </div>
                                                                    <span className="text-sm font-black text-slate-900 pr-2">{entry.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#8ACAEC" fillOpacity={1} fill="url(#colorSub)" strokeWidth={4} />
                                    <Area type="monotone" dataKey="passed" name="Qualified" stroke="#08306B" fillOpacity={1} fill="url(#colorPass)" strokeWidth={4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Funnel Breakdown */}
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-premium relative group">
                        <div className="absolute top-0 left-0 p-8">
                            <div className="w-24 h-24 bg-brand-cyan/5 rounded-full blur-3xl group-hover:bg-brand-cyan/10 transition-all duration-1000"></div>
                        </div>
                        <h3 className="text-2xl font-black font-display mb-10 flex items-center gap-3 text-slate-900 relative z-10">
                            <Filter className="w-6 h-6 text-brand-blue" />
                            Conversion Funnel
                        </h3>
                        <div className="h-[350px] relative z-10 flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelChartData} layout="vertical" margin={{ left: 20, right: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(37, 94, 145, 0.03)', radius: 8 }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-5 rounded-2xl shadow-premium">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                                                        <p className="text-lg font-black text-slate-900">{payload[0].value} <span className="text-slate-400 text-xs font-bold ml-1">Entries</span></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={32}>
                                        {funnelChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={funnelChartData[index].fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-8 grid grid-cols-2 gap-10 w-full px-10">
                                <div className="text-center p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner-soft">
                                    <p className="text-3xl font-display font-black text-brand-blue">{(funnelData?.qualification_rate || 0).toFixed(1)}%</p>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1 pr-2">Qualification</p>
                                </div>
                                <div className="text-center p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner-soft">
                                    <p className="text-3xl font-display font-black text-brand-cyan">{(funnelData?.completion_rate || 0).toFixed(1)}%</p>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1 pr-2">Finalization</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Orphan Audit & Sub-stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left relative z-10">

                    {/* Pass Rate Trend */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-premium group">
                        <h3 className="text-2xl font-black font-display mb-10 text-slate-900">
                            Daily Qualification Analytics
                        </h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendsData}>
                                    <CartesianGrid strokeDasharray="8 8" stroke="#E2E8F0" vertical={false} />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                                        <p className="text-lg font-black text-white">{payload[0].value}% <span className="text-emerald-400 text-[10px] ml-2">PASSED</span></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="pass_rate"
                                        name="Pass Rate"
                                        stroke="#08306B"
                                        strokeWidth={5}
                                        dot={{ r: 0 }}
                                        activeDot={{ r: 8, strokeWidth: 0, fill: '#08306B' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Orphan Issues Pie */}
                    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-premium relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                            <ShieldAlert className="w-40 h-40 rotate-12" />
                        </div>
                        <h3 className="text-2xl font-black font-display mb-2 flex items-center gap-3 text-slate-900">
                            Submission Quality
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 border-b border-slate-50 pb-4">Validation Integrity Checks</p>

                        <div className="h-[200px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orphanChartData}
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {orphanChartData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-premium">
                                                        <p className="text-xs font-black text-slate-900">{payload[0].name}: {payload[0].value}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-3 relative z-10">
                            {orphanData?.categories.map((c: any, i: number) => (
                                <div key={c._id} className="flex items-center justify-between text-[10px] px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner-soft group hover:bg-white hover:shadow-premium transition-all duration-300">
                                    <div className="flex items-center gap-3 truncate pr-2">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-slate-500 font-black uppercase tracking-widest truncate">{c._id.replace('invalid_transition_', '').replace('_', ' ')}</span>
                                    </div>
                                    <span className="font-black text-slate-900 text-xs">{c.count}</span>
                                </div>
                            ))}
                            {(!orphanData || orphanData.categories.length === 0) && (
                                <div className="flex flex-col items-center justify-center py-6 gap-2">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">System Healthy</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}


function StatCard({ title, value, icon, trend, color, delay = 0 }: any) {
    const colors: any = {
        blue: 'text-brand-blue bg-brand-blue/5 border-brand-blue/10',
        cyan: 'text-brand-cyan bg-brand-cyan/5 border-brand-cyan/10',
        rose: 'text-brand-red bg-brand-red/5 border-brand-red/10',
        grey: 'text-slate-400 bg-slate-50 border-slate-100'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-premium transition-all hover:translate-y-[-6px] duration-500 cursor-default text-left relative overflow-hidden group"
        >
            <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000 group-hover:scale-125 transition-transform">
                <TrendingUp className="w-32 h-32 rotate-12" />
            </div>

            <div className="flex flex-col gap-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colors[color] || colors.grey} transition-transform duration-500 shadow-inner-soft`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 pr-2">{title}</p>
                    <h4 className="text-4xl font-display font-black text-slate-900 tracking-tight">{value.toLocaleString()}</h4>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 w-fit px-3 py-2 rounded-xl border border-slate-100 shadow-inner-soft mt-5 pr-4">
                        <TrendingUp className="w-3.5 h-3.5 text-brand-blue pr-1" />
                        {trend}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
