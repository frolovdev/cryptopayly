import { useWallet } from '@solana/wallet-adapter-react';

import dynamic from 'next/dynamic';
import { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { myLinks } from '../routes';
import Layout from '../components/Layout';
import {
  useInitializeUserMutation,
  useUserProfileAccountQuery,
} from '../services/hooks';

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false },
);

export default function HomePage() {
  // We get the public key of the connected wallet, if there is one
  const { publicKey } = useWallet();
  const router = useRouter();
  const initializeUserMutation = useInitializeUserMutation();
  const { status } = useUserProfileAccountQuery();

  useEffect(() => {
    if (status === 'success') {
      router.push(myLinks);
    }
  }, [router, status]);

  return (
    <div className="m-auto flex max-w-4xl flex-col items-stretch gap-8 pt-24">
      {/* We add the Solana wallet connect button */}
      <div className="flex basis-1/4 flex-col">
        <WalletMultiButtonDynamic className="!bg-gray-900 hover:scale-105" />
        {publicKey && (
          <button
            className="mx-auto mt-2 flex items-center rounded-md border border-transparent bg-indigo-600 px-10 py-3 text-center text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => initializeUserMutation.mutate()}
          >
            Sign in
          </button>
        )}
      </div>

      {/* We disable checking out without a connected wallet */}
      {/* <Products submitTarget='/checkout' enabled={publicKey !== null} /> */}
    </div>
  );
}

HomePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
