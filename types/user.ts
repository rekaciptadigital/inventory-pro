// Ensure all fields from the API response are included
export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  nip: string | null;
  nik: string | null;
  first_name: string;
  last_name: string;
  photo_profile: string | null;
  email: string;
  phone_number: string | null;
  address: string | null;
  status: boolean;
  user_roles?: UserRole[];
  // Add password field if it comes in the response, but mark it as optional
  password?: string;
  // Make tokens optional as the API response might not include them
  tokens?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface UserRole {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: string;
  role_id: string;
  status: boolean;
  role?: {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    name: string;
    description: string;
    status: boolean;
  };
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string | null;
  status: boolean;
}

export interface ApiResponse<T> {
  status: {
    code: number;
    message: string;
  };
  data: T;
  pagination?: {
    links: {
      first: string;
      previous: string | null;
      current: string;
      next: string | null;
      last: string;
    };
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}