import React, { useEffect, useState } from 'react';
import { templates } from '../services/api';
import {
    History,
    Trash2,
    Edit3,
    Layers,
    Sparkles,
    X,
    RotateCcw,
    CheckCircle2,
    Upload,
    Plus,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionBlock from '../components/TemplateEditor/QuestionBlock';

interface TemplateState {
    _id?: string;
    name: string;
    type: string;
    layer1_questions: any[];
    layer1_structure: {
        sections: any[];
    };
    layer2_structure: {
        sections: any[];
    };
}

export default function Templates() {
    const [templateList, setTemplateList] = useState([]);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistoryName, setShowHistoryName] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeLayer, setActiveLayer] = useState<1 | 2>(1);
    const [currentTemplate, setCurrentTemplate] = useState<TemplateState>({
        name: '',
        type: 'taste_test',
        layer1_questions: [],
        layer1_structure: {
            sections: [
                {
                    title: 'Respondent Information',
                    questions: [
                        { id: 'name', label: 'Full Name', type: 'text', required: true },
                        { id: 'age_auto', label: 'Age Range', type: 'mcq', options: ['12-18', '19-25', '26-40', '41-60'], required: true },
                        { id: 'gender_auto', label: 'Gender', type: 'mcq', options: ['Male', 'Female'], required: true },
                        { id: 'area', label: 'Area', type: 'text', required: true },
                        { id: 'email', label: 'Email Address', type: 'email', required: true }
                    ]
                }
            ]
        },
        layer2_structure: { sections: [] }
    } as any);

    const fetchTemplates = async () => {
        setLoading(true);
        const data = await templates.list();
        setTemplateList(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure layer1_questions is synced from layer1_structure for backend compatibility if needed
        const flatL1 = (currentTemplate as any).layer1_structure?.sections?.flatMap((s: any) => s.questions || []) || [];
        const templateToSave = {
            ...currentTemplate,
            layer1_questions: flatL1
        };

        if (isEditing && (currentTemplate as any)._id) {
            await templates.update((currentTemplate as any)._id, templateToSave);
        } else {
            await templates.create(templateToSave);
        }
        setIsEditing(false);
        setCurrentTemplate({
            name: '',
            type: 'taste_test',
            layer1_questions: [],
            layer1_structure: { sections: [] },
            layer2_structure: { sections: [] }
        } as any);
        fetchTemplates();
    };

    const handleEdit = (template: any) => {
        // Migration helper: If layer1_structure is empty but layer1_questions has data
        let migratedTemplate = { ...template };
        if ((!template.layer1_structure || !template.layer1_structure.sections || template.layer1_structure.sections.length === 0) && template.layer1_questions?.length > 0) {
            migratedTemplate.layer1_structure = {
                sections: [{
                    title: 'Initial Screening',
                    questions: template.layer1_questions
                }]
            };
        }

        // Ensure structures exist with sections array
        if (!migratedTemplate.layer1_structure || !migratedTemplate.layer1_structure.sections) {
            migratedTemplate.layer1_structure = { sections: [] };
        }
        if (!migratedTemplate.layer2_structure || !migratedTemplate.layer2_structure.sections) {
            migratedTemplate.layer2_structure = { sections: [] };
        }

        setCurrentTemplate(migratedTemplate);
        setIsEditing(true);
        setActiveLayer(1);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Archive this template schema?')) {
            await templates.delete(id);
            fetchTemplates();
        }
    };

    const handleViewHistory = async (name: string) => {
        const data = await templates.getHistory(name);
        setHistory(data);
        setShowHistoryName(name);
    };

    const handleRollback = async (id: string) => {
        if (window.confirm('Rollback to this version? A new version will be committed.')) {
            await templates.rollback(id);
            fetchTemplates();
            if (showHistoryName) handleViewHistory(showHistoryName);
        }
    };

    if (loading && templateList.length === 0) return null;

    const renderLayerEditor = (layer: 1 | 2) => {
        const structureKey = layer === 1 ? 'layer1_structure' : 'layer2_structure';
        const layerData = (currentTemplate as any)[structureKey];
        const sections = layerData?.sections || [];

        const config = layer === 1 ? {
            accent: 'text-brand-glow',
            bg: 'bg-brand-glow/10',
            border: 'border-brand-glow/20',
            shadow: 'shadow-brand-glow/20',
            title: 'Screening Phase',
            sub: '(Layer 1)',
            indicator: 'bg-brand-glow/30',
            indicatorHover: 'group-hover/section:bg-brand-glow',
            addBtnBorder: 'hover:border-brand-glow/30',
            addBtnBg: 'hover:bg-brand-glow/5',
            addBtnText: 'hover:text-brand-glow',
            newSectionBg: 'bg-brand-glow/5',
            newSectionBorder: 'border-brand-glow/10',
            newSectionBorderHover: 'hover:border-brand-glow/30',
            newSectionBgHover: 'hover:bg-brand-glow/10',
            newSectionText: 'text-brand-glow',
            newSectionIconBg: 'bg-brand-glow/10'
        } : {
            accent: 'text-brand-accent',
            bg: 'bg-brand-accent/10',
            border: 'border-brand-accent/20',
            shadow: 'shadow-brand-accent/20',
            title: 'Evaluation Modules',
            sub: '(Layer 2)',
            indicator: 'bg-brand-accent/30',
            indicatorHover: 'group-hover/section:bg-brand-accent',
            addBtnBorder: 'hover:border-brand-accent/30',
            addBtnBg: 'hover:bg-brand-accent/5',
            addBtnText: 'hover:text-brand-accent',
            newSectionBg: 'bg-brand-accent/5',
            newSectionBorder: 'border-brand-accent/10',
            newSectionBorderHover: 'hover:border-brand-accent/30',
            newSectionBgHover: 'hover:bg-brand-accent/10',
            newSectionText: 'text-brand-accent',
            newSectionIconBg: 'bg-brand-accent/10'
        };

        return (
            <div className="space-y-12">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${config.accent} font-black border ${config.border} shadow-lg ${config.shadow} transition-all`}>
                            {layer}
                        </div>
                        <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">
                            {config.title} <span className="text-slate-500 text-sm ml-2 font-bold">{config.sub}</span>
                        </h3>
                    </div>
                </div>

                {sections.map((section: any, sIdx: number) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={sIdx}
                        className="space-y-8 bg-white/[0.03] rounded-[3rem] p-12 border border-white/10 relative group/section shadow-2xl backdrop-blur-sm"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex-1 flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center ${config.accent} border ${config.border} shadow-inner group-hover/section:scale-110 transition-transform`}>
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Module Area</label>
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => {
                                            const newSections = [...layerData.sections];
                                            newSections[sIdx].title = e.target.value;
                                            setCurrentTemplate({ ...currentTemplate, [structureKey]: { ...layerData, sections: newSections } });
                                        }}
                                        className="bg-transparent text-3xl font-display font-black text-white border-b-2 border-transparent focus:border-brand-glow outline-none pb-2 flex-1 w-full transition-all"
                                        placeholder="Name this section..."
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newSections = sections.filter((_: any, idx: number) => idx !== sIdx);
                                    setCurrentTemplate({ ...currentTemplate, [structureKey]: { ...layerData, sections: newSections } });
                                }}
                                className="p-3 text-slate-500 hover:text-red-400 transition-colors hover:bg-red-400/5 rounded-xl"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(section.questions || []).map((q: any, qIdx: number) => (
                                <QuestionBlock
                                    key={q.id || qIdx}
                                    question={q}
                                    showGatekeeper={layer === 1}
                                    onUpdate={(updated) => {
                                        const newSections = sections.map((s: any, idx: number) => {
                                            if (idx !== sIdx) return s;
                                            const newQs = [...(s.questions || [])];
                                            newQs[qIdx] = updated;
                                            return { ...s, questions: newQs };
                                        });
                                        setCurrentTemplate({ ...currentTemplate, [structureKey]: { ...layerData, sections: newSections } });
                                    }}
                                    onDelete={() => {
                                        const newQuestions = (section.questions || []).filter((_: any, idx: number) => idx !== qIdx);
                                        const newSections = sections.map((s: any, idx: number) => idx === sIdx ? { ...s, questions: newQuestions } : s);
                                        setCurrentTemplate({ ...currentTemplate, [structureKey]: { ...layerData, sections: newSections } });
                                    }}
                                />
                            ))}
                        </div>

                        <motion.button
                            layout
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                const newSections = sections.map((s: any, idx: number) => {
                                    if (idx !== sIdx) return s;
                                    return {
                                        ...s,
                                        questions: [...(s.questions || []), {
                                            id: `${layer === 1 ? 'S' : 'Q'}${s.questions?.length + 1}`,
                                            text: '',
                                            label: '',
                                            options: layer === 1 ? ['Yes', 'No'] : ['1', '2', '3', '4', '5'],
                                            type: layer === 1 ? 'mcq' : 'scale'
                                        }]
                                    };
                                });
                                setCurrentTemplate({ ...currentTemplate, [structureKey]: { ...layerData, sections: newSections } });
                            }}
                            className={`w-full py-6 rounded-2xl border-2 border-dashed border-white/5 ${config.addBtnBorder} ${config.addBtnBg} transition-all text-[10px] font-black uppercase tracking-widest text-slate-500 ${config.addBtnText} flex items-center justify-center gap-3 group/addQ`}
                        >
                            <div className="p-2 rounded-lg bg-white/5 group-hover/addQ:bg-white/10 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                            Append New Logic Probe
                        </motion.button>
                    </motion.div>
                ))}

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        const curStruct = (currentTemplate as any)[structureKey];
                        const curSections = curStruct?.sections || [];
                        setCurrentTemplate({
                            ...currentTemplate,
                            [structureKey]: {
                                ...curStruct,
                                sections: [...curSections, { title: 'New Module', questions: [] }]
                            }
                        });
                    }}
                    className={`w-full py-16 rounded-[4rem] ${config.newSectionBg} border-2 border-dashed ${config.newSectionBorder} ${config.newSectionBorderHover} ${config.newSectionBgHover} transition-all flex flex-col items-center justify-center gap-4 ${config.newSectionText} group/newS shadow-lg`}
                >
                    <div className={`p-5 rounded-[2rem] ${config.newSectionIconBg} group-hover/newS:scale-110 group-hover/newS:rotate-90 transition-all duration-500`}>
                        <Plus className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-black tracking-[0.3em] uppercase text-[10px] mb-1">Architectural expansion</span>
                        <span className="text-xl font-display font-black opacity-80 group-hover/newS:opacity-100">Add New Module</span>
                    </div>
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-display font-extrabold tracking-tight">
                        Template <span className="text-brand-glow">Explorer</span>
                    </h1>
                    <p className="mt-2 text-slate-400 max-w-xl">
                        Design and version-control your multi-layered survey schemas.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setIsEditing(true);
                            setCurrentTemplate({
                                name: '',
                                type: 'taste_test',
                                layer1_questions: [],
                                layer1_structure: {
                                    sections: [
                                        {
                                            title: 'Respondent Information',
                                            questions: [
                                                { id: 'name', label: 'Full Name', type: 'text', required: true },
                                                { id: 'age_auto', label: 'Age Range', type: 'mcq', options: ['12-18', '19-25', '26-40', '41-60'], required: true },
                                                { id: 'gender_auto', label: 'Gender', type: 'mcq', options: ['Male', 'Female'], required: true },
                                                { id: 'area', label: 'Area', type: 'text', required: true },
                                                { id: 'email', label: 'Email Address', type: 'email', required: true }
                                            ]
                                        }
                                    ]
                                },
                                layer2_structure: { sections: [] }
                            } as any);
                            setActiveLayer(1);
                        }}
                        className="btn-premium flex items-center gap-2 group shadow-lg shadow-brand-accent/20"
                    >
                        Blueprint New Template
                    </button>

                    <div className="relative">
                        <input
                            type="file"
                            id="template-upload"
                            className="hidden"
                            accept=".xlsx,.xls,.csv"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    try {
                                        setLoading(true);
                                        await (templates as any).upload(file);
                                        const data = await templates.list();
                                        setTemplateList(data);
                                    } catch (err) {
                                        console.error('Upload failed:', err);
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                        />
                        <label
                            htmlFor="template-upload"
                            className="btn-premium flex items-center gap-2 group shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                        >
                            <Upload className="w-5 h-5" />
                            Import XLSX
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Templates Grid */}
                <div className="xl:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {templateList.map((t: any, idx) => (
                                <TemplateCard
                                    key={t._id}
                                    template={t}
                                    idx={idx}
                                    onEdit={() => handleEdit(t)}
                                    onHistory={() => handleViewHistory(t.name)}
                                    onDelete={() => handleDelete(t._id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Info panel */}
                <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-8 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-brand-accent/10 text-brand-accent">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold font-display">Optimization Tip</h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Use <code className="text-brand-glow">Layer 1</code> for rapid qualification.
                            Keep it under 5 questions for maximum participant retention.
                        </p>
                    </div>

                    <div className="glass-card rounded-3xl p-8 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold font-display">Schema Versioning</h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Each save creates a new immutable version. You can rollback any live campaign to a previous schema state instantly.
                        </p>
                    </div>
                </div>
            </div>

            {/* Editor Modal/Panel */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditing(false)}
                            className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-6xl h-[92vh] glass-card rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col bg-slate-950/80"
                        >
                            {/* Editor Header */}
                            <div className="flex flex-col border-b border-white/5 bg-white/5">
                                <div className="flex justify-between items-center px-12 py-8">
                                    <div>
                                        <h2 className="text-3xl font-display font-black text-white">
                                            Template <span className="text-brand-glow">Architect</span>
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Design Studio</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSubmit(e);
                                            }}
                                            className="btn-premium py-4 px-10 text-xs font-black flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 group/commit"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover/commit:scale-110 transition-transform">
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            </div>
                                            COMMIT SCHEMA
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditing(false);
                                            }}
                                            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Switcher */}
                                <div className="flex px-12 pb-6 gap-8">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setActiveLayer(1); }}
                                        className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeLayer === 1 ? 'text-brand-glow' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        1. Screening (L1)
                                        {activeLayer === 1 && (
                                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-glow rounded-full shadow-[0_0_10px_rgba(var(--brand-glow-rgb),0.5)]" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setActiveLayer(2); }}
                                        className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeLayer === 2 ? 'text-brand-accent' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        2. Evaluation (L2)
                                        {activeLayer === 2 && (
                                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent rounded-full shadow-[0_0_10px_rgba(var(--brand-accent-rgb),0.5)]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                                <div className="max-w-4xl mx-auto space-y-12 pb-32">
                                    {/* Global Metadata */}
                                    <div className="glass-card rounded-[2.5rem] p-10 border border-white/10 bg-white/5 space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-brand-glow shadow-[0_0_20px_rgba(var(--brand-glow-rgb),0.5)]" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Template Identity</label>
                                                <input
                                                    type="text"
                                                    value={currentTemplate.name}
                                                    onChange={e => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                                                    className="w-full bg-transparent text-4xl font-display font-black border-b-2 border-white/10 focus:border-brand-glow outline-none pb-4 transition-all placeholder:text-white/10"
                                                    placeholder="Untitled Schema"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Industry Context</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:ring-2 focus:ring-brand-glow appearance-none mt-2"
                                                        value={currentTemplate.type}
                                                        onChange={e => setCurrentTemplate({ ...currentTemplate, type: e.target.value })}
                                                    >
                                                        <option value="taste_test">Taste Test</option>
                                                        <option value="consumer_habit">Consumer Habit</option>
                                                        <option value="b2b_qualification">B2B Qualification</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dynamic Layer Editor */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeLayer}
                                            initial={{ opacity: 0, x: activeLayer === 1 ? -20 : 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: activeLayer === 1 ? 20 : -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {renderLayerEditor(activeLayer)}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Floating Metadata Indicator */}
                            <div className="absolute bottom-8 right-12 z-50">
                                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4 text-xs font-bold text-slate-400 shadow-2xl">
                                    <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                                        <span className="text-brand-glow">L1:</span> {(currentTemplate as any).layer1_structure?.sections?.length || 0} Sec
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-brand-accent">L2:</span> {(currentTemplate as any).layer2_structure?.sections?.length || 0} Sec
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History Side Panel */}
            <AnimatePresence>
                {showHistoryName && (
                    <div className="fixed inset-0 z-[110] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistoryName(null)}
                            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-brand-dark/80 backdrop-blur-3xl h-full border-l border-white/10 shadow-2xl p-10 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-2xl font-display font-black">{showHistoryName}</h2>
                                    <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">Audit Trail & Versioning</p>
                                </div>
                                <button onClick={() => setShowHistoryName(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {history.map((h, i) => (
                                    <div key={h._id} className={`p-6 rounded-2xl border transition-all ${i === 0 ? 'bg-brand-accent/10 border-brand-accent/30' : 'bg-white/5 border-white/5'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-brand-accent text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                    v{h.version}
                                                </span>
                                                {i === 0 && <span className="text-[10px] font-black uppercase text-brand-glow bg-brand-glow/10 px-2 py-0.5 rounded-full">Active</span>}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500">
                                                {new Date(h.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="text-xs text-slate-400 mb-6 font-medium">
                                            Contains {h.layer1_questions.length} logical probes for the <span className="text-slate-200">{h.type}</span> flow.
                                        </div>

                                        <button
                                            onClick={() => handleRollback(h._id)}
                                            disabled={i === 0}
                                            className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            Restore Point
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}

function TemplateCard({ template, idx, onEdit, onHistory, onDelete }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card rounded-[2rem] p-8 border border-white/5 hover:border-brand-accent/30 transition-all group relative overflow-hidden flex flex-col"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-accent/20 transition-all"></div>

            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-all">
                    <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">v{template.version || 1}</span>
                </div>
            </div>

            <div className="relative z-10 flex-1">
                <h3 className="text-xl font-display font-black text-white mb-2 group-hover:text-brand-glow transition-colors">{template.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">{template.type.replace('_', ' ')}</p>

                <div className="flex items-center gap-4 py-4 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />
                        {template.layer1_questions.length} Probes
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-brand-glow" />
                        L1 Active
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-3 gap-2">
                <button onClick={onEdit} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center group/btn transition-all">
                    <Edit3 className="w-4 h-4 text-slate-400 group-hover/btn:text-white" />
                </button>
                <button onClick={onHistory} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center group/btn transition-all">
                    <History className="w-4 h-4 text-slate-400 group-hover/btn:text-white" />
                </button>
                <button onClick={onDelete} className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 flex items-center justify-center group/btn transition-all">
                    <Trash2 className="w-4 h-4 text-slate-500 group-hover/btn:text-rose-400" />
                </button>
            </div>
        </motion.div>
    );
}
