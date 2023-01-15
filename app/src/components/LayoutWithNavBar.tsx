import { PropsWithChildren } from 'react';
import { NavBar } from './NavBar';

export const LayoutWithNavBar = ({ children }: PropsWithChildren<{}>) => {
  return (
    <div className="bg-white flex min-h-screen flex-col">
      <NavBar></NavBar>
      <main className="min-full mb-auto flex grow items-center justify-center">
        {children}
      </main>
    </div>
  );
};
