import { ENV } from './constants';

class Environment {
  private validateApiUrl(url: string | undefined): string {
    if (!url) {
      throw new Error('API_URL environment variable is required');
    }

    try {
      new URL(url); // Validate URL format
      return url;
    } catch {
      throw new Error('API_URL must be a valid URL');
    }
  }

  private getEnvironmentVariable(key: string): string {
    const value = process.env.NEXT_PUBLIC_API_URL;
    
    if (!value) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Environment variable ${key} is not defined`);
        return '';
      }
      throw new Error(`Environment variable ${key} is not defined`);
    }

    return value;
  }

  get isDevelopment(): boolean {
    return process.env.NODE_ENV === ENV.DEVELOPMENT;
  }

  get isProduction(): boolean {
    return process.env.NODE_ENV === ENV.PRODUCTION;
  }

  get isTest(): boolean {
    return process.env.NODE_ENV === ENV.TEST;
  }

  get apiUrl(): string {
    const url = this.getEnvironmentVariable('NEXT_PUBLIC_API_URL');
    return this.validateApiUrl(url);
  }
}

export const env = new Environment();