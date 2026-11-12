'use client';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { PAGE_SIZE_OPTIONS, rangeLabel } from './pagination';
import type { Pagination } from './use-pagination';

export function ListPagination({
  pagination,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  label = 'Paginação',
}: {
  pagination: Pick<
    Pagination<unknown>,
    'page' | 'pageCount' | 'pageSize' | 'total' | 'start' | 'end' | 'setPage' | 'setPageSize'
  >;
  pageSizeOptions?: readonly number[];
  label?: string;
}) {
  const sizeId = useId();
  const { page, pageCount, pageSize, total, setPage, setPageSize } = pagination;

  if (total <= Math.min(...pageSizeOptions)) return null;

  const first = page <= 1;
  const last = page >= pageCount;

  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t px-4 py-2"
    >
      <p role="status" className="text-sm text-muted-foreground tabular-nums">
        {rangeLabel(pagination, total)}
      </p>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <label htmlFor={sizeId} className="text-sm whitespace-nowrap">
            Itens por página
          </label>
          <NativeSelect
            id={sizeId}
            className="w-24"
            value={String(pageSize)}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <NativeSelectOption key={option} value={option}>
                {option}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label="Primeira página"
            disabled={first}
            onClick={() => setPage(1)}
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Página anterior"
            disabled={first}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <span className="min-w-20 px-2 text-center text-sm tabular-nums">
            {page} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Próxima página"
            disabled={last}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label="Última página"
            disabled={last}
            onClick={() => setPage(pageCount)}
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </nav>
  );
}
