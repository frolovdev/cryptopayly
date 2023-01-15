import '../styles/globals.css';
import Head from 'next/head';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ReactElement, ReactNode, useMemo } from 'react';
import { ToastBar, Toaster, toast } from 'react-hot-toast';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { MetaProvider } from '../lib/MetaProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

const queryClient = new QueryClient();

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Toaster position="top-right">
              {(t) => (
                <ToastBar toast={t}>
                  {({ icon, message }) => (
                    <div
                      className="item-center flex cursor-pointer"
                      onClick={() => toast.dismiss(t.id)}
                    >
                      {icon}
                      {message}
                    </div>
                  )}
                </ToastBar>
              )}
            </Toaster>
            <Head>
              <title>cryptopayly</title>
              <link
                rel="stylesheet"
                href="https://rsms.me/inter/inter.css"
              ></link>
            </Head>
            {getLayout(
              <MetaProvider>
                <Component {...pageProps} />
              </MetaProvider>,
            )}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
