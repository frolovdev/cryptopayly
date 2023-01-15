import { PublicKey } from '@solana/web3.js';

export const staticString =
  '👋 You are signing up in cryptopayly';

export const usdcAddress = new PublicKey(
  'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
);

export const PaymentLinkStatus = {
  Waiting: 'waiting',
  Payed: 'payed',
  Error: 'error',
} as const;
