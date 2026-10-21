import type { ReactNode } from 'react';

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <p className="self-center text-lg font-semibold">CyberSetor</p>
        {children}
      </div>
    </main>
  );
}
