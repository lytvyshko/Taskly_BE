import { tasksService } from '../services/tasks.service.js';
import { getTasksQuerySchema } from '../schemas/tasks.schema.js';
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

export const tasksController = {
  getAll,
  create,
};
