import { z } from 'zod';

const tagIcons = [
  'folder',
  'home',
  'work',
  'person',
  'heart',
  'bookmark',
  'flag',
  'list',
  'group',
  'label',
];

const tagColors = [
  'purple',
  'blue',
  'green',
  'orange',
  'red',
  'grey',
  'teal',
];

export const createTagSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tag title is required')
    .max(100, 'Tag title must be at most 100 characters'),
  icon: z.enum(tagIcons, {
    message: 'Invalid tag icon',
  }),
  color: z.enum(tagColors, {
    message: 'Invalid tag color',
  }),
});
