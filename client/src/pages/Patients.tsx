import { Layout } from "@/components/Layout";
import { usePatients } from "@/hooks/use-medical";
import { Loader2, Search, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Patients() {
  const { data: patients, isLoading } = usePatients();
  const [search, setSearch] = useState("");

  const filteredPatients = patients?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Patient Directory</h1>
           <p className="text-slate-500 mt-1">Manage patient records and view history.</p>
        </div>
        <Link href="/assess">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
            <UserPlus className="w-4 h-4" />
            Add Patient
          </button>
        </Link>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search patients by name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients?.map(patient => (
            <div key={patient.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                  {patient.name.charAt(0)}
                </div>
                <span className="text-xs font-mono text-slate-400">#{patient.id}</span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {patient.name}
              </h3>
              
              <div className="mt-2 space-y-1 text-sm text-slate-500">
                <p>Age: {patient.age} • {patient.gender}</p>
                <p>Registered: {new Date(patient.createdAt!).toLocaleDateString()}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                <Link href={`/assess`} className="flex-1 text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                  New Assessment
                </Link>
              </div>
            </div>
          ))}
          {filteredPatients?.length === 0 && (
             <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                No patients found matching "{search}"
             </div>
          )}
        </div>
      )}
    </Layout>
  );
}
