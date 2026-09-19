import { tasksRepository } from '../repositories/tasks.repository.js';

const getAll = async (userId) => {
  return tasksRepository.findAllByUserId(userId);
};

const create = async (userId, taskData) => {
  return tasksRepository.create({
    userId,
    ...taskData,
  });
};

export const tasksService = {
  getAll,
  create,
};
