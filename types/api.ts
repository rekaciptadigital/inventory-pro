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