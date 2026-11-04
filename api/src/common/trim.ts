import type { TransformFnParams } from 'class-transformer';

export function trimString({ value }: TransformFnParams): unknown {
  const raw: unknown = value;
  return typeof raw === 'string' ? raw.trim() : raw;
}
