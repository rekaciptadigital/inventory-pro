export interface ApiResponse<T> {
  status: {
    code: number;
    message: string;
  };
  data: T;
  pagination?: PaginationData;
}

export interface PaginationData {
  totalItems: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  links: {
    first: string;
    previous: string | null;
    current: string;
    next: string | null;
    last: string;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}