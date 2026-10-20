'use client';

import { EllipsisVerticalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Account } from '@/types/contas';

export function AccountActionsMenu({
  account,
  onChangeProfile,
  onResetPassword,
  onDeactivate,
  onReactivate,
}: {
  account: Account;
  onChangeProfile: () => void;
  onResetPassword: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={`Ações de ${account.nome}`} />}
      >
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {account.ativo ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onChangeProfile}>Mudar perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={onResetPassword}>Redefinir senha</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDeactivate}>
              Desativar conta
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={onReactivate}>Reativar conta</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
