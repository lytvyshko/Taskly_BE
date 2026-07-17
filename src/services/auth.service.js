import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError.js';
import { authRepository } from '../repositories/auth.repository.js';
import { generateVerificationToken } from '../utils/generateToken.js';
import { verificationRepository } from '../repositories/verification.repository.js';
import { sendVerificationEmail } from './email.service.js';

const register = async ({ name, email, password }) => {
  const existingUser =
    await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser({
    name,
    email,
    passwordHash,
  });

  const token = generateVerificationToken();

  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );

  await verificationRepository.createVerificationToken({
    userId: user.id,
    token,
    expiresAt,
  });

  await sendVerificationEmail({
    email: user.email,
    token,
  });

  return user;
};

const verifyEmail = async (token) => {
  const verificationToken =
    await verificationRepository.findByToken(token);

  if (!verificationToken) {
    throw new AppError('Invalid verification token', 400);
  }

  if (new Date() > verificationToken.expires_at) {
    await verificationRepository.deleteByToken(token);
    throw new AppError('Verification token expired', 400);
  }

  await authRepository.verifyUserEmail(
    verificationToken.user_id,
  );

  await verificationRepository.deleteByToken(token);
};

const resendVerification = async (email) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.email_verified) {
    throw new AppError('Email is already verified', 409);
  }

  await verificationRepository.deleteByUserId(user.id);

  const token = generateVerificationToken();

  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );

  await verificationRepository.createVerificationToken({
    userId: user.id,
    token,
    expiresAt,
  });

  await sendVerificationEmail({
    email: user.email,
    token,
  });
};

export const authService = {
  register,
  verifyEmail,
  resendVerification,
};
