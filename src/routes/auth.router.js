import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
export const authRouter = new Router();
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema } from '../schemas/auth.schema.js';

authRouter.post(
  '/register',
  validate(registerSchema),
  authController.register,
);
