import { BrevoClient } from '@getbrevo/brevo';
import { emailConfig } from '../config/email.config.js';

const brevo = new BrevoClient({
  apiKey: emailConfig.apiKey,
});

const sender = {
  name: emailConfig.fromName,
  email: emailConfig.fromAddress,
};

const sendVerificationEmail = async ({ email, token }) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await brevo.transactionalEmails.sendTransacEmail({
    sender,

    to: [
      {
        email,
      },
    ],

    subject: 'Verify your email',

    htmlContent: `
      <h2>Welcome to Todo App!</h2>

      <p>
        Please verify your email address
        by clicking the link below:
      </p>

      <a href="${verificationUrl}">
        Verify email
      </a>

      <p>
        This link expires in 24 hours.
      </p>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await brevo.transactionalEmails.sendTransacEmail({
    sender,

    to: [
      {
        email,
      },
    ],

    subject: 'Reset your password',
    htmlContent: `
      <h2>Reset your password</h2>

      <p>You requested to reset your password.</p>

      <p>
        Click the link below to choose a new password:
      </p>

      <a href="${resetUrl}">
        Reset password
      </a>

      <p>
        This link will expire in 1 hour.
      </p>

      <p>
        If you didn't request a password reset,
        you can safely ignore this email.
      </p>
    `,
  });
};

export const emailService = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
