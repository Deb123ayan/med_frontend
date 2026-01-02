import { db } from "./db";
import { patients, predictions, healthRecords } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // 1. Create Patients
  const patientData = [
    { name: "John Doe", age: 58, gender: "Male", medicalHistory: ["Hypertension"] },
    { name: "Jane Smith", age: 42, gender: "Female", medicalHistory: ["Diabetes Type 2 in family"] },
    { name: "Robert Johnson", age: 65, gender: "Male", medicalHistory: ["Previous Heart Attack"] },
  ];

  const createdPatients = await db.insert(patients).values(patientData).returning();
  console.log(`Created ${createdPatients.length} patients.`);

  // 2. Create Health Records & Predictions for each
  for (const patient of createdPatients) {
    // Simulate some clinical data
    const clinicalData = {
      age: patient.age,
      trestbps: 130 + Math.floor(Math.random() * 30),
      chol: 200 + Math.floor(Math.random() * 60),
      thalach: 140 - Math.floor(Math.random() * 40),
      glucose: 90 + Math.floor(Math.random() * 50),
      bmi: 24 + Math.floor(Math.random() * 10)
    };

    // Health Record
    await db.insert(healthRecords).values({
      patientId: patient.id,
      clinicalData,
      ecgData: Array.from({ length: 50 }, () => Math.random()), // Fake ECG
      imageUrl: null
    });

    // Prediction (Simulated)
    const riskScore = Math.floor(Math.random() * 80) + 10;
    let riskCategory = "Low";
    if (riskScore > 30) riskCategory = "Medium";
    if (riskScore > 70) riskCategory = "High";

    await db.insert(predictions).values({
      patientId: patient.id,
      disease: "Heart Disease",
      riskScore,
      riskCategory,
      confidence: 0.85,
      topFeatures: [
        { feature: "Age", value: patient.age, importance: 0.4 },
        { feature: "Cholesterol", value: clinicalData.chol, importance: 0.3 },
        { feature: "Blood Pressure", value: clinicalData.trestbps, importance: 0.2 }
      ],
      biasAnalysis: { genderBias: 0.02, ageBias: 0.05 }
    });
  }

  console.log("Seeding complete.");
}

seed().catch(console.error);
