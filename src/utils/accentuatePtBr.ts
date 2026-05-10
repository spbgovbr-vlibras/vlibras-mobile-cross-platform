/**
 * VLibras /translate returns ASCII-ish gloss tokens (e.g. DICIONARIO) when the
 * source word is written without accents; Unity then fingerspells. When the same
 * word is accented (dicionário), the gloss is lexical (DICIONÁRIO). We approximate
 * browser-widget behaviour by accentuating PT-BR words before calling the API.
 */
const LEXICON: Record<string, string> = {
  // Exceções / palavras em que só o dicionário resolve bem
  acai: 'açaí',
  historia: 'história',
  musica: 'música',
  amanha: 'amanhã',
  coracao: 'coração',
  razao: 'razão',
  sao: 'são',
  nao: 'não',
  tambem: 'também',
  ate: 'até',
  voce: 'você',
  estara: 'estará',
  pais: 'país',
  acrescimo: 'acréscimo',
  decrescimo: 'decréscimo',
};

/** Regras de sufixo, do mais específico ao mais abrangente (todas em minúsculas). */
const SUFFIX_REPLACEMENTS: Array<[RegExp, string]> = [
  [/ucao$/i, 'ução'],
  [/acao$/i, 'ação'],
  [/encia$/i, 'ência'],
  [/ugues$/i, 'uguês'],
  [/escimo$/i, 'éscimo'],
  [/oria$/i, 'ória'],
  [/matica$/i, 'mática'],
  [/atico$/i, 'ático'],
  [/ario$/i, 'ário'],
  [/gues$/i, 'guês'],
  [/usica$/i, 'úsica'],
];

const PT_DIACRITIC = /[àáâãäåèéêëìíîïòóôõöùúûüçñ]/i;

function matchCase(template: string, v: string): string {
  if (!template.length) return v;
  if (template === template.toUpperCase() && template !== template.toLowerCase()) {
    return v.toLocaleUpperCase('pt-BR');
  }
  if (template[0] === template[0].toUpperCase() && template[1] !== undefined) {
    return v.charAt(0).toLocaleUpperCase('pt-BR') + v.slice(1);
  }
  return v;
}

function accentWord(word: string): string {
  if (word.length < 3) return word;
  // NFC para reconhecer acentos mesmo quando vierem como base + combining (ex.: e + ́ )
  const nfc = word.normalize('NFC');

  const lower = nfc.toLowerCase();
  // Também tenta por chave sem diacríticos para corrigir casos parcialmente
  // acentuados, ex.: "açai" -> "açaí".
  const canonical = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const fromLex = LEXICON[lower] || LEXICON[canonical];
  if (fromLex) return matchCase(word, fromLex);

  // Sem acentuar automaticamente palavras que já possuem diacríticos e não
  // estão no léxico de exceções.
  if (PT_DIACRITIC.test(nfc)) return word;

  if (lower.length < 5) return word;

  let candidate = lower;
  for (const [rx, rep] of SUFFIX_REPLACEMENTS) {
    if (rx.test(candidate)) {
      candidate = candidate.replace(rx, rep);
      break;
    }
  }

  return matchCase(word, candidate);
}

/**
 * Aplica correção leve de acentuação em cada token alfabético (preserva números e pontuação).
 */
export function accentuatePortugueseText(text: string): string {
  if (!text || !text.trim()) return text;
  // Evita \p{Letter}: target do projeto é ES5; intervalo cobre PT-BR usual no app.
  return text.replace(/[A-Za-zÀ-ÿ]+/g, (w) => accentWord(w));
}
