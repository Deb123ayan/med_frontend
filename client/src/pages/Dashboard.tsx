import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { usePredictions, usePatients } from "@/hooks/use-medical";
import { Users, Activity, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: predictions, isLoading: loadingPredictions } = usePredictions();
  const { data: patients, isLoading: loadingPatients } = usePatients();

  const totalPatients = patients?.length || 0;
  const highRiskCases = predictions?.filter(p => p.riskCategory === 'High').length || 0;
  const avgConfidence = predictions?.length 
    ? (predictions.reduce((acc, curr) => acc + curr.confidence, 0) / predictions.length * 100).toFixed(1) 
    : "0.0";

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome back, Dr. Smith. Here's today's overview.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Patients" 
          value={totalPatients} 
          icon={Users} 
          color="blue"
          trend={{ value: "12%", type: "up" }}
        />
        <StatCard 
          label="High Risk Cases" 
          value={highRiskCases} 
          icon={AlertTriangle} 
          color="rose"
          trend={{ value: "4%", type: "down" }}
        />
        <StatCard 
          label="Avg. Model Confidence" 
          value={`${avgConfidence}%`} 
          icon={Activity} 
          color="emerald"
        />
        <StatCard 
          label="Recent Assessments" 
          value={predictions?.length || 0} 
          icon={FileText} 
          color="amber"
        />
      </div>

      {/* Recent Assessments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Assessments</h2>
          <Link href="/patients" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Disease Type</th>
                <th className="px-6 py-4">Risk Category</th>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingPredictions ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading assessments...</td></tr>
              ) : predictions?.slice(0, 5).map((pred) => (
                <tr key={pred.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">#{pred.patientId}</td>
                  <td className="px-6 py-4">{pred.disease}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${pred.riskCategory === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                        pred.riskCategory === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      {pred.riskCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4">{pred.riskScore.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(pred.createdAt!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/predictions/${pred.id}`} className="text-blue-600 hover:underline font-medium">
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
              {predictions?.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No assessments found. Start a new one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
