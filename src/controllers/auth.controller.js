import { authService } from '../services/auth.service.js';

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const authController = { register };
