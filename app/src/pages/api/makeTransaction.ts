import { createMemoInstruction } from '@solana/spl-memo';
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
} from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  MakeTransactionBodySchema,
  MakeTransactionQuerySchema,
} from '../../schemas';
import { usdcAddress } from '../../shared';

type MakeTransactionGetResponse = {
  label: string;
  icon: string;
};

export type MakeTransactionOutputData = {
  transaction: string;
  message: string;
};

type ErrorOutput = {
  error: string;
};

function get(res: NextApiResponse<MakeTransactionGetResponse>) {
  res.status(200).json({
    label: 'cryptopayly',
    icon: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/handshake_1f91d.png',
  });
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<MakeTransactionOutputData | ErrorOutput>,
) {
  try {
    const query = MakeTransactionQuerySchema.parse(req.query);

    const body = MakeTransactionBodySchema.parse(req.body);
    // We pass the selected items in the query, calculate the expected cost

    const buyerPublicKey = new PublicKey(body.account);
    const shopPublicKey = new PublicKey(query.recipient);

    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);

    let transaction: Transaction;
    switch (query.currency) {
      case 'usdc':
        const usdcTransaction = await getUSDCTransaction(connection, {
          buyerPublicKey,
          shopPublicKey,
          reference: new PublicKey(query.reference),
          amount: query.amount,
        });

        transaction = usdcTransaction;

        break;
      case 'sol':
        const solTransaction = await getSolTransaction(connection, {
          buyerPublicKey,
          shopPublicKey,
          reference: new PublicKey(query.reference),
          amount: query.amount,
        });
        transaction = solTransaction;
        break;
      default:
        throw new Error();
        break;
    }

    // Serialize the transaction and convert to base64 to return it
    const serializedTransaction = transaction.serialize({
      // We will need the buyer to sign this transaction after it's returned to them
      requireAllSignatures: false,
    });
    const base64 = serializedTransaction.toString('base64');

    // Insert into database: reference, amount

    // Return the serialized transaction
    res.status(200).json({
      transaction: base64,
      message: 'Thanks for your business! 🤝',
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: 'error creating transaction' });
    return;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    MakeTransactionGetResponse | MakeTransactionOutputData | ErrorOutput
  >,
) {
  if (req.method === 'GET') {
    return get(res);
  } else if (req.method === 'POST') {
    return await post(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUSDCTransaction(
  connection: Connection,
  {
    buyerPublicKey,
    amount,
    shopPublicKey,
    reference,
  }: {
    shopPublicKey: PublicKey;
    buyerPublicKey: PublicKey;
    reference: PublicKey;
    amount: string;
  },
) {
  // Get a recent blockhash to include in the transaction
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('finalized');

  const transaction = new Transaction({
    blockhash,
    // The buyer pays the transaction fee
    feePayer: buyerPublicKey,
    lastValidBlockHeight,
  });

  // Get details about the USDC token
  const usdcMint = await getMint(connection, usdcAddress);
  // Get the buyer's USDC token account address
  const buyerUsdcAddress = await getAssociatedTokenAddress(
    usdcAddress,
    buyerPublicKey,
  );
  // Get the shop's USDC token account address
  const shopUsdcAddress = await getAssociatedTokenAddress(
    usdcAddress,
    shopPublicKey,
  );

  // create memo
  const memoInstruction = createMemoInstruction('InvoiceId1');
  // Create the instruction to send USDC from the buyer to the shop
  const transferInstruction = createTransferCheckedInstruction(
    buyerUsdcAddress, // source
    usdcAddress, // mint (token address)
    shopUsdcAddress, // destination
    buyerPublicKey, // owner of source address
    BigInt(amount),
    usdcMint.decimals, // decimals of the USDC token
  );

  // Add the reference to the instruction as a key
  // This will mean this transaction is returned when we query for the reference
  transferInstruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });

  // Add the instruction to the transaction
  transaction.add(memoInstruction);
  transaction.add(transferInstruction);

  return transaction;
}
async function getSolTransaction(
  connection: Connection,
  {
    buyerPublicKey,
    amount,
    shopPublicKey,
    reference,
  }: {
    shopPublicKey: PublicKey;
    buyerPublicKey: PublicKey;
    reference: PublicKey;
    amount: string;
  },
) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('finalized');
  const transaction = new Transaction({
    blockhash,
    // The buyer pays the transaction fee
    feePayer: buyerPublicKey,
    lastValidBlockHeight,
  });

  // Create the instruction to send SOL from the buyer to the shop
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: buyerPublicKey,
    lamports: BigInt(amount),
    toPubkey: shopPublicKey,
  });

  // Add the reference to the instruction as a key
  // This will mean this transaction is returned when we query for the reference
  transferInstruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });

  // Add the instruction to the transaction
  transaction.add(transferInstruction);

  return transaction;
}
