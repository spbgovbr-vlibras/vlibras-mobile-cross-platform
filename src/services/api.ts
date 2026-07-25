import axios from 'axios';

import { Tag, TagSignsResponse } from 'models/dictionary';

/* =============================================================================
 * Dicionário – fonte de dados (produção / repositorio.vlibras.gov.br)
 * -----------------------------------------------------------------------------
 * Endpoints utilizados (todas as listas voltam diretamente do backend):
 *
 *   GET /api/tags
 *     -> Tag[]                     (nome em CAIXA_ALTA com underscores)
 *
 *   GET /api/tagsigns?tag=NOME
 *     -> { tags, signs: string[] } (todos os sinais que pertencem à tag)
 *
 *   GET /api/signs
 *     -> string[]                  (TODOS os sinais — usado para A-Z)
 *
 * Caso a base mude novamente, basta atualizar `apiBaseUrl` em DICT_CONFIG.
 * =========================================================================== */

export const DICT_CONFIG = {
  apiBaseUrl: 'https://repositorio.vlibras.gov.br',
  tagsPath: '/api/tags',
  tagSignsPath: '/api/tagsigns',
  allSignsPath: '/api/signs',
};

const api = axios.create({
  baseURL: DICT_CONFIG.apiBaseUrl,
  timeout: 30000,
});

let cachedAllSigns: string[] | null = null;

async function getAllSigns(): Promise<string[]> {
  if (cachedAllSigns) return cachedAllSigns;
  const response = await api.get<string[]>(DICT_CONFIG.allSignsPath);
  cachedAllSigns = Array.isArray(response.data) ? response.data : [];
  return cachedAllSigns;
}

export async function getTags(): Promise<Tag[]> {
  const response = await api.get<Tag[]>(DICT_CONFIG.tagsPath);
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Faz parsing tolerante para identificar a forma base de um verbo a partir
 * do gloss direcional (ex.: 1S_AJUDAR_2S → "AJUDAR"). Aceita também glosses
 * malformados ("1S_AJUDAR2S" sem `_`, "2S_AJUDAR__2S" com `__`).
 */
function extractVerbBase(gloss: string): string | null {
  if (!gloss || gloss.includes('&')) return null;
  let body = gloss;
  let hadPrefix = false;
  let hadSuffix = false;
  const prefixMatch = body.match(/^(1S|2S|3S|1P|2P|3P)_(.+)$/);
  if (prefixMatch) {
    hadPrefix = true;
    body = prefixMatch[2];
  }
  const suffixMatch = body.match(/^(.+?)_*(1S|2S|3S|1P|2P|3P)$/);
  if (suffixMatch) {
    hadSuffix = true;
    body = suffixMatch[1].replace(/_+$/, '');
  }
  body = body.replace(/^_+|_+$/g, '');
  if (!body) return null;
  if (!hadPrefix && !hadSuffix) return null;
  return body;
}

/**
 * Recupera, para a categoria VERBOS, a forma base de cada verbo
 * (ex.: AJUDAR para 1S_AJUDAR_2S). A nova rota `/api/tagsigns?tag=VERBOS`
 * só devolve as conjugações direcionais — sem isso, o cabeçalho do verbo
 * fica sem o sinal-base para ser tocado.
 */
async function enrichVerbsWithBaseForms(signs: string[]): Promise<string[]> {
  const directionalBases = new Set<string>();
  for (const sign of signs) {
    const base = extractVerbBase(sign);
    if (base) directionalBases.add(base);
  }
  if (!directionalBases.size) return signs;

  let allSigns: string[] = [];
  try {
    allSigns = await getAllSigns();
  } catch (error) {
    return signs;
  }
  const allSignsSet = new Set(allSigns);

  const existing = new Set(signs);
  const enriched = [...signs];
  directionalBases.forEach((base) => {
    if (allSignsSet.has(base) && !existing.has(base)) {
      enriched.push(base);
    }
  });

  return enriched;
}

export async function getSignsByTag(tag: string): Promise<TagSignsResponse> {
  if (!tag) {
    const signs = await getAllSigns();
    return { tags: '', signs };
  }
  const response = await api.get<TagSignsResponse>(DICT_CONFIG.tagSignsPath, {
    params: { tag },
  });
  const data = response.data || ({} as TagSignsResponse);
  let signs = Array.isArray(data.signs) ? data.signs : [];

  const tagName = (typeof data.tags === 'string' ? data.tags : tag) || tag;
  if (tagName.toUpperCase() === 'VERBOS') {
    signs = await enrichVerbsWithBaseForms(signs);
  }

  return {
    tags: tagName,
    signs,
  };
}

export default api;
