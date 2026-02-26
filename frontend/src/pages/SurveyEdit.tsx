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
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-brand-blue animate-spin shadow-inner"></div>
        </div>
    );

    if (!survey) return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center">
            <div className="p-8 rounded-[2.5rem] bg-brand-red/5 border border-brand-red/10 mb-8 shadow-xl text-brand-red">
                <AlertCircle className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-display font-black text-slate-900">Configuration <span className="text-brand-red">Not Found</span></h2>
            <Link to="/dashboard" className="mt-8 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm">Return to Control Center</Link>
        </div>
    );

    const isReadOnly = survey.status !== 'draft';

    return (
        <div className="space-y-10">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-left">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                            Control <span className="text-brand-blue">Center</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tight text-slate-900">
                        Edit <span className="text-slate-400 font-light">Configuration</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Fine-tune deployment rules for <span className="text-slate-900 font-black">{survey.company_name}</span></p>
                </div>

                <AnimatePresence>
                    {isReadOnly && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-brand-red/5 border border-brand-red/20 px-8 py-4 rounded-[2rem] flex items-center gap-4 text-brand-red shadow-xl"
                        >
                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 text-brand-red/60">Status: {survey.status.toUpperCase()}</p>
                                <p className="text-xs font-black uppercase tracking-tight">Read-only Protection Active</p>
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
                        className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl text-left"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-brand-blue/5 text-brand-blue border border-brand-blue/10">
                                    <Database className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-display font-black text-slate-900">Routing <span className="text-brand-blue">& Schema</span></h3>
                            </div>

                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={() => setIsAssistantOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 hover:bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-blue transition-all shadow-sm hover:shadow-md hover:border-brand-blue/20"
                                >
                                    <Wand2 className="w-3 h-3" />
                                    Launch Assistant
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entity Name</label>
                                <input
                                    type="text"
                                    disabled={isReadOnly}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold disabled:opacity-30 shadow-inner"
                                    value={survey.company_name}
                                    onChange={e => setSurvey({ ...survey, company_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Google Form ID</label>
                                <input
                                    type="text"
                                    disabled={isReadOnly}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-brand-blue/50 transition-all font-bold disabled:opacity-30 shadow-inner"
                                    value={survey.google_form_id}
                                    onChange={e => setSurvey({ ...survey, google_form_id: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Handoff URL</label>
                                <div className="relative group">
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                                    <input
                                        type="text"
                                        disabled={isReadOnly}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-slate-900 focus:outline-none focus:border-brand-blue/50 transition-all font-mono text-[10px] font-bold disabled:opacity-30 shadow-inner"
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
                        className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl text-left"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-display font-black text-slate-900">Gatekeeper <span className="text-emerald-600">Rules</span></h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lower Age Limit</label>
                                <input
                                    type="number"
                                    disabled={isReadOnly}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-emerald-500/50 transition-all font-bold disabled:opacity-30 shadow-inner"
                                    value={survey.layer1_rules.age_min || ''}
                                    onChange={e => setSurvey({
                                        ...survey,
                                        layer1_rules: { ...survey.layer1_rules, age_min: parseInt(e.target.value) || null }
                                    })}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Upper Age Limit</label>
                                <input
                                    type="number"
                                    disabled={isReadOnly}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-emerald-500/50 transition-all font-bold disabled:opacity-30 shadow-inner"
                                    value={survey.layer1_rules.age_max || ''}
                                    onChange={e => setSurvey({
                                        ...survey,
                                        layer1_rules: { ...survey.layer1_rules, age_max: parseInt(e.target.value) || null }
                                    })}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender Targeting</label>
                                <div className="relative group">
                                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                                    <select
                                        disabled={isReadOnly}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-slate-900 focus:outline-none focus:border-emerald-500/50 transition-all font-bold appearance-none cursor-pointer disabled:opacity-30 shadow-inner"
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
                                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none rotate-90" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl sticky top-24 text-left">
                        <div className="flex items-center gap-3 mb-8">
                            <Settings className="w-6 h-6 text-brand-blue" />
                            <h3 className="text-xl font-display font-black text-slate-900">Persistence</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">Node Sync</span>
                                <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Ready</span>
                            </div>

                            <div className="w-full h-px bg-slate-100"></div>

                            {!isReadOnly ? (
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-5 bg-brand-blue text-white rounded-2xl flex items-center justify-center gap-3 group shadow-xl shadow-brand-blue/10 hover:shadow-brand-blue/20 transition-all font-black tracking-widest uppercase text-xs"
                                >
                                    {saving ? <Clock className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            Save Changes
                                            <Save className="w-5 h-5 group-hover:scale-110 transition-all" />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Protection State</p>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed">Active surveys cannot be reconfigured to maintain integrity.</p>
                                </div>
                            )}

                            <Link to="/dashboard" className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all rounded-xl text-center text-xs font-black uppercase tracking-widest block shadow-sm">
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
