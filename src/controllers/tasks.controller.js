import { tasksService } from '../services/tasks.service.js';

const getAll = async (req, res) => {
  const tasks = await tasksService.getAll(req.user.id);

  res.json(tasks);
};

const create = async (req, res) => {
  const task = await tasksService.create(
    req.user.id,
    req.body,
  );

  res.status(201).json(task);
};

export const tasksController = {
  getAll,
  create,
};
