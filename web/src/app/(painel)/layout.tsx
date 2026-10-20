import type { ReactNode } from 'react';
import { AuthGuard } from '@/auth/guards/auth-guard';
import { AppShell } from '@/components/app-shell';

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
