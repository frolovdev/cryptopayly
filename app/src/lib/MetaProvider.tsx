import { getMint, Mint } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useContext, createContext, useMemo, PropsWithChildren } from 'react';
import { Loader } from '../components/Loader';
import { usdcAddress } from '../shared';

type MetaContextType = {
  usdcMint: Mint;
};

const defaultContext = {};

const MetaContext = createContext<MetaContextType>(
  defaultContext as MetaContextType,
);

export function useMeta() {
  return useContext(MetaContext);
}

const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);
const connection = new Connection(endpoint);

export const MetaProvider = ({ children }: PropsWithChildren) => {
  const { data: usdcMint, status } = useQuery({
    queryKey: ['metadata'],
    queryFn: async () => {
      const usdcMint = await getMint(connection, usdcAddress);
      return usdcMint;
    },
  });

  if (status !== 'success') {
    return <Loader></Loader>;
  }

  const value = { usdcMint };

  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>;
};
