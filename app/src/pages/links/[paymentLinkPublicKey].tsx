import {
  createQR,
  encodeURL,
  findReference,
  FindReferenceError,
  TransactionRequestURLFields,
  validateTransfer,
  ValidateTransferError,
} from '@solana/pay';

import { useRouter } from 'next/router';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Loader } from '../../components/Loader';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { usdcAddress } from '../../shared';
import Layout from '../../components/Layout';
import { useMeta } from '../../lib/MetaProvider';
import { formatCurrency, fromMinUnitToValue } from '../../lib/formaters';
import { usePaymentLinkByPubKeyQuery } from '../../services/hooks';
import isEqual from 'lodash.isequal';
import { Currency } from '../../constants/enums';

export const useMediaQuery = (width: number) => {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback((e: any) => {
    if (e.matches) setTargetReached(true);
    else setTargetReached(false);
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${width}px)`);
    media.addEventListener('change', updateTarget);

    // Check on mount (callback is not called until a change occurs)
    if (media.matches) setTargetReached(true);

    return () => media.removeEventListener('change', updateTarget);
  }, []);

  return targetReached;
};

const Link = () => {
  const router = useRouter();
  const matches = useMediaQuery(640);
  const { connection } = useConnection();
  // ref to a div where we'll show the QR code
  const qrRef = useRef<HTMLDivElement>(null);
  const { paymentLinkPublicKey } = router.query;
  const meta = useMeta();

  const { data, status } = usePaymentLinkByPubKeyQuery(
    new PublicKey(paymentLinkPublicKey as string),
  );

  // Show the QR code
  useEffect(() => {
    if (!data || !paymentLinkPublicKey) {
      return;
    }
    // window.location is only available in the browser, so create the URL in here
    const { location } = window;
    const apiUrl = `${location.protocol}//${
      location.host
    }/api/makeTransaction?reference=${data.reference.toString()}&amount=${data.amount.toString()}&currency=${formatCurrency(
      data.currency,
    )}&recipient=${data.authority.toString()}`;
    const urlParams: TransactionRequestURLFields = {
      link: new URL(apiUrl),
      label: 'cryptopayly',
      message: 'Thanks for your business!',
    };
    const solanaUrl = encodeURL(urlParams);
    const qr = createQR(solanaUrl, matches ? 250 : 512, 'transparent');
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qr.append(qrRef.current);
    }
  }, [paymentLinkPublicKey, data, matches]);

  // Check every 0.5s if the transaction is completed
  useEffect(() => {
    if (!data || !paymentLinkPublicKey) {
      return;
    }
    const interval = setInterval(async () => {
      try {
        const reference = data.reference;
        // Check if there is any transaction for the reference
        const signatureInfo = await findReference(connection, reference, {
          finality: 'confirmed',
        });
        // Validate that the transaction has the expected recipient, amount and SPL token
        await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient: data.authority,
            amount: fromMinUnitToValue(data.amount, data.currency, {
              usdcMint: meta.usdcMint,
            }),
            splToken: isEqual(data.currency, Currency.usdc)
              ? usdcAddress
              : undefined,
            reference,
          },
          { commitment: 'confirmed' },
        );
        router.push('/links/confirmed');
      } catch (e) {
        console.log('errr', e);
        if (e instanceof FindReferenceError) {
          // No transaction found yet, ignore this error
          return;
        }
        if (e instanceof ValidateTransferError) {
          // Transaction is invalid
          return;
        }
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [data, paymentLinkPublicKey]);

  async function handleCopy() {
    if (!data) {
      return;
    }
    await navigator.clipboard.writeText(data.authority.toString());

    toast.success('Public key is copied');
  }

  if (status !== 'success') {
    return <Loader></Loader>;
  }
  return (
    <div className="w-full sm:w-auto">
      <div className="px-4">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Payment Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Payment details
          </p>
        </div>
        <div className="mt-5 border-t border-gray-200">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Recipient</dt>
              <dd
                onClick={handleCopy}
                className="mt-1 cursor-pointer text-sm text-gray-900 sm:col-span-2 sm:mt-0"
              >
                {data.authority.toString().slice(0, 20).concat('...')}
                <ClipboardIcon className="ml-1 inline h-6 w-6"></ClipboardIcon>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {fromMinUnitToValue(data.amount, data.currency, {
                  usdcMint: meta.usdcMint,
                }).toString()}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Currency</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {formatCurrency(data.currency)}
              </dd>
            </div>
            {/* <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">
                Salary expectation
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                $120,000
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">About</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim
                incididunt cillum culpa consequat. Excepteur qui ipsum aliquip
                consequat sint. Sit id mollit nulla mollit nostrud in ea officia
                proident. Irure nostrud pariatur mollit ad adipisicing
                reprehenderit deserunt qui eu.
              </dd>
            </div> */}
            {/* <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Attachments</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <ul
                  role="list"
                  className="divide-y divide-gray-200 rounded-md border border-gray-200"
                >
                  <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                    <div className="flex w-0 flex-1 items-center">
                      <span className="ml-2 w-0 flex-1 truncate">
                        resume_back_end_developer.pdf
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a
                        href="#"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Download
                      </a>
                    </div>
                  </li>
                  <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                    <div className="flex w-0 flex-1 items-center">
                      <span className="ml-2 w-0 flex-1 truncate">
                        coverletter_back_end_developer.pdf
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a
                        href="#"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Download
                      </a>
                    </div>
                  </li>
                </ul>
              </dd>
            </div> */}
          </dl>
        </div>
      </div>

      <div className="flex justify-center" ref={qrRef}></div>
    </div>
  );
};

export default Link;

Link.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
