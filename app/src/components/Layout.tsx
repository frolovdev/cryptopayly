import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="bg-white flex min-h-screen flex-col gap-16">
      <main className="mb-auto flex min-h-screen items-center justify-center">
        {children}
      </main>
    </div>
  );
}
