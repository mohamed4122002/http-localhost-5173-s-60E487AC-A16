import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tokens, surveys } from '../services/api';
import {
    Plus,
    Filter,
    CheckCircle2,
    ChevronRight,
    ArrowLeft,
    Activity,
    Zap,
    Clock,
    ShieldAlert,
    ExternalLink,
    ChevronLeft,
    Database,
    Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function TokenManagement() {
    const { surveyId } = useParams();
    const [survey, setSurvey] = useState<any>(null);
    const [summary, setSummary] = useState({ unused: 0, passed: 0, failed: 0, submitted: 0, total: 0 });
    const [tokenList, setTokenList] = useState<any[]>([]);
    const [totalTokens, setTotalTokens] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
    const [genCount, setGenCount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);

    const fetchData = async () => {
        if (!surveyId) return;
        setLoading(true);
        try {
            const [sData, sumData, tData] = await Promise.all([
                surveys.get(surveyId),
                tokens.getSummary(surveyId),
                tokens.listBySurvey(surveyId, {
                    status: statusFilter || undefined,
                    page,
                    page_size: 20
                })
            ]);
            setSurvey(sData);
            setSummary(sumData);
            setTokenList(tData.items || []);
            setTotalTokens(tData.total || 0);
        } catch (err) {
            console.error(err);
            toast.error('Failed to sync token repository');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setSelectedTokens([]);
    }, [surveyId, statusFilter, page]);

    const handleGenerate = async () => {
        if (!surveyId) return;
        setLoading(true);
        try {
            await tokens.generate(surveyId, genCount);
            toast.success(`Allocated ${genCount} secure tokens`);
            fetchData();
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (token: string) => {
        const url = `${window.location.protocol}//${window.location.host}/s/${token}`;
        navigator.clipboard.writeText(url);
        toast.success('Access link copied to clipboard');
    };

    const handleBulkInvalidate = async () => {
        if (selectedTokens.length === 0) return;
        if (!confirm(`Are you sure you want to invalidate ${selectedTokens.length} active sessions?`)) return;

        setBulkLoading(true);
        try {
            await tokens.bulkUpdate({
                token_ids: selectedTokens,
                status: 'failed'
            });
            toast.warning(`${selectedTokens.length} entries restricted`);
            fetchData();
            setSelectedTokens([]);
        } catch (err) {
            console.error(err);
        } finally {
            setBulkLoading(false);
        }
    };

    const toggleTokenSelection = (id: string) => {
        setSelectedTokens(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedTokens.length === tokenList.length && tokenList.length > 0) {
            setSelectedTokens([]);
        } else {
            setSelectedTokens(tokenList.map(t => t._id));
        }
    };

    if (!survey) return (
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
                            Access <span className="text-brand-glow">Repository</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight">
                        Token <span className="text-slate-500 font-light">Management</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Monitoring distribution for <span className="text-white">{survey.company_name}</span></p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="glass-card flex items-center gap-4 px-6 py-3 rounded-2xl border border-white/5">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Pool</p>
                            <p className="text-xl font-display font-black text-white">{summary.total}</p>
                        </div>
                        <div className="w-px h-8 bg-white/5"></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Active</p>
                            <p className="text-xl font-display font-black text-brand-glow">{summary.unused}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Controls */}
                <div className="space-y-6">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-display font-black">Bulk <span className="text-brand-glow">Allocation</span></h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Distribution size</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 text-white focus:outline-none focus:border-brand-accent/50 focus:ring-4 focus:ring-brand-accent/10 transition-all font-bold"
                                    value={genCount}
                                    onChange={(e) => setGenCount(parseInt(e.target.value))}
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="btn-premium w-full py-4 text-white flex items-center justify-center gap-2 group shadow-lg shadow-brand-accent/20 font-black tracking-wide"
                            >
                                {loading ? <Clock className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Provision Tokens</>}
                            </button>
                            <p className="text-[10px] text-slate-500 text-center font-bold px-4 leading-relaxed uppercase tracking-tighter">
                                Each token is cryptographically secure and strictly single-use.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-8 border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Frictionless Lifecycle</h4>
                        <div className="space-y-4">
                            <LifecycleItem icon={Plus} label="Allocated" value={summary.total} color="slate" />
                            <LifecycleItem icon={Clock} label="Pending" value={summary.unused} color="brand" />
                            <LifecycleItem icon={CheckCircle2} label="Qualified" value={summary.passed} color="emerald" />
                            <LifecycleItem icon={ShieldAlert} label="Restricted" value={summary.failed} color="rose" />
                            <LifecycleItem icon={ExternalLink} label="Finalized" value={summary.submitted} color="cyan" />
                        </div>
                    </div>
                </div>

                {/* Right: Data Table */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                                <select
                                    className="pl-9 pr-8 py-2.5 bg-brand-surface/40 backdrop-blur-xl border border-white/5 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none focus:border-brand-accent/50 transition-all appearance-none cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">Status Filter</option>
                                    <option value="unused">Active / Pending</option>
                                    <option value="passed">Qualified</option>
                                    <option value="failed">Restricted</option>
                                    <option value="submitted">Finalized</option>
                                </select>
                            </div>

                            <AnimatePresence>
                                {selectedTokens.length > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={handleBulkInvalidate}
                                        disabled={bulkLoading}
                                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition flex items-center gap-2"
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                        Restrict Selected ({selectedTokens.length})
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                Slice {page} <span className="text-slate-700">of</span> {Math.ceil(totalTokens / 20) || 1}
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all disabled:opacity-20"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(totalTokens / 20)}
                                    className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all disabled:opacity-20"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden relative">
                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center z-50"
                                >
                                    <div className="w-10 h-10 rounded-full border-2 border-t-brand-accent border-white/10 animate-spin"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/2 pb-10">
                                        <th className="px-8 py-6 text-left w-10">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-brand-accent focus:ring-brand-accent transition-all cursor-pointer"
                                                checked={selectedTokens.length > 0 && selectedTokens.length === tokenList.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Security String</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Node</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {tokenList.map((t: any, idx) => (
                                        <motion.tr
                                            key={t._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className={`group transition-all hover:bg-white/2 ${selectedTokens.includes(t._id) ? 'bg-brand-accent/5' : ''}`}
                                        >
                                            <td className="px-8 py-5">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-brand-accent focus:ring-brand-accent transition-all cursor-pointer"
                                                    checked={selectedTokens.includes(t._id)}
                                                    onChange={() => toggleTokenSelection(t._id)}
                                                />
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-brand-glow transition-colors">
                                                        <Database className="w-4 h-4" />
                                                    </div>
                                                    <code className="text-xs font-mono font-bold text-slate-300 tracking-tight group-hover:text-white transition-colors">
                                                        {t.token.slice(0, 16)}<span className="text-slate-700">...</span>
                                                    </code>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black text-slate-600 font-mono tracking-tighter uppercase">{t.batch_id.slice(0, 12)}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <StatusBadge status={t.status} />
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => copyToClipboard(t.token)}
                                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-accent/10 hover:text-brand-accent text-slate-400 transition-all group/btn"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {tokenList.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-6 rounded-full bg-white/2 border border-white/5">
                                                        <Activity className="w-12 h-12 text-slate-700" />
                                                    </div>
                                                    <div>
                                                        <p className="font-display font-black text-slate-500">Repository Empty</p>
                                                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-1">No matches found for current filter</p>
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
            </div>
        </div>
    );
}

function LifecycleItem({ icon: Icon, label, value, color }: any) {
    const colors: any = {
        brand: 'text-brand-glow',
        emerald: 'text-emerald-400',
        rose: 'text-rose-400',
        cyan: 'text-cyan-400',
        slate: 'text-slate-400'
    };

    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-white/2 border border-white/5 group-hover:border-white/10 transition-colors ${colors[color]}`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            </div>
            <span className={`text-sm font-display font-black group-hover:scale-110 transition-transform ${colors[color]}`}>{value}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        unused: 'text-brand-glow bg-brand-glow/10 border-brand-glow/20',
        passed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        failed: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
        submitted: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.unused}`}>
            {status}
        </span>
    );
}
