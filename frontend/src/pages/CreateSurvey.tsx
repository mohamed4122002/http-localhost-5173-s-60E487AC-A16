import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { templates, surveys } from '../services/api';
import {
  ArrowLeft,
  Sparkles,
  Layout,
  ShieldCheck,
  Check,
  ChevronRight,
  Globe,
  Database,
  Copy,
  Download,
  ExternalLink,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function CreateSurvey() {
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company_name: '',
    template_id: '',
    customizations: {
      brands: [],
      category: '',
      modified_questions: []
    },
    google_form_id: '',
    google_form_url: '',
    link_count: 5 // Default provisioning
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    templates.list().then(setTemplateList);
  }, []);

  const nextStep = () => {
    if (currentStep === 1 && !formData.company_name) {
      toast.error('Please enter a company name');
      return;
    }
    if (currentStep === 2 && !formData.template_id) {
      toast.error('Please select an implementation blueprint');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.template_id) {
      toast.error('Please select an implementation blueprint');
      return;
    }

    if (formData.link_count <= 0) {
      toast.error('Respondent Pipeline cannot be empty. Please provision at least 1 link.');
      return;
    }

    setLoading(true);

    try {
      const res = await surveys.create(formData);
      setSuccessData(res);
      toast.success('Survey environment and tokens provisioned successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to initialize survey project');
    } finally {
      setLoading(false);
    }
  };

  const currentTemplate = templateList.find(t => t._id === formData.template_id);

  const steps = [
    { id: 1, name: 'Identity', icon: Layout },
    { id: 2, name: 'Blueprint', icon: Database },
    { id: 3, name: 'Provisioning', icon: Globe },
  ];

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
              Provisioning <span className="text-brand-glow">Engine</span>
            </div>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tight">
            Create <span className="text-slate-500 font-light">New Survey</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl">
            Configure a secure, gated survey environment with automated qualification rules and premium reporting.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="hidden lg:flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center gap-2 transition-all duration-500 ${currentStep === s.id ? 'text-brand-accent' : currentStep > s.id ? 'text-emerald-400' : 'text-slate-600'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${currentStep === s.id ? 'bg-brand-accent/10 border-brand-accent/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]' :
                  currentStep > s.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-transparent border-white/10'
                  }`}>
                  {currentStep > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
              </div>
              {idx < steps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-800" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Success / Link Studio Overlay */}
        <AnimatePresence>
          {successData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
            >
              <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-white/10 flex flex-col">
                <div className="p-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-brand-accent/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      Protocol Synchronized
                    </div>
                    <h2 className="text-3xl font-display font-black">Link <span className="text-brand-glow">Studio</span></h2>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Go to Dashboard
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Survey ID" value={successData._id.slice(-8).toUpperCase()} sub="Provisioned ID" />
                    <StatCard label="Link Count" value={successData.generated_tokens?.length || 0} sub="Unique Keys" />
                    <StatCard label="Security" value="One-Time" sub="State Invalidation" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key Registry</h4>
                      <button
                        onClick={() => {
                          const blob = new Blob([successData.generated_tokens.map((t: string) => `${window.location.origin}/s/${t}`).join('\n')], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `survey-links-${successData._id.slice(-6)}.txt`;
                          a.click();
                          toast.success('Registry downloaded');
                        }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-glow hover:text-white transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download Registry
                      </button>
                    </div>
                    <div className="space-y-3">
                      {successData.generated_tokens?.map((token: string, idx: number) => {
                        const url = `${window.location.origin}/s/${token}`;
                        return (
                          <div key={token} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all">
                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 font-mono">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono text-slate-400 truncate tracking-tight">{url}</p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(url);
                                toast.success(`Link ${idx + 1} copied`);
                              }}
                              className="p-2.5 rounded-xl bg-white/5 hover:bg-brand-accent/20 hover:text-brand-glow transition-all"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <a href={url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-400/20 hover:text-cyan-400 transition-all">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-900/50 border-t border-white/5 flex items-center justify-center gap-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System ready for deployment.</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {currentStep === 1 && (
                <div className="glass-card rounded-[2.5rem] p-10 border border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent">
                      <Layout className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-display font-black">Project <span className="text-brand-glow">Identity</span></h3>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Enterprise Entity Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Global Research Corp"
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-brand-accent/50 focus:ring-4 focus:ring-brand-accent/10 transition-all font-bold placeholder:text-slate-700 text-lg"
                        value={formData.company_name}
                        onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Respondent Pipeline</label>
                      <div className="relative group">
                        <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-accent transition-colors pointer-events-none" />
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          placeholder="Number of links to provision"
                          className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-6 py-5 text-white focus:outline-none focus:border-brand-accent/50 transition-all font-bold text-lg"
                          value={formData.link_count}
                          onChange={e => setFormData({ ...formData, link_count: parseInt(e.target.value) || 0 })}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-700 group-focus-within:text-brand-accent transition-colors text-right">
                          Keys
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="glass-card rounded-[2.5rem] p-10 border border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-brand-accent/10 text-brand-accent">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-display font-black">Blueprint <span className="text-brand-glow">Selection</span></h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templateList.map((t: any) => (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => setFormData({ ...formData, template_id: t._id })}
                        className={`text-left p-6 rounded-3xl border transition-all duration-300 group ${formData.template_id === t._id
                          ? 'bg-brand-accent/10 border-brand-accent/40 ring-4 ring-brand-accent/5'
                          : 'bg-white/2 border-white/5 hover:border-white/20 hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2 rounded-xl transition-all ${formData.template_id === t._id ? 'bg-brand-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'bg-white/5 text-slate-400 group-hover:text-slate-200'}`}>
                            <Layout className="w-4 h-4" />
                          </div>
                          {formData.template_id === t._id && <Check className="w-4 h-4 text-brand-glow" />}
                        </div>
                        <h4 className={`text-sm font-black uppercase tracking-widest mb-1 transition-colors ${formData.template_id === t._id ? 'text-white' : 'text-slate-400'}`}>
                          {t.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {t.type.replace('_', ' ')} architecture
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="glass-card rounded-[2.5rem] p-10 border border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-display font-black">Data <span className="text-cyan-400">Endpoint</span></h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Google Form ID</label>
                        <input
                          type="text"
                          placeholder="1FAIpQLS..."
                          className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all font-bold"
                          value={formData.google_form_id}
                          onChange={e => setFormData({ ...formData, google_form_id: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Secure Delivery URL</label>
                        <input
                          type="url"
                          placeholder="https://docs.google.com/forms/..."
                          className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400/50 transition-all font-bold"
                          value={formData.google_form_url}
                          onChange={e => setFormData({ ...formData, google_form_url: e.target.value })}
                          required
                        />
                      </div>
                      <div className={`p-4 rounded-xl border transition-all ${formData.google_form_url.includes('{token}') ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/10'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {formData.google_form_url.includes('{token}') ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">URL Integrity</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500">
                          {formData.google_form_url.includes('{token}') ? "Token injection verified." : "Placeholder {token} missing in URL."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Setup Assistant Integrated */}
                  <div className="p-10 bg-indigo-500/5 rounded-[3.5rem] border border-indigo-500/10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-indigo-400/10 text-indigo-400">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-display font-black">Setup <span className="text-indigo-400">Assistant</span></h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <StepItem num={1} title="Form Visibility" desc="Ensure Form is set to public." active={formData.google_form_url.length > 20} />
                        <StepItem num={2} title="Token Field" desc="Add 'Token' field in Google Form." active={formData.google_form_url.toLowerCase().includes('token')} />
                        <StepItem num={3} title="Pre-filled" desc="Use {token} placeholder in URL." active={formData.google_form_url.includes('{token}')} />
                      </div>
                      <div className="p-6 bg-slate-950 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Apps Script</span>
                          <button
                            onClick={() => {
                              const script = getScript(window.location.protocol + "//" + window.location.host);
                              navigator.clipboard.writeText(script);
                              toast.success('Script copied');
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-400 transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                          <code className="text-[8px] text-slate-500 font-mono block overflow-hidden">
                            const WEBHOOK_URL = "{window.location.origin}/webhook...";
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 sticky top-24">
            <h3 className="text-lg font-display font-black mb-6">Phase <span className="text-brand-glow">Control</span></h3>

            <div className="space-y-4 mb-8">
              {steps.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${currentStep === s.id ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' :
                    currentStep > s.id ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-600'
                    }`}>
                    {currentStep > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= s.id ? 'text-slate-200' : 'text-slate-600'}`}>
                      {s.name}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                      {currentStep === s.id ? 'In Progress' : currentStep > s.id ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-premium w-full py-4 text-white flex items-center justify-center gap-2 group shadow-lg shadow-brand-accent/20 font-black tracking-widest uppercase text-xs"
                >
                  Continue to {steps[currentStep].name}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-premium w-full py-4 text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 flex items-center justify-center gap-2 group font-black tracking-widest uppercase text-xs"
                >
                  {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : (
                    <>
                      Initialize Deployment
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full py-4 text-slate-500 hover:text-white transition-all font-black tracking-widest uppercase text-[10px] flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Step Back
                </button>
              )}
            </div>

            <AnimatePresence>
              {currentTemplate && currentStep > 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 bg-brand-accent/5 border border-brand-accent/10 rounded-2xl"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-glow mb-1">Active Blueprint</p>
                  <p className="text-xs font-bold text-white truncate">{currentTemplate.name}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string, value: string | number, sub: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-2xl font-display font-black text-white">{value}</p>
      <p className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function StepItem({ num, title, desc, active }: any) {
  return (
    <div className={`flex gap-4 p-4 rounded-2xl border transition-all ${active ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/2 border-white/5'}`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
        {num}
      </div>
      <div className="space-y-0.5">
        <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-400' : 'text-slate-400'}`}>{title}</p>
        <p className="text-[10px] font-medium text-slate-600 leading-tight">{desc}</p>
      </div>
    </div>
  );
}

const getScript = (baseUrl: string) => `// Google Apps Script for Webhook Integration
const WEBHOOK_URL = "${baseUrl}/webhook/google-form";

function onFormSubmit(e) {
  const response = e.response;
  const itemResponses = response.getItemResponses();
  const answers = {};
  let token = "";

  for (let i = 0; i < itemResponses.length; i++) {
    const itemResponse = itemResponses[i];
    const title = itemResponse.getItem().getTitle();
    const answer = itemResponse.getResponse();
    
    if (title.toLowerCase() === "token") {
      token = answer;
    } else {
      answers[title] = answer;
    }
  }

  const payload = {
    token,
    answers,
    timestamp: new Date().toISOString()
  };

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}

function setupTrigger() {
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}
`;
