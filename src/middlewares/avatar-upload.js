import multer from 'multer';
import { AppError } from '../errors/AppError.js';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          'Avatar must be a JPEG, PNG, or WebP image',
          400,
        ),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadAvatar = (req, res, next) => {
  upload.single('avatar')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(
          new AppError(
            'Avatar must be smaller than 5 MB',
            400,
          ),
        );
        return;
      }
    }

    next(error);
  });
};
