import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { surveys } from '../services/api';
import {
    Save,
    ArrowLeft,
    AlertCircle,
    Wand2,
    ShieldCheck,
    Database,
    Globe,
    Users,
    ChevronRight,
    Lock,
    Settings,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import FormAssistantModal from '../components/surveys/FormAssistantModal';

export default function SurveyEdit() {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    useEffect(() => {
        if (surveyId) {
            surveys.get(surveyId)
                .then(setSurvey)
                .catch(() => toast.error('Failed to load survey configuration'))
                .finally(() => setLoading(false));
        }
    }, [surveyId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (survey.status !== 'draft') {
            toast.error('Immutable records cannot be modified after activation');
            return;
        }

        setSaving(true);
        try {
            await surveys.update(surveyId!, survey);
            toast.success('Configuration synchronized successfully');
            navigate('/dashboard');
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Failed to update configuration';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-t-brand-accent border-white/10 animate-spin"></div>
        </div>
    );

    if (!survey) return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center">
            <div className="p-6 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
                <AlertCircle className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="text-2xl font-display font-black">Configuration <span className="text-rose-500">Not Found</span></h2>
            <Link to="/dashboard" className="mt-6 text-brand-glow font-black uppercase tracking-widest text-xs hover:underline">Return to Control Center</Link>
        </div>
    );

    const isReadOnly = survey.status !== 'draft';

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
                            Control <span className="text-brand-glow">Center</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight">
                        Edit <span className="text-slate-500 font-light">Configuration</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Fine-tune deployment rules for <span className="text-white">{survey.company_name}</span></p>
                </div>

                <AnimatePresence>
                    {isReadOnly && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-brand-accent/5 border border-brand-accent/20 px-6 py-3 rounded-2xl flex items-center gap-3 text-brand-glow"
                        >
                            <Lock className="w-4 h-4" />
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-slate-500">Status: {survey.status.toUpperCase()}</p>
                                <p className="text-xs font-bold">Read-only Protection Active</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Identity & Infrastructure */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-[2.5rem] p-10 border border-white/5"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent">
                                    <Database className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-display font-black">Routing <span className="text-brand-glow">& Schema</span></h3>
                            </div>

                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={() => setIsAssistantOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-brand-accent/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-glow transition-all"
                                >
                                    <Wand2 className="w-3 h-3" />
                                    Launch Assistant
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Entity Name</label>
                                <input
                                    type="text"
                                    disabled={isReadOnly}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-accent/50 focus:ring-4 focus:ring-brand-accent/10 transition-all font-bold disabled:opacity-30"
                                    value={survey.company_name}
                                    onChange={e => setSurvey({ ...survey, company_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Google Form ID</label>
                                <input
                                    type="text"
                                    disabled={isReadOnly}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-accent/50 transition-all font-bold disabled:opacity-30"
                                    value={survey.google_form_id}
                                    onChange={e => setSurvey({ ...survey, google_form_id: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Handoff URL</label>
                                <div className="relative group">
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-glow transition-colors pointer-events-none" />
                                    <input
                                        type="text"
                                        disabled={isReadOnly}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-brand-glow/50 transition-all font-mono text-[10px] font-bold disabled:opacity-30"
                                        value={survey.google_form_url}
                                        onChange={e => setSurvey({ ...survey, google_form_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Qualification Logic */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-[2.5rem] p-10 border border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-display font-black">Gatekeeper <span className="text-emerald-400">Rules</span></h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Lower Age Limit</label>
                                <input
                                    type="number"
                                    disabled={isReadOnly}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-400/50 transition-all font-bold disabled:opacity-30"
                                    value={survey.layer1_rules.age_min || ''}
                                    onChange={e => setSurvey({
                                        ...survey,
                                        layer1_rules: { ...survey.layer1_rules, age_min: parseInt(e.target.value) || null }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Upper Age Limit</label>
                                <input
                                    type="number"
                                    disabled={isReadOnly}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-400/50 transition-all font-bold disabled:opacity-30"
                                    value={survey.layer1_rules.age_max || ''}
                                    onChange={e => setSurvey({
                                        ...survey,
                                        layer1_rules: { ...survey.layer1_rules, age_max: parseInt(e.target.value) || null }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender Targeting</label>
                                <div className="relative group">
                                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                                    <select
                                        disabled={isReadOnly}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-10 py-4 text-white focus:outline-none focus:border-emerald-400/50 transition-all font-bold appearance-none cursor-pointer disabled:opacity-30"
                                        value={survey.layer1_rules.gender || ''}
                                        onChange={e => setSurvey({
                                            ...survey,
                                            layer1_rules: { ...survey.layer1_rules, gender: e.target.value || null }
                                        })}
                                    >
                                        <option value="">Inclusive (Any)</option>
                                        <option value="male">Target: Male</option>
                                        <option value="female">Target: Female</option>
                                    </select>
                                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 pointer-events-none rotate-90" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-[2rem] p-8 border border-white/5 sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="w-5 h-5 text-slate-500" />
                            <h3 className="text-lg font-display font-black">Persistence</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-500">Node Sync</span>
                                <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Ready</span>
                            </div>

                            <div className="w-full h-px bg-white/5"></div>

                            {!isReadOnly ? (
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-premium w-full py-4 text-white flex items-center justify-center gap-2 group shadow-lg shadow-brand-accent/20 font-black tracking-widest uppercase text-xs"
                                >
                                    {saving ? <Clock className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Save Changes
                                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="p-4 bg-white/2 border border-white/5 rounded-2xl text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Protection State</p>
                                    <p className="text-xs font-bold text-slate-300">Active surveys cannot be reconfigured to maintain integrity.</p>
                                </div>
                            )}

                            <Link to="/dashboard" className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all rounded-xl text-center text-xs font-black uppercase tracking-widest">
                                Return to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </form>

            <FormAssistantModal
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                initialUrl={survey.google_form_url}
                onSave={(url) => {
                    setSurvey({ ...survey, google_form_url: url });
                    setIsAssistantOpen(false);
                    toast.success('Pre-fill mapping updated');
                }}
            />
        </div>
    );
}
