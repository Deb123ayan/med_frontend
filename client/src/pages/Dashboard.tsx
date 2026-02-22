import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { AuthDebug } from "@/components/AuthDebug";
import { usePredictions, usePatients } from "@/hooks/use-medical";
import { Users, Activity, AlertTriangle, FileText, ArrowRight, Plus, Clock, UserCircle } from "lucide-react";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: predictions, isLoading: loadingPredictions } = usePredictions();
  const { data: patients, isLoading: loadingPatients } = usePatients();
  const isMobile = useIsMobile();

  const totalPatients = patients?.length || 0;
  const highRiskCases = predictions?.filter(p => p.riskCategory === 'High').length || 0;
  const avgConfidence = predictions?.length
    ? (predictions.reduce((acc, curr) => acc + curr.confidence, 0) / predictions.length * 100).toFixed(1)
    : "0.0";

  // Sort patients by createdAt descending and take the 5 most recent
  const recentPatients = useMemo(() => {
    if (!patients) return [];
    return [...patients]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [patients]);

  // Generate a consistent color from patient name for avatars
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
      'bg-pink-500', 'bg-rose-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-amber-500', 'bg-orange-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Format relative time
  const getRelativeTime = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Layout>
        {/* Mobile-optimized header */}
        <header className="mb-4 md:mb-8">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1 text-xs md:text-base">
                  {isMobile ? "Today's overview" : "Welcome back, Dr. Smith. Here's today's overview."}
                </p>
              </div>

              {/* Desktop CTA Button */}
              <Link
                href="/assess"
                className="hidden md:flex bg-blue-600 text-white px-4 py-2 rounded-lg font-medium items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Assessment
              </Link>
            </div>

            {/* Mobile CTA Button - Full width */}
            <Link
              href="/assess"
              className="md:hidden bg-blue-600 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 justify-center hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Assessment
            </Link>
          </div>
        </header>

        {/* Stats Grid - Mobile optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
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
            label="Recent Assessments"
            value={predictions?.length || 0}
            icon={FileText}
            color="amber"
          />
        </div>

        {/* Recent Patients Section */}
        <div className="bg-white rounded-lg md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4 md:mb-8">
          <div className="p-3 md:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <UserCircle className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900">Recent Patients</h2>
            </div>
            <Link
              href="/patients"
              className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>

          {loadingPatients ? (
            <div className="p-6 md:p-8 text-center text-slate-400 text-sm">Loading patients...</div>
          ) : recentPatients.length === 0 ? (
            <div className="p-6 md:p-8 text-center text-slate-400 text-sm">
              No patients found.
              <Link href="/assess" className="text-blue-600 hover:underline ml-1">
                Add your first patient
              </Link>
            </div>
          ) : isMobile ? (
            /* Mobile Card View */
            <div className="divide-y divide-slate-100">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${getAvatarColor(patient.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{patient.name}</h3>
                        <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0 ml-2">
                          <Clock className="w-3 h-3" />
                          {getRelativeTime(patient.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">Age {patient.age}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{patient.gender}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-mono text-slate-400">#{patient.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 ml-12">
                    <Link
                      href={`/assess?patientId=${patient.id}`}
                      className="text-blue-600 hover:underline font-medium text-xs bg-blue-50 px-2.5 py-1 rounded inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      New Assessment
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Age</th>
                    <th className="px-6 py-4">Gender</th>
                    <th className="px-6 py-4">Registered</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${getAvatarColor(patient.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {patient.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">#{patient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{patient.age}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${patient.gender === 'Male' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                            patient.gender === 'Female' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                              'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {patient.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {getRelativeTime(patient.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/assess?patientId=${patient.id}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          New Assessment
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Assessments - Mobile responsive */}
        <div className="bg-white rounded-lg md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 md:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900">Recent Assessments</h2>
            </div>
            <Link
              href="/reports"
              className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>

          {/* Mobile Card View */}
          {isMobile ? (
            <div className="divide-y divide-slate-100">
              {loadingPredictions ? (
                <div className="p-4 text-center text-slate-400 text-sm">Loading assessments...</div>
              ) : predictions?.slice(0, 5).map((pred) => (
                <div key={pred.id} className="p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-slate-900 text-sm">#{pred.patientId}</div>
                      <div className="text-xs text-slate-500">{pred.disease}</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                    ${pred.riskCategory === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        pred.riskCategory === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      {pred.riskCategory}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base font-semibold text-slate-900">
                      {pred.riskScore.toFixed(1)}%
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {new Date(pred.createdAt!).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/predictions/${pred.id}`}
                        className="text-blue-600 hover:underline font-medium text-xs bg-blue-50 px-2 py-1 rounded"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {predictions?.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-sm">
                  No assessments found.
                  <Link href="/assess" className="text-blue-600 hover:underline ml-1">
                    Start a new one
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Table View */
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
          )}
        </div>
      </Layout>
      <AuthDebug />
    </>
  );
}
