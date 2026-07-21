import express from 'express';
import { authRouter } from './routes/auth.router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { usersRouter } from './routes/users.router.js';

const app = express();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorMiddleware);

export default app;
