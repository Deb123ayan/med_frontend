import { db } from "./db";
import {
  patients,
  healthRecords,
  predictions,
  type InsertPatient,
  type InsertHealthRecord,
  type InsertPrediction,
  type Patient,
  type Prediction,
  type HealthRecord
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  // Predictions
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getPrediction(id: number): Promise<Prediction | undefined>;
  getPredictions(): Promise<Prediction[]>;
  getPredictionsByPatient(patientId: number): Promise<Prediction[]>;

  // Health Records
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  getHealthRecords(patientId: number): Promise<HealthRecord[]>;
}

export class DatabaseStorage implements IStorage {
  // Patients
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  // Predictions
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }

  async getPrediction(id: number): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions).where(eq(predictions.id, id));
    return prediction;
  }

  async getPredictions(): Promise<Prediction[]> {
      return await db.select().from(predictions).orderBy(desc(predictions.createdAt));
  }

  async getPredictionsByPatient(patientId: number): Promise<Prediction[]> {
    return await db.select().from(predictions).where(eq(predictions.patientId, patientId)).orderBy(desc(predictions.createdAt));
  }

  // Health Records
  async createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord> {
    const [newRecord] = await db.insert(healthRecords).values(record).returning();
    return newRecord;
  }

  async getHealthRecords(patientId: number): Promise<HealthRecord[]> {
    return await db.select().from(healthRecords).where(eq(healthRecords.patientId, patientId));
  }
}

export const storage = new DatabaseStorage();
