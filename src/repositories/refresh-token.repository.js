import { pool } from '../db/pool.js';

const create = async (
  { userId, jti, tokenHash, expiresAt },
  client = pool,
) => {
  await client.query(
    `
      INSERT INTO refresh_tokens
      (
        user_id,
        jti,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
    `,
    [userId, jti, tokenHash, expiresAt],
  );
};

const findByJti = async (jti) => {
  const result = await pool.query(
    `
      SELECT *
      FROM refresh_tokens
      WHERE jti = $1
    `,
    [jti],
  );

  return result.rows[0];
};

const deleteByJti = async (jti, client = pool) => {
  await pool.query(
    `
      DELETE FROM refresh_tokens
      WHERE jti = $1
    `,
    [jti],
  );
};

const deleteExceededSessions = async (
  userId,
  limit,
  client = pool,
) => {
  await client.query(
    `
      DELETE FROM refresh_tokens
      WHERE id IN (
        SELECT id
        FROM refresh_tokens
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC
        OFFSET $2
      )
    `,
    [userId, limit],
  );
};

const deleteExpired = async (client = pool) => {
  await client.query(
    `
      DELETE FROM refresh_tokens
      WHERE expires_at < NOW()
    `,
  );
};

export const refreshTokenRepository = {
  create,
  findByJti,
  deleteByJti,
  deleteExceededSessions,
  deleteExpired,
};
