import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];
  
  // Color based on risk level
  let riskColor = "#10b981"; // Low (Green)
  if (score > 30) riskColor = "#f59e0b"; // Medium (Orange)
  if (score > 70) riskColor = "#ef4444"; // High (Red)

  // Empty part color
  const emptyColor = "#f1f5f9";

  return (
    <div className="relative h-48 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="risk" fill={riskColor} />
            <Cell key="empty" fill={emptyColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="text-3xl font-bold text-slate-800">{score.toFixed(1)}%</span>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Risk Score</p>
      </div>
    </div>
  );
}
