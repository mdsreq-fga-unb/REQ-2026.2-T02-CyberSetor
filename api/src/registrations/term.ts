import { createHash } from 'node:crypto';

/**
 * Versão do termo de compromisso: resumo do texto. O formulário devolve a versão que mostrou,
 * e a API recusa o aceite de um texto que mudou depois que a página abriu.
 */
export function termVersion(texto: string): string {
  return createHash('sha256').update(texto).digest('hex').slice(0, 16);
}
