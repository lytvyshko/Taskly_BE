import { AppError } from '../errors/AppError.js';
import { jwtService } from '../services/jwt.service.js';
import { authRepository } from '../repositories/auth.repository.js';

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError(
      'Authorization header is missing',
      401,
    );
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    throw new AppError('Invalid authorization header', 401);
  }

  let payload;

  try {
    payload = jwtService.verifyAccessToken(token);
  } catch (error) {
    throw new AppError('Invalid access token', 401);
  }

  const { userId } = payload;

  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 401);
  }

  req.user = user;

  next();
};

export { authenticate };
