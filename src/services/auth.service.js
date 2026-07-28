import bcrypt from 'bcrypt';
import { transaction } from '../db/transaction.js';
import { AppError } from '../errors/AppError.js';
import { authRepository } from '../repositories/auth.repository.js';
import { generateVerificationToken } from '../utils/generateToken.js';
import { verificationRepository } from '../repositories/verification.repository.js';
import { emailService } from './email.service.js';
import { jwtService } from './jwt.service.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { passwordResetTokenRepository } from '../repositories/password-reset-token.repository.js';
import { pool } from '../db/pool.js';
import crypto from 'node:crypto';

const prepareRefreshToken = async (userId) => {
  const { refreshToken, jti } =
    jwtService.generateRefreshToken(userId);

  const tokenHash = await bcrypt.hash(refreshToken, 10);

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  return {
    refreshToken,
    jti,
    tokenHash,
    expiresAt,
  };
};

const register = async ({ name, email, password }) => {
  const existingUser =
    await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new AppError(
      'User with this email already exists',
      409,
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedEmail = email.trim().toLowerCase();

  const user = await authRepository.createUser({
    name,
    email: normalizedEmail,
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

  await emailService.sendVerificationEmail({
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

  await emailService.sendVerificationEmail({
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

  const refreshData = await prepareRefreshToken(user.id);

  await refreshTokenRepository.create({
    userId: user.id,
    jti: refreshData.jti,
    tokenHash: refreshData.tokenHash,
    expiresAt: refreshData.expiresAt,
  });

  await refreshTokenRepository.deleteExceededSessions(
    user.id,
    5,
  );

  return {
    accessToken,
    refreshToken: refreshData.refreshToken,
  };
};

const validateRefreshToken = async (refreshToken) => {
  let payload;

  try {
    payload = jwtService.verifyRefreshToken(refreshToken);
  } catch {
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

  return {
    userId,
    jti,
  };
};

const tryGetRefreshTokenPayload = (refreshToken) => {
  try {
    return jwtService.verifyRefreshToken(refreshToken);
  } catch {
    return null;
  }
};

const refresh = async (refreshToken) => {
  const { userId, jti } =
    await validateRefreshToken(refreshToken);

  const accessToken =
    jwtService.generateAccessToken(userId);

  const refreshData = await prepareRefreshToken(userId);

  return transaction(async (client) => {
    await refreshTokenRepository.deleteByJti(jti, client);

    await refreshTokenRepository.create(
      {
        userId,
        jti: refreshData.jti,
        tokenHash: refreshData.tokenHash,
        expiresAt: refreshData.expiresAt,
      },
      client,
    );

    await refreshTokenRepository.deleteExceededSessions(
      userId,
      5,
      client,
    );

    return {
      accessToken,
      refreshToken: refreshData.refreshToken,
    };
  });
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const payload = tryGetRefreshTokenPayload(refreshToken);

  if (!payload) {
    return;
  }

  await refreshTokenRepository.deleteByJti(payload.jti);
};

const createPasswordResetToken = async (
  userId,
  client = pool,
) => {
  await passwordResetTokenRepository.deleteByUserId(
    userId,
    client,
  );

  const selector = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(token, 10);
  const PASSWORD_RESET_TOKEN_EXPIRES_IN = 60 * 60 * 1000;

  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_IN,
  );

  await passwordResetTokenRepository.create(
    {
      userId,
      selector,
      tokenHash,
      expiresAt,
    },
    client,
  );

  return `${selector}.${token}`;
};

const forgotPassword = async (email) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    return;
  }

  const token = await createPasswordResetToken(user.id);

  await emailService.sendPasswordResetEmail(
    user.email,
    token,
  );
};

const validatePasswordResetToken = async (token) => {
  const parts = token.split('.');

  const invalidToken = () => {
    throw new AppError('Invalid password reset token', 400);
  };

  if (parts.length !== 2) invalidToken();

  const [selector, secret] = parts;

  const resetToken =
    await passwordResetTokenRepository.findBySelector(
      selector,
    );

  if (!resetToken) invalidToken();

  if (resetToken.expires_at < new Date()) invalidToken();

  const isValid = await bcrypt.compare(
    secret,
    resetToken.token_hash,
  );

  if (!isValid) {
    throw new AppError('Invalid password reset token', 400);
  }

  return {
    userId: resetToken.user_id,
  };
};

const resetPassword = async (token, newPassword) => {
  const { userId } =
    await validatePasswordResetToken(token);

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await authRepository.updatePassword(userId, passwordHash);
};

export const authService = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
