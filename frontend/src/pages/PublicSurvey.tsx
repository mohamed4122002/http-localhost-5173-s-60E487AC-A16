import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../services/api';
import {
  ShieldCheck,
  ChevronRight,
  Phone,
  Sparkles,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PublicSurvey() {
  const { token } = useParams<{ token: string }>();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'loading' | 'layer1' | 'passed' | 'layer2' | 'failed' | 'submitted'>('loading');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [l2Answers, setL2Answers] = useState<Record<string, any>>({});
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [areaSuggestions, setAreaSuggestions] = useState<string[]>([]);

  const countries = [
    { code: '+20', flag: '🇪🇬', name: 'Egypt' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+966', flag: '🇸🇦', name: 'KSA' },
    { code: '+974', flag: '🇶🇦', name: 'Qatar' },
    { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
    { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
    { code: '+968', flag: '🇴🇲', name: 'Oman' },
    { code: '+962', flag: '🇯🇴', name: 'Jordan' },
    { code: '+1', flag: '🇺🇸', name: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
  ];

  const commonCities = [
    'Cairo, Egypt', 'Giza, Egypt', 'Alexandria, Egypt',
    'Dubai, UAE', 'Abu Dhabi, UAE', 'Sharjah, UAE',
    'Riyadh, KSA', 'Jeddah, KSA', 'Dammam, KSA',
    'Doha, Qatar', 'Kuwait City, Kuwait', 'Manama, Bahrain', 'Muscat, Oman', 'Amman, Jordan',
    'New York, USA', 'London, UK', 'Paris, France', 'Berlin, Germany', 'Tokyo, Japan'
  ];

  useEffect(() => {
    if (token) {
      publicApi.getSurvey(token)
        .then(data => {

          setSurvey(data);
          setStep('layer1');
          setLoading(false);
        })
        .catch(() => {
          setError('This access session has expired or is invalid.');
          setStep('failed');
          setLoading(false);
        });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      setLoading(true);

      // Attempt to map dynamic age/gender for backend validation if they exist
      const submitData: Record<string, any> = { ...answers };

      (survey?.questions || []).forEach((q: any, idx: number) => {
        const label = q.label?.toLowerCase() || '';
        const qId = q.id || idx.toString();
        const val = answers[qId];

        if (!val) return;

        if (label.includes('age') || label.includes('سن') || label.includes('years old')) {
          submitData['age'] = val;
        }
        if (label.includes('gender') || label.includes('sex') || label.includes('جنس')) {
          submitData['gender'] = val;
        }
      });

      const fullPhone = `${countryCode} ${phone}`;
      const result = await publicApi.submitLayer1(token, submitData, fullPhone);

      if (result.passed) {
        setStep('passed');
        setTimeout(() => {
          // Instead of redirecting to Google Form, we now move to Layer 2 in-app
          setStep('layer2');
          setLoading(false);
        }, 2000);
      } else {
        setStep('failed');
        setError(result.message || 'Verification complete. You do not qualify for this study.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Identity verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleL2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      setLoading(true);
      await publicApi.submitLayer2(token, l2Answers);
      setStep('submitted');
      toast.success('Survey submitted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'loading' || (loading && !survey)) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6 text-slate-800">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-t-brand-blue border-slate-200 animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Session</p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-brand-dark flex items-center justify-center p-6 overflow-hidden text-slate-900 font-sans">
      {/* Soft Background Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-blue/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-brand-glow/5 rounded-full blur-[150px]"></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'failed' ? (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-100">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
            </div>
            <h1 className="text-3xl font-display font-black mb-4">Verification <span className="text-rose-500">Restricted</span></h1>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {error || "Our automated system has flagged this session as invalid or non-qualifying for the current study."}
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Audit ID: {token?.slice(0, 8)}
            </div>
          </motion.div>
        ) : step === 'submitted' ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-display font-black mb-4">Participation <span className="text-brand-blue">Complete</span></h1>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Thank you for contributing to this research study. Your responses have been securely synchronized.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Confirmation ID: {token?.slice(-8).toUpperCase()}
            </div>
          </motion.div>
        ) : step === 'passed' ? (
          <motion.div
            key="passed"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 animate-pulse">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-display font-black mb-4">Credentials <span className="text-brand-blue">Verified</span></h1>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Optimization successful. Transitioning to the research instrument...
            </p>
            <div className="flex flex-col items-center gap-2">
              <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-brand-blue shadow-[0_0_10px_rgba(37,94,145,0.2)]"
                />
              </div>
            </div>
          </motion.div>
        ) : step === 'layer2' ? (
          <motion.div
            key="layer2"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-3xl bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-brand-blue" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Evaluation <span className="text-brand-blue">Phase</span>
              </div>
            </div>

            <h1 className="text-3xl font-display font-black tracking-tight mb-8">
              Study <span className="text-slate-400 font-light">Instrument</span>
            </h1>

            <form onSubmit={handleL2Submit} className="space-y-12">
              <div className="space-y-12 max-h-[60vh] overflow-y-auto px-4 custom-scrollbar pb-10">
                {(survey?.layer2_questions?.sections || []).map((section: any, sIdx: number) => (
                  <div key={sIdx} className="space-y-6">
                    {section.title && (
                      <h3 className="text-lg font-bold text-brand-accent border-l-4 border-brand-accent pl-4">{section.title}</h3>
                    )}
                    <div className="space-y-8">
                      {section.questions?.map((q: any) => (
                        <div key={q.id} className="space-y-4">
                          <p className="text-sm font-bold text-slate-800">{q.text || q.label || 'Survey Question'}</p>
                          {q.type === 'scale' ? (
                            <div className="flex items-center gap-2">
                              {[...Array(q.options?.length || q.max || 5)].map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setL2Answers({ ...l2Answers, [q.id]: i + 1 })}
                                  className={`flex-1 h-14 rounded-xl border font-black transition-all ${l2Answers[q.id] === i + 1 ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                >
                                  {q.options?.[i] || i + 1}
                                </button>
                              ))}
                            </div>
                          ) : q.type === 'text' ? (
                            <input
                              type="text"
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-brand-blue/50 transition-all font-bold placeholder:text-slate-300"
                              placeholder="Type your response..."
                              value={l2Answers[q.id] || ''}
                              onChange={(e) => setL2Answers({ ...l2Answers, [q.id]: e.target.value })}
                            />
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {q.options?.map((opt: string) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setL2Answers({ ...l2Answers, [q.id]: opt })}
                                  className={`w-full p-4 rounded-xl border text-left font-bold transition-all ${l2Answers[q.id] === opt ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' : 'bg-slate-50 border-slate-100 text-slate-500'} `}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full py-5 text-white flex items-center justify-center gap-3 group shadow-xl shadow-brand-accent/20 font-black tracking-widest uppercase text-xs rounded-2xl"
              >
                {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : (
                  <>
                    Complete Research Evaluation
                    <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl"
          >
            <div className="flex flex-col items-center mb-10">
              <img src="/brand/logo-icon.png" alt="Logo" className="w-16 h-16 mb-4 object-contain" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Secure <span className="text-brand-blue">Infrastructure</span>
              </div>
            </div>

            <h1 className="text-4xl font-display font-black tracking-tight mb-2 text-center text-slate-900">
              {survey?.company_name} <br /> <span className="text-slate-400 font-light">Participation Protocol</span>
            </h1>
            <div className="flex items-center gap-2 mb-8 justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/10">
                Blueprint: {survey?.template_name || 'Standard'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                ID: {token?.slice(-6).toUpperCase()}
              </span>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed mb-10 pb-8 border-b border-slate-50 text-center">
              Please complete the following qualification probe. Upon synchronization, you will be redirected to the research instrument.
            </p>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-8 max-h-[40vh] overflow-y-auto px-2 custom-scrollbar">
                {/* Always include Phone for handoff matching */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Protocol (International Mobile)</label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountrySelector(!showCountrySelector)}
                        className="h-full bg-slate-50 border border-slate-200 rounded-2xl px-4 text-slate-900 flex items-center gap-2 hover:border-brand-blue/50 transition-all font-bold"
                      >
                        <span>{countries.find(c => c.code === countryCode)?.flag}</span>
                        <span className="text-sm">{countryCode}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showCountrySelector && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                          >
                            {countries.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setShowCountrySelector(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                              >
                                <span className="text-xl">{c.flag}</span>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-900">{c.code}</span>
                                  <span className="text-[10px] text-slate-400 uppercase font-bold">{c.name}</span>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative flex-1 group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      <input
                        type="tel"
                        required
                        placeholder="123 456 7890"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-slate-900 focus:outline-none focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/5 transition-all font-bold placeholder:text-slate-300"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Questions from Blueprint */}
                {survey?.questions?.map((q: any, idx: number) => {
                  const qId = q.id || idx.toString();
                  return (
                    <div key={qId} className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{q.label}</label>
                      <div className="relative group">
                        {q.type === 'mcq' ? (
                          <div className="grid grid-cols-1 gap-2">
                            {q.options?.map((opt: string) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setAnswers({ ...answers, [qId]: opt })}
                                className={`w-full p-4 rounded-2xl border text-left font-bold transition-all ${answers[qId] === opt ? 'bg-brand-blue/10 border-brand-blue text-brand-blue' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : q.type === 'scale' ? (
                          <div className="flex items-center justify-between gap-2">
                            {[...Array(q.max || 5)].map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setAnswers({ ...answers, [qId]: i + 1 })}
                                className={`flex-1 h-12 rounded-xl border font-black transition-all ${answers[qId] === i + 1 ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 relative">
                            <input
                              type={q.type === 'email' ? 'email' : (q.type === 'age' ? 'number' : 'text')}
                              required={q.required}
                              placeholder={q.label}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-brand-blue/50 transition-all font-bold placeholder:text-slate-300"
                              value={answers[qId] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setAnswers({ ...answers, [qId]: val });
                                if (q.id === 'area' || q.label?.toLowerCase().includes('area')) {
                                  if (val.length > 1) {
                                    const filtered = commonCities.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
                                    setAreaSuggestions(filtered);
                                  } else {
                                    setAreaSuggestions([]);
                                  }
                                }
                              }}
                            />

                            {/* Autocomplete Suggestions */}
                            <AnimatePresence>
                              {(q.id === 'area' || q.label?.toLowerCase().includes('area')) && areaSuggestions.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                                >
                                  {areaSuggestions.map(suggestion => (
                                    <button
                                      key={suggestion}
                                      type="button"
                                      onClick={() => {
                                        setAnswers({ ...answers, [qId]: suggestion });
                                        setAreaSuggestions([]);
                                      }}
                                      className="w-full p-4 rounded-xl hover:bg-slate-50 hover:text-brand-blue transition-all text-left font-bold text-sm border border-transparent hover:border-slate-100"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Legacy Suggestions fallback */}
                            {q.suggestions && (!areaSuggestions.length || !(q.id === 'area' || q.label?.toLowerCase().includes('area'))) && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {q.suggestions.map((suggestion: string) => (
                                  <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => setAnswers({ ...answers, [qId]: suggestion })}
                                    className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:bg-brand-blue/5 hover:border-brand-blue/20 hover:text-brand-blue transition-all"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full py-5 text-white flex items-center justify-center gap-3 group shadow-xl shadow-brand-accent/20 font-black tracking-widest uppercase text-xs rounded-2xl"
              >
                {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : (
                  <>
                    Initialize Research Access
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Verified Protocol</span>
              </div>
              <div className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">
                Audit Logged Access
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
