import axios from 'axios';

import { Tag, TagSignsResponse } from 'models/dictionary';

/* =============================================================================
 * Dicionário – fonte de dados (DTH / repositorio-dth.vlibras.lavid.ufpb.br)
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
  apiBaseUrl: 'https://repositorio-dth.vlibras.lavid.ufpb.br',
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
 * Regex usada para identificar verbos com sinais direcionais
 * (ex.: 1S_AJUDAR_2S → base "AJUDAR"). Mantida idêntica à do
 * `Dictionary/index.tsx`, que faz o agrupamento.
 */
const VERB_DIRECTIONAL_REGEX = new RegExp(
  '^(1S_|2S_|3S_|1P_|2P_|3P_)?'
  + '([A-ZÇÕÂÊÍÓÚ]+(?:_(?![123][SP])[A-ZÇÕÂÊÍÓÚ]+)*)'
  + '(_1S|_2S|_3S|_1P|_2P|_3P)?$'
);

/**
 * Recupera, para a categoria VERBOS, a forma base de cada verbo
 * (ex.: AJUDAR para 1S_AJUDAR_2S). A nova rota `/api/tagsigns?tag=VERBOS`
 * só devolve as conjugações direcionais — sem isso, o cabeçalho do verbo
 * fica sem o sinal-base para ser tocado.
 */
async function enrichVerbsWithBaseForms(signs: string[]): Promise<string[]> {
  const directionalBases = new Set<string>();
  for (const sign of signs) {
    const match = sign.match(VERB_DIRECTIONAL_REGEX);
    if (match && (match[1] || match[3]) && match[2]) {
      directionalBases.add(match[2]);
    }
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
