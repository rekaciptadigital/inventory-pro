// Environment constants
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

// Local storage and cookie keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKENS: 'tokens',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    VERIFY: '/auth/verify-token',
  },
  USERS: {
    PROFILE: '/users/profile',
    PASSWORD: '/users/password',
  },
} as const;

// Session configuration
export const SESSION_CONFIG = {
  // Token expiration times in milliseconds
  ACCESS_TOKEN_EXPIRY: 1000 * 60 * 15, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 1000 * 60 * 60 * 24 * 7, // 7 days
  
  // Cookie configuration
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
};