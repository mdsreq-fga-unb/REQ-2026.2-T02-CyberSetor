'use client';

import { KeyRoundIcon, LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/auth/hooks/use-session';
import { profileLabel } from '@/auth/profiles';
import { signOut } from '@/auth/session';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser } from '@/queries/sessao';
import { paths } from '@/routes/paths';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

/** Conta na barra superior: quem está na sessão, troca de senha e saída. */
export function AccountMenu() {
  const router = useRouter();
  const { session } = useSession();
  const user = useCurrentUser();
  if (!session) return null;

  const profile = profileLabel(session.perfil);
  const name = user.data?.nome ?? null;
  const sector = user.data?.setor?.nome ?? null;

  return (
    <DropdownMenu>
      {/* O nome acessível vem do texto do botão e começa pelo que está escrito nele (WCAG 2.5.3,
          RNF15): no celular o nome fica só para o leitor de tela, no lugar de sumir. */}
      <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          {initials(name ?? profile)}
        </span>
        <span className="sr-only text-sm font-medium md:not-sr-only md:max-w-48 md:truncate">
          {name ?? profile}
        </span>
        <span className="sr-only">{name ? `, conta: ${profile}` : ', conta'}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          {name && <span className="truncate text-sm font-medium">{name}</span>}
          <span className="truncate text-xs text-muted-foreground">{profile}</span>
          {sector && (
            <span className="truncate text-xs text-muted-foreground">Setor: {sector}</span>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(paths.auth.changePassword)}>
            <KeyRoundIcon />
            Trocar senha
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              signOut().catch(() => null);
            }}
          >
            <LogOutIcon />
            Sair
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
