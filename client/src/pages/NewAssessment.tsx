import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCreatePrediction } from "@/hooks/use-medical";
import { useLocation } from "wouter";
import { Loader2, Heart, Activity } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { clsx } from "clsx";

export default function NewAssessment() {
  const [diseaseType, setDiseaseType] = useState<'Heart Disease' | 'Diabetes'>('Heart Disease');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createPrediction = useCreatePrediction();

  // Form State
  const [formData, setFormData] = useState({
    // Patient Info
    name: "",
    age: "",
    gender: "Male",
    // Clinical Data
    cp: "0",
    trestbps: "120",
    chol: "200",
    fbs: "0",
    thalach: "150",
    glucose: "100",
    bmi: "25",
    insulin: "80",
    bloodPressure: "80"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clinicalData: Record<string, number> = {};

      if (diseaseType === 'Heart Disease') {
        clinicalData.age = Number(formData.age);
        clinicalData.sex = formData.gender === 'Male' ? 1 : 0;
        clinicalData.cp = Number(formData.cp);
        clinicalData.trestbps = Number(formData.trestbps);
        clinicalData.chol = Number(formData.chol);
        clinicalData.fbs = Number(formData.fbs);
        clinicalData.thalach = Number(formData.thalach);
      } else {
        clinicalData.glucose = Number(formData.glucose);
        clinicalData.bmi = Number(formData.bmi);
        clinicalData.insulin = Number(formData.insulin);
        clinicalData.bloodPressure = Number(formData.bloodPressure);
      }

      const result = await createPrediction.mutateAsync({
        patientData: {
            name: formData.name,
            age: Number(formData.age),
            gender: formData.gender,
            medicalHistory: []
        },
        clinicalData,
        disease: diseaseType
      });

      toast({
        title: "Assessment Complete",
        description: `Risk Score: ${result.riskScore.toFixed(1)}%`,
      });
      
      setLocation(`/predictions/${result.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">New Clinical Assessment</h1>
          <p className="text-slate-500 mt-2">Input patient vitals to generate a real-time risk prediction.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Disease Selector */}
          <div className="lg:col-span-1 space-y-4">
            <div 
              onClick={() => setDiseaseType('Heart Disease')}
              className={clsx(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                diseaseType === 'Heart Disease' 
                  ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10" 
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx("p-2 rounded-lg", diseaseType === 'Heart Disease' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500")}>
                  <Heart className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Heart Disease</h3>
                  <p className="text-xs text-slate-500">Cardiovascular Risk</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setDiseaseType('Diabetes')}
              className={clsx(
                "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                diseaseType === 'Diabetes' 
                  ? "border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10" 
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx("p-2 rounded-lg", diseaseType === 'Diabetes' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                  <Activity className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Diabetes</h3>
                  <p className="text-xs text-slate-500">Metabolic Risk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              {/* Patient Info Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Patient Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <input 
                      required name="name" value={formData.name} onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Age</label>
                      <input 
                        required type="number" name="age" value={formData.age} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="45"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Gender</label>
                      <select 
                        name="gender" value={formData.gender} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Data Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Clinical Metrics
                </h3>
                
                {diseaseType === 'Heart Disease' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Chest Pain Type (CP)</label>
                      <select 
                        name="cp" value={formData.cp} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="0">Typical Angina</option>
                        <option value="1">Atypical Angina</option>
                        <option value="2">Non-anginal Pain</option>
                        <option value="3">Asymptomatic</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Resting BP (mm Hg)</label>
                      <input 
                        type="number" name="trestbps" value={formData.trestbps} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Cholesterol (mg/dl)</label>
                      <input 
                        type="number" name="chol" value={formData.chol} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Max Heart Rate</label>
                      <input 
                        type="number" name="thalach" value={formData.thalach} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-sm font-medium text-slate-700 block mb-2">Fasting Blood Sugar &gt; 120 mg/dl?</label>
                       <div className="flex gap-4">
                         <label className="flex items-center gap-2">
                           <input type="radio" name="fbs" value="1" checked={formData.fbs === "1"} onChange={handleChange} />
                           <span>Yes</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <input type="radio" name="fbs" value="0" checked={formData.fbs === "0"} onChange={handleChange} />
                           <span>No</span>
                         </label>
                       </div>
                    </div>
                  </div>
                ) : (
                  // Diabetes Fields
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Glucose Level</label>
                      <input 
                        type="number" name="glucose" value={formData.glucose} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">BMI</label>
                      <input 
                        type="number" name="bmi" value={formData.bmi} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Insulin Level</label>
                      <input 
                        type="number" name="insulin" value={formData.insulin} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Blood Pressure</label>
                      <input 
                        type="number" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    "w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-200 transform active:scale-[0.98]",
                    diseaseType === 'Heart Disease' 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25" 
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/25",
                    loading && "opacity-70 cursor-wait"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Running Model...
                    </div>
                  ) : (
                    "Generate Risk Assessment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
