import { Router } from 'express';

import { tasksController } from '../controllers/tasks.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTaskSchema } from '../schemas/tasks.schema.js';

const tasksRouter = Router();

tasksRouter.get('/', authenticate, tasksController.getAll);
tasksRouter.post(
  '/',
  authenticate,
  validate(createTaskSchema),
  tasksController.create,
);

export { tasksRouter };
