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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
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

    const COLORS = ['#08306B', '#CD393B', '#BEBEBE', '#8ACAEC'];

    return (
        <div className="min-h-screen bg-brand-dark text-slate-900 p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                    <div>
                        <div className="flex items-center gap-2 text-brand-blue text-sm font-bold mb-1">
                            <Link to="/dashboard" className="hover:text-brand-red">Dashboard</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-400">{survey?.company_name}</span>
                        </div>
                        <h1 className="text-3xl font-display font-black tracking-tight text-slate-900">
                            Survey <span className="text-brand-blue">Analytics</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </button>
                        <Link
                            to={`/surveys/${surveyId}`}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-blue rounded-xl text-sm font-bold text-white hover:bg-blue-800 transition shadow-lg shadow-brand-blue/20"
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">

                    {/* Trends Chart */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                        <h3 className="text-lg font-display font-black mb-6 flex items-center gap-2 text-slate-900">
                            <TrendingUp className="w-5 h-5 text-brand-blue" />
                            Submission Trends
                        </h3>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendsData}>
                                    <defs>
                                        <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8ACAEC" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8ACAEC" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#08306B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#08306B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="_id"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#8ACAEC" fillOpacity={1} fill="url(#colorSub)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="passed" name="Qualified" stroke="#08306B" fillOpacity={1} fill="url(#colorPass)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Funnel Breakdown */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                        <h3 className="text-lg font-display font-black mb-6 flex items-center gap-2 text-slate-900">
                            <Filter className="w-5 h-5 text-brand-blue" />
                            Conversion Funnel
                        </h3>
                        <div className="h-[350px] flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelChartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={80} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                                        {funnelChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={funnelChartData[index].fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-2 gap-8 w-full px-8">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-brand-blue">{(funnelData?.qualification_rate || 0).toFixed(1)}%</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Qualification</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-brand-cyan">{(funnelData?.completion_rate || 0).toFixed(1)}%</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Completion</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Orphan Audit & Sub-stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">

                    {/* Pass Rate Trend */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                        <h3 className="text-lg font-display font-black mb-6 text-slate-900">
                            Daily Qualification Rate (%)
                        </h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                                    <Line type="monotone" dataKey="pass_rate" name="Pass Rate" stroke="#08306B" strokeWidth={4} dot={{ r: 6, fill: '#08306B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Orphan Issues Pie */}
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                        <h3 className="text-lg font-display font-black mb-4 flex items-center gap-2 text-slate-900">
                            <ShieldAlert className="w-5 h-5 text-brand-red" />
                            Security Audit
                        </h3>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orphanChartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {orphanChartData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {orphanData?.categories.map((c: any, i: number) => (
                                <div key={c._id} className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 truncate pr-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-slate-600 font-bold truncate">{c._id.replace('invalid_transition_', '').replace('_', ' ')}</span>
                                    </div>
                                    <span className="font-black text-slate-900">{c.count}</span>
                                </div>
                            ))}
                            {(!orphanData || orphanData.categories.length === 0) && (
                                <p className="text-center text-slate-400 text-sm italic py-4">No security events logged.</p>
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
        sky: 'border-brand-blue/10 hover:border-brand-blue/30',
        emerald: 'border-brand-cyan/10 hover:border-brand-cyan/30',
        rose: 'border-brand-red/10 hover:border-brand-red/30',
        amber: 'border-slate-200 hover:border-slate-300'
    };

    const iconBgs: any = {
        sky: 'bg-brand-blue/5',
        emerald: 'bg-brand-cyan/5',
        rose: 'bg-brand-red/5',
        amber: 'bg-slate-50'
    };

    return (
        <div className={`bg-white border ${borderColors[color] || 'border-slate-100'} p-6 rounded-[2rem] shadow-lg transition-all hover:scale-[1.02] cursor-default text-left`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 ${iconBgs[color] || 'bg-slate-50'} rounded-2xl`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
                    <h4 className="text-3xl font-display font-black mt-1 text-slate-900">{value.toLocaleString()}</h4>
                </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                <ArrowRight className="w-3 h-3 text-brand-blue" />
                {trend}
            </div>
        </div>
    );
}
