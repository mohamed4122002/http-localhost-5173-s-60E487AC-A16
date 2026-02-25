import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TimeSeriesChartProps {
    data: any[];
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Participation Trends
                </h3>
                <span className="text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">Last 30 Days</span>
            </div>

            <div className="flex-1 min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="_id"
                            stroke="#64748b"
                            fontSize={10}
                            tickFormatter={(val) => val.split('-').slice(1).join('/')}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area
                            type="monotone"
                            dataKey="submissions"
                            name="Submissions"
                            stroke="#0ea5e9"
                            fillOpacity={1}
                            fill="url(#colorSub)"
                            strokeWidth={3}
                            activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2, fill: '#0f172a' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="passed"
                            name="Qualified"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorPass)"
                            strokeWidth={3}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#0f172a' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
