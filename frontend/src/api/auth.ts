import { apiClient } from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface StudentRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  preferred_job_role?: string;
  location?: string;
}

export interface RecruiterRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name: string;
  company_website?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  student_profile?: any;
  recruiter_profile?: any;
}

export const authApi = {
  login: async (data: LoginData) => {
    const response = await apiClient.post<Token>('/auth/login', data);
    return response.data;
  },

  registerStudent: async (data: StudentRegistration) => {
    const response = await apiClient.post<UserResponse>('/auth/register/student', data);
    return response.data;
  },

  registerRecruiter: async (data: RecruiterRegistration) => {
    const response = await apiClient.post<UserResponse>('/auth/register/recruiter', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
  },
};
