import { pool } from '../db/pool.js';

const taskFields = `
  tasks.id,
  tasks.title,
  tasks.description,
  tasks.completed,
  tasks.due_date,
  tasks.tag_id,
  tags.title AS tag,
  tags.color AS tag_color,
  tags.icon AS tag_icon
`;

const taskJoin = `
  FROM tasks
  LEFT JOIN tags
    ON tags.id = tasks.tag_id
    AND tags.user_id = tasks.user_id
`;

const getTabCondition = (tab) => {
  switch (tab) {
    case 'today':
      return `
        AND tasks.completed = false
        AND tasks.due_date = CURRENT_DATE::text
      `;
    case 'planned':
      return `
        AND tasks.completed = false
        AND (
          tasks.due_date IS NULL
          OR tasks.due_date <> CURRENT_DATE::text
        )
      `;
    case 'completed':
      return 'AND tasks.completed = true';
    default:
      return '';
  }
};

const findAllByUserId = async (userId, tab) => {
  const result = await pool.query(
    `
      SELECT ${taskFields}
      ${taskJoin}
      WHERE tasks.user_id = $1
      ${getTabCondition(tab)}
      ORDER BY tasks.completed ASC, tasks.due_date ASC NULLS LAST, tasks.created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

const findByIdForUser = async (taskId, userId) => {
  const result = await pool.query(
    `
      SELECT ${taskFields}
      ${taskJoin}
      WHERE tasks.id = $1
        AND tasks.user_id = $2
    `,
    [taskId, userId],
  );

  return result.rows[0];
};

const create = async ({
  userId,
  title,
  description,
  dueDate,
  tagId,
}) => {
  const result = await pool.query(
    `
      INSERT INTO tasks (
        user_id,
        title,
        description,
        due_date,
        tag_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [
      userId,
      title,
      description ?? null,
      dueDate ?? null,
      tagId ?? null,
    ],
  );

  return findByIdForUser(result.rows[0].id, userId);
};

export const tasksRepository = {
  findAllByUserId,
  findByIdForUser,
  create,
};
