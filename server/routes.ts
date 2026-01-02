import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { InsertPatient, InsertPrediction } from "@shared/schema";
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://0.0.0.0:8000";

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
      if (!patientId && input.patientData) {
        const newPatient = await storage.createPatient(input.patientData);
        patientId = newPatient.id;
      }

      if (!patientId) {
        return res.status(400).json({ message: "Patient ID or Patient Data required" });
      }

      // 1. Call Python ML Microservice
      let mlResult;
      try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
          data: input.clinicalData,
          disease: input.disease
        });
        mlResult = response.data;
      } catch (err) {
        console.error("ML Service Error:", err);
        return res.status(503).json({ message: "ML Service unavailable" });
      }

      // 2. Multimodal Fusion (Simulated weighting for now)
      // If image or ECG exists, adjust risk
      if (input.ecgData && input.ecgData.length > 0) {
          mlResult.risk_score *= 1.1; // Simulated fusion impact
      }

      // 3. Store Prediction
      const predictionData: InsertPrediction = {
        patientId,
        disease: input.disease,
        riskScore: mlResult.risk_score,
        riskCategory: mlResult.risk_category,
        confidence: mlResult.confidence,
        uncertainty: mlResult.uncertainty,
        topFeatures: mlResult.top_features,
        biasAnalysis: mlResult.bias_analysis,
        causalCounterfactuals: mlResult.causal_counterfactuals
      };

      const prediction = await storage.createPrediction(predictionData);
      
      await storage.createHealthRecord({
        patientId,
        clinicalData: input.clinicalData,
        ecgData: input.ecgData || null,
        imageMetadata: null
      });

      res.status(201).json(prediction);
    } catch (err) {
      if (err instanceof z.ZodError) {
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
        const prediction = await storage.getPrediction(predictionId);
        if (!prediction) return res.status(404).json({ message: "Prediction not found" });

        // Forward to ML service for causal counterfactual logic
        const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
          data: req.body.changes,
          disease: prediction.disease
        });
        
        res.json({
            ...prediction,
            id: -1,
            ...response.data
        });
    } catch (err) {
      res.status(500).json({ message: "Error generating counterfactual" });
    }
  });

  return httpServer;
}
