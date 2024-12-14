export interface AuthResponse {
  status: {
    code: number;
    message: string;
  };
  data: AuthUser;
  tokens: AuthTokens;
}

export interface AuthUser {
  id?: string;
  nip?: string | null;
  nik?: string | null;
  first_name?: string;
  last_name?: string;
  photo_profile?: string | null;
  email?: string;
  phone_number?: string | null;
  address?: string | null;
  status?: boolean;
  role?: UserRole;
  role_feature_permissions?: RoleFeaturePermission[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  status: boolean;
}

export interface RoleFeaturePermission {
  id: string;
  role_id: string;
  feature_id: string;
  methods: {
    get: boolean;
    post: boolean;
    put: boolean;
    patch: boolean;
    delete: boolean;
  };
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  feature: Feature;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
