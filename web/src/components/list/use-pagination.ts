'use client';

import { useMemo, useState } from 'react';
import { PAGE_SIZE_OPTIONS, pageWindow, type PageWindow } from './pagination';

export interface Pagination<T> extends PageWindow {
  pageSize: number;
  total: number;
  pageRows: T[];
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export function usePagination<T>(
  rows: readonly T[] | undefined,
  { initialPageSize = PAGE_SIZE_OPTIONS[0] }: { initialPageSize?: number } = {},
): Pagination<T> {
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const total = rows?.length ?? 0;
  const window = pageWindow(total, requestedPage, pageSize);
  if (rows && requestedPage !== window.page) setRequestedPage(window.page);

  const pageRows = useMemo(
    () => (rows ? rows.slice((window.page - 1) * pageSize, window.page * pageSize) : []),
    [rows, window.page, pageSize],
  );

  return {
    ...window,
    pageSize,
    total,
    pageRows,
    setPage: (next) => setRequestedPage(Math.min(Math.max(1, next), window.pageCount)),
    setPageSize: (next) => {
      setPageSizeState(next);
      setRequestedPage(1);
    },
  };
}
