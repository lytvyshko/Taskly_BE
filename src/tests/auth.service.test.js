import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';
import { authService } from '../services/auth.service.js';
import { authRepository } from '../repositories/auth.repository.js';
import bcrypt from 'bcrypt';
import { jwtService } from '../services/jwt.service.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';

vi.mock('../repositories/auth.repository.js', () => ({
  authRepository: {
    findUserByEmail: vi.fn(),
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock('../services/jwt.service.js', () => ({
  jwtService: {
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
  },
}));

vi.mock(
  '../repositories/refresh-token.repository.js',
  () => ({
    refreshTokenRepository: {
      create: vi.fn(),
      deleteExceededSessions: vi.fn(),
    },
  }),
);

vi.mock('../services/email.service.js', () => ({
  emailService: {
    sendVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  },
}));

describe('authService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login user with valid credentials', async () => {
    // Arrange

    authRepository.findUserByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed-password',
      email_verified: true,
    });

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('hashed-refresh-token');

    jwtService.generateAccessToken.mockReturnValue(
      'access-token',
    );
    jwtService.generateRefreshToken.mockReturnValue({
      refreshToken: 'refresh-token',
      jti: 'test-jti',
    });

    refreshTokenRepository.create.mockResolvedValue({
      id: 1,
    });

    refreshTokenRepository.deleteExceededSessions.mockResolvedValue();

    // Act

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    // Assert

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(
      authRepository.findUserByEmail,
    ).toHaveBeenCalledWith('test@example.com');

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'hashed-password',
    );

    expect(
      jwtService.generateAccessToken,
    ).toHaveBeenCalledWith(1);

    expect(
      jwtService.generateRefreshToken,
    ).toHaveBeenCalledWith(1);

    expect(bcrypt.hash).toHaveBeenCalledWith(
      'refresh-token',
      10,
    );

    expect(
      refreshTokenRepository.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        jti: 'test-jti',
        tokenHash: 'hashed-refresh-token',
      }),
    );

    expect(
      refreshTokenRepository.deleteExceededSessions,
    ).toHaveBeenCalledWith(1, 5);
  });

  it('should throw an error with invalid credentials', async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed-password',
      email_verified: true,
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow('Invalid email or password');

    expect(
      jwtService.generateAccessToken,
    ).not.toHaveBeenCalled();

    expect(
      jwtService.generateRefreshToken,
    ).not.toHaveBeenCalled();

    expect(
      refreshTokenRepository.create,
    ).not.toHaveBeenCalled();

    expect(
      refreshTokenRepository.deleteExceededSessions,
    ).not.toHaveBeenCalled();
  });

  it('should throw an error when user is not found', async () => {
    // Arrange

    authRepository.findUserByEmail.mockResolvedValue(null);

    // Act & Assert

    await expect(
      authService.login({
        email: 'unknown@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid email or password');

    expect(bcrypt.compare).not.toHaveBeenCalled();

    expect(
      jwtService.generateAccessToken,
    ).not.toHaveBeenCalled();

    expect(
      jwtService.generateRefreshToken,
    ).not.toHaveBeenCalled();

    expect(
      refreshTokenRepository.create,
    ).not.toHaveBeenCalled();

    expect(
      refreshTokenRepository.deleteExceededSessions,
    ).not.toHaveBeenCalled();
  });

  it('should throw an error when email is not verified', async () => {
    // Arrange

    authRepository.findUserByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashed-password',
      email_verified: false,
    });

    bcrypt.compare.mockResolvedValue(true);

    // Act & Assert

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Email is not verified');

    expect(
      jwtService.generateAccessToken,
    ).not.toHaveBeenCalled();

    expect(
      jwtService.generateRefreshToken,
    ).not.toHaveBeenCalled();

    expect(
      refreshTokenRepository.create,
    ).not.toHaveBeenCalled();

    expect(
      refreshTokenRepository.deleteExceededSessions,
    ).not.toHaveBeenCalled();
  });
});
