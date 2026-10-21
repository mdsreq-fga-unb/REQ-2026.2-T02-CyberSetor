import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

export function TableSkeleton({ rows = 3, columns }: { rows?: number; columns: number }) {
  return Array.from({ length: rows }, (_, row) => (
    <TableRow key={row} aria-hidden="true">
      {Array.from({ length: columns }, (__, column) => (
        <TableCell key={column} className="px-4 py-4">
          <Skeleton className="h-4 w-full max-w-48" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function ListEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

export function ListError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-destructive/40 p-4 text-destructive">
      {message}
    </p>
  );
}

export function ListCard({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-lg border">{children}</div>;
}
