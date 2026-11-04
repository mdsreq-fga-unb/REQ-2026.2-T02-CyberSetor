import type { Metadata } from 'next';
import { AccountsView } from '@/sections/contas/views/accounts-view';

export const metadata: Metadata = { title: 'Contas | CyberSetor' };

export default function AccountsPage() {
  return <AccountsView />;
}
