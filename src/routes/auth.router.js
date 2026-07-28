import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
export const authRouter = new Router();
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema } from '../schemas/auth.schema.js';
import { emailSchema } from '../schemas/email.schema.js';
import { loginSchema } from '../schemas/login.schema.js';
import { resetPasswordSchema } from '../schemas/resetPassword.schema.js';

authRouter.post(
  '/register',
  validate(registerSchema),
  authController.register,
);

authRouter.get('/verify-email', authController.verifyEmail);

authRouter.post(
  '/resend-verification',
  validate(emailSchema),
  authController.resendVerification,
);

authRouter.post(
  '/login',
  validate(loginSchema),
  authController.login,
);

authRouter.post('/refresh', authController.refresh);

authRouter.post('/logout', authController.logout);

authRouter.get('/test-cookie', authController.testCookie);

authRouter.post(
  '/forgot-password',
  validate(emailSchema),
  authController.forgotPassword,
);

authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword,
);
