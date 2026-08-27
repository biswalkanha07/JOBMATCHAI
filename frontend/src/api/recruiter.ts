import { apiClient } from './client';
import type { StudentProfile } from './student';

export interface RecruiterApplication {
  id: number;
  job_id: number;
  student_id: number;
  status: string;
  applied_at: string;
  student?: StudentProfile;
}

export const recruiterApi = {
  getJobApplications: async (jobId: number) => {
    const response = await apiClient.get<RecruiterApplication[]>(`/recruiter/jobs/${jobId}/applications`);
    return response.data;
  }
};
