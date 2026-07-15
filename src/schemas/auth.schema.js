import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z.string().email('Invalid email format'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (value) =>
        /\d/.test(value) || /[^A-Za-z0-9]/.test(value),
      {
        message:
          'Password must contain at least one number or symbol',
      },
    ),
});
