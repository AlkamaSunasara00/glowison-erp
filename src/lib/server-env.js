const requiredServerEnv = ['DATABASE_URL', 'JWT_SECRET'];

export function assertServerEnv() {
  const missing = requiredServerEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required server environment variables: ${missing.join(', ')}`);
  }
}
