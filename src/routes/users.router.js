import { Router } from 'express';

import { usersController } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const usersRouter = Router();

usersRouter.get('/me', authenticate, usersController.getMe);

export { usersRouter };
