import express from 'express';
import { authRouter } from './routes/auth.router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());

app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorMiddleware);

export default app;
