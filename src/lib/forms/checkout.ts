import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(60),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  paymentMethod: z.enum(['counter', 'online']).default('counter')
});

export type CheckoutSchema = typeof checkoutSchema;
