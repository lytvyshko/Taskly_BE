import 'dotenv/config';

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsPath = path.resolve(
  __dirname,
  '../../migrations',
);

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const files = await fs.readdir(migrationsPath);

    const migrations = files
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const { rows: executedMigrations } = await client.query(
      `
        SELECT name
        FROM schema_migrations
      `,
    );

    const executedNames = new Set(
      executedMigrations.map((migration) => migration.name),
    );

    for (const migration of migrations) {
      if (executedNames.has(migration)) {
        continue;
      }

      const migrationPath = path.join(
        migrationsPath,
        migration,
      );

      const sql = await fs.readFile(migrationPath, 'utf8');

      console.log(`Running migration: ${migration}`);

      await client.query('BEGIN');

      try {
        await client.query(sql);

        await client.query(
          `
            INSERT INTO schema_migrations (name)
            VALUES ($1)
          `,
          [migration],
        );

        await client.query('COMMIT');

        console.log(`Migration completed: ${migration}`);
      } catch (error) {
        await client.query('ROLLBACK');

        throw error;
      }
    }

    console.log('Migrations completed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
