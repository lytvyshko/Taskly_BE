import { pool } from '../db/pool.js';

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
        created_at
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

export const authRepository = {
  findUserByEmail,
  createUser,
  verifyUserEmail,
  findUserById,
  updatePassword,
};
