import { useState, useEffect } from 'react';
import { ShieldAlert, ChevronRight, Clock, Code, X } from 'lucide-react';
import { analytics } from '../../services/api';

interface OrphanAuditProps {
    data: {
        total_attempts: number;
        categories: any[];
    } | null;
}

export default function OrphanAuditTable({ data }: OrphanAuditProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [details, setDetails] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [activePayload, setActivePayload] = useState<any | null>(null);

    useEffect(() => {
        if (selectedCategory) {
            setLoadingDetails(true);
            analytics.getOrphanDetails(selectedCategory)
                .then(setDetails)
                .catch(console.error)
                .finally(() => setLoadingDetails(false));
        } else {
            setDetails([]);
        }
    }, [selectedCategory]);

    if (!data) return null;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden flex flex-col h-full relative">
            <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    Security Audit Logs
                </h3>
                <p className="text-xs text-slate-500 mt-1">Tracking failed webhook attempts and bot activity.</p>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="min-h-full">
                    {data.categories.map((cat: any) => (
                        <div key={cat._id} className="border-b border-slate-800/50 last:border-0">
                            <button
                                className={`w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors ${selectedCategory === cat._id ? 'bg-slate-800/50' : ''}`}
                                onClick={() => setSelectedCategory(cat._id === selectedCategory ? null : cat._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <ChevronRight className={`w-3 h-3 text-slate-600 transition-transform ${selectedCategory === cat._id ? 'rotate-90 text-amber-400' : ''}`} />
                                    <span className="text-slate-300 font-medium text-xs lowercase first-letter:uppercase">{cat._id.replace('invalid_transition_', '').replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-amber-400 font-mono text-xs font-bold">{cat.count}</span>
                                    <div className="text-[10px] text-slate-500 text-right leading-tight hidden sm:block">
                                        <p>{new Date(cat.latest_attempt).toLocaleDateString()}</p>
                                        <p>{new Date(cat.latest_attempt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </button>

                            {selectedCategory === cat._id && (
                                <div className="bg-slate-950/50 px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="space-y-1 mt-2">
                                        {loadingDetails ? (
                                            <div className="py-4 text-center text-xs text-slate-600 animate-pulse">Loading incident history...</div>
                                        ) : (
                                            details.map((log) => (
                                                <div key={log._id} className="flex items-center justify-between p-2 rounded hover:bg-slate-800/50 group">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-slate-600" />
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setActivePayload(log)}
                                                        className="bg-slate-800 p-1 rounded hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition shadow-lg"
                                                        title="Inspect Payload"
                                                    >
                                                        <Code className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {data.categories.length === 0 && (
                        <div className="px-6 py-12 text-center text-slate-500 italic">No security incidents recorded.</div>
                    )}
                </div>
            </div>

            {/* Payload Inspector Modal */}
            {activePayload && (
                <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 overflow-auto animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                        <h4 className="font-bold flex items-center gap-2 text-amber-400">
                            <Code className="w-4 h-4" />
                            Incident Payload
                        </h4>
                        <button
                            onClick={() => setActivePayload(null)}
                            className="p-1 hover:bg-slate-800 rounded-lg transition"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-auto max-h-[400px]">
                        <pre className="text-emerald-400">{JSON.stringify(activePayload, null, 2)}</pre>
                    </div>
                    <div className="mt-4 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Timestamp</label>
                        <p className="text-xs text-slate-400">{new Date(activePayload.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            )}

            <div className="p-4 bg-slate-950/30 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                    <span className="font-semibold">Total Security Events</span>
                    <span className="font-bold">{data.total_attempts}</span>
                </div>
            </div>
        </div>
    );
}
