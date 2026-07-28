import { z } from 'zod';

export const emailSchema = z.object({
  email: z.email('Invalid email address'),
});
