import { pool } from '../db/pool.js';

const taskFields = `
  id,
  user_id,
  title,
  description,
  completed,
  due_date,
  tag,
  created_at
`;

const findAllByUserId = async (userId) => {
  const result = await pool.query(
    `
      SELECT ${taskFields}
      FROM tasks
      WHERE user_id = $1
      ORDER BY completed ASC, due_date ASC NULLS LAST, created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

const create = async ({
  userId,
  title,
  description,
  dueDate,
  tag,
}) => {
  const result = await pool.query(
    `
      INSERT INTO tasks (
        user_id,
        title,
        description,
        due_date,
        tag
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${taskFields}
    `,
    [userId, title, description ?? null, dueDate ?? null, tag ?? null],
  );

  return result.rows[0];
};

export const tasksRepository = {
  findAllByUserId,
  create,
};
