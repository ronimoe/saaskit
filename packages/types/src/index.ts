// Shared TypeScript types for the SaaS platform

// Basic user type
export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

// Basic API response type
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
} 