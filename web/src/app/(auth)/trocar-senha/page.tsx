import type { Metadata } from 'next';
import { AuthGuard } from '@/auth/guards/auth-guard';
import { ChangePasswordView } from '@/auth/views/change-password-view';

export const metadata: Metadata = { title: 'Trocar senha | CyberSetor' };

export default function ChangePasswordPage() {
  return (
    <AuthGuard allowPendingPasswordChange>
      <ChangePasswordView />
    </AuthGuard>
  );
}
