import { Router } from 'express';

import { tagsController } from '../controllers/tags.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTagSchema,
  deleteTagsSchema,
  updateTagSchema,
} from '../schemas/tags.schema.js';

const tagsRouter = Router();

tagsRouter.get('/', authenticate, tagsController.getAll);
tagsRouter.post(
  '/',
  authenticate,
  validate(createTagSchema),
  tagsController.create,
);
tagsRouter.patch(
  '/:id',
  authenticate,
  validate(updateTagSchema),
  tagsController.update,
);
tagsRouter.delete(
  '/',
  authenticate,
  validate(deleteTagsSchema),
  tagsController.removeMany,
);
tagsRouter.delete('/:id', authenticate, tagsController.remove);

export { tagsRouter };
