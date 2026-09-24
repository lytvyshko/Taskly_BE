import { authRepository } from '../repositories/auth.repository.js';
import { avatarStorageService } from './avatar-storage.service.js';

const updateProfile = async (userId, { name, avatar }) => {
  const currentProfile =
    await authRepository.findUserProfileById(userId);

  let newAvatarKey;

  if (avatar) {
    newAvatarKey = await avatarStorageService.uploadAvatar(
      userId,
      avatar,
    );
  }

  try {
    const user = await authRepository.updateProfile(userId, {
      name,
      avatarKey: newAvatarKey,
    });

    if (newAvatarKey && currentProfile.avatar_key) {
      await avatarStorageService
        .deleteAvatar(currentProfile.avatar_key)
        .catch(() => undefined);
    }

    return user;
  } catch (error) {
    if (newAvatarKey) {
      await avatarStorageService
        .deleteAvatar(newAvatarKey)
        .catch(() => undefined);
    }

    throw error;
  }
};

export const usersService = {
  updateProfile,
};
