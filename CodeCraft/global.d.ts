declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      DATABASE_URL: string;
      PGHOST: string;
      PGUSER: string;
      PGPASSWORD: string;
      PGDATABASE: string;
      PGPORT: string;
      SUNBASE_API_URL: string;
      SUNBASE_API_KEY: string;
      SUNBASE_API_SECRET: string;
      KYC_REDIRECT_URL?: string;
      APP_URL?: string;
    }
  }
}

export {};