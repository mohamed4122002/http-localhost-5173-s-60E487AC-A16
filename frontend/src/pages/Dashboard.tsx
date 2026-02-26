import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { surveys } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SurveyStateToggle } from '../components/SurveyStateManagement';
import {
  Plus,
  Zap,
  CheckCircle2,
  BarChart3,
  Clock,
  FileText,
  Users,
  TrendingUp,
  Trash2,
  Calendar,
  Layers,
  Search,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Dashboard() {
  const [surveyList, setSurveyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    total_surveys: 0,
    active_surveys: 0,
    total_responses: 0,
    match_rate: 0,
    engagement_chart: [],
    uptime: '0.0',
    accuracy: 0
  });

  const fetchSurveys = async () => {
    try {
      const [listData, statsData] = await Promise.all([
        surveys.list(),
        surveys.stats()
      ]);
      setSurveyList(listData);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await surveys.delete(id);
      toast.success('Campaign removed successfully');
      setDeletingId(null);
      fetchSurveys();
    } catch (err) {
      toast.error('Failed to remove campaign');
    }
  };

  const filteredSurveys = surveyList.filter(s =>
    s.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = stats.engagement_chart;

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-t-brand-accent border-white/10 animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Initializing Intelligence</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-dark/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card rounded-[2.5rem] p-10 max-w-md w-full border border-white/10 text-center"
            >
              <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                <Trash2 className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-display font-black mb-3 text-white">Delete Campaign?</h3>
              <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                This action will permanently move this campaign to archives. Associated links will remain valid but inaccessible from this dashboard.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-6 py-4 rounded-2xl bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition-all border border-white/5"
                >
                  Keep Campaign
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  className="px-6 py-4 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue border border-brand-blue/10">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-display">
              Campaign <span className="text-brand-blue">Management</span>
            </div>
          </div>
          <h1 className="text-5xl font-display font-black tracking-tight leading-none text-slate-900">
            Campaign <span className="text-slate-400 font-light italic">Insights</span>
          </h1>
          <p className="mt-4 text-slate-600 max-w-xl font-medium leading-relaxed">
            Real-time analytics for your gated survey deployments and participant verification flows.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/5 transition-all shadow-sm"
            />
          </div>
          <Link
            to="/create-survey"
            className="btn-premium flex items-center justify-center gap-3 group shadow-xl shadow-brand-accent/20 font-black tracking-widest uppercase text-xs"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            Initiate Deployment
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard
          title="Total Campaigns"
          value={stats.total_surveys}
          icon={Layers}
          trend="+12% vs last month"
          color="coral"
          delay={0.1}
        />
        <MetricCard
          title="Active Surveys"
          value={stats.active_surveys}
          icon={Zap}
          trend="Currently live"
          color="cyan"
          delay={0.2}
        />
        <MetricCard
          title="Total Responses"
          value={stats.total_responses.toLocaleString()}
          icon={CheckCircle2}
          trend={`${stats.match_rate}% match rate`}
          color="grey"
          delay={0.3}
        />
        <MetricCard
          title="System Status"
          value={`Online`}
          icon={Clock}
          trend="All systems nominal"
          color="blue"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <div className="w-24 h-24 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-all duration-1000"></div>
          </div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black font-display text-slate-900">Engagement Volume</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time participation metrics</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-5 py-2.5 rounded-2xl shadow-inner-soft">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
              LIVE SYNC
            </div>
          </div>
          <div className="h-[320px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="8 8" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(37, 94, 145, 0.03)', radius: 8 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-5 rounded-2xl shadow-premium">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">{label}</p>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-brand-blue shadow-[0_0_10px_rgba(37,94,145,0.4)]"></div>
                            <p className="text-sm font-black text-slate-900">{payload[0].value} <span className="text-slate-400 font-bold ml-1">Participations</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="surveys"
                  fill="url(#barGradientPremium)"
                  radius={[12, 12, 12, 12]}
                  barSize={32}
                />
                <defs>
                  <linearGradient id="barGradientPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#21A0FF" />
                    <stop offset="100%" stopColor="#08306B" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Intelligence */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium flex flex-col items-center justify-center text-center group">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-brand-blue/10 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
            <div className="relative w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-all duration-500 shadow-inner-soft">
              <Zap className="w-12 h-12 text-brand-blue" />
            </div>
          </div>
          <h3 className="text-2xl font-black font-display text-slate-900 mb-4 tracking-tight">Accuracy Tracking</h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 px-4">
            Verification engine operating at <span className="text-slate-900 font-black">{stats.accuracy}% accuracy</span>.
          </p>
          <div className="w-full h-2 bg-slate-50 rounded-full mb-10 overflow-hidden shadow-inner-soft">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.accuracy}%` }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-brand-blue to-brand-chartBlue shadow-[0_0_15px_rgba(37,94,145,0.2)]"
            />
          </div>
          <Link
            to="/templates"
            className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
          >
            Refine Protocols
          </Link>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-premium relative">
        <div className="p-12 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-slate-50/30">
          <div>
            <h3 className="text-2xl font-black font-display text-slate-900">Active Research Registry</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Audit-ready deployment logs</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-2xl border border-slate-100 w-fit">
            <button className="px-5 py-2.5 rounded-xl bg-white shadow-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest text-brand-blue">All Logs</button>
            <button className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Archived</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-10 py-6 border-b border-slate-100">Company Name</th>
                <th className="px-10 py-6 border-b border-slate-100">Created At</th>
                <th className="px-10 py-6 border-b border-slate-100">Blueprint</th>
                <th className="px-10 py-6 border-b border-slate-100">Survey Status</th>
                <th className="px-10 py-6 border-b border-slate-100 text-right font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredSurveys.map((survey: any, idx) => (
                  <motion.tr
                    key={survey._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-10 py-7 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-brand-blue/30 transition-all font-display font-black text-slate-400 group-hover:text-brand-blue">
                          {survey.company_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-base text-slate-900 group-hover:text-brand-blue transition-colors">
                            {survey.company_name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Deployment {survey._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {new Date(survey.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-brand-accent/50" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Standard Gateway</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <SurveyStateToggle
                        currentStatus={survey.status}
                        onTransition={async (newStatus) => {
                          await surveys.update(survey._id, { status: newStatus });
                          fetchSurveys();
                        }}
                      />
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex justify-end gap-2 pr-2">
                        {survey.status === 'draft' && (
                          <Link
                            to={`/surveys/${survey._id}/edit`}
                            className="p-3 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all border border-amber-500/10 active:scale-95"
                            title="Edit Research Flow"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          to={`/surveys/${survey._id}`}
                          className="p-3 rounded-xl bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 transition-all border border-brand-accent/10 active:scale-95"
                          title="View Participation Links"
                        >
                          <Users className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/analytics/${survey._id}`}
                          className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all border border-emerald-500/10 active:scale-95"
                          title="Analytics Intelligence"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Link>
                        <div className="w-[1px] h-10 bg-white/5 mx-1 translate-y-[-4px]"></div>
                        <button
                          onClick={() => setDeletingId(survey._id)}
                          className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/10 active:scale-95 group/del"
                          title="Secure Archive"
                        >
                          <Trash2 className="w-4 h-4 transition-transform group-hover/del:rotate-12" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredSurveys.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                        <AlertTriangle className="w-10 h-10 text-slate-700" />
                      </div>
                      <div>
                        <p className="text-xl font-black font-display text-slate-400">No campaigns detected</p>
                        <p className="text-sm font-medium text-slate-600 mt-1">Initiate a new deployment to populate your audit logs.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color, delay = 0 }: any) {
  const colors: any = {
    coral: 'text-brand-glow bg-brand-glow/5 border-brand-glow/10',
    cyan: 'text-brand-cyan bg-brand-cyan/5 border-brand-cyan/10',
    grey: 'text-brand-grey bg-brand-grey/5 border-brand-grey/10',
    blue: 'text-brand-blue bg-brand-blue/5 border-brand-blue/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-[2.5rem] p-8 hover:translate-y-[-8px] transition-all duration-500 cursor-default group border border-slate-100 shadow-premium relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 group-hover:scale-125 transition-transform">
        <Icon className="w-40 h-40 rotate-12" />
      </div>
      <div className="flex flex-col gap-6 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colors[color] || colors.coral} group-hover:scale-110 transition-transform duration-500 shadow-inner-soft`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-display font-black text-slate-900 tracking-tight">{value}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-slate-500 bg-slate-50 w-fit px-3 py-2 rounded-xl border border-slate-100 shadow-inner-soft">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="uppercase tracking-widest">{trend}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
