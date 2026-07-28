import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
});

const sendVerificationEmail = async ({ email, token }) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: 'Todo App <no-reply@todoapp.com>',
    to: email,
    subject: 'Verify your email',

    html: `
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

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your password',
    html: `
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
