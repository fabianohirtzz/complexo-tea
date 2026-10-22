// Publica o site na hospedagem de produção por FTP com TLS.
// Uso: FTP_HOST=... FTP_USER=... FTP_PASS=... [FTP_DIR=public_html] node tools/deploy-ftp.mjs [--files a b c]
// Sem --files, sobe todos os arquivos versionados do site (git ls-files), menos os de projeto.
import { writeFileSync, mkdtempSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const { FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR = '' } = process.env;
if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
  console.error('Faltam FTP_HOST, FTP_USER ou FTP_PASS.');
  process.exit(1);
}

// arquivos que são do projeto, não do site
const FORA = [/^\.github\//, /^tools\//, /^docs\//, /^CLAUDE\.md$/, /^README\.md$/, /^\.gitignore$/, /^\.nojekyll$/, /^package\.json$/];

const fi = process.argv.indexOf('--files');
const upload = fi > -1
  ? process.argv.slice(fi + 1).filter(Boolean)
  : spawnSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).stdout.split('\n').filter((f) => f && !FORA.some((re) => re.test(f)));

// credenciais num netrc temporário, fora da linha de comando
const dir = mkdtempSync(join(tmpdir(), 'ftp-'));
const netrc = join(dir, 'netrc');
writeFileSync(netrc, `machine ${FTP_HOST} login ${FTP_USER} password ${FTP_PASS}\n`, { mode: 0o600 });

const BASE = `ftp://${FTP_HOST}/${FTP_DIR ? FTP_DIR.replace(/^\/|\/$/g, '') + '/' : ''}`;
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
// -k: certificado do FTP compartilhado não é do domínio
const curl = (args) => spawnSync('curl', ['-sS', '-k', '--ssl-reqd', '--connect-timeout', '20', '--max-time', '180', '--netrc-file', netrc, ...args], { encoding: 'utf8' });
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function remoteSize(path) {
  const r = curl(['-I', BASE + enc(path)]);
  const m = r.stdout && r.stdout.match(/Content-Length:\s*(\d+)/i);
  return m ? Number(m[1]) : -1;
}

// sem conexão com o FTP não adianta tentar arquivo por arquivo
const teste = curl(['--list-only', BASE]);
if (teste.status !== 0) {
  console.error(`Não conectou no FTP ${FTP_HOST}: ${(teste.stderr || '').trim()}`);
  process.exit(1);
}

const falhas = [];
for (const f of upload) {
  let ok = false;
  for (let t = 1; t <= 5 && !ok; t++) {
    const r = curl(['--ftp-create-dirs', '-T', join(ROOT, f), BASE + enc(f)]);
    ok = r.status === 0 && remoteSize(f) === statSync(join(ROOT, f)).size;
    if (!ok) { console.log(`  tentativa ${t} de ${f}: ${(r.stderr || '').trim() || 'tamanho diferente no servidor'}`); sleep(1500 * t); }
  }
  console.log(ok ? '  ok' : '  FALHOU', f);
  if (!ok) falhas.push(f);
}

rmSync(dir, { recursive: true, force: true });
console.log(`Publicado: ${upload.length - falhas.length}/${upload.length} arquivos.`);
if (falhas.length) process.exit(1);
