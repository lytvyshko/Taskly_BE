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

const remove = async (userId, tagId) => {
  const deletedTag = await tagsRepository.deleteByUserIdAndId(
    userId,
    tagId,
  );

  if (!deletedTag) {
    throw new AppError('Tag not found', 404);
  }
};

const removeMany = async (userId, tagIds) => {
  return tagsRepository.deleteManyByUserIdAndIds(userId, tagIds);
};

export const tagsService = {
  getAll,
  create,
  remove,
  removeMany,
};
