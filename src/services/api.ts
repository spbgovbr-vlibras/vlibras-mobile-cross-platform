import axios from 'axios';

import CategoriesList from 'data/Categories';
import classifiedWordsJson from 'data/classified_words_reduced.json';
import { Tag, TagSignsResponse } from 'models/dictionary';

/* =============================================================================
 * Dicionário – fonte de dados
 * -----------------------------------------------------------------------------
 * Quando o backend antigo do dicionário (repositorio-dth.vlibras.lavid.ufpb.br)
 * voltar a funcionar – ou quando a nova rota for criada no servidor – basta
 * trocar as duas funções abaixo (`getTags` e `getSignsByTag`) por chamadas
 * HTTP. As três fontes que estamos usando hoje são:
 *
 *  1. Lista completa de sinais (A-Z):
 *     GET https://dicionario2.vlibras.gov.br/bundles?region=BR
 *     -> retorna `string[]` com TODOS os sinais disponíveis.
 *
 *  2. Categorias do dicionário:
 *     `src/data/Categories.ts` – lista local com nome + ícone.
 *
 *  3. Mapeamento palavra → categoria (incluindo Verbos):
 *     `src/data/classified_words_reduced.json` – arquivo local.
 *
 * Ou seja, a categorização (Animais, Verbos, Comidas, etc.) e o filtro A-Z
 * são todos resolvidos client-side com as duas fontes locais + o endpoint
 * /bundles. O endpoint /static/TREES/2018.3.1.json também está aqui pronto
 * para ser usado, basta trocar `useTreesEndpoint` para `true` em DICT_CONFIG.
 * =========================================================================== */

export const DICT_CONFIG = {
  /** Base URL do dicionário público da VLibras. */
  apiBaseUrl: 'https://dicionario2.vlibras.gov.br',
  /** Endpoint que devolve a lista de bundles (todos os sinais). */
  bundlesPath: '/bundles',
  /** Endpoint alternativo (árvore por release). Não usado por padrão. */
  treesPath: '/static/TREES/2018.3.1.json',
  /** Quando `true`, prefere o endpoint TREES; caso contrário, usa /bundles. */
  useTreesEndpoint: false,
  /** Região aceita pelo /bundles. */
  region: 'BR',
};

const dicionarioApi = axios.create({
  baseURL: DICT_CONFIG.apiBaseUrl,
  timeout: 30000,
});

interface ClassifiedWord {
  palavra: string;
  categorias: string[];
}

const classifiedWords = classifiedWordsJson as ClassifiedWord[];

let cachedAllSigns: string[] | null = null;

async function getAllSignsFromBundles(): Promise<string[]> {
  if (cachedAllSigns) return cachedAllSigns;
  if (DICT_CONFIG.useTreesEndpoint) {
    const response = await dicionarioApi.get(DICT_CONFIG.treesPath);
    /* The TREES JSON is a giant tree; we just flatten it to a list of leaves. */
    const collected: string[] = [];
    const walk = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (typeof node.gloss === 'string') collected.push(node.gloss);
      Object.values(node).forEach(walk);
    };
    walk(response.data);
    cachedAllSigns = Array.from(new Set(collected));
    return cachedAllSigns;
  }
  const response = await dicionarioApi.get<string[]>(DICT_CONFIG.bundlesPath, {
    params: { region: DICT_CONFIG.region },
  });
  cachedAllSigns = Array.isArray(response.data) ? response.data : [];
  return cachedAllSigns;
}

export async function getTags(): Promise<Tag[]> {
  return CategoriesList.map((category, index) => ({
    id: index,
    active: true,
    name: category.name,
    description: null,
    url: null,
  }));
}

/* Mesma regex usada em `pages/Dictionary/index.tsx` para detectar
 * verbos com prefixo/sufixo direcional (ex.: 1S_AJUDAR_2S). */
const VERB_REGEX = new RegExp(
  '^(1S_|2S_|3S_|1P_|2P_|3P_)?'
  + '([A-ZÇÕÂÊÍÓÚ]+(?:_(?![123][SP])[A-ZÇÕÂÊÍÓÚ]+)*)'
  + '(_1S|_2S|_3S|_1P|_2P|_3P)?$'
);

/**
 * Devolve o conjunto de sinais que devem aparecer na categoria "Verbos".
 *
 * Por que não usamos só o `classified_words_reduced.json`?
 *  – O JSON local não traz a forma base do verbo (ex.: contém
 *    `1S_AJUDAR_2S` mas não contém `AJUDAR`). Sem a forma base, a UI
 *    exibe a conjugação como se fosse o verbo, e a tradução fica
 *    "estranha".
 *
 * Solução: cruzar o JSON local com a lista oficial de bundles.
 *  1. Pega tudo que o JSON classifica como Verbos.
 *  2. Adiciona, da lista de /bundles, todos os sinais com
 *     prefixo/sufixo direcional (1S_X_2S, etc.) e a forma base do
 *     verbo correspondente, garantindo as setinhas (EU → VOCÊ, …).
 *  3. Inclui também desambiguações (X&VERBO) cuja base é um verbo.
 */
async function getVerbSigns(): Promise<string[]> {
  const allSigns = await getAllSignsFromBundles();

  const localVerbs = classifiedWords
    .filter((item) => item.categorias.some((c) => c.toLowerCase() === 'verbos'))
    .map((item) => item.palavra);

  const baseVerbs = new Set<string>();
  const directionalSigns = new Set<string>();

  for (const sign of allSigns) {
    const match = sign.match(VERB_REGEX);
    if (match && (match[1] || match[3])) {
      directionalSigns.add(sign);
      baseVerbs.add(match[2]);
    }
  }

  const result = new Set<string>(localVerbs);

  directionalSigns.forEach((sign) => result.add(sign));

  for (const sign of allSigns) {
    if (baseVerbs.has(sign)) {
      result.add(sign);
      continue;
    }
    if (sign.includes('&')) {
      const after = sign.split('&').pop();
      if (after && baseVerbs.has(after)) {
        result.add(sign);
      }
    }
  }

  return Array.from(result).sort();
}

export async function getSignsByTag(tag: string): Promise<TagSignsResponse> {
  if (!tag) {
    const signs = await getAllSignsFromBundles();
    return { tags: '', signs };
  }

  const lowered = tag.toLowerCase();

  if (lowered === 'verbos') {
    const signs = await getVerbSigns();
    return { tags: tag, signs };
  }

  const signs = classifiedWords
    .filter((item) => item.categorias.some((c) => c.toLowerCase() === lowered))
    .map((item) => item.palavra);

  return { tags: tag, signs };
}

export default dicionarioApi;
