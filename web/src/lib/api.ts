export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

export interface ApiErrorBody {
  code: string;
  message: string;
  correlationId: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
  withSessionCookie?: boolean;
}

export interface ApiDownload {
  blob: Blob;
  fileName: string | null;
}

function parseError(response: Response, error: ApiErrorBody | null): ApiError {
  return new ApiError(
    response.status,
    error?.code ?? 'HTTP_ERROR',
    error?.message ?? 'Falha na comunicação com a API.',
    error?.details,
  );
}

export function fileNameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;
  const quoted = /filename="([^"]+)"/i.exec(disposition);
  if (quoted?.[1]) return quoted[1];
  const plain = /filename=([^;\s]+)/i.exec(disposition);
  return plain?.[1] ?? null;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const form = options.body instanceof FormData;
  if (options.body !== undefined && !form) headers['Content-Type'] = 'application/json';
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
  if (options.withSessionCookie) headers['X-CSRF'] = '1';

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: form
      ? (options.body as FormData)
      : options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
    credentials: options.withSessionCookie ? 'include' : 'omit',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw parseError(response, error);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Baixa um arquivo binário ou texto (como CSV) e lê o nome no `Content-Disposition`. */
export async function apiDownload(
  path: string,
  options: Pick<ApiRequestOptions, 'accessToken'> = {},
): Promise<ApiDownload> {
  const headers: Record<string, string> = {};
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers,
    credentials: 'omit',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw parseError(response, error);
  }

  return {
    blob: await response.blob(),
    fileName: fileNameFromDisposition(response.headers.get('Content-Disposition')),
  };
}

export interface HealthResponse {
  status: 'ok';
  banco: 'ok';
  uptimeSeconds: number;
  timestamp: string;
}

export function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}
