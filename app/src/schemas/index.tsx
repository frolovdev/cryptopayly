import BigNumber from 'bignumber.js';
import { z } from 'zod';

export const CurrencySchema = z.enum(['sol', 'usdc']);

export const AmountInputSchema = z
  .string()
  .refine((val) => new BigNumber(val).isGreaterThan(0));

export const AmountSchema = z
  .string()
  .refine((val) => new BigNumber(val).isGreaterThan(0));

export const MakeTransactionQuerySchema = z.object({
  reference: z.string(),
  amount: AmountInputSchema,
  currency: CurrencySchema,
  recipient: z.string(),
});

export const MakeTransactionBodySchema = z.object({
  account: z.string(),
});

export const AuthorizeCredentialsSchema = z.object({
  pubKey: z.string(),
  sig: z.string(),
});
