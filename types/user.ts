export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  first_name: string;
  last_name: string;
  photo_profile: string | null;
  email: string;
  password?: string;
  phone_number: string | null;
  status: boolean;
  user_roles: any[];
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