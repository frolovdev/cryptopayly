import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { Program } from '@project-serum/anchor';
import { IDL } from '../constants/idl';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { PROGRAM_PUBKEY } from '../constants/keys';
import { Cryptopayly } from '../constants/idl';
import { MutationOptions, useMutation, useQuery } from '@tanstack/react-query';
import { PAYMENT_LINK_STATE, USER_STATE } from '../constants/seeds';
import { BN, type BN as BNType } from 'bn.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { getMint } from '@solana/spl-token';
import { usdcAddress } from '../shared';
import BigNumber from 'bignumber.js';

export function useProgram() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions(),
      );
      return new anchor.Program(
        IDL,
        PROGRAM_PUBKEY,
        provider,
      ) as Program<Cryptopayly>;
    }
  }, [connection, anchorWallet]);

  return program;
}

export function useInitializeUserMutation() {
  const program = useProgram();
  const { publicKey } = useWallet();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!publicKey || !program) {
        return;
      }

      const [userProfilePda] = anchor.utils.publicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode(USER_STATE), publicKey.toBuffer()],
        program.programId,
      );

      return await program.methods
        .createUserProfile()
        .accounts({
          userProfile: userProfilePda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
  });

  return mutation;
}

export function useUserProfileAccountQuery() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const query = useQuery({
    queryKey: ['profileAccount'],
    queryFn: async () => {
      if (!publicKey || !program) {
        throw new Error();
      }

      const [userProfilePda] = anchor.utils.publicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode(USER_STATE), publicKey.toBuffer()],
        program.programId,
      );

      const profileAccount = await program?.account.userProfileAccount.fetch(
        userProfilePda,
      );

      return profileAccount;
    },
    enabled: Boolean(publicKey && program),
  });

  return query;
}

export function usePaymentLinkAccountsQuery() {
  const { publicKey } = useWallet();
  const program = useProgram();

  const query = useQuery({
    queryKey: ['paymentLinkAccountList'],
    queryFn: async () => {
      if (!publicKey || !program) {
        throw new Error();
      }

      const paymentLinkAccounts = await program?.account.paymentLinkAccount.all(
        [
          {
            memcmp: {
              offset: 8,
              bytes: publicKey.toString(),
            },
          },
        ],
      );

      return paymentLinkAccounts;
    },
    enabled: Boolean(publicKey && program),
  });

  return query;
}

type UsePaymentLinkCreateMutationVariables = {
  amount: string;
  currency: string;
  lastPaymentLink: number;
};

export function usePaymentLinkCreateMutation(
  options?: MutationOptions<
    unknown,
    unknown,
    UsePaymentLinkCreateMutationVariables
  >,
) {
  const { publicKey } = useWallet();
  const program = useProgram();
  const mutation = useMutation<
    unknown,
    unknown,
    UsePaymentLinkCreateMutationVariables
  >({
    ...options,
    mutationFn: async ({ amount, currency, lastPaymentLink }) => {
      if (!publicKey || !program) {
        return;
      }

      const [profilePda] = anchor.utils.publicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode(USER_STATE), publicKey.toBuffer()],
        program.programId,
      );
      const [paymentLinkPda] = anchor.utils.publicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode(PAYMENT_LINK_STATE),
          publicKey.toBuffer(),
          Uint8Array.from([lastPaymentLink]),
        ],
        program.programId,
      );

      const reference = Keypair.generate().publicKey;
      const resultAmount = await toMinorUnit(amount, currency.toLowerCase());

      return await program.methods
        .createPaymentLink({
          amount: resultAmount,
          currency: { [currency.toLowerCase()]: {} },
          reference,
        })
        .accounts({
          userProfile: profilePda,
          paymentLinkAccount: paymentLinkPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
  });

  return mutation;
}

export function usePaymentLinkByPubKeyQuery(publicKey: PublicKey) {
  const program = useProgram();
  const query = useQuery({
    queryKey: ['paymentLink', publicKey.toBase58()],
    queryFn: async () => {
      if (!program) {
        throw new Error();
      }
      const paymentLinkAccount =
        await program?.account.paymentLinkAccount.fetch(publicKey);

      return paymentLinkAccount;
    },
    enabled: Boolean(program),
  });

  return query;
}

async function toMinorUnit(amount: string, currency: string) {
  switch (currency) {
    case 'sol':
      return new anchor.BN(
        new BigNumber(amount).multipliedBy(LAMPORTS_PER_SOL).toString(),
      );

    case 'usdc':
      const network = WalletAdapterNetwork.Devnet;
      const endpoint = clusterApiUrl(network);
      const connection = new Connection(endpoint);

      // Get details about the USDC token
      const usdcMint = await getMint(connection, usdcAddress);

      const bignumber = new BigNumber(amount).multipliedBy(
        new BigNumber(10).pow(usdcMint.decimals),
      );
      return new BN(bignumber.toString());

    default:
      throw new Error('unsupported currency');
  }
}
