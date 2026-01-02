import { Link, useLocation } from "wouter";
import { LayoutDashboard, FilePlus2, Users, Settings, Activity, BrainCircuit } from "lucide-react";
import { clsx } from "clsx";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/assess", label: "New Assessment", icon: FilePlus2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold font-display text-slate-800 tracking-tight">
            Medi<span className="text-blue-600">Predict</span>
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100 ring-1 ring-blue-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}>
                <Icon className={clsx(
                  "w-5 h-5",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-4 text-white shadow-lg shadow-blue-900/20">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-blue-200" />
              <span className="font-semibold text-sm">AI Powered</span>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Models trained on verified clinical datasets with 98% accuracy.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
