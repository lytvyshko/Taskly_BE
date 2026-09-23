import { Router } from 'express';

import { tasksController } from '../controllers/tasks.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  bulkUpdateTasksSchema,
  createTaskSchema,
  deleteTasksSchema,
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
  '/bulk',
  authenticate,
  validate(bulkUpdateTasksSchema),
  tasksController.updateMany,
);
tasksRouter.delete(
  '/',
  authenticate,
  validate(deleteTasksSchema),
  tasksController.removeMany,
);
tasksRouter.patch(
  '/:id',
  authenticate,
  validate(updateTaskSchema),
  tasksController.update,
);
tasksRouter.delete('/:id', authenticate, tasksController.remove);

export { tasksRouter };
