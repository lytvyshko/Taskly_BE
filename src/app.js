import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.router.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { usersRouter } from './routes/users.router.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://192.168.3.2:5173',
    ],

    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorMiddleware);

export default app;
