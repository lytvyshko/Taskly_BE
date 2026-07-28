import { pool } from '../db/pool.js';

const create = async (
  { userId, selector, tokenHash, expiresAt },
  client = pool,
) => {
  await client.query(
    `
      INSERT INTO password_reset_tokens (
        user_id,
        selector,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
    `,
    [userId, selector, tokenHash, expiresAt],
  );
};

const findBySelector = async (selector, client = pool) => {
  const { rows } = await client.query(
    `
      SELECT *
      FROM password_reset_tokens
      WHERE selector = $1
      LIMIT 1
    `,
    [selector],
  );

  return rows[0] ?? null;
};

const findByUserId = async (userId, client = pool) => {
  const { rows } = await client.query(
    `
      SELECT *
      FROM password_reset_tokens
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] ?? null;
};

const deleteByUserId = async (userId, client = pool) => {
  await client.query(
    `
      DELETE FROM password_reset_tokens
      WHERE user_id = $1
    `,
    [userId],
  );
};

const deleteExpired = async (client = pool) => {
  await client.query(
    `
      DELETE
      FROM password_reset_tokens
      WHERE expires_at < NOW()
    `,
  );
};

export const passwordResetTokenRepository = {
  create,
  findByUserId,
  findBySelector,
  deleteByUserId,
  deleteExpired,
};
