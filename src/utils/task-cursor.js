import { AppError } from '../errors/AppError.js';

const cursorCreatedAtPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/;

export const encodeTaskCursor = ({
  completed,
  dueDate,
  createdAt,
  id,
}) =>
  Buffer.from(
    JSON.stringify({ completed, dueDate, createdAt, id }),
  ).toString('base64url');

export const decodeTaskCursor = (cursor) => {
  let value;

  try {
    value = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    );
  } catch {
    throw new AppError('Invalid cursor', 400);
  }

  const isValid =
    value &&
    typeof value.completed === 'boolean' &&
    (value.dueDate === null ||
      /^\d{4}-\d{2}-\d{2}$/.test(value.dueDate)) &&
    typeof value.createdAt === 'string' &&
    cursorCreatedAtPattern.test(value.createdAt) &&
    Number.isInteger(value.id) &&
    value.id > 0;

  if (!isValid) {
    throw new AppError('Invalid cursor', 400);
  }

  return value;
};
