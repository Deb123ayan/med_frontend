import { Link, useLocation } from "wouter";
import { LayoutDashboard, FilePlus2, Users, Activity, BrainCircuit, Menu, X, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Mock doctor data for now (no auth)
  const mockDoctor = {
    first_name: "Demo",
    last_name: "Doctor",
    specialization: "General Practice",
    email: "demo@example.com",
    hospital_affiliation: "Demo Hospital"
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/assess", label: "New Assessment", icon: FilePlus2 },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-body">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-3 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-base font-bold font-display text-slate-800 tracking-tight">
            Arogya<span className="text-blue-600">-AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Doctor Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                  {mockDoctor?.first_name?.[0]}{mockDoctor?.last_name?.[0]}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Dr. {mockDoctor?.first_name} {mockDoctor?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{mockDoctor?.specialization}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Logout clicked')}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu} />
          <nav className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold font-display text-slate-800 tracking-tight">
                Arogya<span className="text-blue-600">-AI</span>
              </span>
            </div>
            
            <div className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={closeMobileMenu}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      isActive 
                        ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100 ring-1 ring-blue-200" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={clsx(
                      "w-5 h-5",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="absolute bottom-4 left-3 right-3">
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
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold font-display text-slate-800 tracking-tight">
            Arogya<span className="text-blue-600">-AI</span>
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

        {/* Doctor Profile Section */}
        <div className="p-4 border-t border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                    {mockDoctor?.first_name?.[0]}{mockDoctor?.last_name?.[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900">Dr. {mockDoctor?.first_name} {mockDoctor?.last_name}</p>
                    <p className="text-xs text-slate-500">{mockDoctor?.specialization}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Dr. {mockDoctor?.first_name} {mockDoctor?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{mockDoctor?.email}</p>
                  <p className="text-xs text-muted-foreground">{mockDoctor?.hospital_affiliation}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Logout clicked')}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-4">
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
      <main className="flex-1 md:ml-64 p-3 md:p-8">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
