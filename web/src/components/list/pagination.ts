export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export interface PageWindow {
  page: number;
  pageCount: number;
  start: number;
  end: number;
}

export function pageWindow(total: number, page: number, pageSize: number): PageWindow {
  const size = Math.max(1, Math.floor(pageSize));
  const pageCount = Math.max(1, Math.ceil(Math.max(0, total) / size));
  const current = Math.min(Math.max(1, Math.floor(page)), pageCount);
  const start = total === 0 ? 0 : (current - 1) * size + 1;
  const end = Math.min(current * size, Math.max(0, total));
  return { page: current, pageCount, start, end };
}

export function rangeLabel({ start, end }: PageWindow, total: number): string {
  if (total === 0) return 'Nenhum registro';
  return `${start}–${end} de ${total}`;
}
