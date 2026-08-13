export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;
