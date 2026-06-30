import { z } from 'zod';

const emailSchema = z.string().email({ message: 'Invalid email address' });

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  password: passwordSchema,
  level_english: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  allow_save_audio: z.boolean(),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
  new_password: passwordSchema,
});