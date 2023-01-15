import { useRouter } from 'next/router';
import { myLinks } from '../../../routes';
import { LayoutWithNavBar } from '../../../components/LayoutWithNavBar';
import { ReactElement } from 'react';
import {
  usePaymentLinkCreateMutation,
  useUserProfileAccountQuery,
} from '../../../services/hooks';
import { Loader } from '../../../components/Loader';

export default function MyLinksNewPage() {
  const router = useRouter();
  const { data, status } = useUserProfileAccountQuery();
  const createPaymentLinkMutation = usePaymentLinkCreateMutation({
    onSuccess: () => {
      router.push(myLinks);
    },
  });

  async function handleOnSubmit(event: any) {
    event.preventDefault();
    const amount = event.target[0].value as string;
    const currency = event.target[1].value as string;

    if (data?.lastPaymentLink == null) {
      return;
    }
    createPaymentLinkMutation.mutate({
      amount,
      currency,
      lastPaymentLink: data?.lastPaymentLink,
    });
  }

  if (status !== 'success') {
    return <Loader></Loader>;
  }

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-50">
        <body class="h-full">
        ```
      */}
      <div className=" flex min-h-full w-6/12 flex-col content-center justify-center sm:px-6 lg:px-8">
        <div className=" content-center sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleOnSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount
                </label>
                <div className="mt-1">
                  <input
                    id="amount"
                    name="amount"
                    type="amount"
                    autoComplete="amount"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700"
                >
                  Currency (SOL or USDC)
                </label>
                <div className="mt-1">
                  <input
                    id="currency"
                    name="currency"
                    type="currency"
                    required
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

MyLinksNewPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutWithNavBar>{page}</LayoutWithNavBar>;
};
