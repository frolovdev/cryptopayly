import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { usdcAddress } from '../../shared';
import Link from 'next/link';
import { Loader } from '../../components/Loader';
import { useQuery } from '@tanstack/react-query';
import {
  findReference,
  FindReferenceError,
  validateTransfer,
  ValidateTransferError,
} from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import { paymentLinksKey } from '../../constants/queries';
import { myLinksNew } from '../../routes';
import { ReactElement } from 'react';
import { LayoutWithNavBar } from '../../components/LayoutWithNavBar';
import { formatCurrency, fromMinUnitToValue } from '../../lib/formaters';
import { useMeta } from '../../lib/MetaProvider';
import { usePaymentLinkAccountsQuery } from '../../services/hooks';
import isEqual from 'lodash.isequal';
import { Currency } from '../../constants/enums';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function Status({ status }: { status: string }) {
  if (status === 'Waiting') {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
        Waiting
      </span>
    );
  }

  if (status === 'Error') {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
        Error
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
      Payed
    </span>
  );
}

export default function MyLinksPage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const meta = useMeta();

  async function handleCopy(pl: {
    publicKey: PublicKey;
    account: { reference: PublicKey };
  }) {
    const link = `${location.protocol}//${location.host}/links/${pl.publicKey}`;

    await navigator.clipboard.writeText(link);
  }

  const { data: paymentLinks, status } = usePaymentLinkAccountsQuery();

  const { data: paymentLinksWithStatuses, status: paymentStatusesStatus } =
    useQuery({
      queryKey: [paymentLinksKey, paymentLinks?.length],
      queryFn: async () => {
        if (!publicKey || !paymentLinks) {
          throw new Error();
        }
        const paymentLinksPromises = paymentLinks.map(async (pl) => {
          try {
            // Check if there is any transaction for the reference
            const signatureInfo = await findReference(
              connection,
              pl.account.reference,
              { finality: 'confirmed' },
            );

            // Validate that the transaction has the expected recipient, amount and SPL token
            await validateTransfer(
              connection,
              signatureInfo.signature,
              {
                recipient: publicKey,
                amount: fromMinUnitToValue(
                  pl.account.amount,
                  pl.account.currency,
                  {
                    usdcMint: meta.usdcMint,
                  },
                ),
                splToken: isEqual(pl.account.currency, Currency.usdc)
                  ? usdcAddress
                  : undefined,
                reference: pl.account.reference,
              },
              { commitment: 'confirmed' },
            );

            return { ...pl, status: 'Payed' };
          } catch (e) {
            if (e instanceof FindReferenceError) {
              // No transaction found yet, ignore this error
              return { ...pl, status: 'Waiting' };
            }
            if (e instanceof ValidateTransferError) {
              return { ...pl, status: 'Error' };
            }
            return { ...pl, status: 'Error' };
          }
        });

        return await Promise.all(paymentLinksPromises);
      },

      enabled: Boolean(paymentLinks),
    });

  if (status !== 'success' || paymentStatusesStatus !== 'success') {
    return <Loader></Loader>;
  }

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">
              Payment Links
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the payment links in your account including their
              amount, currency and status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link href={myLinksNew}>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Create Payment Link
              </button>
            </Link>
          </div>
        </div>
        {paymentLinksWithStatuses.length !== 0 && (
          <div className="mt-8 flex flex-col">
            <div className="">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="shadow-sm ring-1 ring-black ring-opacity-5">
                  <table
                    className="min-w-full border-separate"
                    style={{ borderSpacing: 0 }}
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        {/* <th
                      scope="col"
                      className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                    >
                      Name
                    </th> */}
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
                        >
                          Currency
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 py-3.5 pr-4 pl-3 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                        >
                          <span className="sr-only">Copy</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {paymentLinksWithStatuses?.map(
                        (paymentLink, personIdx) => (
                          <tr key={personIdx}>
                            {/* <td
                        className={classNames(
                          personIdx !== people.length - 1
                            ? 'border-b border-gray-200'
                            : '',
                          'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8',
                        )}
                      >
                        {person.name}
                      </td> */}
                            <td
                              className={classNames(
                                personIdx !==
                                  paymentLinksWithStatuses.length - 1
                                  ? 'border-b border-gray-200'
                                  : '',
                                'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8',
                              )}
                            >
                              {fromMinUnitToValue(
                                paymentLink.account.amount,
                                paymentLink.account.currency,
                                { usdcMint: meta.usdcMint },
                              ).toString()}
                            </td>
                            <td
                              className={classNames(
                                personIdx !==
                                  paymentLinksWithStatuses.length - 1
                                  ? 'border-b border-gray-200'
                                  : '',
                                'whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell',
                              )}
                            >
                              {formatCurrency(paymentLink.account.currency)}
                            </td>
                            <td
                              className={classNames(
                                personIdx !==
                                  paymentLinksWithStatuses.length - 1
                                  ? 'border-b border-gray-200'
                                  : '',
                                ' whitespace-nowrap px-3 py-4 text-sm text-gray-500',
                              )}
                            >
                              <Status status={paymentLink.status}></Status>
                            </td>
                            <td
                              className={classNames(
                                personIdx !==
                                  paymentLinksWithStatuses.length - 1
                                  ? 'border-b border-gray-200'
                                  : '',
                                'relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-6 lg:pr-8',
                              )}
                            >
                              <button
                                onClick={() => handleCopy(paymentLink)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Copy<span className="sr-only"></span>
                              </button>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

MyLinksPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithNavBar>{page}</LayoutWithNavBar>;
};
