import { tasksService } from '../services/tasks.service.js';
import {
  getTasksQuerySchema,
  taskIdParamsSchema,
} from '../schemas/tasks.schema.js';
import { AppError } from '../errors/AppError.js';

const getAll = async (req, res) => {
  const result = getTasksQuerySchema.safeParse(req.query);

  if (!result.success) {
    throw new AppError(
      result.error.issues[0].message,
      400,
    );
  }

  const tasks = await tasksService.getAll(
    req.user.id,
    result.data.tab,
  );

  res.json(tasks);
};

const create = async (req, res) => {
  const task = await tasksService.create(
    req.user.id,
    req.body,
  );

  res.status(201).json(task);
};

const update = async (req, res) => {
  const result = taskIdParamsSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError('Invalid task id', 400);
  }

  const task = await tasksService.update(
    req.user.id,
    result.data.id,
    req.body,
  );

  res.json(task);
};

const remove = async (req, res) => {
  const result = taskIdParamsSchema.safeParse(req.params);

  if (!result.success) {
    throw new AppError('Invalid task id', 400);
  }

  await tasksService.remove(req.user.id, result.data.id);

  res.status(204).send();
};

export const tasksController = {
  getAll,
  create,
  update,
  remove,
};
