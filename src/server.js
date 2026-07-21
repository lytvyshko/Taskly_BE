import 'dotenv/config';
import app from './app.js';
import { pool } from './db/pool.js';
import { startCleanupJob } from './jobs/cleanup-tokens.job.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query('SELECT 1');

    startCleanupJob();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

startServer();
