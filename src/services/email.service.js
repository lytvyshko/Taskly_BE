import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
});

export const sendVerificationEmail = async ({
  email,
  token,
}) => {
  const verificationUrl = `${process.env.API_URL}/auth/verify-email?token=${token}`;

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
