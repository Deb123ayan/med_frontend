import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: string; type: 'up' | 'down' };
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'rose';
}

export function StatCard({ label, value, trend, icon: Icon, color = 'blue' }: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-slate-500 mb-1 truncate">{label}</p>
          <h3 className="text-lg md:text-2xl font-bold text-slate-900">{value}</h3>
          
          {trend && (
            <div className={`flex items-center mt-1 md:mt-2 text-xs font-medium ${trend.type === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.type === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              <span className="hidden sm:inline">{trend.value} from last month</span>
              <span className="sm:hidden">{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-2 md:p-3 rounded-lg border ${colorMap[color]} flex-shrink-0 ml-2`}>
          <Icon className="w-4 h-4 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
}
