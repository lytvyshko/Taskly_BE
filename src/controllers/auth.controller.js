import { authService } from '../services/auth.service.js';
import { refreshCookieOptions } from '../config/cookies.js';

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    await authService.verifyEmail(token);

    res.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.resendVerification(email);

    res.json({
      message: 'Verification email has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken } =
      await authService.login({
        email,
        password,
      });

    res
      .cookie(
        'refreshToken',
        refreshToken,
        refreshCookieOptions,
      )
      .json({
        accessToken,
      });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refresh(refreshToken);

  res
    .cookie(
      'refreshToken',
      newRefreshToken,
      refreshCookieOptions,
    )
    .json({
      accessToken,
    });
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    await authService.logout(refreshToken);

    res
      .clearCookie('refreshToken', refreshCookieOptions)
      .sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const testCookie = (req, res) => {
  console.log(req.cookies);

  res.sendStatus(204);
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.json({
      message:
        "If an account with this email exists, we've sent a password reset link.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.json({
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  testCookie,
  forgotPassword,
  resetPassword,
};
