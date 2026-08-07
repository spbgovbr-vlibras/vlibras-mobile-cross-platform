const PRODUCTION_BASE = 'https://transcodificador.vlibras.gov.br/api/v1/';

export const TRANSCODER_ROUTES = {
  base: PRODUCTION_BASE,
  postConversion: `${PRODUCTION_BASE}conversion/`,
  getConversion: (id: string) => `${PRODUCTION_BASE}conversion/${id}`,
} as const;

export class TranscoderHttpError extends Error {
  readonly status: number;

  readonly bodySnippet: string;

  constructor(status: number, bodySnippet: string) {
    super(`HTTP ${status}`);
    this.name = 'TranscoderHttpError';
    this.status = status;
    this.bodySnippet = bodySnippet;
  }
}
