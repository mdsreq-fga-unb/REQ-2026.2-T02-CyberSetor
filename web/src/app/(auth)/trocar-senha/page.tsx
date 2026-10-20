import type { Metadata } from 'next';
import { ChangePasswordView } from '@/auth/views/change-password-view';

export const metadata: Metadata = { title: 'Trocar senha | CyberSetor' };

export default function ChangePasswordPage() {
  return <ChangePasswordView />;
}
