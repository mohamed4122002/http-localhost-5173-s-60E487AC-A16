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
      toast.error('Please select a survey template');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.template_id) {
      toast.error('Please select a survey template');
      return;
    }

    if (formData.link_count <= 0) {
      toast.error('Response limit cannot be empty. Please set at least 1 response.');
      return;
    }

    setLoading(true);

    try {
      const res = await surveys.create(formData);
      setSuccessData(res);
      toast.success('Survey created successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to start survey project');
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-left">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              Survey <span className="text-brand-blue">Setup</span>
            </div>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tight text-slate-900">
            Create <span className="text-slate-400 font-light">New Survey</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl">
            Configure a secure, gated survey environment with automated qualification rules and premium reporting.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-100 p-3 rounded-2xl border border-slate-200 shadow-inner">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center gap-2 transition-all duration-500 ${currentStep === s.id ? 'text-brand-blue' : currentStep > s.id ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${currentStep === s.id ? 'bg-brand-blue text-white border-brand-blue shadow-md' :
                  currentStep > s.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                  }`}>
                  {currentStep > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{s.name}</span>
              </div>
              {idx < steps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
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
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
            >
              <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-slate-200 flex flex-col shadow-2xl">
                <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0 bg-brand-blue/5">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                      Survey Ready
                    </div>
                    <h2 className="text-3xl font-display font-black text-slate-900">Survey <span className="text-brand-blue">Links</span></h2>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest transition-all text-slate-600 shadow-sm"
                  >
                    Go to Dashboard
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar text-left">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Survey ID" value={successData._id.slice(-8).toUpperCase()} sub="Provisioned ID" />
                    <StatCard label="Link Count" value={successData.generated_tokens?.length || 0} sub="Unique Keys" />
                    <StatCard label="Security" value="One-Time" sub="State Invalidation" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Key Registry</h4>
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
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-blue hover:text-blue-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download List
                      </button>
                    </div>
                    <div className="space-y-3">
                      {successData.generated_tokens?.map((token: string, idx: number) => {
                        const url = `${window.location.origin}/s/${token}`;
                        return (
                          <div key={token} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-brand-blue/20 hover:bg-slate-50 transition-all shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 font-mono">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono text-slate-500 truncate tracking-tight">{url}</p>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(url);
                                toast.success(`Link ${idx + 1} copied`);
                              }}
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-blue hover:text-white transition-all text-slate-400"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <a href={url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-cyan hover:text-white transition-all text-slate-400">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Survey is ready for distribution.</p>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
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
                <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-premium text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <Layout className="w-32 h-32 rotate-12" />
                  </div>
                  <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="p-3.5 rounded-2xl bg-brand-blue/5 text-brand-blue border border-brand-blue/10 shadow-inner-soft">
                      <Layout className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-900">General <span className="text-brand-blue">Info</span></h3>
                  </div>

                  <div className="grid grid-cols-1 gap-10 relative z-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Global Research Corp"
                        className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-6 text-slate-900 focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold placeholder:text-slate-300 text-xl shadow-inner-soft"
                        value={formData.company_name}
                        onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Response Limit</label>
                      <div className="relative group">
                        <Sparkles className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          placeholder="Provision volume"
                          className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-16 pr-8 py-6 text-slate-900 focus:outline-none focus:border-brand-blue/50 transition-all font-bold text-xl shadow-inner-soft placeholder:text-slate-300"
                          value={formData.link_count}
                          onChange={e => setFormData({ ...formData, link_count: parseInt(e.target.value) || 0 })}
                        />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 group-focus-within:text-brand-blue transition-colors text-right">
                          Keys
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl text-left">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-brand-blue/5 text-brand-blue border border-brand-blue/10">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-display font-black text-slate-900">Template <span className="text-brand-blue">Selection</span></h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templateList.map((t: any) => (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => setFormData({ ...formData, template_id: t._id })}
                        className={`text-left p-6 rounded-[2.5rem] border transition-all duration-300 group ${formData.template_id === t._id
                          ? 'bg-brand-blue/5 border-brand-blue/20 ring-4 ring-brand-blue/5'
                          : 'bg-white border-slate-100 hover:border-brand-blue/20 hover:bg-slate-50 shadow-sm'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-4 rounded-2xl transition-all ${formData.template_id === t._id ? 'bg-brand-blue text-white shadow-xl' : 'bg-slate-100 text-slate-400 group-hover:text-brand-blue'}`}>
                            <Layout className="w-5 h-5" />
                          </div>
                          {formData.template_id === t._id && <Check className="w-5 h-5 text-brand-blue animate-in zoom-in" />}
                        </div>
                        <h4 className={`text-sm font-black uppercase tracking-widest mb-1 transition-colors ${formData.template_id === t._id ? 'text-slate-900' : 'text-slate-500'}`}>
                          {t.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {t.type.replace('_', ' ')} architecture
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8 text-left">
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-brand-cyan/5 text-brand-cyan border border-brand-cyan/10">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-display font-black text-slate-900">Data <span className="text-brand-cyan">Endpoint</span></h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Google Form ID</label>
                        <input
                          type="text"
                          placeholder="1FAIpQLS..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-brand-cyan/50 transition-all font-bold shadow-inner"
                          value={formData.google_form_id}
                          onChange={e => setFormData({ ...formData, google_form_id: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Delivery URL</label>
                        <input
                          type="url"
                          placeholder="https://docs.google.com/forms/..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-brand-cyan/50 transition-all font-bold shadow-inner"
                          value={formData.google_form_url}
                          onChange={e => setFormData({ ...formData, google_form_url: e.target.value })}
                          required
                        />
                      </div>
                      <div className={`p-4 rounded-xl border transition-all ${formData.google_form_url.includes('{token}') ? 'bg-emerald-50 border-emerald-100' : 'bg-brand-red/5 border-brand-red/10'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {formData.google_form_url.includes('{token}') ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-brand-red" />}
                          <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${formData.google_form_url.includes('{token}') ? 'text-emerald-700' : 'text-brand-red'}`}>URL Configuration</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                          {formData.google_form_url.includes('{token}') ? "Token injection verified." : "Placeholder {token} missing in URL."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Setup Assistant Integrated */}
                  <div className="p-10 bg-slate-50 rounded-[3.5rem] border border-slate-100 shadow-inner">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 rounded-xl bg-brand-blue/5 text-brand-blue border border-brand-blue/10">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-display font-black text-slate-900">Setup <span className="text-brand-blue">Assistant</span></h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 text-left">
                        <StepItem num={1} title="Form Visibility" desc="Ensure Form is set to public." active={formData.google_form_url.length > 20} />
                        <StepItem num={2} title="Token Field" desc="Add 'Token' field in Google Form." active={formData.google_form_url.toLowerCase().includes('token')} />
                        <StepItem num={3} title="Pre-filled" desc="Use {token} placeholder in URL." active={formData.google_form_url.includes('{token}')} />
                      </div>
                      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Apps Script</span>
                          <button
                            onClick={() => {
                              const script = getScript(window.location.protocol + "//" + window.location.host);
                              navigator.clipboard.writeText(script);
                              toast.success('Script copied');
                            }}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-brand-cyan hover:text-white text-brand-cyan transition-all border border-slate-100"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                          <code className="text-[10px] text-slate-400 font-mono block overflow-hidden">
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
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-premium sticky top-24 text-left">
            <h3 className="text-2xl font-display font-black mb-10 text-slate-900">Phase <span className="text-brand-blue">Control</span></h3>

            <div className="space-y-8 mb-12">
              {steps.map(s => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentStep === s.id ? 'bg-brand-blue text-white shadow-xl rotate-3' :
                    currentStep > s.id ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-300'
                    }`}>
                    {currentStep > s.id ? <Check className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${currentStep >= s.id ? 'text-slate-900' : 'text-slate-300'}`}>
                      {s.name}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${currentStep === s.id ? 'text-brand-blue animate-pulse' : 'text-slate-400'}`}>
                      {currentStep === s.id ? 'Active Operation' : currentStep > s.id ? 'Sync Verified' : 'Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-10 border-t border-slate-100">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-6 bg-brand-blue text-white rounded-[1.5rem] flex items-center justify-center gap-4 group shadow-xl shadow-brand-blue/10 hover:shadow-brand-blue/30 transition-all font-black tracking-[0.2em] uppercase text-[10px]"
                >
                  Continue to {steps[currentStep].name}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] hover:bg-emerald-700 flex items-center justify-center gap-4 group font-black tracking-[0.2em] uppercase text-[10px] shadow-xl hover:shadow-emerald-200 transition-all"
                >
                  {loading ? <Sparkles className="w-6 h-6 animate-spin" /> : (
                    <>
                      Create Survey
                      <Check className="w-6 h-6 animate-in zoom-in" />
                    </>
                  )}
                </button>
              )}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full py-4 text-slate-400 hover:text-slate-900 transition-all font-black tracking-[0.2em] uppercase text-[9px] flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Step Back
                </button>
              )}
            </div>

            <AnimatePresence>
              {currentTemplate && currentStep > 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-10 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] shadow-inner-soft"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Active Blueprint</p>
                  <p className="text-xs font-black text-slate-900 truncate bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">{currentTemplate.name}</p>
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
    <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl space-y-2 group hover:border-brand-blue/20 transition-all">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-blue transition-colors">{label}</p>
      <p className="text-3xl font-display font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function StepItem({ num, title, desc, active }: any) {
  return (
    <div className={`flex gap-5 p-5 rounded-3xl border transition-all ${active ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {num}
      </div>
      <div className="space-y-1">
        <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-700' : 'text-slate-900'}`}>{title}</p>
        <p className={`text-[10px] font-bold leading-tight ${active ? 'text-emerald-600/70' : 'text-slate-400'}`}>{desc}</p>
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
