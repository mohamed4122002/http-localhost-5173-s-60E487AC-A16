import { useState, useEffect } from 'react';
import { X, Check, HelpCircle } from 'lucide-react';

interface FormAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prefillUrl: string) => void;
    initialUrl: string;
}

export default function FormAssistantModal({ isOpen, onClose, onSave, initialUrl }: FormAssistantModalProps) {
    const [rawUrl, setRawUrl] = useState('');
    const [fields, setFields] = useState<{ key: string, label: string, mapping: string }[]>([]);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            setRawUrl(initialUrl || '');
        }
    }, [isOpen, initialUrl]);

    const parseUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            const params = new URLSearchParams(urlObj.search);
            const detectedFields: { key: string, label: string, mapping: string }[] = [];

            params.forEach((value, key) => {
                if (key.startsWith('entry.')) {
                    // Try to guess label from value if it's a placeholder
                    let label = `Field ${key}`;
                    if (value && value !== '{{token}}' && value !== '{{phone}}') {
                        label = value;
                    }
                    detectedFields.push({ key, label, mapping: value || '' });
                }
            });

            setFields(detectedFields);
        } catch (e) {
            setFields([]);
        }
    };

    useEffect(() => {
        parseUrl(rawUrl);
    }, [rawUrl]);

    useEffect(() => {
        try {
            if (!rawUrl) {
                setPreviewUrl('');
                return;
            }
            const urlObj = new URL(rawUrl);
            const params = new URLSearchParams(urlObj.search);

            fields.forEach(f => {
                if (f.mapping) {
                    params.set(f.key, f.mapping);
                }
            });

            urlObj.search = params.toString();
            setPreviewUrl(urlObj.toString());
        } catch (e) {
            setPreviewUrl('');
        }
    }, [fields, rawUrl]);

    if (!isOpen) return null;

    const mappingOptions = [
        { value: '', label: 'None' },
        { value: '{{token}}', label: 'Participant Token' },
        { value: '{{phone}}', label: 'Phone Number' },
        { value: '{{survey_id}}', label: 'Survey ID' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm shadow-2xl" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <header className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Google Form Assistant</h2>
                        <p className="text-sm text-slate-400">Map Layer 1 data to specific Google Form fields</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </header>

                <div className="p-6 overflow-y-auto space-y-6">
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-purple-400 uppercase tracking-wider">1. Paste Pre-filled URL</label>
                            <a
                                href="https://support.google.com/docs/answer/28390b8"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-slate-500 hover:text-purple-400 flex items-center gap-1 transition"
                            >
                                <HelpCircle className="w-3 h-3" />
                                How to get this link?
                            </a>
                        </div>
                        <textarea
                            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 outline-none focus:ring-2 focus:ring-purple-500 transition"
                            placeholder="https://docs.google.com/forms/d/e/.../viewform?entry.123=..."
                            value={rawUrl}
                            onChange={(e) => setRawUrl(e.target.value)}
                        />
                    </section>

                    {fields.length > 0 && (
                        <section className="space-y-4">
                            <label className="text-sm font-bold text-emerald-400 uppercase tracking-wider">2. Map Fields</label>
                            <div className="space-y-2">
                                {fields.map((field, idx) => (
                                    <div key={field.key} className="flex items-center gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-300">{field.label}</p>
                                            <code className="text-[10px] text-slate-500">{field.key}</code>
                                        </div>
                                        <select
                                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={field.mapping}
                                            onChange={(e) => {
                                                const newFields = [...fields];
                                                newFields[idx].mapping = e.target.value;
                                                setFields(newFields);
                                            }}
                                        >
                                            {mappingOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {rawUrl && fields.length === 0 && (
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
                            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-500 leading-relaxed">
                                No pre-fill fields detected. Make sure you use a "Get pre-filled link" from Google Forms
                                where you've actually typed some placeholder text into the fields.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[60%]">
                        {previewUrl}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(previewUrl)}
                            disabled={!previewUrl}
                            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-30 px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 transition flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Apply Mapping
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
