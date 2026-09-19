import { z } from 'zod';

const optionalText = (maxLength, message) =>
  z
    .string()
    .trim()
    .max(maxLength, message)
    .optional()
    .nullable();

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(255, 'Task title must be at most 255 characters'),

  description: optionalText(
    5000,
    'Task description must be at most 5000 characters',
  ),

  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid due date')
    .optional()
    .nullable(),

  tag: optionalText(
    100,
    'Task tag must be at most 100 characters',
  ),
});
