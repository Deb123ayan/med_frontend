import { Layout } from "@/components/Layout";
import { usePredictions } from "@/hooks/use-medical";
import { Search, FileText, ArrowRight, Activity, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import { PredictionResponse } from "../../../shared/schema";

export default function Reports() {
    const { data: predictionsData, isLoading } = usePredictions();
    const predictions = predictionsData as PredictionResponse[];
    const [search, setSearch] = useState("");
    const isMobile = useIsMobile();

    const filteredReports = predictions?.filter(p =>
        String(p.patient?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        String(p.patient?.patient_id || "").toLowerCase().includes(search.toLowerCase()) ||
        String(p.disease).toLowerCase().includes(search.toLowerCase()) ||
        String(p.riskCategory).toLowerCase().includes(search.toLowerCase())
    );

    const getRiskColor = (category: string) => {
        switch (category) {
            case 'High': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getRiskIcon = (category: string) => {
        switch (category) {
            case 'High': return <AlertTriangle className="w-3.5 h-3.5" />;
            case 'Low': return <CheckCircle className="w-3.5 h-3.5" />;
            default: return <Activity className="w-3.5 h-3.5" />;
        }
    };

    return (
        <Layout>
            <header className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-slate-900 font-display">
                            Patient Reports
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm md:text-base">
                            View and manage all medical assessment reports and AI diagnostics.
                        </p>
                    </div>
                    <Link href="/assess">
                        <button className="hidden md:flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm items-center gap-2 shadow-lg shadow-blue-500/20 transition-all touch-target">
                            <FileText className="w-4 h-4" />
                            New Report
                        </button>
                    </Link>
                </div>
            </header>

            {/* Search and Filters */}
            <div className="relative mb-4 md:mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                    type="text"
                    placeholder="Search by Patient Name, ID, Disease..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 md:pl-10 pr-4 py-3 rounded-lg md:rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm touch-target text-sm md:text-base"
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-slate-500 animate-pulse">Loading reports...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {isMobile ? (
                        /* Mobile Card View */
                        <div className="divide-y divide-slate-100">
                            {filteredReports?.map((report) => (
                                <Link key={report.id} href={`/predictions/${report.id}`}>
                                    <div className="p-4 hover:bg-slate-50 transition-colors active:bg-slate-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs font-mono text-slate-400 block mb-1">
                                                    #{report.patient?.patient_id || report.patientId}
                                                </span>
                                                <h3 className="font-bold text-slate-900">{report.patient?.name || "Unknown Patient"}</h3>
                                                <p className="text-xs text-slate-500">{report.disease}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskColor(report.riskCategory)}`}>
                                                {getRiskIcon(report.riskCategory)}
                                                {report.riskCategory}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Risk Score</p>
                                                    <p className="text-lg font-black text-slate-900">{report.riskScore.toFixed(1)}%</p>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100" />
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confidence</p>
                                                    <p className="text-sm font-semibold text-slate-600">{(report.confidence * 100).toFixed(0)}%</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-blue-600 font-bold text-sm">
                                                Details <ArrowRight className="w-4 h-4 ml-1" />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center text-[11px] text-slate-400 gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(report.createdAt!).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        /* Desktop Table View */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Patient</th>
                                        <th className="px-6 py-4">Condition</th>
                                        <th className="px-6 py-4">Risk Assessment</th>
                                        <th className="px-6 py-4 text-center">Risk Score</th>
                                        <th className="px-6 py-4">Date & Time</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredReports?.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {report.patient?.name || "Unknown Patient"}
                                                    </span>
                                                    <span className="font-mono text-[10px] font-bold text-slate-400">
                                                        #{report.patient?.patient_id || report.patientId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-slate-900">{report.disease}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">Automated AI Diagnostic</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getRiskColor(report.riskCategory)}`}>
                                                    {getRiskIcon(report.riskCategory)}
                                                    {report.riskCategory} Risk
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-center">
                                                    <div className="text-base font-black text-slate-900">{report.riskScore.toFixed(1)}%</div>
                                                    <div className="text-[10px] text-slate-400 font-bold tracking-tight">CONFIDENCE: {(report.confidence * 100).toFixed(0)}%</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-500">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">
                                                        {new Date(report.createdAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        {new Date(report.createdAt!).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link href={`/predictions/${report.id}`}>
                                                    <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all border border-blue-100">
                                                        VIEW REPORT
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredReports?.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/30">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No reports found</h3>
                            <p className="text-slate-500 max-w-xs mx-auto text-sm">
                                {search ? `No assessments match "${search}". Try a different search term.` : "No assessments have been recorded yet."}
                            </p>
                            {!search && (
                                <Link href="/assess" className="mt-6 inline-block text-blue-600 font-bold hover:underline">
                                    Create your first assessment
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}
