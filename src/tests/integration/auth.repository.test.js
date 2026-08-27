import {
  describe,
  it,
  expect,
  beforeEach,
  afterAll,
} from 'vitest';

import { authRepository } from '../../repositories/auth.repository.js';
import { pool } from '../../db/pool.js';

describe('authRepository', () => {
  beforeEach(async () => {
    await pool.query(
      'TRUNCATE users RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should find user by email', async () => {
    // Arrange
    const email = 'test@example.com';

    await pool.query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash
        )
        VALUES ($1, $2, $3)
      `,
      ['Test User', email, 'hashed-password'],
    );

    // Act
    const user =
      await authRepository.findUserByEmail(email);

    // Assert
    expect(user).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
      password_hash: 'hashed-password',
    });
  });
});
