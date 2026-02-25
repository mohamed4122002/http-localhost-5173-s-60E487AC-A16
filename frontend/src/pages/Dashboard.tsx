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
            <div className="p-2 rounded-xl bg-brand-accent/20 text-brand-accent border border-brand-accent/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-display">
              System <span className="text-brand-glow text-glow-accent">Integrity</span> Control
            </div>
          </div>
          <h1 className="text-5xl font-display font-black tracking-tight leading-none text-white">
            Campaign <span className="text-slate-500 font-light italic">Insights</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-xl font-medium leading-relaxed">
            Real-time analytics for your gated survey deployments and participant verification flows.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white font-bold focus:outline-none focus:border-brand-accent/50 focus:ring-4 focus:ring-brand-accent/5 transition-all"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Tracks"
          value={stats.total_surveys}
          icon={Layers}
          trend="+12% vs last month"
          color="accent"
        />
        <MetricCard
          title="Live Sessions"
          value={stats.active_surveys}
          icon={Zap}
          trend="Currently live"
          color="cyan"
        />
        <MetricCard
          title="Qualified Sync"
          value={stats.total_responses.toLocaleString()}
          icon={CheckCircle2}
          trend={`${stats.match_rate}% match rate`}
          color="emerald"
        />
        <MetricCard
          title="Protocol Uptime"
          value={`${stats.uptime}%`}
          icon={Clock}
          trend="Sub-100ms latency"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <div className="w-16 h-16 bg-brand-accent/5 rounded-full blur-2xl group-hover:bg-brand-accent/10 transition-all duration-700"></div>
          </div>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black font-display text-white">Engagement Volume</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Cross-platform participation metrics</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-brand-glow bg-brand-accent/10 border border-brand-accent/20 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_#8b5cf6]"></span>
              LIVE SYNC
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }}
                />
                <Tooltip
                  cursor={{ fill: '#ffffff02' }}
                  contentStyle={{
                    backgroundColor: '#020617',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                />
                <Bar
                  dataKey="surveys"
                  fill="url(#barGradient)"
                  radius={[8, 8, 8, 8]}
                  barSize={45}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Intelligence */}
        <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 flex flex-col items-center justify-center text-center group">
          <div className="w-24 h-24 bg-brand-accent/10 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 transition-all duration-500 shadow-inner group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <Zap className="w-10 h-10 text-brand-accent" />
          </div>
          <h3 className="text-2xl font-black font-display text-white mb-3">AI Calibration</h3>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            Your verification engine is currently running at **{stats.accuracy}% accuracy** using the latest sentiment modeling.
          </p>
          <div className="w-full h-1 bg-white/5 rounded-full mb-10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.accuracy}%` }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-brand-accent shadow-[0_0_10px_#8b5cf6]"
            />
          </div>
          <Link
            to="/templates"
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-brand-accent hover:text-white transition-all shadow-lg hover:shadow-brand-accent/20"
          >
            Refine Protocols
          </Link>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black font-display text-white">Active Research Registry</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Audit-ready deployment logs</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/5 w-fit">
            <button className="px-5 py-2.5 rounded-xl bg-brand-dark shadow-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white">All Logs</button>
            <button className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Archived</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.02]">
                <th className="px-10 py-6 border-b border-white/5">Corporate Identity</th>
                <th className="px-10 py-6 border-b border-white/5">Initiated</th>
                <th className="px-10 py-6 border-b border-white/5">Protocol Tier</th>
                <th className="px-10 py-6 border-b border-white/5">Validation Pipeline</th>
                <th className="px-10 py-6 border-b border-white/5 text-right font-black">Commands</th>
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
                    className="group hover:bg-brand-accent/[0.03] transition-colors"
                  >
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-brand-accent/20 transition-all font-display font-black text-slate-500 group-hover:text-brand-accent">
                          {survey.company_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-base text-slate-100 group-hover:text-brand-glow transition-colors">
                            {survey.company_name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-slate-500 transition-colors">
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

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    accent: 'text-brand-glow bg-brand-accent/10 border-brand-accent/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]',
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.1)]',
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 hover:scale-[1.03] transition-all duration-500 cursor-default group border border-white/5 hover:border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 rotate-12" />
      </div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-4 rounded-3xl border ${colors[color] || colors.accent} group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</p>
          <p className="text-4xl font-display font-black mt-2 text-white group-hover:text-brand-glow transition-colors">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/5 relative z-10 group-hover:bg-white/10 transition-colors">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <span className="uppercase tracking-widest">{trend}</span>
      </div>
    </div>
  );
}
