import { apiClient } from './client';
import type { StudentProfile } from './student';
import type { MatchResult, Job } from './jobs';

export interface RecruiterApplication {
  id: number;
  job_id: number;
  student_id: number;
  status: string;
  applied_at: string;
  student?: StudentProfile;
  match_result?: MatchResult;
  job?: Job;
}

export interface Company {
  id?: number;
  name: string;
  website?: string;
  description?: string;
  location?: string;
}

export interface Tenant {
  id?: number;
  name?: string;
  company?: Company;
}

export interface RecruiterProfile {
  id?: number;
  first_name: string;
  last_name: string;
  phone?: string;
  tenant?: Tenant;
}

export const recruiterApi = {
  getJobApplications: async (jobId: number | 'all') => {
    const url = jobId === 'all'
      ? '/recruiter/jobs/all/applications'
      : `/recruiter/jobs/${jobId}/applications`;
    const response = await apiClient.get<RecruiterApplication[]>(url);
    return response.data;
  },

  updateApplicationStatus: async (jobId: number, appId: number, status: string) => {
    const response = await apiClient.patch<RecruiterApplication>(`/recruiter/jobs/${jobId}/applications/${appId}/status`, { status });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<RecruiterProfile>('/recruiters/me/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<RecruiterProfile>) => {
    const response = await apiClient.put<RecruiterProfile>('/recruiters/me/profile', data);
    return response.data;
  },

  updateCompany: async (data: Partial<Company>) => {
    const response = await apiClient.put<Company>('/recruiters/me/company', data);
    return response.data;
  },

  downloadResume: async (resumeId: number, fileName: string) => {
    const response = await apiClient.get(`/recruiter/jobs/resume/${resumeId}/download`, {
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  viewResume: async (resumeId: number) => {
    const response = await apiClient.get(`/recruiter/jobs/resume/${resumeId}/download`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};
