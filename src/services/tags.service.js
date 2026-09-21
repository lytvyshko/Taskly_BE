import { AppError } from '../errors/AppError.js';
import { tagsRepository } from '../repositories/tags.repository.js';

const getAll = async (userId) => {
  return tagsRepository.findAllByUserId(userId);
};

const create = async (userId, tagData) => {
  const existingTag =
    await tagsRepository.findByUserIdAndTitle(
      userId,
      tagData.title,
    );

  if (existingTag) {
    throw new AppError(
      'Tag with this title already exists',
      409,
    );
  }

  return tagsRepository.create({
    userId,
    ...tagData,
  });
};

export const tagsService = {
  getAll,
  create,
};
