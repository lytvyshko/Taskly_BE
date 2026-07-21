import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { verificationRepository } from '../repositories/verification.repository.js';

const cleanupExpiredTokens = async () => {
  try {
    await refreshTokenRepository.deleteExpired();

    await verificationRepository.deleteExpired();

    console.log('Expired tokens cleanup completed');
  } catch (error) {
    console.error('Expired tokens cleanup failed:', error);
  }
};

export const startCleanupJob = () => {
  cleanupExpiredTokens();

  setInterval(cleanupExpiredTokens, 25 * 60 * 60 * 1000);
};
