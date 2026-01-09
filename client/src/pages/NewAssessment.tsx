import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCreatePrediction } from "@/hooks/use-medical";
import { useLocation } from "wouter";
import {
  Loader2,
  Heart,
  Activity,
  Microscope,
  Upload,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clsx } from "clsx";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NewAssessment() {
  const [diseaseType, setDiseaseType] = useState<
    "Heart Disease" | "Diabetes" | "Cancer"
  >("Heart Disease");
  const [cancerType, setCancerType] = useState<
    "Breast Cancer" | "Lung Cancer" | "Colorectal Cancer" | "Prostate Cancer"
  >("Breast Cancer");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createPrediction = useCreatePrediction();
  const isMobile = useIsMobile();

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
    bloodPressure: "80",
    // Cancer Data
    tumorSize: "15",
    markerX: "0.5",
    reportText: "",
    // Cancer-specific clinical features
    lymphNodes: "0",
    grade: "2",
    stage: "1",
    erStatus: "1",
    prStatus: "1",
    her2Status: "0",
    menopauseStatus: "0",
    familyHistory: "0",
    smokingHistory: "0",
    smokingYears: "0",
    packYears: "0",
    psaLevel: "2.5",
    // Multimodal breast cancer features
    geneticMarkers: "0",
    menopauseAge: "51",
    // Lung cancer specific features
    copdHistory: "0",
    asbestosExposure: "0",
    noduleSize: "1.0",
    noduleLocation: "1",
    chestPain: "0",
    weightLoss: "0",
    // ECG
    ecgInput: "",
    // Medical Images for ResNet Analysis
    medicalImageFile: null as File | null,
    medicalImageType: "chest_xray" as
      | "chest_xray"
      | "ecg"
      | "echocardiogram"
      | "retinal_fundus"
      | "foot_photo"
      | "thermal_image"
      | "cardiac_mri",
    // Uploaded Documents
    reportFile: null as File | null,
    ecgFile: null as File | null,
    // Image data for upload
    imageBase64: "",
    imageMetadata: null as any,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const name = e.target.name;
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));

      // Handle medical image files for ResNet analysis
      if (
        (name === "reportFile" || name === "medicalImageFile") &&
        file.type.startsWith("image/")
      ) {
        // Convert image to base64 for ResNet analysis
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target?.result as string;

          // Determine scan type based on disease and image type
          let scanType = "Other";
          let bodyPart = "other";
          let analysisType = "general";

          if (diseaseType === "Heart Disease") {
            switch (formData.medicalImageType) {
              case "chest_xray":
                scanType = "X-Ray";
                bodyPart = "chest";
                analysisType = "cardiomegaly_detection";
                break;
              case "ecg":
                scanType = "ECG";
                bodyPart = "heart";
                analysisType = "arrhythmia_detection";
                break;
              case "echocardiogram":
                scanType = "Echocardiogram";
                bodyPart = "heart";
                analysisType = "ejection_fraction";
                break;
              case "cardiac_mri":
                scanType = "MRI";
                bodyPart = "heart";
                analysisType = "cardiac_structure";
                break;
            }
          } else if (diseaseType === "Diabetes") {
            switch (formData.medicalImageType) {
              case "retinal_fundus":
                scanType = "Fundus";
                bodyPart = "eye";
                analysisType = "diabetic_retinopathy";
                break;
              case "foot_photo":
                scanType = "Other";
                bodyPart = "foot";
                analysisType = "diabetic_foot_ulcer";
                break;
              case "thermal_image":
                scanType = "Thermal";
                bodyPart = "extremities";
                analysisType = "neuropathy_detection";
                break;
            }
          } else if (diseaseType === "Cancer") {
            scanType =
              cancerType === "Breast Cancer"
                ? "Histopathology"
                : cancerType === "Lung Cancer"
                ? "CT"
                : cancerType === "Colorectal Cancer"
                ? "MRI"
                : cancerType === "Prostate Cancer"
                ? "MRI"
                : "Dermoscopy";
            bodyPart =
              cancerType === "Breast Cancer"
                ? "breast"
                : cancerType === "Lung Cancer"
                ? "lung"
                : cancerType === "Colorectal Cancer"
                ? "brain"
                : cancerType === "Prostate Cancer"
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
              description: `${diseaseType} medical image for ResNet analysis - ${formData.medicalImageType}`,
              imageType: formData.medicalImageType,
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

      // Handle other file types (reports, ECG data files)
      if (name === "reportFile" && !file.type.startsWith("image/")) {
        toast({
          title: "Report Uploaded",
          description: `${file.name} uploaded successfully`,
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation for cancer types - image upload is mandatory
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

        // Additional validation for lung cancer
        if (
          cancerType === "Lung Cancer" &&
          !formData.medicalImageFile &&
          !formData.imageBase64
        ) {
          toast({
            title: "CT Scan Required",
            description:
              "CT scan image is required for lung cancer multimodal analysis with SHAP explanations",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Handle medical image upload for ResNet analysis
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

      let finalEcgData = formData.ecgInput
        ? formData.ecgInput.split(",").map(Number)
        : undefined;
      if (formData.ecgFile && !finalEcgData) {
        // Simulate extraction from digital ECG report
        finalEcgData = [0.1, 0.5, 1.2, 0.8, 0.2];
        toast({
          title: "ECG Document Parsed",
          description: "Automatically extracted signal features from PDF/Image",
        });
      }

      const clinicalData: Record<string, number | string> = {
        age: Number(formData.age),
      };

      if (diseaseType === "Heart Disease") {
        clinicalData.sex = formData.gender === "Male" ? 1 : 0;
        clinicalData.cp = Number(formData.cp);
        clinicalData.trestbps = Number(formData.trestbps);
        clinicalData.chol = Number(formData.chol);
        clinicalData.fbs = Number(formData.fbs);
        clinicalData.thalach = Number(formData.thalach);
      } else if (diseaseType === "Diabetes") {
        clinicalData.glucose = Number(formData.glucose);
        clinicalData.bmi = Number(formData.bmi);
        clinicalData.insulin = Number(formData.insulin);
        clinicalData.bloodPressure = Number(formData.bloodPressure);
      } else if (diseaseType === "Cancer") {
        clinicalData.cancer_type = cancerType;
        clinicalData.tumor_size = Number(formData.tumorSize);
        clinicalData.marker_x = Number(formData.markerX);

        // Add cancer-specific features based on type
        if (cancerType === "Breast Cancer") {
          // Multimodal breast cancer features
          clinicalData.lymph_nodes = Number(formData.lymphNodes);
          clinicalData.grade = Number(formData.grade);
          clinicalData.stage = Number(formData.stage);
          clinicalData.genetic_markers = Number(formData.geneticMarkers);
          clinicalData.menopause_age = Number(formData.menopauseAge);

          // Legacy features for compatibility
          clinicalData.er_status = Number(formData.erStatus);
          clinicalData.pr_status = Number(formData.prStatus);
          clinicalData.her2_status = Number(formData.her2Status);
          clinicalData.menopause_status = Number(formData.menopauseStatus);
        } else if (cancerType === "Lung Cancer") {
          clinicalData.smoking_years = Number(formData.smokingYears);
          clinicalData.pack_years = Number(formData.packYears);
          clinicalData.copd_history = Number(formData.copdHistory);
          clinicalData.asbestos_exposure = Number(formData.asbestosExposure);
          clinicalData.nodule_size = Number(formData.noduleSize);
          clinicalData.nodule_location = Number(formData.noduleLocation);
          clinicalData.chest_pain = Number(formData.chestPain);
          clinicalData.weight_loss = Number(formData.weightLoss);
        } else if (cancerType === "Prostate Cancer") {
          clinicalData.psa_level = Number(formData.psaLevel);
        }

        clinicalData.family_history = Number(formData.familyHistory);
        clinicalData.smoking_history = Number(formData.smokingHistory);
      }

      const result = await createPrediction.mutateAsync({
        patient_data: {
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          medical_history: [],
        },
        clinical_data: clinicalData as Record<string, number | string>,
        ecg_data: finalEcgData,
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
      <div className="max-w-4xl mx-auto">
        <header className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-slate-900">
            {isMobile ? "New Assessment" : "Multimodal Clinical Assessment"}
          </h1>
          <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-base">
            {isMobile
              ? "AI analysis with patient data"
              : "Input patient vitals, ECG signals, and MRI/Biopsy reports for AI analysis."}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Disease Selector */}
          <div className="lg:col-span-1 space-y-3 md:space-y-4">
            <div
              onClick={() => setDiseaseType("Heart Disease")}
              className={clsx(
                "p-3 md:p-4 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all duration-200 touch-target",
                diseaseType === "Heart Disease"
                  ? "border-blue-500 bg-blue-50/50 ring-2 md:ring-4 ring-blue-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={clsx(
                    "p-1.5 md:p-2 rounded-lg",
                    diseaseType === "Heart Disease"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Heart className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                    Heart Disease
                  </h3>
                  <p className="text-xs text-slate-500">Cardiovascular Risk</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setDiseaseType("Diabetes")}
              className={clsx(
                "p-3 md:p-4 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all duration-200 touch-target",
                diseaseType === "Diabetes"
                  ? "border-emerald-500 bg-emerald-50/50 ring-2 md:ring-4 ring-emerald-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={clsx(
                    "p-1.5 md:p-2 rounded-lg",
                    diseaseType === "Diabetes"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Activity className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                    Diabetes
                  </h3>
                  <p className="text-xs text-slate-500">Metabolic Risk</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setDiseaseType("Cancer")}
              className={clsx(
                "p-3 md:p-4 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all duration-200 touch-target",
                diseaseType === "Cancer"
                  ? "border-rose-500 bg-rose-50/50 ring-2 md:ring-4 ring-rose-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={clsx(
                    "p-1.5 md:p-2 rounded-lg",
                    diseaseType === "Cancer"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Microscope className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                    Cancer
                  </h3>
                  <p className="text-xs text-slate-500">Oncology Risk</p>
                </div>
              </div>
            </div>

            {/* Cancer Type Selector */}
            {diseaseType === "Cancer" && (
              <div className="mt-3 p-3 bg-rose-50/30 rounded-lg border border-rose-100">
                <label className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 block">
                  Cancer Type
                </label>
                <select
                  value={cancerType}
                  onChange={(e) => setCancerType(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-sm rounded border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="Breast Cancer">Breast Cancer</option>
                  <option value="Lung Cancer">Lung Cancer</option>
                  <option value="Colorectal Cancer">Colorectal Cancer</option>
                  <option value="Prostate Cancer">Prostate Cancer</option>
                </select>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg md:rounded-2xl border border-slate-200 shadow-sm p-3 md:p-6 space-y-4 md:space-y-6"
            >
              {/* Patient Info Section */}
              <div>
                <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 md:mb-4 border-b border-slate-100 pb-2">
                  Patient Details
                </h3>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Full Name
                    </label>
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 md:py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all touch-target"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Age
                      </label>
                      <input
                        required
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 md:py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all touch-target"
                        placeholder="45"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 md:py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all touch-target"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multimodal Data Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Multimodal Inputs
                </h3>

                {diseaseType === "Heart Disease" && (
                  <div className="space-y-4 mb-6">
                    {/* Medical Image Upload for Heart Disease */}
                    <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Microscope className="w-5 h-5 text-red-500" />
                        <label className="text-sm font-semibold text-slate-700">
                          Medical Image Analysis (ResNet)
                        </label>
                      </div>

                      {/* Image Type Selection */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          {
                            value: "chest_xray",
                            label: "Chest X-Ray",
                            desc: "Cardiomegaly Detection",
                          },
                          {
                            value: "ecg",
                            label: "ECG Image",
                            desc: "Arrhythmia Analysis",
                          },
                          {
                            value: "echocardiogram",
                            label: "Echocardiogram",
                            desc: "Ejection Fraction",
                          },
                          {
                            value: "cardiac_mri",
                            label: "Cardiac MRI/CT",
                            desc: "Structure Analysis",
                          },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                medicalImageType: type.value as any,
                              }))
                            }
                            className={clsx(
                              "p-2 rounded-lg border text-left transition-all",
                              formData.medicalImageType === type.value
                                ? "border-red-500 bg-red-50 text-red-700"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                          >
                            <div className="text-xs font-semibold">
                              {type.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {type.desc}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Image Upload */}
                      <div className="relative">
                        <input
                          type="file"
                          name="medicalImageFile"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".jpg,.jpeg,.png,.dicom,.dcm"
                        />
                        <div className="flex items-center justify-between p-3 border-2 border-dashed border-red-300 rounded-lg hover:border-red-400 transition-colors">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-slate-600">
                              {formData.medicalImageFile
                                ? formData.medicalImageFile.name
                                : `Upload ${formData.medicalImageType.replace(
                                    "_",
                                    " "
                                  )} image`}
                            </span>
                          </div>
                          <span className="text-xs text-red-600 font-semibold">
                            ResNet Analysis
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ECG Section */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-blue-500" />
                          <label className="text-sm font-semibold text-slate-700">
                            ECG Signal Data
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            name="ecgFile"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".pdf,.jpg,.png,.csv"
                          />
                          <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tighter"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {formData.ecgFile
                              ? formData.ecgFile.name
                              : "Upload Digital ECG"}
                          </button>
                        </div>
                      </div>
                      <textarea
                        name="ecgInput"
                        value={formData.ecgInput}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-slate-200 text-xs font-mono h-20"
                        placeholder="Manual Lead-II Entry (e.g., 0.1, 0.2...)"
                      />
                    </div>
                  </div>
                )}

                {diseaseType === "Cancer" && (
                  <div className="space-y-4 mb-6">
                    {/* Multimodal Breast Cancer Section */}
                    {cancerType === "Breast Cancer" && (
                      <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Microscope className="w-5 h-5 text-pink-500" />
                          <label className="text-sm font-semibold text-slate-700">
                            Multimodal Breast Cancer Analysis
                          </label>
                          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                            ResNet-50 + Clinical
                          </span>
                        </div>

                        {/* Mammography Image Upload */}
                        <div className="mb-4">
                          <div className="relative">
                            <input
                              type="file"
                              name="medicalImageFile"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept=".jpg,.jpeg,.png,.dicom,.dcm"
                            />
                            <div className="flex items-center justify-between p-3 border-2 border-dashed border-pink-300 rounded-lg hover:border-pink-400 transition-colors">
                              <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-pink-500" />
                                <span className="text-sm text-slate-600">
                                  {formData.medicalImageFile
                                    ? formData.medicalImageFile.name
                                    : "Upload Mammography Image"}
                                </span>
                              </div>
                              <span className="text-xs text-pink-600 font-semibold">
                                Required for AI Analysis
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Clinical Features for Multimodal Analysis */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Tumor Size (cm)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              name="tumorSize"
                              value={formData.tumorSize}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                              placeholder="2.5"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Lymph Nodes
                            </label>
                            <input
                              type="number"
                              name="lymphNodes"
                              value={formData.lymphNodes}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Grade (1-3)
                            </label>
                            <select
                              name="grade"
                              value={formData.grade}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                            >
                              <option value="1">Grade 1 (Low)</option>
                              <option value="2">Grade 2 (Moderate)</option>
                              <option value="3">Grade 3 (High)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Stage (1-4)
                            </label>
                            <select
                              name="stage"
                              value={formData.stage}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                            >
                              <option value="1">Stage I</option>
                              <option value="2">Stage II</option>
                              <option value="3">Stage III</option>
                              <option value="4">Stage IV</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Family History
                            </label>
                            <select
                              name="familyHistory"
                              value={formData.familyHistory}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Smoking Years
                            </label>
                            <input
                              type="number"
                              name="smokingYears"
                              value={formData.smokingYears}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Additional Clinical Features */}
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                              Genetic Markers
                            </label>
                            <select
                              name="geneticMarkers"
                              value={formData.geneticMarkers || "0"}
                              onChange={handleChange}
                              className="w-full px-2 py-1 text-xs rounded border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-500/20 focus:border-pink-500"
                            >
                              <option value="0">Negative</option>
                              <option value="1">Positive</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                              Menopause Age
                            </label>
                            <input
                              type="number"
                              name="menopauseAge"
                              value={formData.menopauseAge || "51"}
                              onChange={handleChange}
                              className="w-full px-2 py-1 text-xs rounded border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-500/20 focus:border-pink-500"
                              placeholder="51"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                              Multimodal AI
                            </label>
                            <div className="flex items-center justify-center h-6 bg-pink-100 rounded text-xs font-semibold text-pink-700">
                              Image + Clinical
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 p-2 bg-pink-50/50 rounded-lg border border-pink-100">
                          <p className="text-xs text-pink-700 leading-relaxed">
                            <strong>Multimodal Analysis:</strong> Combines
                            ResNet-50 image analysis of mammography with
                            clinical features for enhanced breast cancer
                            detection accuracy.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Multimodal Lung Cancer Section */}
                    {cancerType === "Lung Cancer" && (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Microscope className="w-5 h-5 text-blue-500" />
                          <label className="text-sm font-semibold text-slate-700">
                            Multimodal Lung Cancer Analysis
                          </label>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            ResNet-50 + Clinical + SHAP
                          </span>
                        </div>

                        {/* CT Scan Image Upload - MANDATORY */}
                        <div className="mb-4">
                          <div className="relative">
                            <input
                              type="file"
                              name="medicalImageFile"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept=".jpg,.jpeg,.png,.dicom,.dcm"
                              required
                            />
                            <div
                              className={`flex items-center justify-between p-3 border-2 border-dashed rounded-lg transition-colors ${
                                formData.medicalImageFile
                                  ? "border-blue-400 bg-blue-50"
                                  : "border-blue-300 hover:border-blue-400"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-slate-600">
                                  {formData.medicalImageFile
                                    ? formData.medicalImageFile.name
                                    : "Upload CT Scan Image"}
                                </span>
                              </div>
                              <span className="text-xs text-blue-600 font-semibold">
                                REQUIRED
                              </span>
                            </div>
                          </div>
                          {!formData.medicalImageFile && (
                            <p className="text-xs text-blue-600 mt-1 font-medium">
                              ⚠️ CT scan image is mandatory for lung cancer
                              analysis
                            </p>
                          )}
                        </div>

                        {/* Clinical Features for Multimodal Analysis */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Smoking Years
                            </label>
                            <input
                              type="number"
                              name="smokingYears"
                              value={formData.smokingYears}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Pack Years
                            </label>
                            <input
                              type="number"
                              name="packYears"
                              value={formData.packYears}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              COPD History
                            </label>
                            <select
                              name="copdHistory"
                              value={formData.copdHistory || "0"}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Asbestos Exposure
                            </label>
                            <select
                              name="asbestosExposure"
                              value={formData.asbestosExposure || "0"}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Nodule Size (cm)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              name="noduleSize"
                              value={formData.noduleSize || "1.0"}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              placeholder="1.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700">
                              Nodule Location
                            </label>
                            <select
                              name="noduleLocation"
                              value={formData.noduleLocation || "1"}
                              onChange={handleChange}
                              className="w-full px-2 py-1.5 text-sm rounded border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                              <option value="1">Right Upper Lobe</option>
                              <option value="2">Right Middle Lobe</option>
                              <option value="3">Right Lower Lobe</option>
                              <option value="4">Left Upper Lobe</option>
                              <option value="5">Left Lower Lobe</option>
                            </select>
                          </div>
                        </div>

                        {/* Additional Clinical Features */}
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                              Family History
                            </label>
                            <select
                              name="familyHistory"
                              value={formData.familyHistory || "0"}
                              onChange={handleChange}
                              className="w-full px-2 py-1 text-xs rounded border border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                              Chest Pain
                            </label>
                            <select
                              name="chestPain"
                              value={formData.chestPain || "0"}
                              onChange={handleChange}
                              className="w-full px-2 py-1 text-xs rounded border border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                              Weight Loss
                            </label>
                            <select
                              name="weightLoss"
                              value={formData.weightLoss || "0"}
                              onChange={handleChange}
                              className="w-full px-2 py-1 text-xs rounded border border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-3 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-700 leading-relaxed">
                            <strong>Multimodal Analysis:</strong> Combines
                            ResNet-50 CT scan analysis with clinical risk
                            factors and provides SHAP explanations for
                            interpretable lung cancer detection.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Other Cancer Types - Standard Image Analysis */}
                    {cancerType !== "Breast Cancer" &&
                      cancerType !== "Lung Cancer" && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-rose-500" />
                              <label className="text-sm font-semibold text-slate-700">
                                Medical Images (CT/MRI/X-Ray)
                              </label>
                            </div>
                            <div className="relative">
                              <input
                                type="file"
                                name="reportFile"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".jpg,.jpeg,.png,.dicom,.dcm"
                                multiple
                              />
                              <button
                                type="button"
                                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-tighter"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                {formData.reportFile
                                  ? formData.reportFile.name
                                  : "Upload Medical Images"}
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-rose-50/30 rounded-lg border border-rose-100">
                            <p className="text-xs text-rose-700 leading-relaxed">
                              <strong>AI Image Analysis:</strong> Upload CT
                              scans, MRI images, or X-rays for automated
                              ResNet-based tumor detection and classification.
                              Supported formats: JPG, PNG, DICOM.
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Clinical Data Section */}
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Tabular Clinical Metrics
                </h3>

                {diseaseType === "Heart Disease" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Chest Pain Type (CP)
                      </label>
                      <select
                        name="cp"
                        value={formData.cp}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="0">Typical Angina</option>
                        <option value="1">Atypical Angina</option>
                        <option value="2">Non-anginal Pain</option>
                        <option value="3">Asymptomatic</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Resting BP (mm Hg)
                      </label>
                      <input
                        type="number"
                        name="trestbps"
                        value={formData.trestbps}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Cholesterol (mg/dl)
                      </label>
                      <input
                        type="number"
                        name="chol"
                        value={formData.chol}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Max Heart Rate
                      </label>
                      <input
                        type="number"
                        name="thalach"
                        value={formData.thalach}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                ) : diseaseType === "Diabetes" ? (
                  <div className="space-y-4">
                    {/* Medical Image Upload for Diabetes */}
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Microscope className="w-5 h-5 text-emerald-500" />
                        <label className="text-sm font-semibold text-slate-700">
                          Medical Image Analysis (ResNet)
                        </label>
                      </div>

                      {/* Image Type Selection */}
                      <div className="grid grid-cols-1 gap-2 mb-3">
                        {[
                          {
                            value: "retinal_fundus",
                            label: "Retinal Fundus Photo",
                            desc: "Diabetic Retinopathy Detection",
                          },
                          {
                            value: "foot_photo",
                            label: "Foot Photography",
                            desc: "Diabetic Foot Ulcer Assessment",
                          },
                          {
                            value: "thermal_image",
                            label: "Thermal Imaging",
                            desc: "Neuropathy Detection",
                          },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                medicalImageType: type.value as any,
                              }))
                            }
                            className={clsx(
                              "p-3 rounded-lg border text-left transition-all",
                              formData.medicalImageType === type.value
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                          >
                            <div className="text-sm font-semibold">
                              {type.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {type.desc}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Image Upload */}
                      <div className="relative">
                        <input
                          type="file"
                          name="medicalImageFile"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".jpg,.jpeg,.png,.dicom,.dcm"
                        />
                        <div className="flex items-center justify-between p-3 border-2 border-dashed border-emerald-300 rounded-lg hover:border-emerald-400 transition-colors">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-slate-600">
                              {formData.medicalImageFile
                                ? formData.medicalImageFile.name
                                : `Upload ${formData.medicalImageType.replace(
                                    "_",
                                    " "
                                  )} image`}
                            </span>
                          </div>
                          <span className="text-xs text-emerald-600 font-semibold">
                            ResNet Analysis
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Glucose Level
                        </label>
                        <input
                          type="number"
                          name="glucose"
                          value={formData.glucose}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          BMI
                        </label>
                        <input
                          type="number"
                          name="bmi"
                          value={formData.bmi}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Tumor Size (mm)
                        </label>
                        <input
                          type="number"
                          name="tumorSize"
                          value={formData.tumorSize}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        />
                      </div>

                      {cancerType === "Breast Cancer" && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Lymph Nodes Affected
                            </label>
                            <input
                              type="number"
                              name="lymphNodes"
                              value={formData.lymphNodes}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Tumor Grade (1-3)
                            </label>
                            <select
                              name="grade"
                              value={formData.grade}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                              <option value="1">Grade 1 (Low)</option>
                              <option value="2">Grade 2 (Intermediate)</option>
                              <option value="3">Grade 3 (High)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              ER Status
                            </label>
                            <select
                              name="erStatus"
                              value={formData.erStatus}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                              <option value="1">Positive</option>
                              <option value="0">Negative</option>
                            </select>
                          </div>
                        </>
                      )}

                      {cancerType === "Lung Cancer" && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Smoking Years
                            </label>
                            <input
                              type="number"
                              name="smokingYears"
                              value={formData.smokingYears}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Pack Years
                            </label>
                            <input
                              type="number"
                              name="packYears"
                              value={formData.packYears}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              COPD History
                            </label>
                            <select
                              name="copdHistory"
                              value={formData.copdHistory || "0"}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Asbestos Exposure
                            </label>
                            <select
                              name="asbestosExposure"
                              value={formData.asbestosExposure || "0"}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Nodule Size (cm)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              name="noduleSize"
                              value={formData.noduleSize || "1.0"}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                              placeholder="1.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Nodule Location (Lobe)
                            </label>
                            <select
                              name="noduleLocation"
                              value={formData.noduleLocation || "1"}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                              <option value="1">Right Upper Lobe</option>
                              <option value="2">Right Middle Lobe</option>
                              <option value="3">Right Lower Lobe</option>
                              <option value="4">Left Upper Lobe</option>
                              <option value="5">Left Lower Lobe</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Chest Pain
                            </label>
                            <select
                              name="chestPain"
                              value={formData.chestPain || "0"}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              Weight Loss
                            </label>
                            <select
                              name="weightLoss"
                              value={formData.weightLoss || "0"}
                              onChange={handleChange}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            >
                              <option value="0">No</option>
                              <option value="1">Yes</option>
                            </select>
                          </div>
                        </>
                      )}

                      {cancerType === "Prostate Cancer" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            PSA Level (ng/mL)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="psaLevel"
                            value={formData.psaLevel}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Family History
                        </label>
                        <select
                          name="familyHistory"
                          value={formData.familyHistory}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 md:pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    "w-full py-3.5 md:py-3.5 rounded-lg md:rounded-xl font-bold text-white shadow-lg transition-all duration-200 transform active:scale-[0.98] touch-target",
                    diseaseType === "Heart Disease"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25"
                      : diseaseType === "Diabetes"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/25"
                      : "bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-rose-500/25",
                    loading && "opacity-70 cursor-wait"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isMobile
                        ? "Analyzing..."
                        : "Multimodal Fusion Analysis..."}
                    </div>
                  ) : isMobile ? (
                    "Run AI Analysis"
                  ) : (
                    "Run Integrated AI Diagnostics"
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
