import { Router } from 'express';

import { usersController } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadAvatar } from '../middlewares/avatar-upload.js';

const usersRouter = Router();

usersRouter.get('/me', authenticate, usersController.getMe);
usersRouter.patch(
  '/me/profile',
  authenticate,
  uploadAvatar,
  usersController.updateProfile,
);

export { usersRouter };
