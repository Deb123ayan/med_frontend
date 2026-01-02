import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { InsertPatient, InsertPrediction } from "@shared/schema";

// --- SIMULATED ML MODELS ---
// In a real app, these would call out to a Python service or load a model.
// Here we simulate the logic to demonstrate the architecture.

function calculateRisk(
  clinicalData: Record<string, number>,
  disease: string
): { riskScore: number; topFeatures: { feature: string; value: number; importance: number }[] } {
  let riskScore = 0;
  const features = [];

  if (disease === "Heart Disease") {
    // Simulated logic based on common risk factors
    const ageFactor = (clinicalData.age || 50) / 100;
    const bpFactor = (clinicalData.trestbps || 120) > 140 ? 0.3 : 0.1;
    const cholFactor = (clinicalData.chol || 200) > 240 ? 0.3 : 0.1;
    const maxHrFactor = (clinicalData.thalach || 150) < 100 ? 0.2 : 0;

    riskScore = (0.2 + ageFactor * 0.3 + bpFactor + cholFactor + maxHrFactor) * 100;
    
    // Feature Attribution (Simulating SHAP)
    features.push({ feature: "Age", value: clinicalData.age || 0, importance: ageFactor * 0.3 });
    features.push({ feature: "Blood Pressure", value: clinicalData.trestbps || 0, importance: bpFactor });
    features.push({ feature: "Cholesterol", value: clinicalData.chol || 0, importance: cholFactor });
  } else if (disease === "Diabetes") {
    const glucoseFactor = (clinicalData.glucose || 100) > 140 ? 0.5 : 0.1;
    const bmiFactor = (clinicalData.bmi || 25) > 30 ? 0.3 : 0.1;
    
    riskScore = (0.1 + glucoseFactor + bmiFactor) * 100;

    features.push({ feature: "Glucose", value: clinicalData.glucose || 0, importance: glucoseFactor });
    features.push({ feature: "BMI", value: clinicalData.bmi || 0, importance: bmiFactor });
  }

  // Normalize
  riskScore = Math.min(Math.max(riskScore, 5), 99);
  
  return { 
    riskScore, 
    topFeatures: features.sort((a, b) => b.importance - a.importance) 
  };
}

function getRiskCategory(score: number): "Low" | "Medium" | "High" {
  if (score < 30) return "Low";
  if (score < 70) return "Medium";
  return "High";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Patients
  app.get(api.patients.list.path, async (req, res) => {
    const patients = await storage.getPatients();
    res.json(patients);
  });

  app.post(api.patients.create.path, async (req, res) => {
    try {
      const input = api.patients.create.input.parse(req.body);
      const patient = await storage.createPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.patients.get.path, async (req, res) => {
    const patient = await storage.getPatient(Number(req.params.id));
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  // Predictions
  app.get(api.predictions.list.path, async (req, res) => {
      const predictions = await storage.getPredictions();
      res.json(predictions);
  });

  app.post(api.predictions.predict.path, async (req, res) => {
    try {
      const input = api.predictions.predict.input.parse(req.body);
      
      let patientId = input.patientId;
      
      // If no patient ID, create new patient
      if (!patientId && input.patientData) {
        const newPatient = await storage.createPatient(input.patientData);
        patientId = newPatient.id;
      }

      if (!patientId) {
        return res.status(400).json({ message: "Patient ID or Patient Data required" });
      }

      // 1. Simulate ML Inference
      const { riskScore, topFeatures } = calculateRisk(input.clinicalData, input.disease);
      const riskCategory = getRiskCategory(riskScore);
      const confidence = 0.85 + (Math.random() * 0.1); // Simulated model confidence

      // 2. Bias Check (Simulated)
      // Check if risk score varies significantly for simulated counterfactual demographics
      const biasAnalysis = {
        genderBias: Math.random() * 0.05, // Low bias
        ageBias: Math.random() * 0.1 // Some age correlation is expected in medicine
      };

      // 3. Store Prediction
      const predictionData: InsertPrediction = {
        patientId,
        disease: input.disease,
        riskScore,
        riskCategory,
        confidence,
        topFeatures,
        biasAnalysis
      };

      const prediction = await storage.createPrediction(predictionData);
      
      // Store Health Record
      await storage.createHealthRecord({
        patientId,
        clinicalData: input.clinicalData,
        ecgData: input.ecgData,
        imageUrl: null // Placeholder
      });

      res.status(201).json(prediction);
    } catch (err) {
      if (err instanceof z.ZodError) {
         console.error(err);
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.predictions.get.path, async (req, res) => {
    const prediction = await storage.getPrediction(Number(req.params.id));
    if (!prediction) return res.status(404).json({ message: "Prediction not found" });
    res.json(prediction);
  });

  app.post(api.predictions.counterfactual.path, async (req, res) => {
    try {
      const predictionId = Number(req.params.id);
      const originalPrediction = await storage.getPrediction(predictionId);
      
      if (!originalPrediction) return res.status(404).json({ message: "Prediction not found" });
      
      const changes = req.body.changes; // e.g. { chol: 180 }
      
      // Fetch original clinical data (In a real app, we'd query healthRecords)
      // Here we assume we have the base data or we just run the model with the *changes* applied to a "standard" baseline if data missing,
      // but ideally we should fetch the actual record.
      // For MVP simplicity, we will assume the Client passes the FULL new state or we reconstruct it.
      // *Correction*: To do this properly, we should fetch the health record.
      const records = await storage.getHealthRecords(originalPrediction.patientId);
      const lastRecord = records[records.length - 1]; // Use latest
      
      if (!lastRecord) return res.status(404).json({ message: "Health data not found for counterfactual" });

      const newClinicalData = { ...lastRecord.clinicalData, ...changes };
      
      const { riskScore, topFeatures } = calculateRisk(newClinicalData, originalPrediction.disease);
      
      // Return a "Hypothetical" prediction object (not saved to DB)
      const hypotheticalPrediction = {
        ...originalPrediction,
        id: -1, // hypothetical
        riskScore,
        riskCategory: getRiskCategory(riskScore),
        topFeatures,
        createdAt: new Date()
      };

      res.json(hypotheticalPrediction);

    } catch (err) {
      res.status(500).json({ message: "Error generating counterfactual" });
    }
  });

  return httpServer;
}
