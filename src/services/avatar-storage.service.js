import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import { AppError } from '../errors/AppError.js';

const extensionByMimeType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const getR2Config = () => {
  const config = {
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
  };

  if (Object.values(config).some((value) => !value)) {
    throw new AppError(
      'Avatar storage is not configured',
      500,
    );
  }

  return config;
};

const createR2Client = (config) =>
  new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

const uploadAvatar = async (userId, file) => {
  const config = getR2Config();
  const extension = extensionByMimeType[file.mimetype];

  if (!extension) {
    throw new AppError('Unsupported avatar image type', 400);
  }

  const key = `avatars/user-${userId}/${crypto.randomUUID()}.${extension}`;
  const client = createR2Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return key;
};

const deleteAvatar = async (key) => {
  if (!key) return;

  const config = getR2Config();
  const client = createR2Client(config);

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
  );
};

export const avatarStorageService = {
  uploadAvatar,
  deleteAvatar,
};
