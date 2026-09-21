import { Router } from 'express';

import { tagsController } from '../controllers/tags.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTagSchema } from '../schemas/tags.schema.js';

const tagsRouter = Router();

tagsRouter.get('/', authenticate, tagsController.getAll);
tagsRouter.post(
  '/',
  authenticate,
  validate(createTagSchema),
  tagsController.create,
);

export { tagsRouter };
