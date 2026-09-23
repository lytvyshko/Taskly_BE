import { AppError } from '../errors/AppError.js';
import { tasksRepository } from '../repositories/tasks.repository.js';

const getAll = async (userId, tab, search) => {
  return tasksRepository.findAllByUserId(userId, tab, search);
};

const create = async (userId, taskData) => {
  return tasksRepository.create({
    userId,
    ...taskData,
  });
};

const update = async (userId, taskId, taskData) => {
  const updatedTask = await tasksRepository.updateByIdForUser(
    taskId,
    userId,
    taskData,
  );

  if (!updatedTask) {
    throw new AppError('Task not found', 404);
  }

  return updatedTask;
};

const remove = async (userId, taskId) => {
  const deletedTask = await tasksRepository.deleteByIdForUser(
    taskId,
    userId,
  );

  if (!deletedTask) {
    throw new AppError('Task not found', 404);
  }
};

const updateMany = async (userId, taskData) => {
  return tasksRepository.updateManyByIdsForUser(userId, taskData);
};

const removeMany = async (userId, taskIds) => {
  return tasksRepository.deleteManyByIdsForUser(userId, taskIds);
};

export const tasksService = {
  getAll,
  create,
  update,
  remove,
  updateMany,
  removeMany,
};
