import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError.js';
import { authRepository } from '../repositories/auth.repository.js';

const register = async ({ name, email, password }) => {
  const existingUser =
    await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser({
    name,
    email,
    passwordHash,
  });

  return user;
};

export const authService = {
  register,
};
