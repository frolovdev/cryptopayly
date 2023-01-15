import isEqual from 'lodash.isequal';
import { Mint } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import { Currency, CurrencyType } from '../constants/enums';

type Options = {
  usdcMint?: Mint;
};

export function fromMinUnitToValue(
  amount: BN,
  currency: CurrencyType,
  { usdcMint }: Options,
) {
  if (isEqual(currency, Currency.sol)) {
    return new BigNumber(amount.toString()).dividedBy(LAMPORTS_PER_SOL);
  }

  if (isEqual(currency, Currency.usdc)) {
    if (!usdcMint) {
      throw new Error('please provide a usdcMint');
    }
    return new BigNumber(amount.toString()).dividedBy(
      new BigNumber(10).pow(usdcMint.decimals),
    );
  }

  throw new Error('please use allowed currencies');
}

export function formatCurrency(currency: CurrencyType) {
  if (isEqual(currency, Currency.usdc)) {
    return 'usdc';
  }

  if (isEqual(currency, Currency.sol)) {
    return 'sol';
  }

  throw new Error('please use allowed currencies');
}
