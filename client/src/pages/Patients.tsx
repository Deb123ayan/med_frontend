import { Layout } from "@/components/Layout";
import { usePatients } from "@/hooks/use-medical";
import { Loader2, Search, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Patients() {
  const { data: patients, isLoading } = usePatients();
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const filteredPatients = patients?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <header className="flex flex-col gap-3 md:gap-4 mb-4 md:mb-8">
        <div className="flex items-center justify-between">
          <div>
             <h1 className="text-xl md:text-3xl font-bold text-slate-900">
               {isMobile ? "Patients" : "Patient Directory"}
             </h1>
             <p className="text-slate-500 mt-1 text-sm md:text-base">
               {isMobile ? "Manage patient records" : "Manage patient records and view history."}
             </p>
          </div>
          {!isMobile && (
            <Link href="/assess">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all touch-target">
                <UserPlus className="w-4 h-4" />
                Add Patient
              </button>
            </Link>
          )}
        </div>
        
        {/* Mobile Add Button */}
        {isMobile && (
          <Link href="/assess">
            <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 justify-center shadow-lg shadow-blue-500/20 transition-all touch-target">
              <UserPlus className="w-4 h-4" />
              Add New Patient
            </button>
          </Link>
        )}
      </header>

      {/* Search Bar */}
      <div className="relative mb-4 md:mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5" />
        <input 
          type="text" 
          placeholder={isMobile ? "Search patients..." : "Search patients by name..."} 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 md:pl-10 pr-4 py-3 rounded-lg md:rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm touch-target"
        />
      </div>

      {/* Patients Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredPatients?.map(patient => (
            <div key={patient.id} className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm md:text-base">
                  {patient.name.charAt(0)}
                </div>
                <span className="text-xs font-mono text-slate-400">#{patient.id}</span>
              </div>
              
              <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {patient.name}
              </h3>
              
              <div className="mt-2 space-y-1 text-sm text-slate-500">
                <p>Age: {patient.age} • {patient.gender}</p>
                <p className="text-xs md:text-sm">Registered: {new Date(patient.createdAt!).toLocaleDateString()}</p>
              </div>

              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-100">
                <Link href={`/assess`} className="block w-full text-center py-2.5 md:py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors touch-target">
                  New Assessment
                </Link>
              </div>
            </div>
          ))}
          {filteredPatients?.length === 0 && (
             <div className="col-span-full text-center py-8 md:py-12 bg-slate-50 rounded-lg md:rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm md:text-base">
                {search ? `No patients found matching "${search}"` : "No patients found"}
             </div>
          )}
        </div>
      )}
    </Layout>
  );
}
