import type { ReactNode } from 'react';
import { AuthGuard } from '@/auth/guards/auth-guard';
import { DashboardLayout } from '@/layouts/dashboard/dashboard-layout';

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
