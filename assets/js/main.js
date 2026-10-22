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
// a página atual vem marcada pelo tools/partials.mjs
const linkAtivo = links.querySelector('.is-ativo');

function moveBlob(link) {
  navLinks.forEach((l) => l.classList.toggle('is-sob-blob', l === link));
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
moveBlob(linkAtivo);
document.fonts && document.fonts.ready.then(() => moveBlob(linkAtivo));

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
if (!reduz) {
  document.querySelectorAll('[data-faixa]').forEach((faixa) => {
    const copia = faixa.firstElementChild.cloneNode(true);
    copia.setAttribute('aria-hidden', 'true');
    // a cópia é só visual: links fora da ordem de tabulação
    copia.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
    faixa.appendChild(copia);
  });
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

/* ---------- Galeria das unidades: foto grande + miniaturas ---------- */
document.querySelectorAll('[data-vitrine]').forEach((vitrine) => {
  const foto = vitrine.querySelector('[data-vitrine-foto]');
  const legenda = vitrine.querySelector('[data-vitrine-legenda]');
  const conta = vitrine.querySelector('[data-vitrine-conta]');
  const minis = [...vitrine.querySelectorAll('.vitrine__mini')];
  let atual = 0;
  const mostra = (i) => {
    atual = (i + minis.length) % minis.length;
    const m = minis[atual];
    minis.forEach((b) => b.removeAttribute('aria-current'));
    m.setAttribute('aria-current', 'true');
    foto.classList.add('is-trocando');
    const nova = new Image();
    nova.src = m.dataset.src;
    const troca = () => {
      foto.src = m.dataset.src;
      foto.alt = m.dataset.alt;
      legenda.textContent = m.dataset.legenda;
      conta.textContent = `${atual + 1} / ${minis.length}`;
      requestAnimationFrame(() => foto.classList.remove('is-trocando'));
    };
    nova.decode().then(troca, troca);
  };
  minis.forEach((m, i) => m.addEventListener('click', () => mostra(i)));
  vitrine.querySelector('[data-vitrine-ant]').addEventListener('click', () => mostra(atual - 1));
  vitrine.querySelector('[data-vitrine-prox]').addEventListener('click', () => mostra(atual + 1));
});

/* ---------- Reels: carrossel em leque, o do centro toca ---------- */
const carrossel = document.querySelector('[data-carrossel]');
if (carrossel) {
  const reels = [...carrossel.querySelectorAll('[data-reel]')];
  const pontos = [...carrossel.querySelectorAll('[data-ponto]')];
  const n = reels.length;
  let ativo = 0;
  let naTela = false;

  const atualizaSom = (reel) => {
    const v = reel.querySelector('video');
    const som = reel.querySelector('.reel__som');
    som.setAttribute('aria-label', v.muted ? 'Ativar som' : 'Desativar som');
    som.querySelector('use').setAttribute('href', v.muted ? '#ic-mudo' : '#ic-som');
  };

  const posiciona = (i) => {
    ativo = (i + n) % n;
    reels.forEach((reel, j) => {
      let pos = j - ativo;
      if (pos > n / 2) pos -= n;
      if (pos < -n / 2) pos += n;
      reel.dataset.pos = Math.abs(pos) <= 2 ? pos : 'fora';
      const v = reel.querySelector('video');
      if (pos === 0) {
        if (naTela && !reduz) v.play().catch(() => {});
      } else {
        v.pause();
        v.muted = true;
        atualizaSom(reel);
      }
    });
    pontos.forEach((p, j) => (j === ativo ? p.setAttribute('aria-current', 'true') : p.removeAttribute('aria-current')));
  };

  reels.forEach((reel, j) => {
    const v = reel.querySelector('video');
    reel.addEventListener('click', (e) => {
      if (e.target.closest('.reel__som')) return;
      if (j !== ativo) return posiciona(j);
      v.paused ? v.play() : v.pause();
    });
    reel.querySelector('.reel__som').addEventListener('click', () => {
      v.muted = !v.muted;
      if (v.paused) v.play().catch(() => {});
      atualizaSom(reel);
    });
  });
  pontos.forEach((p, j) => p.addEventListener('click', () => posiciona(j)));
  carrossel.querySelector('[data-carrossel-ant]').addEventListener('click', () => posiciona(ativo - 1));
  carrossel.querySelector('[data-carrossel-prox]').addEventListener('click', () => posiciona(ativo + 1));

  // arrastar no celular
  let x0 = null;
  carrossel.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  carrossel.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) posiciona(ativo + (dx < 0 ? 1 : -1));
  });

  // só toca com a seção na tela
  new IntersectionObserver(([e]) => {
    naTela = e.isIntersecting;
    const v = reels[ativo].querySelector('video');
    if (naTela && !reduz) v.play().catch(() => {}); else v.pause();
  }, { threshold: 0.35 }).observe(carrossel);

  posiciona(0);
}

/* ---------- Formulário (Ouvidoria): envia pelo FormSubmit e volta com ?enviado=1 ---------- */
document.querySelectorAll('[data-form]').forEach((form) => {
  const next = form.querySelector('[data-form-next]');
  if (next) next.value = location.href.split(/[?#]/)[0] + '?enviado=1#manifestacao';
  form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) { e.preventDefault(); form.reportValidity(); return; }
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
  });
  if (/[?&]enviado=1\b/.test(location.search)) {
    form.classList.add('is-enviado');
    const ok = form.querySelector('[data-form-ok]');
    ok.setAttribute('tabindex', '-1');
    ok.focus({ preventScroll: true });
  }
});

/* ---------- Ano no rodapé ---------- */
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });
