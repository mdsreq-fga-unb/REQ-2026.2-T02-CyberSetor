import type { ReactNode } from 'react';

export default function PublicGroupLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center gap-6 bg-muted px-4 py-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <p className="self-center text-lg font-semibold">Instituto No Setor</p>
        {children}
      </div>
    </main>
  );
}
