import { tasksRepository } from '../repositories/tasks.repository.js';

const getAll = async (userId, tab) => {
  return tasksRepository.findAllByUserId(userId, tab);
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
