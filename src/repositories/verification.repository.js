import { pool } from '../db/pool.js';

const createVerificationToken = async ({
  userId,
  token,
  expiresAt,
}) => {
  const result = await pool.query(
    `
      INSERT INTO email_verification_tokens (
        user_id,
        token,
        expires_at
      )
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token, expires_at, created_at;
    `,
    [userId, token, expiresAt],
  );

  return result.rows[0];
};

const findByToken = async (token) => {
  const result = await pool.query(
    `
    SELECT *
    FROM email_verification_tokens
    WHERE token = $1
    `,
    [token],
  );

  return result.rows[0];
};

const deleteByToken = async (token) => {
  await pool.query(
    `
    DELETE FROM email_verification_tokens
    WHERE token = $1;
    `,
    [token],
  );
};

const deleteByUserId = async (userId) => {
  await pool.query(
    `
    DELETE FROM email_verification_tokens
    WHERE user_id = $1;
    `,
    [userId],
  );
};

export const verificationRepository = {
  createVerificationToken,
  findByToken,
  deleteByToken,
  deleteByUserId,
};
