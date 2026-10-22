# Complexo TEA · site institucional

Site do **Complexo TEA** (Grupo Libertad), centro de diagnóstico de autismo e Terapia ABA com
unidades em **Canoas** (Hub de Saúde Maxplaza) e **Porto Alegre** (Ipanema). Substitui o
WordPress/Elementor atual em complexotea.com.br. Projeto irmão: HD360 Moinhos
(`E:\Clientes\Grupo Libertad\HD 360 Moinhos\Site\hd360-project`), mesmo nicho e público, usado
como referência de arquitetura e deploy.

## Briefing

- **Objetivo:** levar pais ao WhatsApp para agendar avaliação; ranquear para "diagnóstico autismo
  Canoas/Porto Alegre", "terapia ABA Canoas/Porto Alegre" (SEO) e ser citado por IAs (GEO).
- **Público:** pais e cuidadores, muitas vezes no início da suspeita de TEA.
- **Tom:** acolhedor, claro, sem jargão. Regras Freela: sem travessões, sem emojis, números concretos.
- **Visual:** colorido, animado, sem poluição. Cores e ilustrações do site atual.
- **Contato:** WhatsApp/telefone único (51) 3411-1008 · atendimento@complexotea.com.br ·
  @complexotea · Facebook id 61562013670025 · avaliação Google g.page/r/CZstcnzuMHAEEBM/review
- **Empresa:** Libertad Assistência Integral Ltda · CNPJ 14.762.530/0002-62

## Design

- **Cores da interface: só roxo `#48038C` e laranja `#F25C05`** (texto/botão laranja usa `#C94A00`
  por contraste), mais neutros (tinta `#24103D`, papel `#F6F2FB`). Decisão do cliente.
- **Só as peças de quebra-cabeça são multicoloridas** (amarelo `#F0C908`, verde `#82A406`, azul
  `#15779B` existem apenas como `--p-*` para preencher peças).
- Tipografia: **Super Comic** (títulos, fonte do cliente, só caixa alta, `assets/fonts/super-comic.woff2`)
  × Nunito (texto e menu). A Super Comic é larga: evitar palavras longas em títulos no mobile.
- Motivo central: a peça de quebra-cabeça do logo (`<symbol id="peca">`, `--peca-mask` em CSS).
  Cada peça recebe `data-cor` e lê `--c`. O desenho ocupa ~60% do viewBox: para peça grande,
  deixar o svg vazar a caixa (ver `.etapa__num`).
- Hero sem foto (cliente não gostou): disco roxo + crianças ilustradas + 5 peças que se encaixam.
- Unidades: painel roxo + foto grande com setas + mosaico de miniaturas. Instagram: carrossel em
  leque, o reel do centro toca mudo quando a seção está na tela.
  Demais: blob deslizante no menu, menu mobile em círculo, faixa de especialidades, linha da
  trilha que se desenha, revelar ao rolar, peças flutuando no rodapé. `prefers-reduced-motion` respeitado.

## Estrutura

```
index.html            home (única página por enquanto)
assets/css/main.css   todos os estilos
assets/js/main.js     interações (vanilla, sem build)
assets/img/poa|canoas fotos das unidades (WebP otimizado)
assets/img/ilustra    personagens ilustrados do site antigo
assets/img/marca      logo, favicon
assets/video/reels    reels do Instagram (540p, ~2-5 MB, preload none)
tools/deploy-ftp.mjs  deploy por FTP (curl + TLS)
Fotos/ Fotos-POA/ Imagens/ reels/   originais do cliente (fora do git)
```

## Preview e deploy

- **Preview:** https://fabianohirtzz.github.io/complexo-tea/ (repo público `fabianohirtzz/complexo-tea`,
  branch `main`, raiz). Público porque a conta não é GitHub Pro; nunca versionar credenciais.
  Todas as páginas têm `<meta name="robots" content="noindex, nofollow">` no preview.
- **Produção:** workflow manual "Publicar em produção" (`.github/workflows/deploy-producao.yml`).
  Troca o noindex por index e sobe por FTP. Secrets: `FTP_HOST`, `FTP_USER`, `FTP_PASS`,
  `FTP_DIR` (opcional, ex.: `public_html`).
- Antes do primeiro deploy em produção: criar `.htaccess` (DirectoryIndex index.html, https,
  redirects das URLs do WordPress: /o-complexo/, /especialidades/, /atendimento/, /ouvidoria/,
  /contato/, /blog/) e decidir o que fazer com os arquivos do WordPress no servidor.

## Estado atual

- **Fase:** home v1 pronta para aprovação no preview (2026-10-22).
- **Próximo:** aprovação da home → páginas internas (O Complexo, Especialidades, Unidades,
  Atendimento/Diagnóstico, FAQ, Ouvidoria, Contato, Privacidade) → blog (fase 2).

## Pendências com o cliente

- Confirmar o selo "1º centro de diagnóstico de autismo do RS" (vem do site atual).
- Convênios aceitos, horário de funcionamento, faixa etária atendida, responsável técnico (CRM/RQE).
- Logo em alta resolução (o atual tem 300×150 px) e, se possível, em SVG.
- Fotos de Canoas em resolução maior (as atuais têm 375×500 px).
- Credenciais FTP de produção.
