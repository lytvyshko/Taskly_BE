import { pool } from '../db/pool.js';

const tagFields = `
  id,
  title,
  color,
  icon
`;

const findAllByUserId = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        tags.id,
        tags.title,
        tags.color,
        tags.icon,
        COUNT(tasks.id)::INTEGER AS task_count
      FROM tags
      LEFT JOIN tasks ON tasks.tag_id = tags.id
      WHERE tags.user_id = $1
      GROUP BY tags.id
      ORDER BY tags.created_at ASC, tags.id ASC
    `,
    [userId],
  );

  return result.rows;
};

const findByUserIdAndTitle = async (userId, title) => {
  const result = await pool.query(
    `
      SELECT ${tagFields}
      FROM tags
      WHERE user_id = $1
        AND title = $2
    `,
    [userId, title],
  );

  return result.rows[0];
};

const create = async ({ userId, title, icon, color }) => {
  const result = await pool.query(
    `
      INSERT INTO tags (
        user_id,
        title,
        icon,
        color
      )
      VALUES ($1, $2, $3, $4)
      RETURNING ${tagFields}
    `,
    [userId, title, icon, color],
  );

  return result.rows[0];
};

export const tagsRepository = {
  findAllByUserId,
  findByUserIdAndTitle,
  create,
};
