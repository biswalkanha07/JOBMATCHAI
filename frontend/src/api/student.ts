import { apiClient } from './client';

export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export interface StudentSkill {
  skill: Skill;
  proficiency?: string;
  years_of_experience?: number;
  last_used?: number;
  priority?: string;
}

export interface Education {
  id: number;
  education_level?: string;
  degree: string;
  specialization?: string;
  institution: string;
  university_or_board?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  currently_studying: boolean;
  percentage?: number;
  cgpa?: number;
  grading_system?: string;
  description?: string;
}

export interface Experience {
  id: number;
  job_title: string;
  employment_type?: string;
  company_name: string;
  company_location?: string;
  industry?: string;
  start_date?: string;
  end_date?: string;
  currently_working: boolean;
  description?: string;
  skills_used?: string[];
}

export interface Project {
  id: number;
  name: string;
  project_type?: string;
  role?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  currently_active: boolean;
  technologies?: string[];
  responsibilities?: string;
  team_size?: number;
  project_status?: string;
  project_url?: string;
  github_url?: string;
  live_demo_url?: string;
}

export interface Resume {
  id: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  version?: number;
  is_primary?: boolean;
  visibility?: string;
  uploaded_at: string;
}

export interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  career_status?: string;
  profile_headline?: string;
  about_me?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  personal_website?: string;
  
  preferred_job_roles?: string[];
  preferred_work_locations?: string[];
  work_mode?: string[];
  employment_type?: string[];
  preferred_industries?: string[];
  expected_salary_min?: number;
  expected_salary_max?: number;
  currency?: string;
  willing_to_relocate?: boolean;
  notice_period?: string;
  job_search_status?: string;

  skill_associations: StudentSkill[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  resumes: Resume[];
  completion_percentage: number;
}

export interface Application {
  id: number;
  job_id: number;
  student_id: number;
  status: string;
  applied_at: string;
  updated_at?: string;
  job?: any;
}

export interface MatchResult {
  id: number;
  job_id: number;
  student_id: number;
  overall_score: number;
  text_score: number;
  skill_score: number;
  experience_score: number;
  education_score: number;
  project_score: number;
  location_score: number;
  work_mode_score: number;
  salary_score: number;
  is_eligible: boolean;
  matched_skills?: string;
  missing_skills?: string;
  explanation: any;
  job?: any;
  student?: any;
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
  },

  getRecommendedJobs: async () => {
    const response = await apiClient.get<MatchResult[]>('/students/me/recommended-jobs');
    return response.data;
  },

  updateProfile: async (data: Partial<StudentProfile>) => {
    const response = await apiClient.patch<StudentProfile>('/students/me/profile', data);
    return response.data;
  },

  addEducation: async (data: Omit<Education, 'id'>) => {
    const response = await apiClient.post<Education>('/students/me/education', data);
    return response.data;
  },

  deleteEducation: async (id: number) => {
    await apiClient.delete(`/students/me/education/${id}`);
  },

  addExperience: async (data: Omit<Experience, 'id'>) => {
    const response = await apiClient.post<Experience>('/students/me/experience', data);
    return response.data;
  },

  deleteExperience: async (id: number) => {
    await apiClient.delete(`/students/me/experience/${id}`);
  },

  addProject: async (data: Omit<Project, 'id'>) => {
    const response = await apiClient.post<Project>('/students/me/projects', data);
    return response.data;
  },

  deleteProject: async (id: number) => {
    await apiClient.delete(`/students/me/projects/${id}`);
  },

  addSkill: async (data: { skill_name: string, proficiency?: string, years_of_experience?: number, last_used?: number, priority?: string }) => {
    const response = await apiClient.post<StudentSkill>('/students/me/skills', data);
    return response.data;
  },

  deleteSkill: async (id: number) => {
    await apiClient.delete(`/students/me/skills/${id}`);
  },

  uploadResume: async (file: File, isPrimary: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', String(isPrimary));
    const response = await apiClient.post<Resume>('/students/me/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteResume: async (id: number) => {
    await apiClient.delete(`/students/me/resume/${id}`);
  }
};
