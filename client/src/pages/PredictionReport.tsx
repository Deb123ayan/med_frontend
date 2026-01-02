import { useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { usePrediction, useCounterfactual } from "@/hooks/use-medical";
import { RiskGauge } from "@/components/RiskGauge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from "recharts";
import { Loader2, AlertCircle, Sparkles, Sliders, ArrowRight } from "lucide-react";
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

  // Prepare Feature Data for Chart
  const featureData = prediction.topFeatures.map(f => ({
    name: f.feature,
    importance: f.importance,
    value: f.value
  }));

  const handleSimulate = async () => {
    if (!id) return;
    try {
      // Find the most important feature to simulate change on
      const topFeature = prediction.topFeatures[0].feature; 
      const changes = { [topFeature]: simulationValue };
      
      const result = await counterfactual.mutateAsync({ 
        id: Number(id), 
        changes 
      });
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
            <h1 className="text-3xl font-bold text-slate-900">Clinical Report</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              ID: #{prediction.id}
            </span>
          </div>
          <p className="text-slate-500">Analysis generated on {new Date(prediction.createdAt!).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
           <h2 className="text-xl font-semibold text-slate-900">{prediction.disease}</h2>
           <p className="text-sm text-slate-500">Model Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 w-full border-b border-slate-100 pb-2">
            Risk Assessment
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
        </div>

        {/* Explainability / Top Features */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Key Risk Factors
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                   dataKey="name" 
                   type="category" 
                   width={100} 
                   tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                  {featureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-4 italic">
            *Features listed in order of impact on the model's decision.
          </p>
        </div>

        {/* Bias Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
             Bias Check
           </h3>
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-slate-600">Gender Sensitivity</span>
                 <span className="font-medium text-slate-900">{(prediction.biasAnalysis?.genderBias || 0).toFixed(3)}</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${(prediction.biasAnalysis?.genderBias || 0) * 100}%` }} 
                 />
               </div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-slate-600">Age Sensitivity</span>
                 <span className="font-medium text-slate-900">{(prediction.biasAnalysis?.ageBias || 0).toFixed(3)}</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-purple-500" 
                    style={{ width: `${(prediction.biasAnalysis?.ageBias || 0) * 100}%` }} 
                 />
               </div>
             </div>
             <p className="text-xs text-slate-400 mt-2">
               Lower values indicate fairer predictions across demographic groups.
             </p>
           </div>
        </div>

        {/* Counterfactual Simulator */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl">
           <h3 className="text-sm font-bold uppercase tracking-wider mb-6 border-b border-slate-700 pb-2 flex items-center gap-2">
             <Sliders className="w-4 h-4 text-emerald-400" /> "What-If" Simulator
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div className="space-y-6">
                <p className="text-slate-300 text-sm">
                  Adjust the primary risk factor <strong>{featureData[0].name}</strong> to see how it affects the patient's risk score.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Value: {featureData[0].value}</span>
                    <span className="text-emerald-400">Target: {simulationValue || featureData[0].value}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="300" 
                    step="5"
                    defaultValue={featureData[0].value}
                    onChange={(e) => setSimulationValue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <button 
                  onClick={handleSimulate}
                  disabled={counterfactual.isPending}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {counterfactual.isPending ? "Simulating..." : "Run Simulation"}
                </button>
             </div>

             <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
               <div className="flex items-center justify-center gap-8">
                 <div>
                   <p className="text-xs text-slate-400 uppercase">Original Risk</p>
                   <p className="text-2xl font-bold text-white">{prediction.riskScore.toFixed(1)}%</p>
                 </div>
                 <ArrowRight className="w-5 h-5 text-slate-600" />
                 <div>
                   <p className="text-xs text-slate-400 uppercase">Simulated Risk</p>
                   {simulatedRisk !== null ? (
                     <p className={clsx(
                       "text-2xl font-bold transition-all duration-300",
                       simulatedRisk < prediction.riskScore ? "text-emerald-400" : "text-rose-400"
                     )}>
                       {simulatedRisk.toFixed(1)}%
                     </p>
                   ) : (
                     <p className="text-2xl font-bold text-slate-600">--</p>
                   )}
                 </div>
               </div>
               {simulatedRisk !== null && (
                 <p className="text-xs text-slate-400 mt-4">
                   {simulatedRisk < prediction.riskScore 
                     ? "Risk decreased! This intervention could be effective."
                     : "Risk increased. Caution advised."}
                 </p>
               )}
             </div>
           </div>
        </div>

      </div>
    </Layout>
  );
}
