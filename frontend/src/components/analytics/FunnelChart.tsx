import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Filter } from 'lucide-react';

interface FunnelChartProps {
    data: {
        unused: number;
        passed: number;
        failed: number;
        submitted: number;
        qualification_rate: number;
        completion_rate: number;
    } | null;
}

export default function FunnelChart({ data }: FunnelChartProps) {
    if (!data) return null;

    const chartData = [
        { name: 'Total Audience', value: (data.unused + data.passed + data.failed), fill: '#64748b' },
        { name: 'Qualified (L1)', value: data.passed, fill: '#10b981' },
        { name: 'Conversions (L2)', value: data.submitted, fill: '#0ea5e9' },
    ];

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                Conversion Funnel
            </h3>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 60, top: 10, bottom: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={12}
                            width={100}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={45}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList dataKey="value" position="right" fill="#cbd5e1" fontSize={12} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <p className="text-2xl font-bold text-emerald-400">{data.qualification_rate.toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Qualification</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <p className="text-2xl font-bold text-sky-400">{data.completion_rate.toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Completion</p>
                </div>
            </div>
        </div>
    );
}
