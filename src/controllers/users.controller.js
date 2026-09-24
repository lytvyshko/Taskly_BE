import { AppError } from '../errors/AppError.js';
import { usersService } from '../services/users.service.js';
import { updateProfileSchema } from '../schemas/users.schema.js';

const getMe = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  const result = updateProfileSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      result.error.issues[0].message,
      400,
    );
  }

  if (result.data.name === undefined && !req.file) {
    throw new AppError(
      'Name or avatar must be provided',
      400,
    );
  }

  const user = await usersService.updateProfile(
    req.user.id,
    {
      name: result.data.name,
      avatar: req.file,
    },
  );

  res.json(user);
};

export const usersController = {
  getMe,
  updateProfile,
};
