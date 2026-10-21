import type { Metadata } from 'next';
import { GuestGuard } from '@/auth/guards/guest-guard';
import { SignInView } from '@/auth/views/sign-in-view';

export const metadata: Metadata = { title: 'Entrar | CyberSetor' };

export default function SignInPage() {
  return (
    <GuestGuard>
      <SignInView />
    </GuestGuard>
  );
}
