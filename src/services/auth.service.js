import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError.js';
import { authRepository } from '../repositories/auth.repository.js';
import { generateVerificationToken } from '../utils/generateToken.js';
import { verificationRepository } from '../repositories/verification.repository.js';
import { sendVerificationEmail } from './email.service.js';
import { jwtService } from './jwt.service.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';

const createRefreshToken = async (userId) => {
  const { refreshToken, jti } =
    jwtService.generateRefreshToken(userId);

  const tokenHash = await bcrypt.hash(refreshToken, 10);

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  await refreshTokenRepository.create({
    userId,
    jti,
    tokenHash,
    expiresAt,
  });

  return refreshToken;
};

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

const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password_hash,
  );

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.email_verified) {
    throw new AppError('Email is not verified', 403);
  }

  const accessToken = jwtService.generateAccessToken(
    user.id,
  );

  const refreshToken = await createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
  };
};

const refresh = async (refreshToken) => {
  let payload;

  try {
    payload = jwtService.verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }

  const { userId, jti } = payload;

  const storedToken =
    await refreshTokenRepository.findByJti(jti);

  if (!storedToken) {
    throw new AppError('Refresh token not found', 401);
  }

  const isValid = await bcrypt.compare(
    refreshToken,
    storedToken.token_hash,
  );

  if (!isValid) {
    throw new AppError('Invalid refresh token', 401);
  }

  await refreshTokenRepository.deleteByJti(jti);

  const accessToken =
    jwtService.generateAccessToken(userId);

  const newRefreshToken = await createRefreshToken(userId);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const authService = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
};
