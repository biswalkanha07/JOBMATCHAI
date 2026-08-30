import { apiClient } from './client';

export interface Job {
  id: number;
  tenant_id: number;
  title: string;
  status: string;
  description?: string;
  location?: string;
  employment_type?: string;
  department?: string;
  category?: string;
  responsibilities?: string;
  required_qualifications?: string;
  preferred_qualifications?: string;
  work_mode?: string;
  number_of_openings?: number;
  minimum_experience?: number;
  maximum_experience?: number;
  minimum_salary?: number;
  maximum_salary?: number;
  currency?: string;
  salary_period?: string;
  salary_disclosed?: boolean;
  minimum_education?: string;
  preferred_degree?: string;
  preferred_field_of_study?: string;
  application_deadline?: string;
  salary_range?: string;
  created_at: string;
}

export interface DashboardStats {
  active_jobs: number;
  total_jobs: number;
  total_applications: number;
  pending_evaluation: number;
  shortlisted: number;
  rejected: number;
}

export interface RequirementDetail {
  requirement: string;
  status: 'Strong Match' | 'Partial Match' | 'Missing' | 'Not Available';
  evidence: string;
  category: string;
}

export interface ExplainabilityData {
  overall_match: number;
  match_label: string;
  confidence: 'High' | 'Medium' | 'Low';
  category_scores: {
    skills: number;
    experience: number;
    projects: number;
    role: number;
    education: number;
    location: number;
    work_mode: number;
    certifications: number;
  };
  matched_requirements: RequirementDetail[];
  partial_requirements: RequirementDetail[];
  missing_requirements: RequirementDetail[];
  not_available_requirements: RequirementDetail[];
  summary: string;
  strengths: string[];
  gaps: string[];
}

export interface MatchResult {
  id: number;
  job_id: number;
  student_id: number;
  overall_score: number;
  semantic_score: number;
  text_score?: number; // Add alias/fallback
  skill_score: number;
  experience_score: number;
  education_score: number; // Split from education_project
  project_score: number;   // Split from education_project
  location_score: number;
  work_mode_score: number;
  salary_score: number;
  is_eligible: boolean;
  matched_skills?: string;
  missing_skills?: string;
  explanation: string; // JSON string containing ExplainabilityData
  job?: any;
  student?: any;
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

  createRecruiterJob: async (jobData: any) => {
    const response = await apiClient.post<Job>('/recruiter/jobs/', jobData);
    return response.data;
  },

  updateRecruiterJob: async (jobId: number, jobData: any) => {
    const response = await apiClient.put<Job>(`/recruiter/jobs/${jobId}`, jobData);
    return response.data;
  },

  getRecruiterJob: async (id: number) => {
    const response = await apiClient.get<Job>(`/recruiter/jobs/${id}`);
    return response.data;
  },

  getJobMatches: async (jobId: number | 'all') => {
    const url = jobId === 'all'
      ? '/recruiter/jobs/all/matches'
      : `/recruiter/jobs/${jobId}/matches`;
    const response = await apiClient.get<MatchResult[]>(url);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get<DashboardStats>('/recruiter/jobs/dashboard/stats');
    return response.data;
  }
};
