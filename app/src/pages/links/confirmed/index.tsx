import { ReactElement } from 'react';
import Layout from '../../../components/Layout';

export default function Confirmed() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* <h2 className="text-lg font-semibold text-indigo-600">
          
          </h2> */}
          <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Transaction confirmed!
          </p>
          <p className="mx-auto mt-5 max-w-xl text-xl text-gray-500">
            Thank you for your business
          </p>
        </div>
      </div>
    </div>
  );
}

Confirmed.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
