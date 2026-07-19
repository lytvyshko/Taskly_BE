import { authService } from '../services/auth.service.js';

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

    const tokens = await authService.login({
      email,
      password,
    });

    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  const tokens = await authService.refresh(refreshToken);

  res.json(tokens);
};

export const authController = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
};
