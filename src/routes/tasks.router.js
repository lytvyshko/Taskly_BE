import { Router } from 'express';

import { tasksController } from '../controllers/tasks.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
} from '../schemas/tasks.schema.js';

const tasksRouter = Router();

tasksRouter.get('/', authenticate, tasksController.getAll);
tasksRouter.post(
  '/',
  authenticate,
  validate(createTaskSchema),
  tasksController.create,
);
tasksRouter.patch(
  '/:id',
  authenticate,
  validate(updateTaskSchema),
  tasksController.update,
);
tasksRouter.delete('/:id', authenticate, tasksController.remove);

export { tasksRouter };
