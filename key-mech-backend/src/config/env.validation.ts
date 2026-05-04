type Environment = Record<string, string | undefined>;

const required = (env: Environment, key: string) => {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
};

export interface AppEnvironment {
  DATABASE_URL: string;
  JWT_SECRET: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_SECRET: string;
  FRONTEND_ORIGIN: string;
  NODE_ENV: string;
  PORT: string;
}

export function validateEnv(env: Environment): AppEnvironment {
  return {
    DATABASE_URL: required(env, 'DATABASE_URL'),
    JWT_SECRET: required(env, 'JWT_SECRET'),
    RAZORPAY_KEY_ID: required(env, 'RAZORPAY_KEY_ID'),
    RAZORPAY_SECRET: required(env, 'RAZORPAY_SECRET'),
    FRONTEND_ORIGIN: env.FRONTEND_ORIGIN?.trim() || 'http://localhost:5173',
    NODE_ENV: env.NODE_ENV?.trim() || 'development',
    PORT: env.PORT?.trim() || '3006',
  };
}
