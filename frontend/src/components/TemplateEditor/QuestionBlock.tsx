import { Trash2, GripVertical, CheckCircle2, Type, Hash, List, ShieldCheck, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionBlockProps {
    question: any;
    showGatekeeper?: boolean;
    onUpdate: (data: any) => void;
    onDelete: () => void;
}

const TYPE_CONFIG: any = {
    mcq: { icon: List, label: 'Multiple Choice', color: 'text-brand-glow', bg: 'bg-brand-glow/10', border: 'border-brand-glow/20' },
    scale: { icon: Hash, label: 'Rating Scale', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/20' },
    text: { icon: Type, label: 'Short Answer', color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20' }
};

export default function QuestionBlock({ question, showGatekeeper = true, onUpdate, onDelete }: QuestionBlockProps) {
    const qType = question.type || 'mcq';
    const config = TYPE_CONFIG[qType] || TYPE_CONFIG.mcq;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative"
        >
            <div className="glass-card rounded-[2rem] p-8 border border-white/5 hover:border-white/10 transition-all bg-slate-900/40 shadow-xl overflow-hidden">
                {/* Visual Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.bg} ${config.color.replace('text-', 'bg-')} shadow-[0_0_15px_rgba(var(--brand-glow-rgb),0.3)]`} />

                <div className="flex gap-8">
                    {/* Reorder Handle */}
                    <div className="hidden md:flex flex-col items-center gap-2 pt-2">
                        <div className="cursor-grab active:cursor-grabbing p-2 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                            <GripVertical className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-8">
                        {/* Question Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-[10px] font-black uppercase tracking-widest border ${config.border} flex items-center gap-1.5`}>
                                        <config.icon className="w-3 h-3" />
                                        {config.label}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ID: {question.id}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                    className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <input
                                type="text"
                                value={question.label || question.text || ''}
                                onChange={(e) => onUpdate({ ...question, label: e.target.value, text: e.target.value })}
                                placeholder="Enter your question here..."
                                className="w-full bg-transparent text-2xl font-display font-black text-white border-b-2 border-transparent focus:border-brand-glow outline-none pb-4 transition-all placeholder:text-white/5"
                            />
                        </div>

                        {/* Question Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Controls / Options */}
                            <div className="lg:col-span-8 space-y-6">
                                <AnimatePresence mode="wait">
                                    {qType === 'text' ? (
                                        <motion.div
                                            key="text"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-slate-500 text-sm italic font-medium"
                                        >
                                            Participants will provide a short text response.
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="options"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-6"
                                        >
                                            {showGatekeeper && (
                                                <div className="flex items-center justify-between px-2 bg-slate-950/20 py-3 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-white">Gatekeeper Protocol</div>
                                                            <div className="text-[9px] text-slate-500 font-bold">Select the required answer for qualification</div>
                                                        </div>
                                                    </div>
                                                    {question.correct_answer && (
                                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Logic Active</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                {(question.options || []).map((opt: string, i: number) => (
                                                    <motion.div
                                                        layout
                                                        key={i}
                                                        className="flex items-center gap-4 group/option"
                                                    >
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    type="button"
                                                                    disabled={!showGatekeeper}
                                                                    onClick={() => {
                                                                        if (!showGatekeeper) return;
                                                                        if (question.correct_answer === opt) {
                                                                            onUpdate({ ...question, correct_answer: null });
                                                                        } else {
                                                                            onUpdate({ ...question, correct_answer: opt });
                                                                        }
                                                                    }}
                                                                    className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden ${showGatekeeper
                                                                        ? (question.correct_answer === opt && opt !== ''
                                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                                                                            : 'bg-slate-950/40 border-white/10 text-slate-600 hover:border-emerald-500/50 hover:bg-emerald-500/5 group/gatekeeper cursor-pointer')
                                                                        : 'bg-slate-950/20 border-white/5 text-slate-500 cursor-default'
                                                                        }`}
                                                                >
                                                                    {showGatekeeper ? (
                                                                        question.correct_answer === opt && opt !== '' ? (
                                                                            <motion.div
                                                                                initial={{ scale: 0, rotate: -90 }}
                                                                                animate={{ scale: 1, rotate: 0 }}
                                                                                className="flex flex-col items-center gap-1"
                                                                            >
                                                                                <ShieldCheck className="w-6 h-6" />
                                                                                <span className="text-[7px] font-black uppercase">PASS</span>
                                                                            </motion.div>
                                                                        ) : (
                                                                            <div className="flex flex-col items-center gap-1 group-hover/gatekeeper:text-emerald-500 transition-colors">
                                                                                <span className="text-sm font-black">{i + 1}</span>
                                                                                <span className="text-[7px] font-black opacity-40 uppercase">GATE</span>
                                                                            </div>
                                                                        )
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <span className="text-sm font-black">{i + 1}</span>
                                                                        </div>
                                                                    )}
                                                                </button>

                                                                <div className="flex-1 relative">
                                                                    <input
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => {
                                                                            const newOpts = [...(question.options || [])];
                                                                            newOpts[i] = e.target.value;
                                                                            const update: any = { options: newOpts };
                                                                            if (question.correct_answer === opt) {
                                                                                update.correct_answer = e.target.value;
                                                                            }
                                                                            onUpdate({ ...question, ...update });
                                                                        }}
                                                                        className={`w-full bg-slate-950/60 border rounded-[1.25rem] px-6 py-5 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-700 ${question.correct_answer === opt && opt !== ''
                                                                            ? 'border-emerald-500/50 ring-4 ring-emerald-500/5 shadow-inner'
                                                                            : 'border-white/5 focus:border-brand-glow/30'
                                                                            }`}
                                                                        placeholder={`Option Value...`}
                                                                    />
                                                                    {question.correct_answer === opt && opt !== '' && (
                                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 shadow-sm">
                                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Correct Response</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const newOpts = question.options.filter((_: any, idx: number) => idx !== i);
                                                                        const update: any = { options: newOpts };
                                                                        if (question.correct_answer === opt) {
                                                                            update.correct_answer = null;
                                                                        }
                                                                        onUpdate({ ...question, ...update });
                                                                    }}
                                                                    className="p-4 text-slate-600 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all opacity-0 group-hover/option:opacity-100"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                <motion.button
                                                    layout
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdate({ ...question, options: [...(question.options || []), ''] });
                                                    }}
                                                    className="w-full py-4 rounded-2xl border-2 border-dashed border-white/5 hover:border-brand-glow/30 hover:bg-brand-glow/5 transition-all text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-brand-glow flex items-center justify-center gap-3 group/add"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover/add:rotate-90 transition-transform">
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                    Extend Option Matrix
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Configuration */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Behavior Mode</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {Object.entries(TYPE_CONFIG).map(([key, cfg]: [string, any]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const update: any = { type: key };
                                                    if (key === 'text') {
                                                        update.options = [];
                                                    } else if (!question.options || question.options.length === 0) {
                                                        update.options = key === 'scale' ? ['1', '2', '3', '4', '5'] : ['Option 1'];
                                                    }
                                                    onUpdate({ ...question, ...update });
                                                }}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${qType === key
                                                    ? `${cfg.bg} ${cfg.border} shadow-lg shadow-${key === 'mcq' ? 'brand-glow' : key === 'scale' ? 'brand-cyan' : 'brand-accent'}/10`
                                                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}`}
                                            >
                                                <div className={`p-2 rounded-xl ${qType === key ? cfg.bg : 'bg-slate-800'}`}>
                                                    <cfg.icon className={`w-4 h-4 ${qType === key ? cfg.color : 'text-slate-500'}`} />
                                                </div>
                                                <div>
                                                    <div className={`text-xs font-black uppercase tracking-widest ${qType === key ? 'text-white' : 'text-slate-500'}`}>{cfg.label.split(' ')[0]}</div>
                                                    <div className="text-[10px] text-slate-600 font-bold">{key === 'mcq' ? 'Fixed Choices' : key === 'scale' ? 'Numeric Range' : 'Free Form'}</div>
                                                </div>
                                                {qType === key && <CheckCircle2 className={`w-4 h-4 ml-auto ${cfg.color}`} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
