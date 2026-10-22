// Aplica o topo e o rodapé compartilhados (partials/) em todas as páginas do site.
// Uso: node tools/partials.mjs   (rodar sempre que mudar partials/ ou criar uma página)
//
// Cada página marca onde entram os blocos:
//   <!-- PARTIAL:topo -->...<!-- /PARTIAL:topo -->
//   <!-- PARTIAL:rodape -->...<!-- /PARTIAL:rodape -->
// e diz qual é no <body data-pagina="...">, para o link do menu ficar marcado.
// {{base}} vira o caminho até a raiz ("" na home, "../" nas páginas em pasta)
// e {{inicio}} o link da home ("./" ou "../").
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const IGNORA = new Set(['.git', 'node_modules', 'partials', 'tools', '.github', '.playwright-mcp', 'assets', 'Fotos', 'Fotos-POA', 'Imagens', 'reels', 'fontes']);

function paginas(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) return IGNORA.has(nome) ? [] : paginas(p);
    return nome.endsWith('.html') ? [p] : [];
  });
}

const blocos = {
  topo: readFileSync(join(ROOT, 'partials/topo.html'), 'utf8').trimEnd(),
  rodape: readFileSync(join(ROOT, 'partials/rodape.html'), 'utf8').trimEnd(),
};

let total = 0;
for (const arq of paginas(ROOT)) {
  let html = readFileSync(arq, 'utf8');
  const nivel = relative(ROOT, arq).split(sep).length - 1;
  const base = '../'.repeat(nivel);
  const inicio = nivel ? base : './';
  const pagina = (html.match(/<body[^>]*data-pagina="([^"]+)"/) || [])[1] || '';
  let mudou = false;

  for (const [nome, conteudo] of Object.entries(blocos)) {
    const re = new RegExp(`(<!-- PARTIAL:${nome} -->)[\\s\\S]*?(<!-- /PARTIAL:${nome} -->)`);
    if (!re.test(html)) continue;
    let bloco = conteudo.replaceAll('{{base}}', base).replaceAll('{{inicio}}', inicio);
    // marca o link da página atual no menu
    if (pagina) {
      bloco = bloco.replace(new RegExp(`class="((?:nav|menu)__link[^"]*)"([^>]*data-pagina="${pagina}")`, 'g'), 'class="$1 is-ativo" aria-current="page"$2');
    }
    html = html.replace(re, `$1\n${bloco}\n  $2`);
    mudou = true;
  }
  if (mudou) { writeFileSync(arq, html); total++; console.log('  ok', relative(ROOT, arq)); }
}
console.log(`${total} página(s) atualizada(s).`);
