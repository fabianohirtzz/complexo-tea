// Complexo TEA · interações da home
document.documentElement.classList.add('js');

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Nav: some ao descer, volta ao subir ---------- */
const nav = document.querySelector('[data-nav]');
let ultimoY = window.scrollY;
const wa = document.querySelector('.wa-flutuante');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const menuAberto = document.body.classList.contains('menu-aberto');
  nav.classList.toggle('is-escondido', !menuAberto && y > 400 && y > ultimoY);
  wa.classList.toggle('is-visivel', y > 500);
  ultimoY = y;
}, { passive: true });

/* ---------- Nav: peça colorida que desliza sob o link ---------- */
const links = document.querySelector('[data-nav-links]');
const blob = document.querySelector('[data-nav-blob]');
const navLinks = [...links.querySelectorAll('.nav__link')];
let linkAtivo = null;

function moveBlob(link) {
  if (!link) { links.classList.remove('tem-blob'); return; }
  const cor = getComputedStyle(link).getPropertyValue('--c');
  blob.style.setProperty('--x', link.offsetLeft + 'px');
  blob.style.setProperty('--w', link.offsetWidth + 'px');
  blob.style.setProperty('--c', cor);
  links.classList.add('tem-blob');
}
navLinks.forEach((l) => {
  l.addEventListener('mouseenter', () => moveBlob(l));
  l.addEventListener('focus', () => moveBlob(l));
});
links.addEventListener('mouseleave', () => moveBlob(linkAtivo));

// link ativo conforme a seção visível
// todas as seções entram: as que não têm link no menu limpam o destaque
const secoes = [...document.querySelectorAll('main > section')];
const obsSecao = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((l) => l.classList.toggle('is-ativo', l.getAttribute('href') === '#' + e.target.id));
    linkAtivo = navLinks.find((l) => l.classList.contains('is-ativo')) || null;
    if (!links.matches(':hover')) moveBlob(linkAtivo);
  });
}, { rootMargin: '-45% 0px -50% 0px' });
secoes.forEach((s) => obsSecao.observe(s));

/* ---------- Menu mobile ---------- */
const burger = document.querySelector('[data-burger]');
const menu = document.querySelector('[data-menu]');
function abreMenu(abrir) {
  burger.setAttribute('aria-expanded', String(abrir));
  burger.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-aberto', abrir);
  document.body.style.overflow = abrir ? 'hidden' : '';
  if (abrir) {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-aberto'));
  } else {
    menu.classList.remove('is-aberto');
    setTimeout(() => { if (!menu.classList.contains('is-aberto')) menu.hidden = true; }, 600);
  }
}
burger.addEventListener('click', () => abreMenu(burger.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => abreMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-aberto')) { abreMenu(false); burger.focus(); } });

/* ---------- Revelar ao rolar ---------- */
const obsRevela = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-visivel'); obsRevela.unobserve(e.target); }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.revela, [data-trilha]').forEach((el) => obsRevela.observe(el));

/* ---------- Faixa de especialidades: duplica para loop contínuo ---------- */
const faixa = document.querySelector('[data-faixa]');
if (faixa && !reduz) {
  const copia = faixa.firstElementChild.cloneNode(true);
  copia.setAttribute('aria-hidden', 'true');
  faixa.appendChild(copia);
}

/* ---------- Abas das unidades ---------- */
const abas = document.querySelector('[data-abas]');
if (abas) {
  const botoes = [...abas.querySelectorAll('[role="tab"]')];
  const marca = abas.querySelector('[data-abas-marca]');
  const posiciona = (btn) => {
    marca.style.setProperty('--x', btn.offsetLeft + 'px');
    marca.style.setProperty('--w', btn.offsetWidth + 'px');
  };
  const seleciona = (btn) => {
    botoes.forEach((b) => {
      const sel = b === btn;
      b.setAttribute('aria-selected', String(sel));
      b.tabIndex = sel ? 0 : -1;
      document.getElementById(b.getAttribute('aria-controls')).hidden = !sel;
    });
    posiciona(btn);
  };
  botoes.forEach((b, i) => {
    b.addEventListener('click', () => seleciona(b));
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const prox = botoes[(i + (e.key === 'ArrowRight' ? 1 : -1) + botoes.length) % botoes.length];
      seleciona(prox); prox.focus();
    });
  });
  const atual = () => botoes.find((b) => b.getAttribute('aria-selected') === 'true');
  posiciona(atual());
  window.addEventListener('resize', () => posiciona(atual()));
  document.fonts && document.fonts.ready.then(() => posiciona(atual()));
}

/* ---------- Reels: um toca por vez, com som opcional ---------- */
const reels = [...document.querySelectorAll('.reel')];
function para(reel) {
  const v = reel.querySelector('video');
  v.pause();
  reel.classList.remove('is-tocando');
}
reels.forEach((reel) => {
  const v = reel.querySelector('video');
  const play = reel.querySelector('.reel__play');
  const som = reel.querySelector('.reel__som');
  const tocar = () => {
    reels.forEach((r) => r !== reel && para(r));
    v.play();
    reel.classList.add('is-tocando');
    som.hidden = false;
  };
  play.addEventListener('click', () => { v.muted = false; atualizaSom(); tocar(); });
  v.addEventListener('click', () => (v.paused ? tocar() : para(reel)));
  const atualizaSom = () => {
    som.setAttribute('aria-label', v.muted ? 'Ativar som' : 'Desativar som');
    som.querySelector('use').setAttribute('href', v.muted ? '#ic-mudo' : '#ic-som');
  };
  som.addEventListener('click', () => { v.muted = !v.muted; atualizaSom(); });
});
// pausa o que sair da tela
const obsReel = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => { if (!e.isIntersecting) para(e.target); });
}, { threshold: 0.2 });
reels.forEach((r) => obsReel.observe(r));

/* ---------- Ano no rodapé ---------- */
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });
