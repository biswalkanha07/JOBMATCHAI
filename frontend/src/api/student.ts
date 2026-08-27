import { apiClient } from './client';

export interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  location?: string;
  preferred_job_role?: string;
}

export interface Application {
  id: number;
  job_id: number;
  student_id: number;
  status: string;
  applied_at: string;
  job?: any;
}

export const studentApi = {
  getProfile: async () => {
    const response = await apiClient.get<StudentProfile>('/students/me/profile');
    return response.data;
  },

  applyToJob: async (jobId: number) => {
    const response = await apiClient.post<Application>('/students/applications', { job_id: jobId });
    return response.data;
  },

  getApplications: async () => {
    const response = await apiClient.get<Application[]>('/students/applications');
    return response.data;
  }
};
