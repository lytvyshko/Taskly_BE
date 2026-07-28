import { z } from 'zod';
import { passwordSchema } from './auth.schema.js';

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});
