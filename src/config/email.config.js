const requiredEnvVars = [
  'BREVO_API_KEY',
  'EMAIL_FROM_NAME',
  'EMAIL_FROM_ADDRESS',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}`,
    );
  }
}

export const emailConfig = {
  apiKey: process.env.BREVO_API_KEY,
  fromName: process.env.EMAIL_FROM_NAME,
  fromAddress: process.env.EMAIL_FROM_ADDRESS,
};
