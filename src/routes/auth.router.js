import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
export const authRouter = new Router();
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema } from '../schemas/auth.schema.js';
import { resendVerificationSchema } from '../schemas/resend-verification.schema.js';

authRouter.post(
  '/register',
  validate(registerSchema),
  authController.register,
);

authRouter.get('/verify-email', authController.verifyEmail);

authRouter.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  authController.resendVerification,
);
