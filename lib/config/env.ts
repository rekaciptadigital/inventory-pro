export const env = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

export const apiConfig = {
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
};