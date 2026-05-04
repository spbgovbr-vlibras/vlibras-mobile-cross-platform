/**
 * Remoção de acentos está desativada: enviar ou derivar texto sempre sem acento
 * fazia a API VLibras devolver gloss tipo DICIONARIO (datilologia) em vez de DICIONÁRIO.
 * Mantemos a assinatura para não quebrar imports antigos.
 */
export function removeAccents(str: string): string {
  return str;
}
