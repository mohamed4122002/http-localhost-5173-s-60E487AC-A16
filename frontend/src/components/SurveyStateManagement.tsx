import { useState } from 'react';
import { ChevronDown, AlertTriangle, Loader2 } from 'lucide-react';

interface StateToggleProps {
    currentStatus: string;
    onTransition: (newStatus: string) => Promise<void>;
}

export function SurveyStateToggle({ currentStatus, onTransition }: StateToggleProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const transitions: Record<string, string[]> = {
        draft: ['active', 'closed'],
        active: ['closed'],
        closed: []
    };

    const handleStateSelect = (status: string) => {
        setIsConfirming(status);
        setIsOpen(false);
    };

    const executeTransition = async () => {
        if (!isConfirming) return;
        setLoading(true);
        try {
            await onTransition(isConfirming);
            setIsConfirming(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const statusColors: Record<string, string> = {
        draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        closed: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };

    const available = transitions[currentStatus] || [];

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={available.length === 0}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all ${statusColors[currentStatus]} ${available.length > 0 ? 'hover:brightness-110' : 'opacity-70 cursor-not-allowed'}`}
            >
                <span className="uppercase">{currentStatus}</span>
                {available.length > 0 && <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-20 overflow-hidden">
                        {available.map(status => (
                            <button
                                key={status}
                                onClick={() => handleStateSelect(status)}
                                className="w-full text-left px-4 py-2 text-xs font-bold uppercase text-slate-300 hover:bg-slate-800 hover:text-white transition"
                            >
                                Move to {status}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {isConfirming && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-3 bg-amber-500/20 border border-amber-500/20 rounded-full">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Update Survey State?</h3>
                                <p className="text-sm text-slate-400 mt-2">
                                    Transitioning from <span className="font-bold uppercase text-white">{currentStatus}</span> to <span className="font-bold uppercase text-white">{isConfirming}</span> is permanent.
                                    {isConfirming === 'active' && ' The Google Form ID will be locked.'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                <button
                                    onClick={() => setIsConfirming(null)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeTransition}
                                    disabled={loading}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
