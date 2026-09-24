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

const findAllByUserId = async (userId, tab, search) => {
  const queryParams = [userId];
  const searchCondition = search
    ? `
        AND (
          tasks.title ILIKE $2
          OR tasks.description ILIKE $2
          OR tags.title ILIKE $2
        )
      `
    : '';

  if (search) {
    queryParams.push(`%${search}%`);
  }

  const result = await pool.query(
    `
      SELECT ${taskFields}
      ${taskJoin}
      WHERE tasks.user_id = $1
      ${searchCondition}
      ${getTabCondition(tab)}
      ORDER BY tasks.completed ASC, tasks.due_date ASC NULLS LAST, tasks.created_at DESC
    `,
    queryParams,
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

const updateByIdForUser = async (
  taskId,
  userId,
  { title, description, dueDate, tagId },
) => {
  const result = await pool.query(
    `
      UPDATE tasks
      SET title = $1,
          description = $2,
          due_date = $3,
          tag_id = $4
      WHERE id = $5
        AND user_id = $6
      RETURNING id
    `,
    [
      title,
      description ?? null,
      dueDate ?? null,
      tagId ?? null,
      taskId,
      userId,
    ],
  );

  if (!result.rows[0]) return undefined;

  return findByIdForUser(result.rows[0].id, userId);
};

const updateManyByIdsForUser = async (
  userId,
  { ids, completed, dueDate, tagId },
) => {
  const assignments = [];
  const values = [userId, ids];

  if (completed !== undefined) {
    assignments.push(`completed = $${values.length + 1}`);
    values.push(completed);
  }

  if (dueDate !== undefined) {
    assignments.push(`due_date = $${values.length + 1}`);
    values.push(dueDate);
  }

  if (tagId !== undefined) {
    assignments.push(`tag_id = $${values.length + 1}`);
    values.push(tagId);
  }

  const result = await pool.query(
    `
      UPDATE tasks
      SET ${assignments.join(', ')}
      WHERE user_id = $1
        AND id = ANY($2::INTEGER[])
      RETURNING id
    `,
    values,
  );

  return result.rows.map((row) => row.id);
};

const deleteManyByIdsForUser = async (userId, ids) => {
  const result = await pool.query(
    `
      DELETE FROM tasks
      WHERE user_id = $1
        AND id = ANY($2::INTEGER[])
      RETURNING id
    `,
    [userId, ids],
  );

  return result.rows.map((row) => row.id);
};

export const tasksRepository = {
  findAllByUserId,
  findByIdForUser,
  create,
  updateByIdForUser,
  updateManyByIdsForUser,
  deleteManyByIdsForUser,
};
