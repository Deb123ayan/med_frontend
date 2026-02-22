import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Helper function to get headers (no auth for now)
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

// ============================================
// PATIENTS HOOKS
// ============================================

export function usePatients() {
  return useQuery({
    queryKey: [api.patients.list.path],
    queryFn: async () => {
      const res = await fetch(api.patients.list.path, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch patients");
      return api.patients.list.responses[200].parse(await res.json());
    },
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: [api.patients.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.patients.get.path, { id });
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch patient");
      return api.patients.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.patients.create.path, {
        method: api.patients.create.method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create patient");
      return api.patients.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.patients.list.path] }),
  });
}

export function useTouchPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/patients/${id}/touch/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to touch patient");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.patients.list.path] });
    }
  });
}

// ============================================
// PREDICTION HOOKS
// ============================================

export function usePredictions(patientId?: number) {
  return useQuery({
    queryKey: [api.predictions.list.path, patientId],
    queryFn: async () => {
      const url = patientId
        ? `${api.predictions.list.path}?patientId=${patientId}`
        : api.predictions.list.path;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch predictions");
      return api.predictions.list.responses[200].parse(await res.json());
    },
  });
}

export function usePrediction(id: number) {
  return useQuery({
    queryKey: [api.predictions.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.predictions.get.path, { id });
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch prediction");
      return api.predictions.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.predictions.predict.input>) => {
      const res = await fetch(api.predictions.predict.path, {
        method: api.predictions.predict.method,
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.predictions.predict.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to generate prediction");
      }
      return api.predictions.predict.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.predictions.list.path] }),
  });
}

export function useCounterfactual() {
  return useMutation({
    mutationFn: async ({ id, changes }: { id: number, changes: Record<string, number | string> }) => {
      const url = buildUrl(api.predictions.counterfactual.path, { id });
      const res = await fetch(url, {
        method: api.predictions.counterfactual.method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ changes }),
      });
      if (!res.ok) throw new Error("Failed to simulate counterfactual");
      return api.predictions.counterfactual.responses[200].parse(await res.json());
    },
  });
}
