import { tagsService } from '../services/tags.service.js';

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

export const tagsController = {
  getAll,
  create,
};
