import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analytics, surveys } from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import {
    TrendingUp, Users, CheckCircle2, AlertCircle,
    ArrowRight, Filter, RefreshCcw,
    ShieldAlert
} from 'lucide-react';

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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
    );

    const funnelChartData = [
        { name: 'Unused', value: funnelData?.unused || 0, fill: '#64748b' },
        { name: 'Passed', value: funnelData?.passed || 0, fill: '#10b981' },
        { name: 'Failed', value: funnelData?.failed || 0, fill: '#f43f5e' },
        { name: 'Submitted', value: funnelData?.submitted || 0, fill: '#0ea5e9' },
    ];

    const orphanChartData = orphanData?.categories.map((c: any) => ({
        name: c._id.replace('invalid_transition_', '').replace('_', ' '),
        value: c.count
    })) || [];

    const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9'];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-1">
                            <Link to="/dashboard" className="hover:text-purple-300">Dashboard</Link>
                            <span>/</span>
                            <span className="text-slate-400">{survey?.company_name}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Survey Analytics
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-800 transition shadow-lg"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </button>
                        <Link
                            to={`/surveys/${surveyId}`}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-500 transition shadow-lg shadow-purple-900/20"
                        >
                            <Users className="w-4 h-4" />
                            Manage Tokens
                        </Link>
                    </div>
                </header>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Submissions"
                        value={funnelData?.submitted || 0}
                        icon={<CheckCircle2 className="w-6 h-6 text-sky-400" />}
                        trend={`${(funnelData?.completion_rate || 0).toFixed(1)}% Comp. Rate`}
                        color="sky"
                    />
                    <StatCard
                        title="Qualified Leads"
                        value={funnelData?.passed || 0}
                        icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
                        trend={`${(funnelData?.qualification_rate || 0).toFixed(1)}% Qual. Rate`}
                        color="emerald"
                    />
                    <StatCard
                        title="Qualification Failures"
                        value={funnelData?.failed || 0}
                        icon={<AlertCircle className="w-6 h-6 text-rose-400" />}
                        trend="Layer 1 Drop-off"
                        color="rose"
                    />
                    <StatCard
                        title="Orphan Submissions"
                        value={orphanData?.total_attempts || 0}
                        icon={<ShieldAlert className="w-6 h-6 text-amber-400" />}
                        trend="Failed Webhook Attempts"
                        color="amber"
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Trends Chart */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Submission Trends (Last 30 Days)
                        </h3>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendsData}>
                                    <defs>
                                        <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="_id"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                        itemStyle={{ fontSize: '13px' }}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorSub)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="passed" name="Qualified" stroke="#10b981" fillOpacity={1} fill="url(#colorPass)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Funnel Breakdown */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-400" />
                            Conversion Funnel
                        </h3>
                        <div className="h-[350px] flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelChartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                        {funnelChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={funnelChartData[index].fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-2 gap-8 w-full px-8">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-400">{(funnelData?.qualification_rate || 0).toFixed(1)}%</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Qualification Rate</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-sky-400">{(funnelData?.completion_rate || 0).toFixed(1)}%</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Completion Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Orphan Audit & Sub-stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Pass Rate Trend */}
                    <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            Daily Qualification Rate (%)
                        </h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="_id" stroke="#64748b" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="pass_rate" name="Pass Rate" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Orphan Issues Pie */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-400" />
                            Webhook Audit Logs
                        </h3>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orphanChartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {orphanChartData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {orphanData?.categories.map((c: any, i: number) => (
                                <div key={c._id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-slate-800/50 border border-slate-700/50">
                                    <div className="flex items-center gap-2 truncate pr-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-slate-300 truncate">{c._id.replace('invalid_transition_', '').replace('_', ' ')}</span>
                                    </div>
                                    <span className="font-bold">{c.count}</span>
                                </div>
                            ))}
                            {(!orphanData || orphanData.categories.length === 0) && (
                                <p className="text-center text-slate-500 text-sm italic">No orphan attempts logged.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color }: any) {
    const borderColors: any = {
        sky: 'border-sky-500/20 hover:border-sky-500/50',
        emerald: 'border-emerald-500/20 hover:border-emerald-500/50',
        rose: 'border-rose-500/20 hover:border-rose-500/50',
        amber: 'border-amber-500/20 hover:border-amber-500/50'
    };

    return (
        <div className={`bg-slate-900/50 border ${borderColors[color] || 'border-slate-800'} p-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] cursor-default backdrop-blur-sm`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <h4 className="text-3xl font-extrabold mt-1">{value.toLocaleString()}</h4>
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ArrowRight className="w-3 h-3" />
                {trend}
            </div>
        </div>
    );
}
