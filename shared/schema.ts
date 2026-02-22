import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patient_id: text("patient_id"), // Hospital ID
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // 'Male', 'Female', 'Other'
  medicalHistory: jsonb("medical_history").$type<string[]>(), // Array of conditions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  // Tabular data (Blood Pressure, Glucose, Cholesterol, etc.)
  clinicalData: jsonb("clinical_data").notNull().$type<Record<string, number>>(),
  // Time-series metadata or reference (e.g., ECG signal points)
  ecgData: jsonb("ecg_data").$type<number[]>(),
  // Image metadata (MRI, X-ray, Biopsy)
  imageMetadata: jsonb("image_metadata").$type<{ url: string, type: string, findings?: string, scanType?: "MRI" | "X-ray" | "CT" }>(),
  // Report Text (for NLP scanning)
  reportText: text("report_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  disease: text("disease").notNull(), // 'Heart Disease', 'Diabetes', 'Cancer'
  riskScore: doublePrecision("risk_score").notNull(), // 0-100
  riskCategory: text("risk_category").notNull(), // 'Low', 'Medium', 'High'
  confidence: doublePrecision("confidence").notNull(), // 0-1
  uncertainty: doublePrecision("uncertainty").notNull(), // Monte Carlo Dropout / Ensemble variance
  // Explainability data
  topFeatures: jsonb("top_features").notNull().$type<Array<{ feature: string, value: number, importance: number, contribution: "positive" | "negative" }>>(),
  biasAnalysis: jsonb("bias_analysis").$type<{ genderBias: number, ageBias: number, fairnessWarning?: string }>(),
  causalCounterfactuals: jsonb("causal_counterfactuals").$type<Array<{ feature: string, originalValue: number, suggestedValue: number, impactOnRisk: number }>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({ id: true, createdAt: true });
export const insertPredictionSchema = createInsertSchema(predictions).omit({ id: true, createdAt: true });

// === TYPES ===

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = any; // z.infer<typeof insertPatientSchema>;

export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = any; // z.infer<typeof insertHealthRecordSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = any; // z.infer<typeof insertPredictionSchema>;

// API Request/Response Types
export type PredictionRequest = {
  patientId?: number;
  patientData?: InsertPatient;
  clinicalData: Record<string, number>;
  ecgData?: number[];
  reportText?: string;
  imageUrl?: string;
  disease: 'Heart Disease' | 'Diabetes' | 'Cancer';
};

export type CounterfactualRequest = {
  predictionId: number;
  changes: Record<string, number>;
};

export type PredictionResponse = Prediction & {
  patient: Patient;
};
