import { useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { usePrediction, useCounterfactual } from "@/hooks/use-medical";
import { RiskGauge } from "@/components/RiskGauge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from "recharts";
import { Loader2, AlertCircle, Sparkles, Sliders, ArrowRight, Info, Fingerprint } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export default function PredictionReport() {
  const { id } = useParams();
  const { data: prediction, isLoading } = usePrediction(Number(id));
  const counterfactual = useCounterfactual();
  
  // Simulation State
  const [simulationValue, setSimulationValue] = useState<number>(0);
  const [simulatedRisk, setSimulatedRisk] = useState<number | null>(null);

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  if (!prediction) return <div className="p-8">Prediction not found.</div>;

  const featureData = prediction.topFeatures.map(f => ({
    name: f.feature,
    importance: f.importance,
    value: f.value,
    contribution: f.contribution
  }));

  const handleSimulate = async () => {
    if (!id) return;
    try {
      const topFeature = prediction.topFeatures[0].feature; 
      const changes = { [topFeature]: simulationValue };
      const result = await counterfactual.mutateAsync({ id: Number(id), changes });
      setSimulatedRisk(result.riskScore);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Explainable AI Clinical Report</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Record ID: #{prediction.id}
            </span>
          </div>
          <p className="text-slate-500">Multimodal Fusion Diagnostic • {new Date(prediction.createdAt!).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
           <div className="flex items-center justify-end gap-2 mb-1">
             <Fingerprint className="w-4 h-4 text-slate-400" />
             <h2 className="text-xl font-bold text-slate-900">{prediction.disease}</h2>
           </div>
           <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Model Fidelity: {(prediction.confidence * 100).toFixed(1)}%</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Assessment Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 w-full border-b border-slate-100 pb-2 flex justify-between items-center">
            Probabilistic Risk 
            <Info className="w-4 h-4 text-slate-300" />
          </h3>
          <RiskGauge score={prediction.riskScore} />
          
          <div className={clsx(
            "mt-4 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2",
            prediction.riskCategory === 'High' ? "bg-rose-50 text-rose-700" :
            prediction.riskCategory === 'Medium' ? "bg-amber-50 text-amber-700" :
            "bg-emerald-50 text-emerald-700"
          )}>
            <AlertCircle className="w-4 h-4" />
            Category: {prediction.riskCategory} Risk
          </div>

          <div className="mt-6 w-full p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Uncertainty Metric (MC Dropout)</p>
            <div className="flex items-center gap-2">
               <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-slate-400" style={{width: `${prediction.uncertainty * 100}%`}} />
               </div>
               <span className="text-xs font-mono text-slate-600">±{(prediction.uncertainty * 100).toFixed(1)}%</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 leading-tight">Variance calculated via 50 forward passes with stochastic dropout.</p>
          </div>
        </div>

        {/* Local Explainability */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Local Attribution (SHAP Values)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis 
                   dataKey="name" 
                   type="category" 
                   width={120} 
                   tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                  {featureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.contribution === 'negative' ? '#94a3b8' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" /> High Risk Drivers
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-sm" /> Protective Factors
            </div>
          </div>
        </div>

        {/* Algorithmic Bias Reporting */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
             Fairness Audit
           </h3>
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-widest">
                 <span>Gender Parity Delta</span>
                 <span className="text-slate-900">{(prediction.biasAnalysis?.genderBias || 0).toFixed(3)}</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-indigo-400" 
                    style={{ width: `${(prediction.biasAnalysis?.genderBias || 0) * 100}%` }} 
                 />
               </div>
             </div>
             <div>
               <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-widest">
                 <span>Age Group Variance</span>
                 <span className="text-slate-900">{(prediction.biasAnalysis?.ageBias || 0).toFixed(3)}</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-purple-400" 
                    style={{ width: `${(prediction.biasAnalysis?.ageBias || 0) * 100}%` }} 
                 />
               </div>
             </div>
             <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <p className="text-[10px] text-indigo-700 leading-tight">
                  {prediction.biasAnalysis?.fairnessWarning || "System confirms parity within acceptable clinical thresholds."}
                </p>
             </div>
           </div>
        </div>

        {/* Counterfactual & Causal Reasoning */}
        <div className="lg:col-span-2 bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Sliders className="w-32 h-32" />
           </div>
           
           <h3 className="text-sm font-bold uppercase tracking-wider mb-6 border-b border-slate-700 pb-2 flex items-center gap-2 relative z-10">
             <Sliders className="w-4 h-4 text-emerald-400" /> Causal Counterfactual Simulator
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
             <div className="space-y-6">
                <p className="text-slate-400 text-xs leading-relaxed">
                  Adjust <strong>{featureData[0].name}</strong> to explore causal pathways and intervention efficacy. This model uses causal inference to estimate risk delta.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500 tracking-widest">
                    <span>Baseline: {featureData[0].value}</span>
                    <span className="text-emerald-400">Intervention: {simulationValue || featureData[0].value}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="300" 
                    step="5"
                    defaultValue={featureData[0].value}
                    onChange={(e) => setSimulationValue(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <button 
                  onClick={handleSimulate}
                  disabled={counterfactual.isPending}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40 disabled:opacity-50"
                >
                  {counterfactual.isPending ? "Computing Delta..." : "Compute Intervention Risk"}
                </button>
             </div>

             <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-700/50">
               <div className="flex items-center justify-center gap-8">
                 <div>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Baseline Risk</p>
                   <p className="text-2xl font-mono font-bold text-white">{prediction.riskScore.toFixed(1)}%</p>
                 </div>
                 <ArrowRight className="w-5 h-5 text-slate-600" />
                 <div>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Post-Intervention</p>
                   {simulatedRisk !== null ? (
                     <p className={clsx(
                       "text-2xl font-mono font-bold transition-all duration-300",
                       simulatedRisk < prediction.riskScore ? "text-emerald-400" : "text-rose-400"
                     )}>
                       {simulatedRisk.toFixed(1)}%
                     </p>
                   ) : (
                     <p className="text-2xl font-mono font-bold text-slate-700">--</p>
                   )}
                 </div>
               </div>
               {simulatedRisk !== null && (
                 <div className="mt-4 pt-4 border-t border-slate-700/50">
                   <p className="text-[10px] font-bold uppercase tracking-tighter">
                     {simulatedRisk < prediction.riskScore 
                       ? "✓ Favorable causal outcome detected"
                       : "⚠ Adverse pathway identified"}
                   </p>
                 </div>
               )}
             </div>
           </div>
        </div>

      </div>

      <footer className="mt-12 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
         <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
         <p className="text-xs text-amber-800 leading-relaxed">
           <strong>Clinical Disclaimer:</strong> This system is a Research Prototype Decision Support System. Predictions are generated via ensemble probabilistic models and are for informational purposes only. Do not use for definitive diagnosis or treatment planning.
         </p>
      </footer>
    </Layout>
  );
}
