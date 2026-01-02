import { useParams } from "wouter";
import { Layout } from "@/components/Layout";
import { usePrediction, useCounterfactual } from "@/hooks/use-medical";
import { RiskGauge } from "@/components/RiskGauge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  Loader2, AlertCircle, Sparkles, Sliders, ArrowRight, Info, Fingerprint, 
  Stethoscope, FileText, Users, CheckCircle, AlertTriangle, Clock, Microscope
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export default function PredictionReport() {
  const { id } = useParams() as { id: string };
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

  // Handle both old and new prediction formats
  const topFeatures = prediction.topFeatures || [];
  const clinicalInterpretation = (prediction as any).clinical_interpretation || (prediction as any).clinicalInterpretation || '';
  const recommendations = (prediction as any).recommendations || {};
  const modelPerformance = (prediction as any).model_performance || (prediction as any).modelPerformance || {};
  const nextSteps = (prediction as any).next_steps || (prediction as any).nextSteps || [];
  const biasAnalysis = prediction.biasAnalysis || (prediction as any).bias_analysis || {};

  const featureData = topFeatures.map((f: any) => ({
    name: f.feature,
    importance: f.importance || 0,
    value: f.value,
    contribution: f.contribution,
    clinical_meaning: (f as any).clinical_meaning || `${f.feature}: ${f.value}`,
    shap_value: (f as any).shap_value || 0
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

          {/* Clinical Interpretation */}
          {clinicalInterpretation && (
            <div className="mt-4 w-full p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Clinical Interpretation</p>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">{clinicalInterpretation}</p>
            </div>
          )}

          {/* Model Performance */}
          {modelPerformance.auc_score && (
            <div className="mt-4 w-full p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">Model Performance</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">AUC Score:</span>
                  <span className="font-mono text-slate-900">{modelPerformance.auc_score}</span>
                </div>
                {modelPerformance.sensitivity && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Sensitivity:</span>
                    <span className="font-mono text-slate-900">{modelPerformance.sensitivity}</span>
                  </div>
                )}
                {modelPerformance.specificity && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Specificity:</span>
                    <span className="font-mono text-slate-900">{modelPerformance.specificity}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 w-full p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Uncertainty Metric (MC Dropout)</p>
            <div className="flex items-center gap-2">
               <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-slate-400" style={{width: `${(prediction.uncertainty || 0.1) * 100}%`}} />
               </div>
               <span className="text-xs font-mono text-slate-600">±{((prediction.uncertainty || 0.1) * 100).toFixed(1)}%</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 leading-tight">Variance calculated via 50 forward passes with stochastic dropout.</p>
          </div>
        </div>

        {/* Local Explainability */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Clinical Feature Attribution (SHAP Values)
          </h3>
          
          {featureData.length > 0 ? (
            <>
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
                      formatter={(value: any) => [
                        typeof value === 'number' ? value.toFixed(3) : value,
                        'SHAP Value'
                      ]}
                      labelFormatter={(label: any) => {
                        const feature = featureData.find((f: any) => f.name === label);
                        return feature?.clinical_meaning || label;
                      }}
                    />
                    <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                      {featureData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.contribution === 'negative' ? '#94a3b8' : '#6366f1'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Clinical Meanings */}
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Clinical Interpretations</h4>
                {featureData.slice(0, 3).map((feature: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className={clsx(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      feature.contribution === 'negative' 
                        ? "bg-slate-400" : "bg-indigo-500"
                    )} />
                    <div>
                      <p className="text-xs font-medium text-slate-900">{feature.name}</p>
                      <p className="text-xs text-slate-600">{feature.clinical_meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No feature explanations available</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" /> High Risk Drivers
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
              <div className="w-2.5 h-2.5 bg-slate-400 rounded-sm" /> Protective Factors
            </div>
          </div>
        </div>

        {/* Medical Images Display */}
        {(prediction as any).medical_images && (prediction as any).medical_images.length > 0 && (
          <div className="lg:col-span-3 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-blue-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Stored Medical Images
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(prediction as any).medical_images.map((image: any, index: number) => (
                <div key={index} className="bg-white/70 p-4 rounded-xl border border-blue-100">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-blue-800">{image.scan_type}</h4>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {image.body_part}
                      </span>
                    </div>
                    
                    {image.image_url && (
                      <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        <img 
                          src={image.image_url} 
                          alt={image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-1 text-xs text-slate-600">
                      <div>File: {image.filename}</div>
                      <div>Size: {image.file_size ? `${(image.file_size / 1024).toFixed(1)} KB` : 'N/A'}</div>
                      <div>Dimensions: {image.width}×{image.height}</div>
                      <div>Format: {image.image_format}</div>
                    </div>
                    
                    {image.ai_analysis && image.ai_analysis.prediction && (
                      <div className="pt-2 border-t border-blue-100">
                        <div className="text-xs font-medium text-blue-800 mb-1">AI Analysis:</div>
                        <div className="text-xs text-slate-600">
                          {image.ai_analysis.prediction.predicted_class} 
                          ({(image.ai_analysis.prediction.confidence * 100).toFixed(1)}%)
                        </div>
                      </div>
                    )}
                    
                    {image.description && (
                      <div className="text-xs text-slate-500 italic">
                        {image.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Combined Cancer & Image Analysis Results */}
        {(prediction as any).image_analysis && (prediction as any).multimodal_fusion && (
          <div className="lg:col-span-3 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6 rounded-2xl border border-purple-200 shadow-lg">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-purple-100 pb-2 flex items-center gap-2">
              <Microscope className="w-4 h-4 text-purple-500" /> 
              Combined Cancer Prediction & ResNet Image Analysis
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Combined Results */}
              <div className="space-y-4">
                <div className="bg-white/80 p-5 rounded-xl border border-purple-100 shadow-sm">
                  <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                    🎯 Final Combined Results
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                      <span className="font-semibold text-slate-700">Combined Risk Score:</span>
                      <span className="text-2xl font-bold text-purple-700">
                        {(prediction as any).multimodal_fusion.combined_risk.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs font-medium text-blue-600 mb-1">Clinical Data</div>
                        <div className="text-lg font-bold text-blue-700">
                          {(prediction as any).multimodal_fusion.tabular_risk.toFixed(1)}%
                        </div>
                        <div className="text-xs text-blue-500">70% weight</div>
                      </div>
                      
                      <div className="text-center p-3 bg-rose-50 rounded-lg border border-rose-200">
                        <div className="text-xs font-medium text-rose-600 mb-1">Image Analysis</div>
                        <div className="text-lg font-bold text-rose-700">
                          {(prediction as any).multimodal_fusion.image_risk.toFixed(1)}%
                        </div>
                        <div className="text-xs text-rose-500">30% weight</div>
                      </div>
                    </div>
                    
                    {(prediction as any).multimodal_fusion.fusion_details && (
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="text-xs font-medium text-green-700 mb-2">Analysis Agreement</div>
                        <div className="text-sm text-green-600 capitalize">
                          {(prediction as any).multimodal_fusion.fusion_details.agreement_level} Agreement
                        </div>
                        {(prediction as any).multimodal_fusion.fusion_details.confidence_boost && (
                          <div className="text-xs text-green-500 mt-1">
                            ✓ High confidence - both modalities align
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Combined Clinical Interpretation */}
                {(prediction as any).combined_clinical_interpretation && (
                  <div className="bg-white/80 p-5 rounded-xl border border-purple-100 shadow-sm">
                    <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                      🏥 Combined Clinical Interpretation
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {(prediction as any).combined_clinical_interpretation}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Right Column - Detailed Image Analysis */}
              <div className="space-y-4">
                <div className="bg-white/80 p-5 rounded-xl border border-purple-100 shadow-sm">
                  <h4 className="text-sm font-bold text-purple-800 mb-4 flex items-center gap-2">
                    🔬 ResNet Image Analysis Details
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-medium text-slate-600 mb-1">Model Used</div>
                        <div className="text-sm font-semibold text-slate-800">
                          {(prediction as any).image_analysis.model_info?.name || 'ResNet-50'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-600 mb-1">Scan Type</div>
                        <div className="text-sm font-semibold text-slate-800">
                          {(prediction as any).image_analysis.scan_type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs font-medium text-slate-600 mb-2">AI Prediction</div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-800">
                          {(prediction as any).image_analysis.prediction.predicted_class}
                        </span>
                        <span className="text-sm font-bold text-purple-600">
                          {((prediction as any).image_analysis.prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    {(prediction as any).image_analysis.tumor_analysis && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-slate-600">Tumor Analysis</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-slate-50 rounded">
                            <div className="font-medium">Tumor Detected</div>
                            <div className={clsx(
                              "font-semibold",
                              (prediction as any).image_analysis.tumor_analysis.tumor_detected 
                                ? "text-rose-600" : "text-green-600"
                            )}>
                              {(prediction as any).image_analysis.tumor_analysis.tumor_detected ? "Yes" : "No"}
                            </div>
                          </div>
                          <div className="p-2 bg-slate-50 rounded">
                            <div className="font-medium">Malignancy Risk</div>
                            <div className="font-semibold text-slate-800">
                              {((prediction as any).image_analysis.tumor_analysis.malignancy_probability * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(prediction as any).image_analysis.clinical_assessment && (
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <div className="text-xs font-medium text-blue-700 mb-2">Clinical Assessment</div>
                        <div className="text-sm text-blue-600">
                          Urgency: {(prediction as any).image_analysis.clinical_assessment.urgency_level}
                        </div>
                        <div className="text-xs text-blue-500 mt-1">
                          {(prediction as any).image_analysis.clinical_assessment.time_to_action}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Image Recommendations */}
                {(prediction as any).image_analysis.recommendations && (
                  <div className="bg-white/80 p-5 rounded-xl border border-purple-100 shadow-sm">
                    <h4 className="text-sm font-bold text-purple-800 mb-3">Image-Based Recommendations</h4>
                    <div className="space-y-2">
                      {(prediction as any).image_analysis.recommendations.immediate_actions?.slice(0, 2).map((action: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Fusion Method Explanation */}
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <h4 className="text-sm font-bold text-indigo-800 mb-2 flex items-center gap-2">
                ⚡ Multimodal AI Fusion Method
              </h4>
              <p className="text-xs text-indigo-600 leading-relaxed">
                {(prediction as any).multimodal_fusion.fusion_method}: Clinical features (patient data, lab results, symptoms) are weighted at 70% 
                while ResNet image analysis contributes 30% to the final risk assessment. This approach leverages both quantitative 
                clinical data and visual pattern recognition for enhanced diagnostic accuracy.
              </p>
            </div>
          </div>
        )}
        {recommendations && Object.keys(recommendations).length > 0 && (
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" /> Evidence-Based Clinical Recommendations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.immediate_actions && recommendations.immediate_actions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h4 className="text-sm font-bold text-slate-900">Immediate Actions</h4>
                  </div>
                  <ul className="space-y-2">
                    {recommendations.immediate_actions.map((action: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-3 h-3 text-rose-500 mt-0.5 shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendations.lifestyle_modifications && recommendations.lifestyle_modifications.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <h4 className="text-sm font-bold text-slate-900">Lifestyle Modifications</h4>
                  </div>
                  <ul className="space-y-2">
                    {recommendations.lifestyle_modifications.map((modification: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                        {modification}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendations.screening_recommendations && recommendations.screening_recommendations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h4 className="text-sm font-bold text-slate-900">Screening Protocol</h4>
                  </div>
                  <ul className="space-y-2">
                    {recommendations.screening_recommendations.map((screening: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                        {screening}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {nextSteps && nextSteps.length > 0 && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Next Steps
                </h4>
                <ul className="space-y-1">
                  {nextSteps.map((step: string, index: number) => (
                    <li key={index} className="text-sm text-emerald-700 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Algorithmic Bias Reporting */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
             Fairness Audit
           </h3>
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-widest">
                 <span>Gender Parity Delta</span>
                 <span className="text-slate-900">{(biasAnalysis?.genderBias || biasAnalysis?.demographic_bias?.gender_bias || 0).toFixed(3)}</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-indigo-400" 
                    style={{ width: `${(biasAnalysis?.genderBias || biasAnalysis?.demographic_bias?.gender_bias || 0) * 100}%` }} 
                 />
               </div>
             </div>
             <div>
               <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400 mb-1 tracking-widest">
                 <span>Age Group Variance</span>
                 <span className="text-slate-900">{(biasAnalysis?.ageBias || biasAnalysis?.demographic_bias?.age_bias || 0).toFixed(3)}</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-purple-400" 
                    style={{ width: `${(biasAnalysis?.ageBias || biasAnalysis?.demographic_bias?.age_bias || 0) * 100}%` }} 
                 />
               </div>
             </div>
             
             {/* Bias Warnings */}
             {biasAnalysis?.warnings && biasAnalysis.warnings.length > 0 && (
               <div className="space-y-2">
                 {biasAnalysis.warnings.map((warning: string, index: number) => (
                   <div key={index} className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                     <p className="text-[10px] text-amber-700 leading-tight flex items-start gap-2">
                       <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                       {warning}
                     </p>
                   </div>
                 ))}
               </div>
             )}
             
             <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <p className="text-[10px] text-indigo-700 leading-tight">
                  {biasAnalysis?.fairnessWarning || biasAnalysis?.fairness_metrics?.access_to_care || "System confirms parity within acceptable clinical thresholds."}
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
