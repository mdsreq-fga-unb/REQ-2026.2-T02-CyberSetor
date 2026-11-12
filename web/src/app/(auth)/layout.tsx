import type { ReactNode } from 'react';
import { LogoMark } from '@/components/brand/logo-mark';

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <p className="flex items-center gap-3 self-center text-lg font-semibold">
          <LogoMark className="size-10 rounded-lg" />
          CyberSetor
        </p>
        {children}
      </div>
    </main>
  );
}
