import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCreatePrediction } from "@/hooks/use-medical";
import { useLocation } from "wouter";
import {
  Loader2,
  Microscope,
  Upload,
  User,
  FileImage,
  Activity,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Brain,
  Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clsx } from "clsx";

export default function NewAssessment() {
  const diseaseType = "Cancer";
  const [currentStep, setCurrentStep] = useState(1);
  const [cancerType, setCancerType] = useState<
    | "Breast Cancer"
    | "Lung Cancer"
    | "Colorectal Cancer"
    | "Prostate Cancer"
    | "Skin Cancer"
    | "Brain Cancer"
  >("Breast Cancer");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createPrediction = useCreatePrediction();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    tumorSize: "",
    markerX: "",
    reportText: "",
    lymphNodes: "",
    grade: "",
    stage: "",
    erStatus: "",
    prStatus: "",
    her2Status: "",
    menopauseStatus: "",
    familyHistory: "",
    smokingHistory: "",
    smokingYears: "",
    packYears: "",
    psaLevel: "",
    lesionDiameter: "",
    asymmetry: "",
    borderIrregularity: "",
    colorVariation: "",
    sunExposure: "",
    skinType: "",
    geneticMarkers: "",
    menopauseAge: "",
    copdHistory: "",
    asbestosExposure: "",
    noduleSize: "",
    noduleLocation: "",
    chestPain: "",
    weightLoss: "",
    manufacturer: "",
    studyYear: "",
    seriesYear: "",
    // Brain Cancer specific fields
    headaches: "",
    seizures: "",
    visionProblems: "",
    speechProblems: "",
    memoryIssues: "",
    motorWeakness: "",
    radiationExposure: "",
    tumorLocation: "",
    symptomDuration: "",
    kpsScore: "",
    medicalImageFile: null as File | null,
    reportFile: null as File | null,
    imageBase64: "",
    imageMetadata: null as any,
  });

  // Cancer type configurations
  const cancerConfigs = {
    "Breast Cancer": {
      icon: "🎗️",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
      borderColor: "border-pink-200",
      scanType: "Mammography/Histopathology",
      description:
        "Advanced breast tissue analysis using AI-powered mammography and histopathology interpretation",
    },
    "Lung Cancer": {
      icon: "🫁",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      scanType: "CT Scan/X-Ray",
      description:
        "Comprehensive lung imaging analysis with nodule detection and risk assessment",
    },
    "Colorectal Cancer": {
      icon: "🩺",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      scanType: "CT/Colonoscopy",
      description:
        "Detailed colorectal imaging with polyp detection and staging analysis",
    },
    "Prostate Cancer": {
      icon: "👨‍⚕️",
      gradient: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-50 to-indigo-50",
      borderColor: "border-purple-200",
      scanType: "MRI/Biopsy",
      description:
        "Precision prostate imaging with PSA correlation and Gleason scoring",
    },
    "Skin Cancer": {
      icon: "🔬",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      scanType: "Dermoscopy",
      description:
        "Advanced dermatological analysis using ABCDE criteria and pattern recognition",
    },
    "Brain Cancer": {
      icon: "🧠",
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50",
      borderColor: "border-violet-200",
      scanType: "MRI/CT Scan",
      description:
        "Comprehensive brain tumor analysis using MRI imaging with clinical symptom correlation",
    },
  };

  const currentConfig = cancerConfigs[cancerType];

  // Step validation
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.age && formData.gender);
      case 2:
        return !!(formData.medicalImageFile || formData.imageBase64);
      case 3:
        // Make step 3 mandatory - require at least tumor size and family history
        return !!(formData.tumorSize && formData.familyHistory !== "");
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const file = e.target.files?.[0] || null;

    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));

      if (
        (name === "reportFile" || name === "medicalImageFile") &&
        file.type.startsWith("image/")
      ) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target?.result as string;

          let scanType = "Other";
          let bodyPart = "other";
          let analysisType = "general";

          if (diseaseType === "Cancer") {
            scanType =
              cancerType === "Breast Cancer"
                ? "Histopathology"
                : cancerType === "Lung Cancer"
                  ? "CT"
                  : cancerType === "Colorectal Cancer"
                    ? "CT"
                    : cancerType === "Prostate Cancer"
                      ? "MRI"
                      : cancerType === "Brain Cancer"
                        ? "MRI"
                        : "Dermoscopy";
            bodyPart =
              cancerType === "Breast Cancer"
                ? "breast"
                : cancerType === "Lung Cancer"
                  ? "lung"
                  : cancerType === "Colorectal Cancer"
                    ? "colon"
                    : cancerType === "Prostate Cancer"
                      ? "prostate"
                      : cancerType === "Brain Cancer"
                        ? "brain"
                        : "skin";
            analysisType = "cancer_detection";
          }

          setFormData((prev) => ({
            ...prev,
            imageBase64: base64Data,
            imageMetadata: {
              filename: file.name,
              scanType: scanType,
              bodyPart: bodyPart,
              description: `${diseaseType} medical image for ResNet analysis`,
              analysisType: analysisType,
              disease: diseaseType,
            },
          }));
        };
        reader.readAsDataURL(file);

        toast({
          title: "Medical Image Uploaded",
          description: `${file.name} ready for ResNet analysis`,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only allow submission when on step 3
    if (currentStep !== 3) {
      console.log(
        "Form submission blocked - not on step 3, current step:",
        currentStep,
      );
      return;
    }

    setLoading(true);

    try {
      if (diseaseType === "Cancer") {
        if (!formData.medicalImageFile && !formData.imageBase64) {
          toast({
            title: "Image Required",
            description: `Medical image upload is mandatory for ${cancerType} analysis`,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      let medicalImages: any[] = [];
      if (formData.imageBase64 && formData.imageMetadata) {
        medicalImages = [
          {
            filename: formData.imageMetadata.filename,
            scanType: formData.imageMetadata.scanType,
            bodyPart: formData.imageMetadata.bodyPart,
            description: formData.imageMetadata.description,
            imageData: formData.imageBase64,
          },
        ];

        toast({
          title: "ResNet Analysis Starting",
          description: `Processing ${formData.imageMetadata.scanType} image with medical AI...`,
        });
      }

      const clinicalData: Record<string, number | string> = {
        age: Number(formData.age),
      };

      if (diseaseType === "Cancer") {
        clinicalData.cancer_type = cancerType;
        clinicalData.tumor_size = Number(formData.tumorSize) || 15;
        clinicalData.marker_x = Number(formData.markerX) || 0.5;

        if (cancerType === "Breast Cancer") {
          clinicalData.lymph_nodes = Number(formData.lymphNodes) || 0;
          clinicalData.grade = Number(formData.grade) || 2;
          clinicalData.stage = Number(formData.stage) || 1;
          clinicalData.genetic_markers = Number(formData.geneticMarkers) || 0;
          clinicalData.menopause_age = Number(formData.menopauseAge) || 51;
          clinicalData.er_status = Number(formData.erStatus) || 1;
          clinicalData.pr_status = Number(formData.prStatus) || 1;
          clinicalData.her2_status = Number(formData.her2Status) || 0;
          clinicalData.menopause_status = Number(formData.menopauseStatus) || 0;
        } else if (cancerType === "Lung Cancer") {
          clinicalData.smoking_years = Number(formData.smokingYears) || 0;
          clinicalData.pack_years = Number(formData.packYears) || 0;
          clinicalData.copd_history = Number(formData.copdHistory) || 0;
          clinicalData.asbestos_exposure =
            Number(formData.asbestosExposure) || 0;
          clinicalData.nodule_size = Number(formData.noduleSize) || 1.0;
          clinicalData.nodule_location = Number(formData.noduleLocation) || 1;
          clinicalData.chest_pain = Number(formData.chestPain) || 0;
          clinicalData.weight_loss = Number(formData.weightLoss) || 0;
        } else if (cancerType === "Colorectal Cancer") {
          clinicalData.sex = formData.gender;
          clinicalData.manufacturer = formData.manufacturer || "SIEMENS";
          clinicalData.study_year = Number(formData.studyYear) || 2024;
          clinicalData.series_year =
            Number(formData.seriesYear || formData.studyYear) || 2024;
        } else if (cancerType === "Prostate Cancer") {
          clinicalData.psa_level = Number(formData.psaLevel) || 2.5;
        } else if (cancerType === "Skin Cancer") {
          clinicalData.lesion_diameter = Number(formData.lesionDiameter) || 5;
          clinicalData.asymmetry = Number(formData.asymmetry) || 0;
          clinicalData.border_irregularity =
            Number(formData.borderIrregularity) || 0;
          clinicalData.color_variation = Number(formData.colorVariation) || 0;
          clinicalData.sun_exposure = Number(formData.sunExposure) || 1;
          clinicalData.skin_type = Number(formData.skinType) || 2;
        } else if (cancerType === "Brain Cancer") {
          clinicalData.headaches = Number(formData.headaches) || 0;
          clinicalData.seizures = Number(formData.seizures) || 0;
          clinicalData.vision_problems = Number(formData.visionProblems) || 0;
          clinicalData.speech_problems = Number(formData.speechProblems) || 0;
          clinicalData.memory_issues = Number(formData.memoryIssues) || 0;
          clinicalData.motor_weakness = Number(formData.motorWeakness) || 0;
          clinicalData.radiation_exposure = Number(formData.radiationExposure) || 0;
          clinicalData.tumor_location = Number(formData.tumorLocation) || 1;
          clinicalData.symptom_duration = Number(formData.symptomDuration) || 1;
          clinicalData.kps_score = Number(formData.kpsScore) || 90;
        }

        clinicalData.family_history = Number(formData.familyHistory) || 0;
        clinicalData.smoking_history = Number(formData.smokingHistory) || 0;
      }

      const result = await createPrediction.mutateAsync({
        patient_data: {
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          medical_history: [],
        },
        clinical_data: clinicalData as Record<string, number | string>,
        medical_images: medicalImages,
        disease: diseaseType,
      });

      toast({
        title: "Assessment Complete",
        description: `Combined Risk Score: ${result.riskScore.toFixed(1)}% | ${
          (result as any).imageAnalysisResults
            ? "With Image Analysis"
            : "Clinical Data Only"
        }`,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-r ${currentConfig.gradient} text-white`}
                  >
                    <Microscope className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  AI Cancer Detection
                </h1>
                <p className="text-slate-600 mt-1 text-sm md:text-base">
                  Advanced multimodal analysis combining medical imaging with
                  clinical data
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex md:hidden items-center gap-2 justify-center">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                        currentStep === step
                          ? `bg-gradient-to-r ${currentConfig.gradient} text-white shadow-lg`
                          : currentStep > step
                            ? "bg-green-500 text-white"
                            : "bg-slate-200 text-slate-500",
                      )}
                    >
                      {currentStep > step ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <ChevronRight
                        className={clsx(
                          "w-4 h-4 mx-1",
                          currentStep > step
                            ? "text-green-500"
                            : "text-slate-300",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                        currentStep === step
                          ? `bg-gradient-to-r ${currentConfig.gradient} text-white shadow-lg`
                          : currentStep > step
                            ? "bg-green-500 text-white"
                            : "bg-slate-200 text-slate-500",
                      )}
                    >
                      {currentStep > step ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <ChevronRight
                        className={clsx(
                          "w-5 h-5 mx-2",
                          currentStep > step
                            ? "text-green-500"
                            : "text-slate-300",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Cancer Type Selector - Top on mobile, Left Sidebar on desktop */}
            <div className="lg:col-span-3 order-1">
              <div
                className={`bg-gradient-to-br ${currentConfig.bgGradient} p-4 md:p-6 rounded-2xl ${currentConfig.borderColor} border-2 lg:sticky lg:top-24`}
              >
                <div className="text-center mb-4 md:mb-6">
                  <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                    {currentConfig.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base md:text-lg">
                    Cancer Type
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">
                    Select for specialized analysis
                  </p>
                </div>

                {/* Mobile: Horizontal scroll, Desktop: Vertical stack */}
                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:space-y-0">
                  {Object.entries(cancerConfigs).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => {
                        // Only allow switching cancer types on step 1
                        if (currentStep > 1) {
                          toast({
                            title: "Cannot Switch Cancer Type",
                            description:
                              "Please complete or restart the current analysis to switch cancer types",
                            variant: "destructive",
                          });
                          return;
                        }

                        setCancerType(type as typeof cancerType);
                        if (formData.medicalImageFile || formData.imageBase64) {
                          setFormData((prev) => ({
                            ...prev,
                            medicalImageFile: null,
                            imageBase64: "",
                            imageMetadata: null,
                          }));
                          toast({
                            title: "Image Cleared",
                            description: `Switched to ${type} - please upload appropriate image`,
                          });
                        }
                      }}
                      disabled={currentStep > 1}
                      className={clsx(
                        "flex-shrink-0 lg:w-full p-3 rounded-xl text-left transition-all duration-200 border-2 min-w-[140px] lg:min-w-0",
                        currentStep > 1
                          ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
                          : cancerType === type
                            ? `bg-white ${config.borderColor} shadow-md`
                            : "bg-white/50 border-transparent hover:bg-white/80",
                      )}
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <span className="text-lg lg:text-xl">
                          {config.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 text-xs lg:text-sm truncate">
                            {type.replace(" Cancer", "")}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {config.scanType}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Current Selection Info */}
                <div className="mt-6 p-4 bg-white/60 rounded-xl border border-white/50">
                  <h4 className="font-semibold text-slate-900 text-sm mb-2">
                    {cancerType} Analysis
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentConfig.description}
                  </p>

                  {/* Restart Analysis Button */}
                  {currentStep > 1 && (
                    <div className="mt-4 pt-3 border-t border-white/50">
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          setFormData({
                            name: "",
                            age: "",
                            gender: "Male",
                            tumorSize: "",
                            markerX: "",
                            reportText: "",
                            lymphNodes: "",
                            grade: "",
                            stage: "",
                            erStatus: "",
                            prStatus: "",
                            her2Status: "",
                            menopauseStatus: "",
                            familyHistory: "",
                            smokingHistory: "",
                            smokingYears: "",
                            packYears: "",
                            psaLevel: "",
                            lesionDiameter: "",
                            asymmetry: "",
                            borderIrregularity: "",
                            colorVariation: "",
                            sunExposure: "",
                            skinType: "",
                            geneticMarkers: "",
                            menopauseAge: "",
                            copdHistory: "",
                            asbestosExposure: "",
                            noduleSize: "",
                            noduleLocation: "",
                            chestPain: "",
                            weightLoss: "",
                            manufacturer: "",
                            studyYear: "",
                            seriesYear: "",
                            // Brain Cancer specific fields
                            headaches: "",
                            seizures: "",
                            visionProblems: "",
                            speechProblems: "",
                            memoryIssues: "",
                            motorWeakness: "",
                            radiationExposure: "",
                            tumorLocation: "",
                            symptomDuration: "",
                            kpsScore: "",
                            medicalImageFile: null,
                            reportFile: null,
                            imageBase64: "",
                            imageMetadata: null,
                          });
                          toast({
                            title: "Analysis Restarted",
                            description:
                              "You can now select a different cancer type",
                          });
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        🔄 Restart Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Main Content Area */}
            <div className="lg:col-span-9 order-2">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Step 1: Patient Information */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 md:p-6 text-white">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-white/20 rounded-xl">
                          <User className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <h2 className="text-lg md:text-xl font-bold">
                            Patient Information
                          </h2>
                          <p className="text-blue-100 text-sm md:text-base">
                            Basic demographic and contact details
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base md:text-lg"
                            placeholder="Enter patient's full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Age *
                          </label>
                          <input
                            required
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base md:text-lg"
                            placeholder="Age in years"
                            min="1"
                            max="120"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Gender *
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-base md:text-lg"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Validation Status */}
                      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3">
                          {isStepValid(1) ? (
                            <>
                              <Check className="w-5 h-5 text-green-500" />
                              <span className="text-sm font-medium text-green-700">
                                Patient information complete
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-amber-500" />
                              <span className="text-sm font-medium text-amber-700">
                                Please fill in all required fields
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Step 2: Medical Image Upload */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${currentConfig.gradient} p-6 text-white`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <FileImage className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">
                            Medical Image Analysis
                          </h2>
                          <p className="text-white/90">
                            Upload {currentConfig.scanType} for AI analysis
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Upload Area */}
                      <div className="relative">
                        <input
                          type="file"
                          name="medicalImageFile"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          accept=".jpg,.jpeg,.png,.dicom,.dcm"
                        />

                        <div
                          className={clsx(
                            "border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-200",
                            formData.medicalImageFile || formData.imageBase64
                              ? "border-green-300 bg-green-50"
                              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100",
                          )}
                        >
                          {formData.medicalImageFile || formData.imageBase64 ? (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-green-700">
                                  Image Ready for Analysis
                                </h3>
                                <p className="text-green-600">
                                  {formData.medicalImageFile?.name ||
                                    "Medical image uploaded"}
                                </p>
                                <p className="text-sm text-green-500 mt-2">
                                  ResNet-50 AI model will analyze this image for{" "}
                                  {cancerType.toLowerCase()} detection
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                                <Upload className="w-8 h-8 text-slate-500" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-slate-700">
                                  Upload {currentConfig.scanType} Image
                                </h3>
                                <p className="text-slate-500">
                                  Drag and drop or click to select medical
                                  images
                                </p>
                                <p className="text-sm text-slate-400 mt-2">
                                  Supported formats: JPG, PNG, DICOM • Max size:
                                  10MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Analysis Info */}
                      <div className="mt-6 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-slate-200 rounded-lg">
                            <Brain className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">
                              AI-Powered Analysis
                            </h4>
                            <ul className="text-sm text-slate-600 space-y-1">
                              <li>• ResNet-50 deep learning architecture</li>
                              <li>• Trained on thousands of medical images</li>
                              <li>
                                • Provides confidence scores and explanations
                              </li>
                              <li>
                                • Combines with clinical data for comprehensive
                                assessment
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Validation Status */}
                      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3">
                          {isStepValid(2) ? (
                            <>
                              <Check className="w-5 h-5 text-green-500" />
                              <span className="text-sm font-medium text-green-700">
                                Medical image uploaded and ready for analysis
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-amber-500" />
                              <span className="text-sm font-medium text-amber-700">
                                Medical image upload is required for{" "}
                                {cancerType.toLowerCase()} analysis
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Step 3: Clinical Parameters */}
                {currentStep === 3 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">
                            Clinical Parameters
                          </h2>
                          <p className="text-emerald-100">
                            Additional data to enhance AI accuracy
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      {/* Basic Clinical Data */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Tumor Size (mm)
                          </label>
                          <input
                            required
                            type="number"
                            name="tumorSize"
                            value={formData.tumorSize}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="15"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Family History
                          </label>
                          <select
                            name="familyHistory"
                            value={formData.familyHistory}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                          >
                            <option value="">Select family history</option>
                            <option value="0">No family history</option>
                            <option value="1">Family history present</option>
                          </select>
                        </div>
                      </div>

                      {/* Cancer-Specific Parameters */}
                      {cancerType === "Breast Cancer" && (
                        <div className="p-6 bg-pink-50 rounded-xl border border-pink-200">
                          <h4 className="font-semibold text-pink-700 mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Breast Cancer Specific Parameters
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Lymph Nodes Affected
                              </label>
                              <input
                                type="number"
                                name="lymphNodes"
                                value={formData.lymphNodes}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-500 focus:outline-none"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tumor Grade
                              </label>
                              <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-pink-200 focus:border-pink-500 focus:outline-none"
                              >
                                <option value="">Select grade</option>
                                <option value="1">Grade 1 (Low grade)</option>
                                <option value="2">
                                  Grade 2 (Intermediate)
                                </option>
                                <option value="3">Grade 3 (High grade)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {cancerType === "Brain Cancer" && (
                        <div className="p-6 bg-violet-50 rounded-xl border border-violet-200">
                          <h4 className="font-semibold text-violet-700 mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            Brain Cancer Specific Parameters
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Headaches
                              </label>
                              <select
                                name="headaches"
                                value={formData.headaches}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:outline-none"
                              >
                                <option value="">Select</option>
                                <option value="0">No headaches</option>
                                <option value="1">Frequent headaches</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Seizures
                              </label>
                              <select
                                name="seizures"
                                value={formData.seizures}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:outline-none"
                              >
                                <option value="">Select</option>
                                <option value="0">No seizures</option>
                                <option value="1">History of seizures</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Vision Problems
                              </label>
                              <select
                                name="visionProblems"
                                value={formData.visionProblems}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:outline-none"
                              >
                                <option value="">Select</option>
                                <option value="0">No vision issues</option>
                                <option value="1">Vision problems present</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Memory Issues
                              </label>
                              <select
                                name="memoryIssues"
                                value={formData.memoryIssues}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:outline-none"
                              >
                                <option value="">Select</option>
                                <option value="0">No memory issues</option>
                                <option value="1">Memory problems present</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Symptom Duration (months)
                              </label>
                              <input
                                type="number"
                                name="symptomDuration"
                                value={formData.symptomDuration}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:outline-none"
                                placeholder="6"
                                min="1"
                                max="60"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Performance Status (0-100)
                              </label>
                              <input
                                type="number"
                                name="kpsScore"
                                value={formData.kpsScore}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:border-violet-500 focus:outline-none"
                                placeholder="90"
                                min="40"
                                max="100"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3">
                          {isStepValid(3) ? (
                            <>
                              <Check className="w-5 h-5 text-green-500" />
                              <span className="text-sm font-medium text-green-700">
                                Clinical parameters complete - ready for AI
                                analysis
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-amber-500" />
                              <span className="text-sm font-medium text-amber-700">
                                Please fill in tumor size and family history to
                                continue
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Navigation and Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 gap-4 sm:gap-0">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={clsx(
                      "flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all text-sm md:text-base",
                      currentStep === 1
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300",
                    )}
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    Previous
                  </button>

                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Step Indicator for Mobile */}
                    <div className="flex sm:hidden items-center gap-2">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={clsx(
                            "w-3 h-3 rounded-full",
                            currentStep === step
                              ? `bg-gradient-to-r ${currentConfig.gradient}`
                              : currentStep > step
                                ? "bg-green-500"
                                : "bg-slate-300",
                          )}
                        />
                      ))}
                    </div>

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!isStepValid(currentStep)}
                        className={clsx(
                          "flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all text-sm md:text-base",
                          isStepValid(currentStep)
                            ? `bg-gradient-to-r ${currentConfig.gradient} text-white hover:shadow-lg`
                            : "bg-slate-200 text-slate-400 cursor-not-allowed",
                        )}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={
                          loading ||
                          !isStepValid(1) ||
                          !isStepValid(2) ||
                          !isStepValid(3)
                        }
                        className={clsx(
                          "flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold text-white transition-all text-sm md:text-lg",
                          loading ||
                            !isStepValid(1) ||
                            !isStepValid(2) ||
                            !isStepValid(3)
                            ? "bg-slate-400 cursor-not-allowed"
                            : `bg-gradient-to-r ${currentConfig.gradient} hover:shadow-xl active:scale-95`,
                        )}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                            <span className="hidden sm:inline">
                              Analyzing with AI...
                            </span>
                            <span className="sm:hidden">Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Microscope className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="hidden sm:inline">
                              Generate AI Assessment
                            </span>
                            <span className="sm:hidden">Generate</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
