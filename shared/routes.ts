import { z } from 'zod';
import { insertPatientSchema, patients, predictions, healthRecords } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  patients: {
    list: {
      method: 'GET' as const,
      path: '/api/patients/',
      responses: {
        200: z.array(z.custom<typeof patients.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/patients/',
      input: insertPatientSchema,
      responses: {
        201: z.custom<typeof patients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/patients/:id/',
      responses: {
        200: z.custom<typeof patients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  predictions: {
    predict: {
      method: 'POST' as const,
      path: '/api/predictions/predict/',
      input: z.object({
        patient_id: z.number().optional(),
        patient_data: insertPatientSchema.optional() as any,
        clinical_data: z.record(z.union([z.number(), z.string()])),
        ecg_data: z.array(z.number()).optional(),
        report_text: z.string().optional(),
        image_metadata: z.object({
          url: z.string(),
          type: z.string(),
          scanType: z.enum(['MRI', 'X-ray', 'CT', 'Biopsy'])
        }).optional(),
        medical_images: z.array(z.object({
          filename: z.string(),
          scanType: z.string(),
          bodyPart: z.string(),
          description: z.string().optional(),
          imageData: z.string() // base64 encoded image
        })).optional(),
        disease: z.enum(['Heart Disease', 'Diabetes', 'Cancer']),
      }),
      responses: {
        201: z.custom<typeof predictions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/predictions/:id',
      responses: {
        200: z.custom<typeof predictions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/predictions/',
      responses: {
        200: z.array(z.any()), // Should be PredictionResponse ideally
      }
    },
    counterfactual: {
      method: 'POST' as const,
      path: '/api/predictions/:id/counterfactual',
      input: z.object({
        changes: z.record(z.union([z.number(), z.string()])),
      }),
      responses: {
        200: z.custom<typeof predictions.$inferSelect>(), // Returns a hypothetical prediction
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
