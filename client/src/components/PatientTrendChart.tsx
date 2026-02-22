import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { PredictionResponse } from "@shared/schema";
import { format } from "date-fns";
import { TrendingUp, Activity, AlertTriangle } from "lucide-react";

interface PatientTrendChartProps {
    predictions: PredictionResponse[];
}

export function PatientTrendChart({ predictions }: PatientTrendChartProps) {
    if (!predictions || predictions.length === 0) return null;

    // Sort by date ascending for the chart
    const sortedData = [...predictions]
        .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
        .map((p) => ({
            date: format(new Date(p.createdAt!), "MMM dd"),
            fullDate: format(new Date(p.createdAt!), "MMM dd, yyyy HH:mm"),
            riskScore: p.riskScore,
            confidence: p.confidence * 100,
            disease: p.disease,
        }));

    const latest = sortedData[sortedData.length - 1];
    const previous = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;
    const diff = previous ? latest.riskScore - previous.riskScore : 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-slate-50 border-b border-slate-200 p-4 md:px-6 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Patient Progress & History
                    </h3>
                    <p className="text-xs text-slate-500">Longitudinal risk assessment tracking</p>
                </div>
                {previous && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${diff > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                        {diff > 0 ? <AlertTriangle className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)}% change
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sortedData}>
                            <defs>
                                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="riskScore"
                                name="Risk Score"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRisk)"
                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Baseline Risk</p>
                        <p className="text-lg font-black text-slate-900">{sortedData[0].riskScore.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Latest Assessment</p>
                        <p className="text-lg font-black text-slate-900">{latest.riskScore.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Record Count</p>
                        <p className="text-lg font-black text-slate-900">{sortedData.length}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Primary Condition</p>
                        <p className="text-sm font-bold text-slate-700">{latest.disease}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
