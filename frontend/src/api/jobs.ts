import { apiClient } from './client';

export interface Job {
  id: number;
  tenant_id: number;
  title: string;
  status: string;
  description?: string;
  location?: string;
  salary_range?: string;
  created_at: string;
}

export const jobsApi = {
  getPublicJobs: async () => {
    const response = await apiClient.get<Job[]>('/public/jobs/');
    return response.data;
  },

  getPublicJob: async (id: number) => {
    const response = await apiClient.get<Job>(`/public/jobs/${id}`);
    return response.data;
  },

  getRecruiterJobs: async () => {
    const response = await apiClient.get<Job[]>('/recruiter/jobs/');
    return response.data;
  },

  createRecruiterJob: async (data: Partial<Job>) => {
    const response = await apiClient.post<Job>('/recruiter/jobs/', data);
    return response.data;
  },

  getRecruiterJob: async (id: number) => {
    const response = await apiClient.get<Job>(`/recruiter/jobs/${id}`);
    return response.data;
  }
};
