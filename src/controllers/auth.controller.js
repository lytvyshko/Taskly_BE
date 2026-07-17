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

export const authController = {
  register,
  verifyEmail,
  resendVerification,
};
