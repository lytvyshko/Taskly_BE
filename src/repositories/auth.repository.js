import { pool } from '../db/pool.js';

const toPublicUser = ({ avatar_key, ...user }) => {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(
    /\/$/,
    '',
  );

  return {
    ...user,
    avatar_url:
      avatar_key && publicUrl
        ? `${publicUrl}/${avatar_key}`
        : null,
  };
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );

  return result.rows[0];
};

const createUser = async ({
  name,
  email,
  passwordHash,
}) => {
  const result = await pool.query(
    `
    INSERT INTO users (
      name,
      email,
      password_hash
    )
    VALUES ($1, $2, $3)
    RETURNING id, name, email, email_verified, created_at;
    `,
    [name, email, passwordHash],
  );

  return result.rows[0];
};

const verifyUserEmail = async (userId) => {
  const result = await pool.query(
    `
    UPDATE users
    SET email_verified = true
    WHERE id = $1
    RETURNING id, email, email_verified;
    `,
    [userId],
  );

  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        email_verified,
        created_at,
        avatar_key
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0]
    ? toPublicUser(result.rows[0])
    : undefined;
};

const findUserProfileById = async (id) => {
  const result = await pool.query(
    `
      SELECT id, name, avatar_key
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

const findUserPasswordById = async (id) => {
  const result = await pool.query(
    `
      SELECT password_hash
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

const updatePassword = async (
  userId,
  passwordHash,
  client = pool,
) => {
  await client.query(
    `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
    `,
    [passwordHash, userId],
  );
};

const updateProfile = async (
  userId,
  { name, avatarKey },
) => {
  const fields = [];
  const values = [userId];

  if (name !== undefined) {
    fields.push(`name = $${values.length + 1}`);
    values.push(name);
  }

  if (avatarKey !== undefined) {
    fields.push(`avatar_key = $${values.length + 1}`);
    values.push(avatarKey);
  }

  const result = await pool.query(
    `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING id
    `,
    values,
  );

  if (!result.rows[0]) return undefined;

  return findUserById(result.rows[0].id);
};

export const authRepository = {
  findUserByEmail,
  createUser,
  verifyUserEmail,
  findUserById,
  findUserProfileById,
  findUserPasswordById,
  updatePassword,
  updateProfile,
};
