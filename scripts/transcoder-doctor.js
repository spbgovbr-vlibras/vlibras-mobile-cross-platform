#!/usr/bin/env node
/**
 * Diagnóstico ponta a ponta do transcodificador usado no compartilhamento.
 *
 * Reproduz exatamente o que o app faz (src/services/shareVideo.ts):
 *   1. POST  {base}/conversion/   multipart, campo "videoConversion"
 *   2. GET   {base}/conversion/{id}  em loop até o corpo ser um MP4 (magic `ftyp`)
 *
 * Além do caminho "oficial", testa variações de rota (com/sem barra final,
 * outros nomes de campo) para detectar quando a API muda de contrato — que é a
 * causa recorrente do share "parar de funcionar sem motivo aparente".
 *
 * Uso:
 *   node scripts/transcoder-doctor.js
 *   node scripts/transcoder-doctor.js --file .tmp-transcoder-test/sample.webm
 *   node scripts/transcoder-doctor.js --base https://transcodificador.vlibras.gov.br/api/v1
 *   node scripts/transcoder-doctor.js --probe-only   (só checa rotas, não converte)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const DEFAULT_BASE = 'https://transcodificador.vlibras.gov.br/api/v1';
/**
 * O gateway devolve 403 para requisições sem User-Agent. O WebView do app sempre
 * manda um, mas o Node não manda nenhum por padrão — sem isso o diagnóstico
 * acusa uma falha que não existe no app.
 */
const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36';
/** Origin que o WebView do Capacitor usa no Android. */
const ORIGIN = 'https://localhost';
const DEFAULT_FILE = '.tmp-transcoder-test/sample.webm';
const OUT_DIR = '.tmp-transcoder-test';
const POLL_INTERVAL_MS = 1000;
const POLL_MAX_ATTEMPTS = 60; // igual ao `contador = 60` do Player
const REQUEST_TIMEOUT_MS = 120000;

const args = process.argv.slice(2);
function argValue(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const BASE = argValue('--base', DEFAULT_BASE).replace(/\/+$/, '');
const FILE = argValue('--file', DEFAULT_FILE);
const PROBE_ONLY = args.includes('--probe-only');

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};
const ok = (m) => console.log(`${c.green}  OK${c.reset}  ${m}`);
const bad = (m) => console.log(`${c.red}  ERRO${c.reset}  ${m}`);
const warn = (m) => console.log(`${c.yellow}  AVISO${c.reset}  ${m}`);
const info = (m) => console.log(`${c.dim}  ...${c.reset}  ${m}`);
function section(title) {
  console.log(`\n${c.bold}${c.blue}${title}${c.reset}`);
  console.log(`${c.dim}${'-'.repeat(title.length)}${c.reset}`);
}

/** Requisição HTTP(S) crua; devolve status, headers e corpo em Buffer. */
function request(urlString, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const client = url.protocol === 'https:' ? https : http;
    const started = Date.now();

    const req = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          Origin: ORIGIN,
          ...(options.headers || {}),
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
            elapsedMs: Date.now() - started,
          })
        );
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`timeout após ${REQUEST_TIMEOUT_MS}ms`));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/** Corpo multipart/form-data com um único arquivo. */
function buildMultipart(fieldName, filename, contentType, fileBuffer) {
  const boundary = `----VLibrasDoctor${crypto.randomBytes(12).toString('hex')}`;
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return { boundary, body: Buffer.concat([head, fileBuffer, tail]) };
}

/** MP4 válido: bytes 4..7 são "ftyp" (mesma checagem de isConvertedMp4). */
function isMp4(buffer) {
  return (
    buffer.length >= 12 &&
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  );
}

function preview(buffer, limit = 220) {
  const text = buffer.slice(0, limit).toString('utf8').replace(/\s+/g, ' ').trim();
  // Se não for texto legível, mostra os primeiros bytes em hex.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0e-\x1f]/.test(text)) {
    return `<binário> ${buffer.slice(0, 16).toString('hex')}`;
  }
  return text || '<vazio>';
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Lê o campo `status` do JSON de andamento; null se o corpo não for esse JSON. */
function parseStatusJson(buffer) {
  if (buffer.length === 0 || buffer[0] !== 0x7b) return null; // não começa com '{'
  try {
    const parsed = JSON.parse(buffer.toString('utf8'));
    return typeof parsed.status === 'string' ? parsed.status : null;
  } catch (_) {
    return null;
  }
}

/** POST do vídeo numa rota/campo específicos. */
async function postConversion(routePath, fieldName, fileBuffer, filename, contentType) {
  const { boundary, body } = buildMultipart(fieldName, filename, contentType, fileBuffer);
  const url = `${BASE}${routePath}`;
  const res = await request(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        Accept: 'application/json',
      },
    },
    body
  );
  return { url, res };
}

/** Extrai o id da resposta do POST, aceitando JSON {id} ou texto puro. */
function parseConversionId(buffer) {
  const text = buffer.toString('utf8').trim();
  if (!text) return null;
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.id === 'string' && parsed.id) return parsed.id;
    } catch (_) {
      return null;
    }
    return null;
  }
  return text;
}

async function main() {
  console.log(`${c.bold}${c.cyan}VLibras — Diagnóstico do transcodificador${c.reset}`);
  console.log(`${c.dim}base: ${BASE}${c.reset}`);

  // ---------------------------------------------------------------- arquivo
  section('1. Arquivo de entrada');
  const filePath = path.resolve(FILE);
  if (!fs.existsSync(filePath)) {
    bad(`arquivo não encontrado: ${filePath}`);
    console.log(
      `\n  Gere um webm de teste no navegador (DevTools na Home, durante uma tradução):\n` +
        `${c.dim}    const c = document.querySelector('canvas');\n` +
        `    const r = new MediaRecorder(c.captureStream(30), { mimeType: 'video/webm;codecs=vp8' });\n` +
        `    const parts = []; r.ondataavailable = e => parts.push(e.data);\n` +
        `    r.onstop = () => { const a = document.createElement('a');\n` +
        `      a.href = URL.createObjectURL(new Blob(parts, {type:'video/webm'}));\n` +
        `      a.download = 'sample.webm'; a.click(); };\n` +
        `    r.start(250); setTimeout(() => r.stop(), 5000);${c.reset}\n`
    );
    process.exit(1);
  }
  const fileBuffer = fs.readFileSync(filePath);
  const isWebm = path.extname(filePath).toLowerCase() === '.webm';
  const uploadName = isWebm ? 'video.webm' : 'video.mp4';
  const uploadType = isWebm ? 'video/webm' : 'video/mp4';
  ok(`${path.relative(process.cwd(), filePath)} — ${fmtBytes(fileBuffer.length)} (${uploadType})`);

  // -------------------------------------------------------- rotas candidatas
  section('2. Sondagem de rotas (POST)');
  info('descobrindo qual formato de rota a API aceita hoje');

  const routeCandidates = [
    { path: '/conversion/', label: 'com barra final  (usada pelo app)' },
    { path: '/conversion', label: 'sem barra final' },
  ];

  // Sonda leve: POST vazio só para ler o status da rota (403/404 vs 400/422).
  for (const candidate of routeCandidates) {
    try {
      const res = await request(
        `${BASE}${candidate.path}`,
        {
          method: 'POST',
          headers: { 'Content-Length': 0, Accept: 'application/json' },
        },
        null
      );
      const line = `POST ${candidate.path.padEnd(13)} → ${res.status}  ${candidate.label}`;
      if (res.status === 403 || res.status === 404) {
        bad(`${line}\n        ${c.dim}${preview(res.body, 120)}${c.reset}`);
      } else if (res.status >= 300 && res.status < 400) {
        warn(`${line}  (redirect → ${res.headers.location || '?'})`);
      } else {
        ok(`${line}  ${c.dim}(rota existe; rejeitou o corpo vazio, esperado)${c.reset}`);
      }
    } catch (err) {
      bad(`POST ${candidate.path} → falha de rede: ${err.message}`);
    }
  }

  if (PROBE_ONLY) {
    console.log(`\n${c.dim}--probe-only: parando antes do upload real.${c.reset}\n`);
    return;
  }

  // -------------------------------------------------------------- upload real
  section('3. Upload real (POST /conversion/)');
  const fieldCandidates = ['videoConversion', 'video', 'file'];
  let conversionId = null;
  let usedField = null;
  let usedRoute = null;

  for (const route of routeCandidates) {
    for (const field of fieldCandidates) {
      let result;
      try {
        result = await postConversion(route.path, field, fileBuffer, uploadName, uploadType);
      } catch (err) {
        bad(`POST ${route.path} campo "${field}" → rede: ${err.message}`);
        continue;
      }
      const { res } = result;
      const label = `POST ${route.path} campo "${field}" → ${res.status} em ${res.elapsedMs}ms`;

      if (res.status >= 200 && res.status < 300) {
        const id = parseConversionId(res.body);
        if (id) {
          ok(`${label}\n        id = ${c.bold}${id}${c.reset}`);
          conversionId = id;
          usedField = field;
          usedRoute = route.path;
          break;
        }
        warn(`${label} — 2xx mas sem id reconhecível: ${preview(res.body)}`);
      } else {
        bad(`${label}\n        ${c.dim}${preview(res.body)}${c.reset}`);
      }
    }
    if (conversionId) break;
  }

  if (!conversionId) {
    bad('nenhuma combinação de rota/campo foi aceita — a API mudou de contrato');
    console.log(
      `\n  Peça à equipe do transcodificador o contrato atual:\n` +
        `    - caminho exato do POST (com ou sem barra final)\n` +
        `    - nome do campo multipart do arquivo\n` +
        `    - formato da resposta (JSON {id} ou texto)\n`
    );
    process.exit(1);
  }

  if (usedField !== 'videoConversion' || usedRoute !== '/conversion/') {
    warn(
      `o app usa rota "/conversion/" e campo "videoConversion"; ` +
        `o que funcionou foi rota "${usedRoute}" e campo "${usedField}" — ` +
        `ajuste src/services/shareVideo.ts`
    );
  }

  // ------------------------------------------------------------------ polling
  section('4. Polling do resultado (GET /conversion/{id})');
  info(`até ${POLL_MAX_ATTEMPTS} tentativas, 1x por segundo (igual ao app)`);

  const pollStarted = Date.now();
  let mp4 = null;
  let lastStatus = null;
  let lastPreview = null;

  for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt += 1) {
    let res;
    try {
      res = await request(`${BASE}/conversion/${conversionId}`, {
        method: 'GET',
        headers: { Accept: '*/*' },
      });
    } catch (err) {
      warn(`tentativa ${attempt}: rede — ${err.message}`);
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    lastStatus = res.status;
    lastPreview = preview(res.body);

    if (res.status >= 200 && res.status < 300 && isMp4(res.body)) {
      const secs = ((Date.now() - pollStarted) / 1000).toFixed(1);
      ok(
        `tentativa ${attempt}: MP4 pronto — ${fmtBytes(res.body.length)} em ${secs}s ` +
          `(content-type: ${res.headers['content-type'] || 'n/d'})`
      );
      mp4 = res.body;
      break;
    }

    // A API sinaliza andamento com JSON: {"status":"PROCESSANDO"}.
    const statusJson = parseStatusJson(res.body);
    if (statusJson && /ERRO|ERROR|FAIL/i.test(statusJson)) {
      bad(`tentativa ${attempt}: conversão falhou no servidor — status "${statusJson}"`);
      process.exit(1);
    }

    // Mostra só as primeiras tentativas e depois a cada 5, para não poluir.
    if (attempt <= 3 || attempt % 5 === 0) {
      info(
        `tentativa ${attempt}: ${res.status} — ${fmtBytes(res.body.length)} — ` +
          `${statusJson ? `status "${statusJson}"` : lastPreview.slice(0, 90)}`
      );
    }

    await sleep(POLL_INTERVAL_MS);
  }

  if (!mp4) {
    bad(`vídeo não ficou pronto em ${POLL_MAX_ATTEMPTS}s`);
    console.log(`        último status: ${lastStatus}`);
    console.log(`        último corpo:  ${lastPreview}`);
    console.log(
      `\n  Se o status for 404/403, o GET provavelmente também mudou de formato\n` +
        `  (ex.: precisa de barra final, ou virou /conversion/{id}/download).\n`
    );
    process.exit(1);
  }

  // ---------------------------------------------------------------- validação
  section('5. Validação do MP4');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `doctor-${Date.now()}.mp4`);
  fs.writeFileSync(outPath, mp4);
  ok(`assinatura ISO "ftyp" presente (mesma checagem de isConvertedMp4)`);
  ok(`salvo em ${path.relative(process.cwd(), outPath)}`);
  info('abra o arquivo para confirmar que o avatar aparece e o vídeo tem duração');

  section('Resumo');
  console.log(`  rota POST ....... ${usedRoute}`);
  console.log(`  campo multipart . ${usedField}`);
  console.log(`  id .............. ${conversionId}`);
  console.log(`  entrada ......... ${fmtBytes(fileBuffer.length)} ${uploadType}`);
  console.log(`  saída ........... ${fmtBytes(mp4.length)} video/mp4`);
  console.log(
    `\n${c.green}${c.bold}  Pipeline do transcodificador está funcional.${c.reset}\n`
  );
}

main().catch((err) => {
  console.error(`\n${c.red}Falha inesperada:${c.reset} ${err.stack || err.message}\n`);
  process.exit(1);
});
