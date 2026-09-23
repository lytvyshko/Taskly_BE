import { tagsService } from '../services/tags.service.js';
import {
  deleteTagParamsSchema,
} from '../schemas/tags.schema.js';
import { AppError } from '../errors/AppError.js';

const getAll = async (req, res) => {
  const tags = await tagsService.getAll(req.user.id);

  res.json(tags);
};

const create = async (req, res) => {
  const tag = await tagsService.create(
    req.user.id,
    req.body,
  );

  res.status(201).json(tag);
};

const update = async (req, res) => {
  const result = deleteTagParamsSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError('Invalid tag id', 400);
  }

  const tag = await tagsService.update(
    req.user.id,
    result.data.id,
    req.body,
  );

  res.json(tag);
};

const remove = async (req, res) => {
  const result = deleteTagParamsSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError('Invalid tag id', 400);
  }

  await tagsService.remove(req.user.id, result.data.id);

  res.status(204).send();
};

const removeMany = async (req, res) => {
  const deletedIds = await tagsService.removeMany(
    req.user.id,
    req.body.ids,
  );

  res.json({ deletedIds });
};

export const tagsController = {
  getAll,
  create,
  update,
  remove,
  removeMany,
};
