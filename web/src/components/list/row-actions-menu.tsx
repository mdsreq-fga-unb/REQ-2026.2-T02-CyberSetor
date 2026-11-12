'use client';

import { EllipsisVerticalIcon } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface RowAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function RowActionsMenu({ label, actions }: { label: string; actions: RowAction[] }) {
  const regular = actions.filter((action) => !action.destructive);
  const destructive = actions.filter((action) => action.destructive);
  const item = (action: RowAction) => (
    <DropdownMenuItem
      key={action.label}
      variant={action.destructive ? 'destructive' : 'default'}
      disabled={action.disabled}
      onClick={action.onSelect}
    >
      {action.label}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={label} />}>
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {regular.length > 0 && <DropdownMenuGroup>{regular.map(item)}</DropdownMenuGroup>}
        {regular.length > 0 && destructive.length > 0 && <DropdownMenuSeparator />}
        {destructive.length > 0 && <Fragment>{destructive.map(item)}</Fragment>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
